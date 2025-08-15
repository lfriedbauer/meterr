#!/usr/bin/env python3
"""
Model Tester - Test routing logic locally without API costs
Usage: python scripts/python/model_tester.py
"""

import torch
from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
import time
import json
from typing import Dict, Any, List
import argparse
from pathlib import Path

class ModelTester:
    """Test different models locally for routing decisions"""
    
    def __init__(self, use_gpu: bool = True):
        self.device = 'cuda' if (use_gpu and torch.cuda.is_available()) else 'cpu'
        print(f"🎮 Using device: {self.device}")
        self.models = {}
        self._load_models()
    
    def _load_models(self):
        """Load small models for testing"""
        print("Loading test models...")
        
        # Load small models for testing
        model_configs = {
            'simple': 'gpt2',  # Small, fast model
            'medium': 'microsoft/DialoGPT-medium',  # Medium complexity
            # Add more models as needed
        }
        
        for name, model_id in model_configs.items():
            try:
                print(f"Loading {name} ({model_id})...")
                self.models[name] = pipeline(
                    'text-generation',
                    model=model_id,
                    device=0 if self.device == 'cuda' else -1,
                    max_new_tokens=100
                )
                print(f"✅ Loaded {name}")
            except Exception as e:
                print(f"⚠️ Could not load {name}: {e}")
    
    def test_prompt(self, prompt: str, model_name: str = None) -> Dict[str, Any]:
        """Test a prompt with specified model"""
        if model_name and model_name not in self.models:
            raise ValueError(f"Model {model_name} not available")
        
        if model_name:
            models_to_test = {model_name: self.models[model_name]}
        else:
            models_to_test = self.models
        
        results = {}
        
        for name, model in models_to_test.items():
            print(f"\nTesting with {name}...")
            
            start_time = time.time()
            try:
                response = model(prompt, max_new_tokens=100, do_sample=True, temperature=0.7)
                elapsed = time.time() - start_time
                
                results[name] = {
                    'response': response[0]['generated_text'],
                    'time': f"{elapsed:.3f}s",
                    'tokens_per_second': len(response[0]['generated_text'].split()) / elapsed
                }
            except Exception as e:
                results[name] = {
                    'response': f"Error: {e}",
                    'time': 'N/A',
                    'tokens_per_second': 0
                }
        
        return results
    
    def classify_complexity(self, prompt: str) -> str:
        """Classify prompt complexity for routing"""
        # Simple heuristics for complexity
        word_count = len(prompt.split())
        has_code = '```' in prompt or 'def ' in prompt or 'function' in prompt
        has_math = any(c in prompt for c in ['=', '+', '-', '*', '/', '%'])
        question_count = prompt.count('?')
        
        complexity_score = 0
        
        # Scoring logic
        if word_count > 100:
            complexity_score += 2
        elif word_count > 50:
            complexity_score += 1
        
        if has_code:
            complexity_score += 2
        
        if has_math:
            complexity_score += 1
        
        if question_count > 2:
            complexity_score += 1
        
        # Determine routing
        if complexity_score >= 4:
            return 'complex'
        elif complexity_score >= 2:
            return 'medium'
        else:
            return 'simple'
    
    def test_routing_logic(self, test_prompts: List[str]) -> pd.DataFrame:
        """Test routing logic on multiple prompts"""
        import pandas as pd
        
        results = []
        
        for prompt in test_prompts:
            complexity = self.classify_complexity(prompt)
            
            # Test with appropriate model
            model_name = complexity if complexity in self.models else 'simple'
            response_data = self.test_prompt(prompt, model_name)
            
            results.append({
                'prompt': prompt[:50] + '...' if len(prompt) > 50 else prompt,
                'complexity': complexity,
                'model_used': model_name,
                'response_time': response_data[model_name]['time']
            })
        
        return pd.DataFrame(results)
    
    def benchmark_routing(self) -> None:
        """Benchmark routing decisions"""
        test_prompts = [
            "Hello, how are you?",  # Simple
            "What is the capital of France?",  # Simple
            "Explain quantum computing in simple terms.",  # Medium
            "Write a Python function to calculate fibonacci numbers recursively.",  # Complex
            "What are the philosophical implications of artificial intelligence on human consciousness?",  # Complex
        ]
        
        print("\n🏁 Testing routing logic...")
        df = self.test_routing_logic(test_prompts)
        print("\nRouting Results:")
        print(df.to_string())

def main():
    parser = argparse.ArgumentParser(description='Model Tester')
    parser.add_argument('--prompt', type=str, help='Prompt to test')
    parser.add_argument('--model', type=str, help='Specific model to use')
    parser.add_argument('--benchmark', action='store_true', help='Run routing benchmark')
    parser.add_argument('--no-gpu', action='store_true', help='Disable GPU usage')
    
    args = parser.parse_args()
    
    tester = ModelTester(use_gpu=not args.no_gpu)
    
    if args.benchmark:
        tester.benchmark_routing()
    
    elif args.prompt:
        complexity = tester.classify_complexity(args.prompt)
        print(f"\n📦 Complexity: {complexity}")
        
        results = tester.test_prompt(args.prompt, args.model)
        
        for model_name, data in results.items():
            print(f"\n{'='*50}")
            print(f"Model: {model_name}")
            print(f"Time: {data['time']}")
            print(f"Response: {data['response'][:200]}...")
    
    else:
        # Interactive mode
        print("\n🤖 Interactive Model Tester")
        print("Available models:", list(tester.models.keys()))
        
        while True:
            prompt = input("\nEnter prompt (or 'quit' to exit): ")
            if prompt.lower() == 'quit':
                break
            
            complexity = tester.classify_complexity(prompt)
            print(f"Complexity: {complexity}")
            
            results = tester.test_prompt(prompt)
            for model_name, data in results.items():
                print(f"\n{model_name}: {data['response'][:100]}...")
                print(f"Time: {data['time']}")

if __name__ == "__main__":
    main()