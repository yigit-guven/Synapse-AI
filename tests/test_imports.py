import sys
import os

# Add project root to path
sys.path.append(os.getcwd())

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

    from src.app import main
    print("App module loaded.")
    
    print("All imports successful!")

except ImportError as e:
    print(f"ImportError: {e}")
    sys.exit(1)
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
