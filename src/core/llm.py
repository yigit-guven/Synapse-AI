from langchain_community.llms import Ollama
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.callbacks import CallbackManager, StreamingStdOutCallbackHandler
from src.core.config import settings

def get_llm(model_name: str = settings.MODEL_NAME):
    """
    Returns an instance of the Ollama LLM with temperature set to 0 
    to ensure deterministic and strictly grounded responses.
    """
    return Ollama(
        base_url=settings.OLLAMA_BASE_URL,
        model=model_name,
        temperature=0.0,
        callback_manager=CallbackManager([StreamingStdOutCallbackHandler()])
    )

def create_rag_chain(vector_store, model_name: str = settings.MODEL_NAME):
    """
    Creates a RetrievalQA chain using LCEL.
    """
    llm = get_llm(model_name)
    retriever = vector_store.as_retriever()
    
    prompt = ChatPromptTemplate.from_template("""You are a strict knowledge retrieval assistant. 
Your ONLY source of information is the provided context below.
DO NOT use any external knowledge, general knowledge, or examples not found in the context.
If the answer is not contained within the context, simply state: "I don't know the answer to that because it's not in the provided documents."
Do not attempt to make up an answer or provide information from your memory.

<context>
{context}
</context>

Question: {input}
Answer:""")

    document_chain = create_stuff_documents_chain(llm, prompt)
    retrieval_chain = create_retrieval_chain(retriever, document_chain)
    
    return retrieval_chain
