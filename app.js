class AISiteGenerator {
    constructor() {
        this.suggestions = [];
        this.appliedSuggestions = [];
        this.undoStack = [];
        this.redoStack = [];
        this.currentProject = {
            html: '',
            css: '',
            js: ''
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadMockSuggestions();
        this.updatePreview();
    }

    bindEvents() {
        // Chat functionality
        document.getElementById('sendMessage').addEventListener('click', () => this.sendMessage());
        document.getElementById('userInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Undo/Redo functionality
        document.getElementById('undoBtn').addEventListener('click', () => this.undo());
        document.getElementById('redoBtn').addEventListener('click', () => this.redo());

        // Preview controls
        document.getElementById('refreshPreview').addEventListener('click', () => this.updatePreview());
        document.getElementById('previewToggle').addEventListener('click', () => this.togglePreview());

        // Code editor tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // Editor content changes
        document.getElementById('htmlEditor').addEventListener('input', () => this.updateProjectCode('html'));
        document.getElementById('cssEditor').addEventListener('input', () => this.updateProjectCode('css'));
        document.getElementById('jsEditor').addEventListener('input', () => this.updateProjectCode('js'));

        // Modal controls
        document.querySelector('.modal-close').addEventListener('click', () => this.closeModal());
        document.getElementById('acceptSuggestion').addEventListener('click', () => this.acceptSuggestion());
        document.getElementById('modifySuggestion').addEventListener('click', () => this.modifySuggestion());
        document.getElementById('rejectSuggestion').addEventListener('click', () => this.rejectSuggestion());

        // Close modal on outside click
        document.getElementById('suggestionModal').addEventListener('click', (e) => {
            if (e.target.id === 'suggestionModal') this.closeModal();
        });
    }

    sendMessage() {
        const input = document.getElementById('userInput');
        const message = input.value.trim();
        if (!message) return;

        this.addChatMessage(message, 'user');
        input.value = '';

        // Simulate AI response with suggestions
        setTimeout(() => {
            this.generateAIResponse(message);
        }, 1000);
    }

    addChatMessage(message, type) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = message;
        
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    generateAIResponse(userMessage) {
        const responses = [
            "Great! I can help you create that. Let me suggest some content and structure for your website.",
            "I understand what you're looking for. Here are some recommendations based on your requirements.",
            "That sounds like an interesting project! I'll generate some suggestions to get you started.",
            "Perfect! Let me create some content and design suggestions for your website."
        ];

        const response = responses[Math.floor(Math.random() * responses.length)];
        this.addChatMessage(response, 'ai');

        // Generate new suggestions based on user input
        this.generateContextualSuggestions(userMessage);
    }

    generateContextualSuggestions(context) {
        const newSuggestions = [
            {
                id: Date.now() + 1,
                type: 'content',
                title: 'Homepage Content',
                description: `Create a compelling homepage with hero section based on: "${context}"`,
                code: `<section class="hero">
    <h1>Welcome to Your Website</h1>
    <p>Based on your idea: ${context}</p>
    <button class="cta-button">Get Started</button>
</section>`,
                target: 'html'
            },
            {
                id: Date.now() + 2,
                type: 'design',
                title: 'Modern Styling',
                description: 'Add modern CSS styling with responsive design',
                code: `.hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 4rem 2rem;
    text-align: center;
}

.hero h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.cta-button {
    background: #ff6b6b;
    color: white;
    padding: 1rem 2rem;
    border: none;
    border-radius: 25px;
    font-size: 1.1rem;
    cursor: pointer;
    transition: transform 0.2s;
}

.cta-button:hover {
    transform: translateY(-2px);
}`,
                target: 'css'
            },
            {
                id: Date.now() + 3,
                type: 'functionality',
                title: 'Interactive Features',
                description: 'Add interactive JavaScript functionality',
                code: `document.addEventListener('DOMContentLoaded', function() {
    const ctaButton = document.querySelector('.cta-button');
    
    ctaButton.addEventListener('click', function() {
        alert('Welcome! Your website is coming to life!');
        this.style.background = '#45b7d1';
    });
    
    // Smooth scroll effect
    window.addEventListener('scroll', function() {
        const hero = document.querySelector('.hero');
        const scrolled = window.pageYOffset;
        hero.style.transform = 'translateY(' + scrolled * 0.5 + 'px)';
    });
});`,
                target: 'js'
            }
        ];

        newSuggestions.forEach(suggestion => {
            this.suggestions.push(suggestion);
            this.renderSuggestion(suggestion);
        });
    }

    loadMockSuggestions() {
        const mockSuggestions = [
            {
                id: 1,
                type: 'seo',
                title: 'SEO Meta Tags',
                description: 'Add essential meta tags for better search engine optimization',
                code: `<meta name="description" content="Your website description here">
<meta name="keywords" content="relevant, keywords, here">
<meta property="og:title" content="Your Website Title">
<meta property="og:description" content="Your website description">
<meta property="og:image" content="/path/to/image.jpg">`,
                target: 'html'
            },
            {
                id: 2,
                type: 'structure',
                title: 'Navigation Menu',
                description: 'Create a responsive navigation menu structure',
                code: `<nav class="navbar">
    <div class="nav-brand">Your Logo</div>
    <ul class="nav-menu">
        <li><a href="#home">Home</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#services">Services</a></li>
        <li><a href="#contact">Contact</a></li>
    </ul>
</nav>`,
                target: 'html'
            }
        ];

        this.suggestions = mockSuggestions;
        this.renderSuggestions();
    }

    renderSuggestions() {
        this.suggestions.forEach(suggestion => this.renderSuggestion(suggestion));
    }

    renderSuggestion(suggestion) {
        const container = document.getElementById('suggestionsContainer');
        const suggestionDiv = document.createElement('div');
        suggestionDiv.className = 'suggestion-item';
        suggestionDiv.dataset.id = suggestion.id;

        const status = this.getSuggestionStatus(suggestion.id);
        if (status) suggestionDiv.classList.add(status);

        suggestionDiv.innerHTML = `
            <div class="suggestion-type">${suggestion.type}</div>
            <div class="suggestion-title">${suggestion.title}</div>
            <div class="suggestion-description">${suggestion.description}</div>
            <div class="suggestion-actions">
                <button class="btn btn-success btn-small" onclick="app.showSuggestionModal(${suggestion.id})">
                    Preview & Apply
                </button>
                <button class="btn btn-warning btn-small" onclick="app.modifyAndApply(${suggestion.id})">
                    Edit & Apply
                </button>
                <button class="btn btn-danger btn-small" onclick="app.rejectSuggestionById(${suggestion.id})">
                    Reject
                </button>
            </div>
        `;

        container.appendChild(suggestionDiv);
    }

    showSuggestionModal(suggestionId) {
        const suggestion = this.suggestions.find(s => s.id === suggestionId);
        if (!suggestion) return;

        document.getElementById('modalTitle').textContent = suggestion.title;
        document.getElementById('modalDescription').textContent = suggestion.description;
        document.getElementById('modalPreview').textContent = suggestion.code;
        
        this.currentSuggestion = suggestion;
        document.getElementById('suggestionModal').classList.remove('hidden');
    }

    closeModal() {
        document.getElementById('suggestionModal').classList.add('hidden');
        this.currentSuggestion = null;
    }

    acceptSuggestion() {
        if (!this.currentSuggestion) return;
        
        this.applySuggestion(this.currentSuggestion);
        this.closeModal();
    }

    modifySuggestion() {
        if (!this.currentSuggestion) return;
        
        // Switch to the appropriate editor tab
        this.switchTab(this.currentSuggestion.target);
        
        // Add the suggestion code to the editor for modification
        const editor = document.getElementById(`${this.currentSuggestion.target}Editor`);
        const currentContent = editor.value;
        const newContent = currentContent + '\n\n' + this.currentSuggestion.code;
        editor.value = newContent;
        
        this.updateProjectCode(this.currentSuggestion.target);
        this.markSuggestionAsApplied(this.currentSuggestion.id);
        this.closeModal();
    }

    rejectSuggestion() {
        if (!this.currentSuggestion) return;
        
        this.markSuggestionAsRejected(this.currentSuggestion.id);
        this.closeModal();
    }

    rejectSuggestionById(suggestionId) {
        this.markSuggestionAsRejected(suggestionId);
    }

    modifyAndApply(suggestionId) {
        const suggestion = this.suggestions.find(s => s.id === suggestionId);
        if (!suggestion) return;
        
        this.currentSuggestion = suggestion;
        this.modifySuggestion();
    }

    applySuggestion(suggestion) {
        // Save current state for undo
        this.saveStateForUndo();
        
        // Apply the suggestion
        const editor = document.getElementById(`${suggestion.target}Editor`);
        const currentContent = editor.value;
        const newContent = currentContent + '\n\n' + suggestion.code;
        editor.value = newContent;
        
        this.updateProjectCode(suggestion.target);
        this.markSuggestionAsApplied(suggestion.id);
        
        // Clear redo stack
        this.redoStack = [];
        this.updateUndoRedoButtons();
    }

    markSuggestionAsApplied(suggestionId) {
        const element = document.querySelector(`[data-id="${suggestionId}"]`);
        if (element) {
            element.classList.remove('rejected');
            element.classList.add('applied');
        }
        
        if (!this.appliedSuggestions.includes(suggestionId)) {
            this.appliedSuggestions.push(suggestionId);
        }
    }

    markSuggestionAsRejected(suggestionId) {
        const element = document.querySelector(`[data-id="${suggestionId}"]`);
        if (element) {
            element.classList.remove('applied');
            element.classList.add('rejected');
        }
        
        // Remove from applied suggestions if it was there
        this.appliedSuggestions = this.appliedSuggestions.filter(id => id !== suggestionId);
    }

    getSuggestionStatus(suggestionId) {
        const element = document.querySelector(`[data-id="${suggestionId}"]`);
        if (element) {
            if (element.classList.contains('applied')) return 'applied';
            if (element.classList.contains('rejected')) return 'rejected';
        }
        return null;
    }

    saveStateForUndo() {
        this.undoStack.push({
            html: this.currentProject.html,
            css: this.currentProject.css,
            js: this.currentProject.js,
            appliedSuggestions: [...this.appliedSuggestions]
        });

        // Limit undo stack size
        if (this.undoStack.length > 20) {
            this.undoStack.shift();
        }
    }

    undo() {
        if (this.undoStack.length === 0) return;
        
        // Save current state for redo
        this.redoStack.push({
            html: this.currentProject.html,
            css: this.currentProject.css,
            js: this.currentProject.js,
            appliedSuggestions: [...this.appliedSuggestions]
        });
        
        // Restore previous state
        const previousState = this.undoStack.pop();
        this.currentProject = {
            html: previousState.html,
            css: previousState.css,
            js: previousState.js
        };
        this.appliedSuggestions = previousState.appliedSuggestions;
        
        // Update UI
        this.updateEditors();
        this.updateSuggestionsDisplay();
        this.updatePreview();
        this.updateUndoRedoButtons();
    }

    redo() {
        if (this.redoStack.length === 0) return;
        
        // Save current state for undo
        this.saveStateForUndo();
        
        // Restore next state
        const nextState = this.redoStack.pop();
        this.currentProject = {
            html: nextState.html,
            css: nextState.css,
            js: nextState.js
        };
        this.appliedSuggestions = nextState.appliedSuggestions;
        
        // Update UI
        this.updateEditors();
        this.updateSuggestionsDisplay();
        this.updatePreview();
        this.updateUndoRedoButtons();
    }

    updateUndoRedoButtons() {
        document.getElementById('undoBtn').disabled = this.undoStack.length === 0;
        document.getElementById('redoBtn').disabled = this.redoStack.length === 0;
    }

    updateEditors() {
        document.getElementById('htmlEditor').value = this.currentProject.html;
        document.getElementById('cssEditor').value = this.currentProject.css;
        document.getElementById('jsEditor').value = this.currentProject.js;
    }

    updateSuggestionsDisplay() {
        // Update suggestion items to reflect current applied state
        document.querySelectorAll('.suggestion-item').forEach(item => {
            const id = parseInt(item.dataset.id);
            item.classList.remove('applied', 'rejected');
            
            if (this.appliedSuggestions.includes(id)) {
                item.classList.add('applied');
            }
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update editor content
        document.querySelectorAll('.editor-content').forEach(editor => {
            editor.classList.remove('active');
        });
        document.getElementById(`${tabName}Editor`).classList.add('active');
    }

    updateProjectCode(type) {
        const editor = document.getElementById(`${type}Editor`);
        this.currentProject[type] = editor.value;
        this.updatePreview();
    }

    updatePreview() {
        const previewFrame = document.getElementById('previewFrame');
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Preview</title>
                <style>${this.currentProject.css}</style>
            </head>
            <body>
                ${this.currentProject.html}
                <script>${this.currentProject.js}</script>
            </body>
            </html>
        `;
        
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        previewFrame.src = url;
    }

    togglePreview() {
        const previewSection = document.querySelector('.preview-section');
        previewSection.style.display = previewSection.style.display === 'none' ? 'flex' : 'none';
    }
}

// Initialize the application
const app = new AISiteGenerator();

// Update undo/redo buttons initially
app.updateUndoRedoButtons();