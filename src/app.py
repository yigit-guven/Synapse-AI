import streamlit as st
import os
import tempfile
from src.core.ingest import load_and_split_pdf
from src.core.vector_store import VectorStore
from src.core.llm import create_rag_chain
from src.core.config import settings

# Page Configuration
st.set_page_config(
    page_title="Synapse AI",
    page_icon="🧠",
    layout="wide"
)

# Custom CSS
st.markdown("""
    <style>
    .stApp {
        background-color: #0E1117;
        color: #FAFAFA;
    }
    .stChatInput input {
        background-color: #262730 !important;
        color: #FAFAFA !important;
        border: 1px solid #4B4B4B !important;
    }
    .user-message {
        background-color: #262730;
        padding: 1rem;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
    }
    .bot-message {
        background-color: #0E1117;
        padding: 1rem;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
        border: 1px solid #262730;
    }
    </style>
""", unsafe_allow_html=True)

# Initialize Session State
if "messages" not in st.session_state:
    st.session_state.messages = []

if "vector_store" not in st.session_state:
    st.session_state.vector_store = VectorStore()

# Sidebar
with st.sidebar:
    st.title("🧠 Synapse AI")
    st.markdown("---")
    
    st.subheader("Configuration")
    model_name = st.text_input("Model Name", value=settings.MODEL_NAME)
    ollama_url = st.text_input("Ollama URL", value=settings.OLLAMA_BASE_URL)
    
    # Update settings if changed
    if ollama_url != settings.OLLAMA_BASE_URL:
        settings.OLLAMA_BASE_URL = ollama_url
    
    st.markdown("---")
    st.subheader("Document Ingestion")
    uploaded_file = st.file_uploader("Upload PDF", type=["pdf"])
    
    if uploaded_file and st.button("Ingest Document"):
        with st.spinner("Ingesting document..."):
            # Save uploaded file to temp file
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
                tmp_file.write(uploaded_file.getvalue())
                tmp_path = tmp_file.name
            
            try:
                chunks = load_and_split_pdf(tmp_path)
                st.session_state.vector_store.add_documents(chunks)
                st.success(f"Ingested {len(chunks)} chunks!")
            except Exception as e:
                st.error(f"Error ingesting document: {str(e)}")
            finally:
                os.remove(tmp_path)
    
    st.markdown("---")
    st.subheader("Web Ingestion")
    web_url = st.text_input("Enter URL", placeholder="https://example.com")
    
    if web_url and st.button("Ingest URL"):
        with st.spinner(f"Ingesting {web_url}..."):
            try:
                # Lazy import to avoid circular dependency if any, though none here
                from src.core.ingest import load_and_split_web_page
                chunks = load_and_split_web_page(web_url)
                st.session_state.vector_store.add_documents(chunks)
                st.success(f"Ingested {len(chunks)} chunks from URL!")
            except Exception as e:
                st.error(f"Error ingesting URL: {str(e)}")

# Main Chat Interface
st.header("Document Intelligence Engine")

# Display Chat History
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# User Input
if prompt := st.chat_input("Ask a question about your documents..."):
    # Add user message to history
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    # Generate Response
    with st.chat_message("assistant"):
        message_placeholder = st.empty()
        full_response = ""
        
        with st.spinner("Thinking..."):
            try:
                qa_chain = create_rag_chain(
                    st.session_state.vector_store,
                    model_name=model_name
                )
                
                # Run the chain
                response = qa_chain.invoke({"query": prompt})
                result = response["result"]
                source_documents = response["source_documents"]
                
                # Format Response
                full_response = result
                
                # Append Sources (Optional)
                if source_documents:
                    full_response += "\n\n**Sources:**\n"
                    for i, doc in enumerate(source_documents, 1):
                        source_text = doc.page_content[:150].replace("\n", " ") + "..."
                        full_response += f"{i}. {source_text}\n"

                message_placeholder.markdown(full_response)
                
            except Exception as e:
                full_response = f"Error: {str(e)}\n\nMake sure Ollama is running and the model `{model_name}` is pulled."
                message_placeholder.error(full_response)
        
        # Add assistant message to history
        st.session_state.messages.append({"role": "assistant", "content": full_response})
