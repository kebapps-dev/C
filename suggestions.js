// Suggestion Box System
// Handles user suggestions and email submissions

// Email configuration - UPDATE THIS EMAIL ADDRESS
const SUGGESTION_EMAIL = 'conner.glaser@kebamerica.com';

// Configuration
const SUGGESTION_CONFIG = {
    emailEndpoint: `https://formsubmit.co/${SUGGESTION_EMAIL}`,
    maxSuggestionLength: 1000,
    showThankYouDuration: 3000, // 3 seconds
    buttonText: {
        submit: 'Send Suggestion',
        sending: 'Sending...',
        sent: 'Suggestion Sent!'
    }
};

// Initialize suggestion box when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    createSuggestionBox();
});

// Create and inject the suggestion box HTML
function createSuggestionBox() {
    const suggestionHtml = `
        <div id="suggestionBox" class="suggestion-box">
            <button id="suggestionToggle" class="suggestion-toggle" title="Send us a suggestion">
                💡 Suggestions
            </button>
            
            <div id="suggestionPanel" class="suggestion-panel hidden">
                <div class="suggestion-header">
                    <h3>Share Your Suggestions</h3>
                    <button id="closeSuggestion" class="close-btn">&times;</button>
                </div>
                
                <form id="suggestionForm" class="suggestion-form">
                    <div class="form-group">
                        <label for="userName">Name (Optional):</label>
                        <input type="text" id="userName" name="name" placeholder="Your name">
                    </div>
                    
                    <div class="form-group">
                        <label for="userEmail">Email (Optional):</label>
                        <input type="email" id="userEmail" name="email" placeholder="your.email@example.com">
                    </div>
                    
                    <div class="form-group">
                        <label for="suggestionText">Suggestion <span class="required">*</span>:</label>
                        <textarea id="suggestionText" name="suggestion" required 
                                placeholder="Tell us your ideas for improvements, new features, or any feedback..."
                                maxlength="${SUGGESTION_CONFIG.maxSuggestionLength}"></textarea>
                        <div class="char-count">
                            <span id="charCount">0</span>/${SUGGESTION_CONFIG.maxSuggestionLength} characters
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="currentApp">Current Application:</label>
                        <input type="text" id="currentApp" name="application" readonly>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" id="cancelSuggestion" class="btn-cancel">Cancel</button>
                        <button type="submit" id="submitSuggestion" class="btn-submit">
                            ${SUGGESTION_CONFIG.buttonText.submit}
                        </button>
                    </div>
                </form>
                
                <div id="thankYouMessage" class="thank-you-message hidden">
                    <h3>Thank You!</h3>
                    <p>Your suggestion has been sent successfully. We appreciate your feedback!</p>
                </div>
            </div>
        </div>
    `;
    
    // Create styles
    const suggestionStyles = `
        <style id="suggestionStyles">
            .suggestion-box {
                position: fixed;
                top: 25px;
                right: 20px;
                z-index: 1000;
                font-family: Arial, sans-serif;
            }
            
            .suggestion-toggle {
                background: linear-gradient(135deg, #4CAF50, #45a049);
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 25px;
                cursor: pointer;
                font-size: 14px;
                font-weight: bold;
                box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .suggestion-toggle:hover {
                background: linear-gradient(135deg, #45a049, #3d8b40);
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
            }
            
            .suggestion-panel {
                position: absolute;
                bottom: 60px;
                right: 0;
                width: 400px;
                max-width: 90vw;
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
                border: 1px solid #e0e0e0;
                transition: all 0.3s ease;
                transform: translateY(10px);
                opacity: 0;
            }
            
            .suggestion-panel:not(.hidden) {
                transform: translateY(0);
                opacity: 1;
            }
            
            .hidden {
                display: none !important;
            }
            
            .suggestion-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 20px 10px;
                border-bottom: 1px solid #f0f0f0;
            }
            
            .suggestion-header h3 {
                margin: 0;
                color: #333;
                font-size: 18px;
            }
            
            .close-btn {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #999;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.2s ease;
            }
            
            .close-btn:hover {
                background: #f5f5f5;
                color: #333;
            }
            
            .suggestion-form {
                padding: 20px;
            }
            
            .form-group {
                margin-bottom: 16px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 6px;
                font-weight: 600;
                color: #555;
                font-size: 14px;
            }
            
            .required {
                color: #e53e3e;
            }
            
            .form-group input,
            .form-group textarea {
                width: 100%;
                padding: 10px;
                border: 2px solid #e0e0e0;
                border-radius: 6px;
                font-size: 14px;
                transition: border-color 0.2s ease;
                box-sizing: border-box;
            }
            
            .form-group input:focus,
            .form-group textarea:focus {
                outline: none;
                border-color: #4CAF50;
                box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
            }
            
            .form-group textarea {
                resize: vertical;
                min-height: 100px;
                font-family: Arial, sans-serif;
            }
            
            .char-count {
                text-align: right;
                font-size: 12px;
                color: #999;
                margin-top: 4px;
            }
            
            .form-actions {
                display: flex;
                gap: 10px;
                justify-content: flex-end;
                margin-top: 20px;
            }
            
            .btn-cancel,
            .btn-submit {
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                transition: all 0.2s ease;
            }
            
            .btn-cancel {
                background: #f5f5f5;
                color: #666;
            }
            
            .btn-cancel:hover {
                background: #ebebeb;
            }
            
            .btn-submit {
                background: #4CAF50;
                color: white;
            }
            
            .btn-submit:hover {
                background: #45a049;
            }
            
            .btn-submit:disabled {
                background: #ccc;
                cursor: not-allowed;
            }
            
            .thank-you-message {
                padding: 40px 20px;
                text-align: center;
            }
            
            .thank-you-message h3 {
                color: #4CAF50;
                margin-bottom: 10px;
            }
            
            .thank-you-message p {
                color: #666;
                margin: 0;
            }
            
            @media (max-width: 480px) {
                .suggestion-panel {
                    width: calc(100vw - 40px);
                    right: 20px;
                }
                
                .suggestion-box {
                    right: 10px;
                    bottom: 10px;
                }
            }
        </style>
    `;
    
    // Inject styles and HTML
    document.head.insertAdjacentHTML('beforeend', suggestionStyles);
    document.body.insertAdjacentHTML('beforeend', suggestionHtml);
    
    // Initialize event listeners
    initializeSuggestionEvents();
    
    // Set current application
    updateCurrentApplication();
}

// Initialize all event listeners for the suggestion box
function initializeSuggestionEvents() {
    const toggleBtn = document.getElementById('suggestionToggle');
    const panel = document.getElementById('suggestionPanel');
    const closeBtn = document.getElementById('closeSuggestion');
    const cancelBtn = document.getElementById('cancelSuggestion');
    const form = document.getElementById('suggestionForm');
    const textarea = document.getElementById('suggestionText');
    const charCount = document.getElementById('charCount');
    
    // Toggle panel visibility
    toggleBtn.addEventListener('click', () => {
        toggleSuggestionPanel();
    });
    
    // Close panel
    [closeBtn, cancelBtn].forEach(btn => {
        btn.addEventListener('click', () => {
            closeSuggestionPanel();
        });
    });
    
    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
        if (!document.getElementById('suggestionBox').contains(e.target)) {
            closeSuggestionPanel();
        }
    });
    
    // Character counter
    textarea.addEventListener('input', () => {
        const count = textarea.value.length;
        charCount.textContent = count;
        
        if (count > SUGGESTION_CONFIG.maxSuggestionLength * 0.9) {
            charCount.style.color = '#e53e3e';
        } else {
            charCount.style.color = '#999';
        }
    });
    
    // Form submission
    form.addEventListener('submit', handleSuggestionSubmit);
}

// Toggle suggestion panel visibility
function toggleSuggestionPanel() {
    const panel = document.getElementById('suggestionPanel');
    const form = document.getElementById('suggestionForm');
    const thankYou = document.getElementById('thankYouMessage');
    
    if (panel.classList.contains('hidden')) {
        // Show panel and ensure form is visible
        panel.classList.remove('hidden');
        form.classList.remove('hidden');
        thankYou.classList.add('hidden');
        updateCurrentApplication();
        
        // Focus on textarea
        setTimeout(() => {
            document.getElementById('suggestionText').focus();
        }, 100);
    } else {
        closeSuggestionPanel();
    }
}

// Close suggestion panel
function closeSuggestionPanel() {
    const panel = document.getElementById('suggestionPanel');
    panel.classList.add('hidden');
    
    // Reset form after a delay
    setTimeout(() => {
        resetSuggestionForm();
    }, 300);
}

// Reset the suggestion form
function resetSuggestionForm() {
    const form = document.getElementById('suggestionForm');
    const thankYou = document.getElementById('thankYouMessage');
    const submitBtn = document.getElementById('submitSuggestion');
    
    form.reset();
    form.classList.remove('hidden');
    thankYou.classList.add('hidden');
    
    submitBtn.disabled = false;
    submitBtn.textContent = SUGGESTION_CONFIG.buttonText.submit;
    
    document.getElementById('charCount').textContent = '0';
    document.getElementById('charCount').style.color = '#999';
}

// Update current application field
function updateCurrentApplication() {
    const appSelect = document.getElementById('application');
    const currentAppField = document.getElementById('currentApp');
    
    if (appSelect && currentAppField) {
        const selectedApp = appSelect.value || 'None selected';
        currentAppField.value = selectedApp;
    }
}

// Handle suggestion form submission
async function handleSuggestionSubmit(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitSuggestion');
    const form = document.getElementById('suggestionForm');
    
    // Disable submit button and show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = SUGGESTION_CONFIG.buttonText.sending;
    
    try {
        const formData = new FormData(form);
        
        // Add timestamp and user agent
        formData.append('timestamp', new Date().toISOString());
        formData.append('userAgent', navigator.userAgent);
        formData.append('url', window.location.href);
        
        // Send email using FormSubmit or similar service
        const response = await fetch(SUGGESTION_CONFIG.emailEndpoint, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            showThankYouMessage();
        } else {
            throw new Error('Failed to send suggestion');
        }
        
    } catch (error) {
        console.error('Error sending suggestion:', error);
        
        // Fallback: try mailto link
        const suggestion = document.getElementById('suggestionText').value;
        const name = document.getElementById('userName').value;
        const email = document.getElementById('userEmail').value;
        const app = document.getElementById('currentApp').value;
        
        const subject = encodeURIComponent(`Product Calculator Suggestion - ${app}`);
        const body = encodeURIComponent(`
Suggestion: ${suggestion}

Name: ${name || 'Not provided'}
Email: ${email || 'Not provided'}
Application: ${app}
Timestamp: ${new Date().toISOString()}
URL: ${window.location.href}
        `);
        
        const mailtoLink = `mailto:${SUGGESTION_EMAIL}?subject=${subject}&body=${body}`;
        
        // Try to open mailto
        const mailWindow = window.open(mailtoLink);
        
        // Show thank you message even if email client doesn't open
        setTimeout(() => {
            showThankYouMessage();
        }, 1000);
        
        // Reset button if mailto fails
        if (!mailWindow) {
            submitBtn.disabled = false;
            submitBtn.textContent = SUGGESTION_CONFIG.buttonText.submit;
            alert(`Unable to send email automatically. Please copy your suggestion and send it manually to: ${SUGGESTION_EMAIL}`);
        }
    }
}

// Show thank you message
function showThankYouMessage() {
    const form = document.getElementById('suggestionForm');
    const thankYou = document.getElementById('thankYouMessage');
    const submitBtn = document.getElementById('submitSuggestion');
    
    form.classList.add('hidden');
    thankYou.classList.remove('hidden');
    
    submitBtn.textContent = SUGGESTION_CONFIG.buttonText.sent;
    
    // Auto-close after delay
    setTimeout(() => {
        closeSuggestionPanel();
    }, SUGGESTION_CONFIG.showThankYouDuration);
}

// Public API for external use
window.SuggestionBox = {
    open: toggleSuggestionPanel,
    close: closeSuggestionPanel,
    updateApp: updateCurrentApplication
};
