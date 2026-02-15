const chatFeed = document.getElementById('chat-feed');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const uploadBtn = document.getElementById('upload-btn');
const fileInput = document.getElementById('file-input');
const fileList = document.getElementById('file-list');
const resetBtn = document.getElementById('reset-btn');
const startScreen = document.querySelector('.start-screen');
const themeToggle = document.getElementById('theme-toggle');
const stopBtn = document.getElementById('stop-btn');
const inputActions = document.getElementById('input-actions');
const legalLink = document.getElementById('legal-link');
const legalModal = document.getElementById('legal-modal');
const closeModal = document.querySelector('.close-modal');

let abortController = null;

// --- THEME TOGGLE LOGIC ---
const sunIcon = `<svg class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
const moonIcon = `<svg class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

// Load Theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.innerHTML = sunIcon;
} else {
    themeToggle.innerHTML = moonIcon;
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    themeToggle.innerHTML = isDark ? sunIcon : moonIcon;
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// --- LEGAL MODAL ---
if (legalLink && legalModal) {
    legalLink.addEventListener('click', (e) => {
        e.preventDefault();
        legalModal.style.display = "block";
    });
    closeModal.addEventListener('click', () => legalModal.style.display = "none");
    window.addEventListener('click', (e) => {
        if (e.target == legalModal) legalModal.style.display = "none";
    });
}

// --- UPLOAD HANDLER ---
uploadBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    // Optimistic UI update
    const emptyState = document.querySelector('.empty-state');
    if (emptyState) emptyState.remove();

    files.forEach(file => {
        const item = document.createElement('div');
        item.classList.add('file-item');
        item.innerHTML = `<span>⏳</span> ${file.name}`;
        fileList.appendChild(item);
    });

    try {
        const loadingId = showLoading("Ingesting documents...");

        const response = await fetch('/api/ingest', {
            method: 'POST',
            body: formData
        });

        removeLoading(loadingId);

        if (!response.ok) throw new Error('Ingestion failed');

        const result = await response.json();

        // Update UI to show success
        const fileItems = fileList.querySelectorAll('.file-item span');
        fileItems.forEach(span => span.textContent = '📄');

        addMessage(`✅ Successfully ingested ${result.message}`, 'bot');

    } catch (error) {
        console.error(error);
        addMessage(`❌ Error: ${error.message}`, 'bot');
    }
});

// --- RESET HANDLER ---
if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to clear the vector database? Chat history will be preserved.')) return;

        try {
            const response = await fetch('/api/reset', { method: 'POST' });
            if (!response.ok) throw new Error('Reset failed');

            fileList.innerHTML = '<div class="empty-state">No files loaded.</div>';
            // Chat history is PRESERVED (no chatFeed.innerHTML = '')
            addMessage('🗑️ Knowledge base cleared. Chats preserved.', 'bot');
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    });
}

// --- CHAT HANDLER ---
async function handleSend() {
    const text = userInput.value.trim();
    if (!text) return;

    if (startScreen) startScreen.style.display = 'none';

    // 1. Show User Message
    addMessage(text, 'user');
    userInput.value = '';

    // 2. Loading State
    const loadingId = showLoading();

    // Show Stop Button
    if (inputActions) inputActions.style.display = 'flex';

    abortController = new AbortController();

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text }),
            signal: abortController.signal
        });

        removeLoading(loadingId);

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || 'Failed to get response');
        }

        const data = await response.json();
        const markdown = marked.parse(data.answer);
        addMessage(markdown, 'bot', true);

    } catch (error) {
        removeLoading(loadingId);
        if (error.name === 'AbortError') {
            addMessage('🛑 Generation stopped by user.', 'bot');
        } else {
            addMessage(`⚠️ Error: ${error.message}`, 'bot');
        }
    } finally {
        if (inputActions) inputActions.style.display = 'none';
        abortController = null;
    }
}

// Stop Button Logic
if (stopBtn) {
    stopBtn.addEventListener('click', () => {
        if (abortController) {
            abortController.abort();
        }
    });
}

function addMessage(text, sender, isHtml = false) {
    const row = document.createElement('div');
    row.classList.add('message-row', sender);
    const bubble = document.createElement('div');
    bubble.classList.add('bubble');

    // Animate in
    row.style.opacity = '0';
    row.style.transform = 'translateY(10px)';
    row.style.transition = 'opacity 0.3s, transform 0.3s';

    if (sender === 'bot') {
        bubble.innerHTML = `<strong>Synapse AI:</strong><br>${isHtml ? text : text}`;
    } else {
        bubble.textContent = text;
    }

    row.appendChild(bubble);
    chatFeed.appendChild(row);
    chatFeed.scrollTop = chatFeed.scrollHeight;

    // Trigger animation
    requestAnimationFrame(() => {
        row.style.opacity = '1';
        row.style.transform = 'translateY(0)';
    });
}

function showLoading(text = "Processing...") {
    const id = 'loading-' + Date.now();
    const row = document.createElement('div');
    row.classList.add('message-row', 'bot');
    row.id = id;
    row.innerHTML = `<div class="bubble" style="color: var(--text-muted)">${text}</div>`;
    chatFeed.appendChild(row);
    chatFeed.scrollTop = chatFeed.scrollHeight;
    return id;
}

function removeLoading(id) {
    const element = document.getElementById(id);
    if (element) element.remove();
}

sendBtn.addEventListener('click', handleSend);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
});