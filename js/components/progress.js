/**
 * Progress Modal Component
 * Shows progress for long-running GitHub operations
 */

class Progress {
    static modal = null;
    static titleElement = null;
    static messageElement = null;
    static detailsElement = null;
    static progressFill = null;
    static isVisible = false;

    static init() {
        if (!this.modal) {
            this.modal = document.getElementById('progress-modal');
            this.titleElement = document.getElementById('progress-title');
            this.messageElement = document.getElementById('progress-message');
            this.detailsElement = document.getElementById('progress-details');
            this.progressFill = document.getElementById('progress-fill');
        }
    }

    /**
     * Show progress modal
     */
    static show(options = {}) {
        this.init();

        const {
            title = 'Processing...',
            message = 'Please wait...',
            percentage = 0,
            details = ''
        } = options;

        this.titleElement.textContent = title;
        this.messageElement.textContent = message;
        this.updateProgress(percentage);
        
        if (details) {
            this.addDetail(details);
        }

        this.modal.classList.remove('hidden');
        this.isVisible = true;
    }

    /**
     * Hide progress modal
     */
    static hide() {
        this.init();
        this.modal.classList.add('hidden');
        this.isVisible = false;
        this.clearDetails();
    }

    /**
     * Update progress percentage
     */
    static updateProgress(percentage) {
        this.init();
        const clampedPercentage = Math.max(0, Math.min(100, percentage));
        this.progressFill.style.width = `${clampedPercentage}%`;
    }

    /**
     * Update progress message
     */
    static updateMessage(message) {
        this.init();
        this.messageElement.textContent = message;
    }

    /**
     * Update progress title
     */
    static updateTitle(title) {
        this.init();
        this.titleElement.textContent = title;
    }

    /**
     * Add detail line to progress
     */
    static addDetail(detail) {
        this.init();
        const timestamp = new Date().toLocaleTimeString();
        const detailLine = `[${timestamp}] ${detail}\n`;
        this.detailsElement.textContent += detailLine;
        
        // Auto-scroll to bottom
        this.detailsElement.scrollTop = this.detailsElement.scrollHeight;
    }

    /**
     * Clear all details
     */
    static clearDetails() {
        this.init();
        this.detailsElement.textContent = '';
    }

    /**
     * Update progress with object containing multiple properties
     */
    static update(progressData) {
        if (progressData.title !== undefined) {
            this.updateTitle(progressData.title);
        }
        
        if (progressData.message !== undefined) {
            this.updateMessage(progressData.message);
        }
        
        if (progressData.percentage !== undefined) {
            this.updateProgress(progressData.percentage);
        }
        
        if (progressData.detail !== undefined) {
            this.addDetail(progressData.detail);
        }
    }

    /**
     * Show indeterminate progress (spinning animation)
     */
    static showIndeterminate(title = 'Processing...', message = 'Please wait...') {
        this.show({ title, message, percentage: 0 });
        
        // Add indeterminate animation class
        this.progressFill.classList.add('indeterminate');
        
        // Remove width constraint for indeterminate
        this.progressFill.style.width = '30%';
    }

    /**
     * Switch from indeterminate to determinate progress
     */
    static switchToDeterminate(percentage = 0) {
        this.init();
        this.progressFill.classList.remove('indeterminate');
        this.updateProgress(percentage);
    }

    /**
     * Track GitHub operation progress
     */
    static trackGitHubOperation(operationName, operation) {
        return new Promise(async (resolve, reject) => {
            try {
                this.show({
                    title: operationName,
                    message: 'Initializing...',
                    percentage: 0
                });

                this.addDetail(`Starting ${operationName}`);

                // Execute operation
                const result = await operation((progressData) => {
                    this.update(progressData);
                });

                this.updateProgress(100);
                this.updateMessage('Completed successfully!');
                this.addDetail(`${operationName} completed successfully`);

                // Keep modal open briefly to show completion
                setTimeout(() => {
                    this.hide();
                    resolve(result);
                }, 1500);

            } catch (error) {
                this.hide();
                reject(error);
            }
        });
    }

    /**
     * Track batch operation progress
     */
    static trackBatchOperation(operationName, operations) {
        return new Promise(async (resolve, reject) => {
            try {
                this.show({
                    title: operationName,
                    message: 'Starting batch operation...',
                    percentage: 0
                });

                const total = operations.length;
                let completed = 0;
                const results = [];

                for (const [index, operation] of operations.entries()) {
                    const operationName = operation.name || `Operation ${index + 1}`;
                    
                    this.updateMessage(`Processing: ${operationName}`);
                    this.addDetail(`Starting ${operationName}`);

                    try {
                        const result = await operation.execute();
                        results.push({ success: true, result, index, name: operationName });
                        completed++;
                        
                        this.addDetail(`✓ ${operationName} completed`);
                    } catch (error) {
                        results.push({ success: false, error, index, name: operationName });
                        this.addDetail(`✗ ${operationName} failed: ${error.message}`);
                    }

                    // Update progress
                    const percentage = Math.round(((index + 1) / total) * 100);
                    this.updateProgress(percentage);

                    // Small delay between operations
                    if (index < total - 1) {
                        await new Promise(resolve => setTimeout(resolve, 200));
                    }
                }

                this.updateMessage(`Completed: ${completed}/${total} operations successful`);
                this.addDetail(`Batch operation finished: ${completed} succeeded, ${total - completed} failed`);

                // Keep modal open to show final results
                setTimeout(() => {
                    this.hide();
                    resolve({
                        results,
                        completed,
                        failed: total - completed,
                        total
                    });
                }, 2000);

            } catch (error) {
                this.hide();
                reject(error);
            }
        });
    }
}

// Add CSS for indeterminate progress animation
const progressStyle = document.createElement('style');
progressStyle.textContent = `
    .progress-fill.indeterminate {
        animation: indeterminateProgress 2s infinite linear;
        background: linear-gradient(90deg, 
            transparent 0%, 
            #007bff 50%, 
            transparent 100%);
    }
    
    @keyframes indeterminateProgress {
        0% {
            transform: translateX(-100%);
        }
        100% {
            transform: translateX(400%);
        }
    }
`;
document.head.appendChild(progressStyle);

// Make available globally
window.Progress = Progress;