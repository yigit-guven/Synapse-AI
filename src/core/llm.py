from langchain_community.llms import Ollama
from langchain.chains import RetrievalQA
from langchain_core.callbacks import CallbackManager, StreamingStdOutCallbackHandler
from src.core.config import settings

def get_llm(model_name: str = settings.MODEL_NAME):
    """
    Returns an instance of the Ollama LLM.
    """
    return Ollama(
        base_url=settings.OLLAMA_BASE_URL,
        model=model_name,
        callback_manager=CallbackManager([StreamingStdOutCallbackHandler()])
    )

def create_rag_chain(vector_store, model_name: str = settings.MODEL_NAME):
    """
    Creates a RetrievalQA chain.
    """
    llm = get_llm(model_name)
    retriever = vector_store.as_retriever()
    
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=retriever,
        return_source_documents=True
    )
    
    return qa_chain
