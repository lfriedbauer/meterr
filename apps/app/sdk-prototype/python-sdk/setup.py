from setuptools import setup, find_packages

setup(
    name="meterr",
    version="0.1.0",
    description="Track AI API costs with one line of code",
    author="Meterr.ai",
    packages=find_packages(),
    install_requires=[
        "openai>=1.0.0",
        "anthropic>=0.7.0",
        "httpx>=0.24.0",
        "pydantic>=2.0.0",
    ],
    python_requires=">=3.7",
)