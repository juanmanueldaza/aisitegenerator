/**
 * Toast Notification Component
 * Provides user feedback through toast notifications
 */

class Toast {
    static container = null;

    static init() {
        if (!this.container) {
            this.container = document.getElementById('toast-container');
        }
    }

    /**
     * Show toast notification
     */
    static show(options = {}) {
        this.init();

        const {
            type = 'info',
            title = '',
            message = '',
            duration = 4000,
            actions = []
        } = options;

        const toast = this.createToast(type, title, message, actions);
        this.container.appendChild(toast);

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.remove(toast);
            }, duration);
        }

        return toast;
    }

    /**
     * Create toast element
     */
    static createToast(type, title, message, actions) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const content = document.createElement('div');
        content.className = 'toast-content';

        if (title) {
            const titleElement = document.createElement('div');
            titleElement.className = 'toast-title';
            titleElement.textContent = title;
            content.appendChild(titleElement);
        }

        if (message) {
            const messageElement = document.createElement('div');
            messageElement.className = 'toast-message';
            messageElement.textContent = message;
            content.appendChild(messageElement);
        }

        toast.appendChild(content);

        // Add actions if provided
        if (actions.length > 0) {
            const actionsContainer = document.createElement('div');
            actionsContainer.className = 'toast-actions';

            actions.forEach(action => {
                const button = document.createElement('button');
                button.className = `btn btn-sm ${action.style || 'btn-secondary'}`;
                button.textContent = action.text;
                button.onclick = () => {
                    if (action.onClick) action.onClick();
                    this.remove(toast);
                };
                actionsContainer.appendChild(button);
            });

            toast.appendChild(actionsContainer);
        }

        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'toast-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => this.remove(toast);
        toast.appendChild(closeBtn);

        return toast;
    }

    /**
     * Remove toast with animation
     */
    static remove(toast) {
        if (toast.parentNode) {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }

    /**
     * Show success toast
     */
    static success(title, message, duration = 4000) {
        return this.show({
            type: 'success',
            title,
            message,
            duration
        });
    }

    /**
     * Show error toast
     */
    static error(title, message, duration = 6000) {
        return this.show({
            type: 'error',
            title,
            message,
            duration
        });
    }

    /**
     * Show warning toast
     */
    static warning(title, message, duration = 5000) {
        return this.show({
            type: 'warning',
            title,
            message,
            duration
        });
    }

    /**
     * Show info toast
     */
    static info(title, message, duration = 4000) {
        return this.show({
            type: 'info',
            title,
            message,
            duration
        });
    }

    /**
     * Clear all toasts
     */
    static clearAll() {
        this.init();
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
    }
}

// Add CSS animation for slideOut
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .toast-actions {
        margin-top: 0.5rem;
        display: flex;
        gap: 0.5rem;
    }
    
    .btn-sm {
        padding: 0.25rem 0.75rem;
        font-size: 0.875rem;
    }
`;
document.head.appendChild(style);

// Make available globally
window.Toast = Toast;