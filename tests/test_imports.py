import sys
import os
import pytest

# Add project root to path
sys.path.append(os.getcwd())

def test_imports():
    """Test that all key modules can be imported without error."""
    try:
        print("Testing imports...")
        from src.core.config import settings
        print(f"Config loaded. Model: {settings.MODEL_NAME}")

        from src.core.ingest import load_and_split_pdf
        print("Ingest module loaded.")

        from src.core.vector_store import VectorStore
        print("VectorStore module loaded.")

        from src.core.llm import get_llm
        print("LLM module loaded.")

        from src.api import app
        print("App module loaded.")
        
        print("All imports successful!")

    except ImportError as e:
        pytest.fail(f"ImportError: {e}")
    except Exception as e:
        pytest.fail(f"Error: {e}")
