const chatFeed = document.getElementById('chat-feed');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const uploadBtn = document.getElementById('upload-btn');
const fileInput = document.getElementById('file-input');
const fileList = document.getElementById('file-list');
const startScreen = document.querySelector('.start-screen');
const themeToggle = document.getElementById('theme-toggle');
// --- THEME TOGGLE LOGIC ---
const sunIcon = `<svg class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
const moonIcon = `<svg class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

themeToggle.addEventListener('click', () => {
    // 1. Toggle the class on the BODY
    document.body.classList.toggle('dark-mode');
    
    // 2. Switch Icon
    const isDark = document.body.classList.contains('dark-mode');
    themeToggle.innerHTML = isDark ? sunIcon : moonIcon;
});


// --- UPLOAD HANDLER ---
uploadBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    const emptyState = document.querySelector('.empty-state');
    if (emptyState && files.length > 0) emptyState.remove();

    files.forEach(file => {
        const item = document.createElement('div');
        item.classList.add('file-item');
        item.innerHTML = `<span>📄</span> ${file.name}`;
        fileList.appendChild(item);
    });
});

// --- CHAT HANDLER ---
function handleSend() {
    const text = userInput.value.trim();
    if (!text) return;

    if (startScreen) startScreen.style.display = 'none';

    // 1. Show User Message
    addMessage(text, 'user');
    userInput.value = '';

    // 2. Loading State
    const loadingId = showLoading();

    // 3. Mock Response
    setTimeout(() => {
        removeLoading(loadingId);
        const mockResponse = "I've scanned the document. Based on the architecture diagrams, the 'Ingestion Node' connects directly to the 'Vector Store' via a secure pipeline.";
        addMessage(mockResponse, 'bot');
    }, 1200);
}

function addMessage(text, sender) {
    const row = document.createElement('div');
    row.classList.add('message-row', sender);
    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    
    if (sender === 'bot') {
        bubble.innerHTML = `<strong>Synapse AI:</strong><br>${text}`;
    } else {
        bubble.textContent = text;
    }

    row.appendChild(bubble);
    chatFeed.appendChild(row);
    chatFeed.scrollTop = chatFeed.scrollHeight;
}

function showLoading() {
    const id = 'loading-' + Date.now();
    const row = document.createElement('div');
    row.classList.add('message-row', 'bot');
    row.id = id;
    row.innerHTML = `<div class="bubble" style="color: var(--text-muted)">Processing...</div>`;
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