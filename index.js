console.log("Synapse AI: Streaming Version 1.1 (Feb 23)");
const chatFeed = document.getElementById('chat-feed');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const uploadBtn = document.getElementById('upload-btn');
const fileInput = document.getElementById('file-input');
const fileList = document.getElementById('file-list');
const resetBtn = document.getElementById('reset-btn'); // New Reset Button
const startScreen = document.querySelector('.start-screen');
const themeToggle = document.getElementById('theme-toggle');

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// --- THEME TOGGLE LOGIC ---
const sunIcon = `<svg class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
const moonIcon = `<svg class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    themeToggle.innerHTML = isDark ? sunIcon : moonIcon;
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

        // FIX: Create the FormData object and attach the files
        const formData = new FormData();
        files.forEach(file => {
            formData.append('file', file); // 'file' is the key your Python backend will look for
        });

        const response = await fetch('/api/ingest', {
            method: 'POST',
            body: formData // Now this works!
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
            showToast('Database cleared!');
        } catch (error) {
            showToast(`Error: ${error.message}`);
        }
    });
}
//Joni Dani
// --- CHAT HANDLER ---
function handleSend() {
    const text = userInput.value.trim();
    if (!text) return;

    if (startScreen) startScreen.style.display = 'none';

    // 1. Show User Message
    addMessage(text, 'user');
    userInput.value = '';

    // 2. Loading State (Make sure you added the Skeleton Loader CSS from the previous step!)
    const loadingId = showLoading();

    // 3. Mock Response with a Citation Badge
    setTimeout(() => {
        removeLoading(loadingId);
        
        // We inject a <span class="citation"> here to create the clickable badge
        const mockResponse = `I've scanned the document. Based on the architecture diagrams, the 'Ingestion Node' connects directly to the 'Vector Store' via a secure pipeline. <span class="citation" title="View source document">🔗 system_architecture.pdf (pg. 4)</span>`;
        
        addMessage(mockResponse, 'bot');
    }, 1500);
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

    // Auto-remove after 4 seconds
    setTimeout(() => {
        toast.classList.add('hide');
        // Wait for the slide-out animation to finish before deleting the element
        toast.addEventListener('transitionend', () => toast.remove());
    }, 4000);
}

function addMessage(text, sender, isHtml = false) {
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
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
});