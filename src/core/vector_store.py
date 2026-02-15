from typing import List
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain_core.documents import Document
from src.core.config import settings
import chromadb

class VectorStore:
    def __init__(self):
        self.embedding_function = SentenceTransformerEmbeddings(model_name=settings.EMBEDDING_MODEL)
        self.persist_directory = settings.CHROMA_PERSIST_DIRECTORY
        
        # Initialize client but let LangChain handle the collection interactions for simplicity
        self.db = Chroma(
            persist_directory=self.persist_directory,
            embedding_function=self.embedding_function
        )

    def add_documents(self, documents: List[Document]):
        """
        Adds documents to the vector store.
        """
        if not documents:
            return
        
        self.db.add_documents(documents)
        self.db.persist()

    def similarity_search(self, query: str, k: int = 4) -> List[Document]:
        """
        Performs a similarity search for a given query.
        """
        return self.db.similarity_search(query, k=k)

    def as_retriever(self):
        return self.db.as_retriever()
