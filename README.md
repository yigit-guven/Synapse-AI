# Synapse AI

**High-Performance, Self-Hosted Document Intelligence Engine**

**Synapse AI** is an enterprise-grade RAG (Retrieval-Augmented Generation) infrastructure designed to bridge the gap between static unstructured data and actionable machine intelligence. By leveraging local Large Language Models (LLMs) and vector-based semantic search, Synapse AI transforms private document repositories into interactive, queryable knowledge bases.

---

## 🚀 Live Demo

Try the public demo version here: **[http://144.34.87.24:8501/](http://144.34.87.24:8501/)**

> [!WARNING]
> **Shared Environment**: This demo uses a shared database. **DO NOT** upload sensitive data.
> Please read the [Privacy Policy](PRIVACY_POLICY.md) before use.

---

## Core Philosophy: Zero-Leakage Intelligence

Most AI solutions sacrifice data sovereignty for ease of use. Synapse AI is built on the principle of **Data Sovereignty**. It is deployed exclusively on private Virtual Private Servers (VPS), ensuring that proprietary lore, legal documents, and sensitive business data never leave your controlled environment.

## Technical Architecture

The system operates through a multi-stage neural pipeline optimized for restricted hardware:

1.  **Ingestion & Neural Chunking**: Documents are parsed and decomposed into context-aware segments using recursive character splitting.
2.  **Vector Embedding**: Segments are transformed into high-dimensional vector space using `all-minilm` (or multilingual variants).
3.  **Semantic Retrieval**: Queries are processed using Cosine Similarity to retrieve the most relevant context from a local **ChromaDB** instance.
4.  **Inference**: A local LLM (via **Ollama**) synthesizes retrieved data to generate grounded, hallucination-free responses.

$$\text{Similarity}(A, B) = \frac{A \cdot B}{\|A\| \|B\|}$$

## Key Features

*   **Self-Sovereign Data**: Complete root-access control on Linux-based VPS environments.
*   **Dynamic Knowledge Injection**: Real-time PDF uploading and index refreshing via a Web Interface.
*   **Agentic Decision Support**: Engineered for complex reasoning tasks, from gaming lore consistency to regulatory compliance.
*   **GPU/CPU Optimized**: Lightweight containerized deployment via Docker.

## Business & Legal Utility

Designed with the German startup ecosystem in mind, Synapse AI facilitates Intelligent Document Processing (IDP) for:

*   **Regulatory Auditing**: Rapid analysis of *Aufenthaltstitel* (Residence Permit) requirements and legal frameworks.
*   **Financial Analysis**: Automated reporting on revenue streams from platforms like Roblox and Curseforge.
*   **Technical Documentation**: Ensuring architectural consistency for large-scale projects.

## Tech Stack

*   **Language**: Python 3.10+
*   **Vector Database**: ChromaDB
*   **Inference Engine**: Ollama (Llama 3 / Mistral)
*   **Frontend**: HTML5, CSS3, Vanilla JavaScript
*   **Containerization**: Docker & Docker Compose

## Installation & Usage

*(Coming Soon: Detailed Docker setup instructions)*

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yigit-guven/Synapse-AI.git
    cd Synapse-AI
    ```

2.  **Set up Virtual Environment**
    ```bash
    python -m venv venv
    # On Windows
    venv\Scripts\activate
    # On macOS/Linux
    source venv/bin/activate
    ```

3.  **Install Dependencies**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Run the Application**
    ```bash
    uvicorn src.api:app --host 0.0.0.0 --port 8000
    ```
    Access the UI at `http://localhost:8000`.

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to submit pull requests to this project.

## Security

For security concerns, please refer to [SECURITY.md](SECURITY.md).

---

*"Synapse AI isn't just a reader; it's the connection between your data and your decisions."*

<div align="center">
  <p>Developed with ❤️ by <a href="https://github.com/yigit-guven">Yigit Guven</a> & <a href="https://github.com/JoniDani1">Joni Dani</a></p>
</div>