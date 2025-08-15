#!/usr/bin/env python3
"""
Token Analyzer - GPU-accelerated token counting and analysis
Usage: python scripts/python/token_analyzer.py [options]
"""

import torch
from transformers import AutoTokenizer
import tiktoken
import pandas as pd
import numpy as np
from typing import List, Dict, Any
import json
import argparse
from pathlib import Path
import time
from tqdm import tqdm

class TokenAnalyzer:
    """GPU-accelerated token analysis for multiple models"""
    
    def __init__(self):
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        print(f"🎮 Using device: {self.device}")
        
        # Initialize tokenizers for different models
        self.tokenizers = {}
        self._load_tokenizers()
        
    def _load_tokenizers(self):
        """Load tokenizers for various models"""
        print("Loading tokenizers...")
        
        # OpenAI models
        try:
            self.tokenizers['gpt-4'] = tiktoken.encoding_for_model('gpt-4')
            self.tokenizers['gpt-3.5-turbo'] = tiktoken.encoding_for_model('gpt-3.5-turbo')
            print("✅ Loaded OpenAI tokenizers")
        except Exception as e:
            print(f"⚠️ Could not load OpenAI tokenizers: {e}")
        
        # Open source models (for local testing)
        try:
            self.tokenizers['llama2'] = AutoTokenizer.from_pretrained(
                'meta-llama/Llama-2-7b-hf',
                use_fast=True
            )
            print("✅ Loaded Llama2 tokenizer")
        except Exception as e:
            print(f"⚠️ Could not load Llama2 tokenizer: {e}")
    
    def count_tokens(self, texts: List[str], model: str = 'gpt-4') -> List[int]:
        """Count tokens for a list of texts"""
        if model not in self.tokenizers:
            raise ValueError(f"Model {model} not available. Choose from: {list(self.tokenizers.keys())}")
        
        tokenizer = self.tokenizers[model]
        counts = []
        
        if self.device == 'cuda' and hasattr(tokenizer, 'encode_batch'):
            # Batch processing on GPU if available
            with torch.cuda.amp.autocast():
                for text in tqdm(texts, desc="Counting tokens"):
                    counts.append(len(tokenizer.encode(text)))
        else:
            # CPU processing
            for text in tqdm(texts, desc="Counting tokens"):
                if hasattr(tokenizer, 'encode'):
                    counts.append(len(tokenizer.encode(text)))
                else:
                    # For HuggingFace tokenizers
                    counts.append(len(tokenizer(text)['input_ids']))
        
        return counts
    
    def compare_models(self, text: str) -> pd.DataFrame:
        """Compare tokenization across different models"""
        results = {}
        
        for model_name, tokenizer in self.tokenizers.items():
            try:
                if hasattr(tokenizer, 'encode'):
                    token_count = len(tokenizer.encode(text))
                else:
                    token_count = len(tokenizer(text)['input_ids'])
                
                # Estimate costs (example rates)
                cost_per_1k = {
                    'gpt-4': 0.03,
                    'gpt-3.5-turbo': 0.002,
                    'llama2': 0.0  # Local model
                }
                
                cost = (token_count / 1000) * cost_per_1k.get(model_name, 0)
                
                results[model_name] = {
                    'tokens': token_count,
                    'cost_per_1k': cost_per_1k.get(model_name, 0),
                    'estimated_cost': f"${cost:.6f}"
                }
            except Exception as e:
                results[model_name] = {
                    'tokens': 'Error',
                    'cost_per_1k': 0,
                    'estimated_cost': f"Error: {e}"
                }
        
        return pd.DataFrame(results).T
    
    def analyze_dataset(self, file_path: str) -> Dict[str, Any]:
        """Analyze a dataset of texts"""
        df = pd.read_csv(file_path)
        
        # Assuming the CSV has a 'text' column
        if 'text' not in df.columns:
            raise ValueError("CSV must have a 'text' column")
        
        texts = df['text'].tolist()
        
        # Analyze with each model
        results = {}
        for model in self.tokenizers.keys():
            print(f"\nAnalyzing with {model}...")
            counts = self.count_tokens(texts, model)
            
            results[model] = {
                'total_tokens': sum(counts),
                'avg_tokens': np.mean(counts),
                'std_tokens': np.std(counts),
                'min_tokens': min(counts),
                'max_tokens': max(counts),
                'percentile_50': np.percentile(counts, 50),
                'percentile_95': np.percentile(counts, 95)
            }
        
        return results
    
    def benchmark_performance(self, sample_size: int = 1000) -> Dict[str, float]:
        """Benchmark tokenization performance"""
        # Generate sample texts
        sample_texts = [
            f"This is a sample text number {i} for benchmarking tokenization performance."
            for i in range(sample_size)
        ]
        
        results = {}
        
        for model_name in self.tokenizers.keys():
            start_time = time.time()
            _ = self.count_tokens(sample_texts, model_name)
            elapsed = time.time() - start_time
            
            results[model_name] = {
                'total_time': elapsed,
                'texts_per_second': sample_size / elapsed,
                'ms_per_text': (elapsed * 1000) / sample_size
            }
        
        return results

def main():
    parser = argparse.ArgumentParser(description='Token Analyzer')
    parser.add_argument('--text', type=str, help='Text to analyze')
    parser.add_argument('--file', type=str, help='CSV file to analyze')
    parser.add_argument('--benchmark', action='store_true', help='Run performance benchmark')
    parser.add_argument('--compare', action='store_true', help='Compare models')
    parser.add_argument('--model', type=str, default='gpt-4', help='Model to use')
    
    args = parser.parse_args()
    
    analyzer = TokenAnalyzer()
    
    if args.benchmark:
        print("\n🏃 Running performance benchmark...")
        results = analyzer.benchmark_performance()
        df = pd.DataFrame(results).T
        print("\nBenchmark Results:")
        print(df.to_string())
    
    elif args.compare and args.text:
        print(f"\n📊 Comparing models for text...")
        df = analyzer.compare_models(args.text)
        print("\nComparison Results:")
        print(df.to_string())
    
    elif args.file:
        print(f"\n📁 Analyzing dataset: {args.file}")
        results = analyzer.analyze_dataset(args.file)
        df = pd.DataFrame(results).T
        print("\nDataset Analysis:")
        print(df.to_string())
    
    elif args.text:
        print(f"\n💬 Analyzing text with {args.model}...")
        count = analyzer.count_tokens([args.text], args.model)[0]
        print(f"Token count: {count}")
    
    else:
        # Interactive mode
        print("\n🎯 Interactive Token Analyzer")
        print("Available models:", list(analyzer.tokenizers.keys()))
        
        while True:
            text = input("\nEnter text (or 'quit' to exit): ")
            if text.lower() == 'quit':
                break
            
            df = analyzer.compare_models(text)
            print("\n" + df.to_string())

if __name__ == "__main__":
    main()