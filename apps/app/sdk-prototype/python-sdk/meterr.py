```python
"""
Meterr.ai Python SDK
A drop-in replacement for OpenAI SDK with automatic cost tracking and analytics
"""

import os
import json
import time
import queue
import sqlite3
import hashlib
import asyncio
import threading
import functools
from typing import Dict, Any, Optional, List, Union, Callable
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from contextlib import contextmanager
import logging

try:
    import openai
    from openai import AsyncOpenAI, OpenAI as OpenAIClient
except ImportError:
    openai = None
    AsyncOpenAI = None
    OpenAIClient = None

import httpx
import tiktoken

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Model pricing (per 1K tokens)
MODEL_COSTS = {
    # GPT-4 models
    "gpt-4": {"input": 0.03, "output": 0.06},
    "gpt-4-32k": {"input": 0.06, "output": 0.12},
    "gpt-4-turbo-preview": {"input": 0.01, "output": 0.03},
    "gpt-4-1106-preview": {"input": 0.01, "output": 0.03},
    "gpt-4-vision-preview": {"input": 0.01, "output": 0.03},
    "gpt-4o": {"input": 0.005, "output": 0.015},
    "gpt-4o-mini": {"input": 0.00015, "output": 0.0006},
    
    # GPT-3.5 models
    "gpt-3.5-turbo": {"input": 0.0005, "output": 0.0015},
    "gpt-3.5-turbo-16k": {"input": 0.003, "output": 0.004},
    "gpt-3.5-turbo-1106": {"input": 0.001, "output": 0.002},
    "gpt-3.5-turbo-0125": {"input": 0.0005, "output": 0.0015},
    
    # Legacy models
    "text-davinci-003": {"input": 0.02, "output": 0.02},
    "text-davinci-002": {"input": 0.02, "output": 0.02},
    "text-curie-001": {"input": 0.002, "output": 0.002},
    "text-babbage-001": {"input": 0.0005, "output": 0.0005},
    "text-ada-001": {"input": 0.0004, "output": 0.0004},
    
    # Embedding models
    "text-embedding-ada-002": {"input": 0.0001, "output": 0},
    "text-embedding-3-small": {"input": 0.00002, "output": 0},
    "text-embedding-3-large": {"input": 0.00013, "output": 0},
}

@dataclass
class UsageRecord:
    """Represents a single API usage record"""
    timestamp: str
    model: str
    input_tokens: int
    output_tokens: int
    total_tokens: int
    cost: float
    team: Optional[str]
    project: Optional[str]
    tags: Dict[str, Any]
    request_id: str
    endpoint: str
    latency_ms: float
    status: str
    error: Optional[str] = None

class TokenCounter:
    """Handles token counting for different models"""
    
    _encoders = {}
    
    @classmethod
    def get_encoder(cls, model: str):
        """Get or create encoder for model"""
        if model not in cls._encoders:
            try:
                if "gpt-4" in model or "gpt-3.5" in model:
                    cls._encoders[model] = tiktoken.encoding_for_model(model.replace("-preview", "").replace("-1106", ""))
                else:
                    cls._encoders[model] = tiktoken.get_encoding("cl100k_base")
            except Exception:
                cls._encoders[model] = tiktoken.get_encoding("cl100k_base")
        return cls._encoders[model]
    
    @classmethod
    def count_tokens(cls, text: str, model: str = "gpt-3.5-turbo") -> int:
        """Count tokens in text for given model"""
        try:
            encoder = cls.get_encoder(model)
            return len(encoder.encode(text))
        except Exception as e:
            # Fallback: estimate 1 token per 4 characters
            return len(text) // 4

    @classmethod
    def count_messages_tokens(cls, messages: List[Dict], model: str = "gpt-3.5-turbo") -> int:
        """Count tokens in chat messages"""
        total = 0
        for message in messages:
            # Each message has overhead tokens
            total += 4  # message overhead
            
            if isinstance(message, dict):
                if "role" in message:
                    total += cls.count_tokens(message["role"], model)
                if "content" in message:
                    if isinstance(message["content"], str):
                        total += cls.count_tokens(message["content"], model)
                    elif isinstance(message["content"], list):
                        for item in message["content"]:
                            if isinstance(item, dict) and "text" in item:
                                total += cls.count_tokens(item["text"], model)
                if "name" in message:
                    total += cls.count_tokens(message["name"], model)
                    
        total += 2  # reply overhead
        return total

class OfflineQueue:
    """SQLite-based offline queue for failed telemetry"""
    
    def __init__(self, db_path: str = ".meterr_queue.db"):
        self.db_path = db_path
        self._init_db()
    
    def _init_db(self):
        """Initialize SQLite database"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS queue (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    data TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    retry_count INTEGER DEFAULT 0
                )
            """)
            conn.commit()
    
    def add(self, record: UsageRecord):
        """Add record to queue"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "INSERT INTO queue (data) VALUES (?)",
                (json.dumps(asdict(record)),)
            )
            conn.commit()
    
    def get_batch(self, limit: int = 100) -> List[tuple]:
        """Get batch of records to retry"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                "SELECT id, data FROM queue ORDER BY created_at LIMIT ?",
                (limit,)
            )
            return cursor.fetchall()
    
    def remove(self, ids: List[int]):
        """Remove successfully sent records"""
        if not ids:
            return
        with sqlite3.connect(self.db_path) as conn:
            placeholders = ",".join("?" * len(ids))
            conn.execute(f"DELETE FROM queue WHERE id IN ({placeholders})", ids)
            conn.commit()
    
    def update_retry(self, id: int):
        """Update retry count for failed record"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "UPDATE queue SET retry_count = retry_count + 1 WHERE id = ?",
                (id,)
            )
            conn.commit()

class TelemetryBatcher:
    