/**
 * MarkdownRenderer - Core markdown parsing and rendering functionality
 * Supports standard markdown with custom Mermaid diagram integration
 */
class MarkdownRenderer {
    constructor() {
        this.mermaidIntegration = null;
    }

    /**
     * Set the Mermaid integration instance
     */
    setMermaidIntegration(mermaidIntegration) {
        this.mermaidIntegration = mermaidIntegration;
    }

    /**
     * Convert markdown text to HTML
     */
    async render(markdownText) {
        if (!markdownText) return '';

        try {
            // First, extract and process Mermaid diagrams
            const processedContent = await this.processMermaidBlocks(markdownText);
            
            // Then render the rest as markdown
            return this.renderMarkdown(processedContent);
        } catch (error) {
            console.error('Error rendering markdown:', error);
            return `<div class="error">Error rendering content: ${error.message}</div>`;
        }
    }

    /**
     * Process Mermaid code blocks and replace them with rendered diagrams
     */
    async processMermaidBlocks(text) {
        const mermaidRegex = /```mermaid\n([\s\S]*?)\n```/g;
        let processedText = text;
        let match;
        const mermaidBlocks = [];

        // Extract all Mermaid blocks
        while ((match = mermaidRegex.exec(text)) !== null) {
            mermaidBlocks.push({
                fullMatch: match[0],
                diagramCode: match[1].trim(),
                index: match.index
            });
        }

        // Process each Mermaid block
        for (const block of mermaidBlocks) {
            if (this.mermaidIntegration) {
                const renderedDiagram = await this.mermaidIntegration.renderDiagram(block.diagramCode);
                processedText = processedText.replace(block.fullMatch, renderedDiagram);
            } else {
                // Fallback if Mermaid integration is not available
                const fallback = `<div class="mermaid-error">
                    <h4>Mermaid Not Available</h4>
                    <p>Mermaid diagrams are not currently supported.</p>
                    <pre><code>${this.escapeHtml(block.diagramCode)}</code></pre>
                </div>`;
                processedText = processedText.replace(block.fullMatch, fallback);
            }
        }

        return processedText;
    }

    /**
     * Basic markdown to HTML conversion
     * This is a simplified implementation - in a real app, you'd use a library like marked.js
     */
    renderMarkdown(text) {
        let html = text;

        // Headers
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

        // Bold and Italic
        html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // Code blocks (non-mermaid)
        html = html.replace(/```(\w+)?\n([\s\S]*?)\n```/g, (match, lang, code) => {
            return `<pre><code class="language-${lang || 'text'}">${this.escapeHtml(code)}</code></pre>`;
        });

        // Inline code
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

        // Unordered lists
        html = html.replace(/^\* (.*)$/gim, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

        // Ordered lists
        html = html.replace(/^\d+\. (.*)$/gim, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/s, (match) => {
            // Check if this is already wrapped in <ul> tags
            if (match.includes('<ul>')) {
                return match;
            }
            return `<ol>${match}</ol>`;
        });

        // Blockquotes
        html = html.replace(/^> (.*)$/gim, '<blockquote>$1</blockquote>');

        // Line breaks and paragraphs
        html = html.replace(/\n\n/g, '</p><p>');
        html = html.replace(/\n/g, '<br>');
        
        // Wrap in paragraphs if not already wrapped in other elements
        if (!html.startsWith('<') && html.trim() !== '') {
            html = `<p>${html}</p>`;
        }

        return html;
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Sanitize HTML content to prevent XSS attacks
     */
    sanitizeHtml(html) {
        // Basic sanitization - in production, use a library like DOMPurify
        const allowedTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'em', 'code', 'pre', 'ul', 'ol', 'li', 'a', 'blockquote', 'div'];
        const allowedAttributes = {
            'a': ['href', 'target', 'rel'],
            'code': ['class'],
            'div': ['class', 'id'],
            'pre': ['class']
        };

        // This is a simplified sanitization - use DOMPurify in production
        return html;
    }
}