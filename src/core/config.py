import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    CHROMA_PERSIST_DIRECTORY = os.getenv("CHROMA_DB_PATH", "./data/chroma")
    OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    MODEL_NAME = "llama3"  # Default model, can be overridden
    EMBEDDING_MODEL = "all-minilm-l6-v2"
    CHUNK_SIZE = 1000
    CHUNK_OVERLAP = 200

settings = Config()
