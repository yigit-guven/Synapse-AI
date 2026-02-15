import os
import shutil
import tempfile
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List

from src.core.ingest import load_and_split_pdf, load_and_split_web_page
from src.core.vector_store import VectorStore
from src.core.llm import create_rag_chain
from src.core.config import settings

app = FastAPI(title="Synapse AI API")

# Initialize Vector Store (Global Singleton)
vector_store = VectorStore()

# Request Models
class ChatRequest(BaseModel):
    message: str
    model_name: str = "llama3"

class ResetRequest(BaseModel):
    pass

# --- API Endpoints ---

@app.get("/")
async def serve_index():
    return FileResponse("index.html")

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        qa_chain = create_rag_chain(vector_store, model_name=request.model_name)
        
        # Invoke chain
        response = qa_chain.invoke({"input": request.message})
        
        return {
            "answer": response["answer"],
            "context": [doc.page_content for doc in response["context"]]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ingest")
async def ingest_endpoint(files: List[UploadFile] = File(...)):
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    
    ingested_count = 0
    errors = []

    for file in files:
        try:
            # Save to temp file
            suffix = os.path.splitext(file.filename)[1]
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                shutil.copyfileobj(file.file, tmp)
                tmp_path = tmp.name
            
            # Process
            if suffix.lower() == ".pdf":
                chunks = load_and_split_pdf(tmp_path)
                vector_store.add_documents(chunks)
                ingested_count += len(chunks)
            else:
                errors.append(f"Unsupported file type: {file.filename}")

            # Cleanup
            os.remove(tmp_path)
            
        except Exception as e:
            errors.append(f"Error processing {file.filename}: {str(e)}")
            
    return {
        "message": f"Ingested {ingested_count} chunks.",
        "errors": errors
    }

@app.post("/api/reset")
async def reset_endpoint():
    try:
        vector_store.clear()
        return {"message": "Database cleared successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Mount Static Files (CSS, JS)
# We mount root to serve style.css and index.js if they are in the root directory
app.mount("/", StaticFiles(directory="."), name="static")
