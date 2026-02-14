import os
from typing import List
from langchain_community.document_loaders import PyPDFLoader, WebBaseLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
from src.core.config import settings

def _get_splitter():
    return RecursiveCharacterTextSplitter(
        chunk_size=settings.CHUNK_SIZE,
        chunk_overlap=settings.CHUNK_OVERLAP,
        separators=["\n\n", "\n", " ", ""]
    )

def load_and_split_pdf(file_path: str) -> List[Document]:
    """
    Loads a PDF file and splits it into chunks.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    loader = PyPDFLoader(file_path)
    documents = loader.load()

    text_splitter = _get_splitter()
    
    chunks = text_splitter.split_documents(documents)
    return chunks

def load_and_split_web_page(url: str) -> List[Document]:
    """
    Loads a web page and splits it into chunks.
    """
    try:
        loader = WebBaseLoader(url)
        documents = loader.load()
        
        text_splitter = _get_splitter()
        chunks = text_splitter.split_documents(documents)
        return chunks
    except Exception as e:
        raise Exception(f"Failed to load URL {url}: {str(e)}")
