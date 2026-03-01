console.log("Synapse AI: Streaming Version 1.1 (Feb 23)");
const chatFeed = document.getElementById('chat-feed');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const uploadBtn = document.getElementById('upload-btn');
const fileInput = document.getElementById('file-input');
const fileList = document.getElementById('file-list');
const resetBtn = document.getElementById('reset-btn'); 
const startScreen = document.querySelector('.start-screen');
const themeToggle = document.getElementById('theme-toggle');

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// --- THEME LOGIC ---
const sunIcon = `<svg class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
const moonIcon = `<svg class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

function setTheme(isDark) {
    if (isDark) {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = sunIcon;
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-mode');
        themeToggle.innerHTML = moonIcon;
        localStorage.setItem('theme', 'light');
    }
}

// Initial choice: Get from localStorage, or default to dark
const savedTheme = localStorage.getItem('theme');
const prefersDark = savedTheme ? savedTheme === 'dark' : true;
setTheme(prefersDark);

themeToggle.addEventListener('click', () => {
    const isNowDark = !document.body.classList.contains('dark-mode');
    setTheme(isNowDark);
});

// --- UPLOAD HANDLER ---
uploadBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    for (let file of files) {
        if (file.size > MAX_FILE_SIZE_BYTES) {
            showToast(`Blocked: "${file.name}" exceeds ${MAX_FILE_SIZE_MB}MB.`, 'error');
            fileInput.value = '';
            return;
        }
    }

   
    const emptyState = document.querySelector('.empty-state');
    if (emptyState) emptyState.remove();

    files.forEach(file => {
        const item = document.createElement('div');
        item.classList.add('file-item');
        item.innerHTML = `<span>⏳</span> ${file.name}`;
        fileList.appendChild(item);
    });

    disableChatInput();

    try {
        const loadingId = showLoading("Ingesting documents...");

        // FIX: Create the FormData object and attach the files
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file); 
        });

        const response = await fetch('/api/ingest', {
            method: 'POST',
            body: formData 
        });

        removeLoading(loadingId);

        if (!response.ok) throw new Error('Ingestion failed');
        const result = await response.json();

        userInput.disabled = false;
        sendBtn.disabled = false;
        userInput.placeholder = "Ask about your documents...";

        const fileItems = fileList.querySelectorAll('.file-item span');
        fileItems.forEach(span => span.textContent = '📄');

        addMessage(`✅ Successfully ingested ${result.message}`, 'bot');

        enableChatInput();

    } catch (error) {
        console.error("Ingestion Error:", error);
        addMessage(`❌ Error: ${error.message}`, 'bot');
    }
});

if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to clear the entire database?')) return;

        try {
            const response = await fetch('/api/reset', { method: 'POST' });
            if (!response.ok) throw new Error('Reset failed');

            fileList.innerHTML = '<div class="empty-state">No files loaded.</div>';
            chatFeed.innerHTML = ''; // Clear chat
            if (startScreen) {
                chatFeed.appendChild(startScreen);
                startScreen.style.display = 'block';
            }

            
            userInput.disabled = true;
            sendBtn.disabled = true;
            userInput.placeholder = "Upload a document to unlock chat...";

            showToast('Database cleared!');
        } catch (error) {
            showToast(`Error: ${error.message}`);
        }
    });
}

// --- CHAT HANDLER ---
async function handleSend() {
    const text = userInput.value.trim();
    if (!text || userInput.disabled) return;

    if (startScreen) startScreen.style.display = 'none';

    //Show User Message
    addMessage(text, 'user');
    userInput.value = '';

    userInput.style.height = 'auto';

    //Loading State
    const loadingId = showLoading();

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Chat failed');
        }

        //Handle Streaming Response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let botMessageId = null;
        let bubble = null;
        let fullText = "";
        
        // A tracker to know when the AI actually starts talking
        let isFirstChunk = true; 

        while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
                // Remove the blinking cursor when completely finished
                if (bubble) bubble.innerHTML = `<strong>Synapse AI:</strong><br>${marked.parse(fullText)}`;
                break;
            }

            // NEW LOGIC: Only remove the skeleton loader when the FIRST piece of text arrives!
            if (isFirstChunk) {
                removeLoading(loadingId); 
                botMessageId = 'bot-' + Date.now();
                addMessage("", 'bot', botMessageId); 
                bubble = document.getElementById(botMessageId).querySelector('.bubble');
                isFirstChunk = false;
            }

            
            const chunk = decoder.decode(value, { stream: true });
            fullText += chunk;

            // Render markdown with the blinking cursor attached
            bubble.innerHTML = `<strong>Synapse AI:</strong><br>${marked.parse(fullText)}<span class="blinking-cursor"></span>`;
            chatFeed.scrollTop = chatFeed.scrollHeight;
        }

    } catch (error) {
        console.error("Chat Error:", error);
        removeLoading(loadingId);
        addMessage(`❌ Error: ${error.message}`, 'bot');
    }
}


// --- TOAST NOTIFICATION SYSTEM ---
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.classList.add('toast', type);

    // Choose an icon based on the type
    let icon = 'ℹ️';
    if (type === 'error') icon = '❌';
    if (type === 'success') icon = '✅';
    if (type === 'warning') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span> <div>${message}</div>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('hide'); 

        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

function addMessage(text, sender, id = null) {
    const row = document.createElement('div');
    row.classList.add('message-row', sender);
    if (id) row.id = id;

    const bubble = document.createElement('div');
    bubble.classList.add('bubble');

    if (sender === 'bot') {
        const htmlContent = text ? marked.parse(text) : '<span class="blinking-cursor"></span>';
        bubble.innerHTML = `<strong>Synapse AI:</strong><br>${htmlContent}`;
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

    // Replace the boring text with the sleek animated lines
    row.innerHTML = `
        <div class="bubble" style="background-color: transparent; padding-left: 0;">
            <div class="skeleton-container">
                <div class="skeleton-line"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line short"></div>
            </div>
        </div>
    `;

    chatFeed.appendChild(row);
    chatFeed.scrollTop = chatFeed.scrollHeight;
    return id;
}

function removeLoading(id) {
    const element = document.getElementById(id);
    if (element) element.remove();
}

sendBtn.addEventListener('click', handleSend);

userInput.addEventListener('input', function() {
    this.style.height = 'auto'; 
    this.style.height = (this.scrollHeight) + 'px'; 
});

userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault(); 
        handleSend();
        
        userInput.style.height = 'auto'; 
    }
});

// --- STATE MANAGEMENT ---
function enableChatInput() {
    userInput.disabled = false;
    sendBtn.disabled = false;
    userInput.placeholder = "Ask a question about your documents...";
    userInput.focus(); 
}

function disableChatInput() {
    userInput.disabled = true;
    sendBtn.disabled = true;
    userInput.placeholder = "Upload a document to unlock chat...";
}