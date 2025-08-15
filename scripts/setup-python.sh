#!/bin/bash
# Setup Python environment for AI/ML analysis

echo "🐍 Setting up Python environment for Meterr..."

# Check Python version
python_version=$(python3 --version 2>&1 | grep -oE '[0-9]+\.[0-9]+')
required_version="3.8"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo "⚠️  Python $required_version or higher is required. Found: $python_version"
    exit 1
fi

echo "✅ Python $python_version detected"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🚀 Activating virtual environment..."
source venv/bin/activate || . venv/Scripts/activate  # Windows compatibility

# Upgrade pip
echo "🔧 Upgrading pip..."
pip install --upgrade pip

# Install requirements
echo "📦 Installing Python dependencies..."
pip install -r scripts/python/requirements.txt

# Test CUDA availability
echo "🎮 Testing CUDA availability..."
python3 -c "import torch; print(f'CUDA available: {torch.cuda.is_available()}')" 2>/dev/null || echo "PyTorch not installed"

# Create useful aliases
echo "🔗 Creating aliases..."
if [ -f ~/.bashrc ]; then
    grep -q "alias meterr-analyze" ~/.bashrc || echo "alias meterr-analyze='python scripts/python/token_analyzer.py'" >> ~/.bashrc
    grep -q "alias meterr-test" ~/.bashrc || echo "alias meterr-test='python scripts/python/model_tester.py'" >> ~/.bashrc
    grep -q "alias meterr-dashboard" ~/.bashrc || echo "alias meterr-dashboard='streamlit run scripts/python/dashboard.py'" >> ~/.bashrc
    echo "✅ Aliases added to ~/.bashrc"
fi

echo ""
echo "🎉 Python environment setup complete!"
echo ""
echo "Available commands:"
echo "  python scripts/python/token_analyzer.py   - Analyze token usage"
echo "  python scripts/python/model_tester.py     - Test model routing"
echo "  streamlit run scripts/python/dashboard.py - Launch dashboard"
echo ""
echo "Or use aliases (after restarting terminal):"
echo "  meterr-analyze"
echo "  meterr-test"
echo "  meterr-dashboard"