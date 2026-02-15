from langchain_community.llms import Ollama
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
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
    Creates a RetrievalQA chain using LCEL.
    """
    llm = get_llm(model_name)
    retriever = vector_store.as_retriever()
    
    prompt = ChatPromptTemplate.from_template("""Answer the following question based only on the provided context:

<context>
{context}
</context>

Question: {input}""")

    document_chain = create_stuff_documents_chain(llm, prompt)
    retrieval_chain = create_retrieval_chain(retriever, document_chain)
    
    return retrieval_chain
