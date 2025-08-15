import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { LivePreviewProps, DeviceType } from '../../types/preview';
import { DEVICE_TYPES } from '../../types/preview';
import { generatePreviewHTML } from '../../utils/content';
import PreviewControls from './PreviewControls';
import './LivePreview.css';

const LivePreview: React.FC<LivePreviewProps> = ({ content, className = '' }) => {
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>(DEVICE_TYPES[0]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate preview HTML with security measures
  const previewHTML = generatePreviewHTML(content);

  // Create secure blob URL for iframe content
  const createPreviewURL = useCallback(() => {
    try {
      const blob = new Blob([previewHTML], { type: 'text/html' });
      return URL.createObjectURL(blob);
    } catch (err) {
      console.error('Error creating preview URL:', err);
      setError('Failed to generate preview');
      return null;
    }
  }, [previewHTML]);

  // Update iframe content when content changes
  useEffect(() => {
    if (!iframeRef.current) return;

    setIsLoading(true);
    setError(null);

    const url = createPreviewURL();
    if (url) {
      iframeRef.current.src = url;

      // Cleanup previous URL
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setIsLoading(false);
    }
  }, [createPreviewURL, refreshKey]);

  // Handle iframe load events
  const handleIframeLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError('Failed to load preview');
  };

  // Refresh the preview
  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Toggle fullscreen mode
  const handleFullscreenToggle = () => {
    setIsFullscreen((prev) => !prev);
  };

  // Calculate iframe dimensions based on device and zoom
  const iframeStyle = {
    width: `${selectedDevice.width}px`,
    height: `${selectedDevice.height}px`,
    transform: `scale(${zoomLevel})`,
    transformOrigin: 'top left',
  };

  // Calculate container dimensions to accommodate scaled iframe
  const containerStyle = {
    width: `${selectedDevice.width * zoomLevel}px`,
    height: `${selectedDevice.height * zoomLevel}px`,
  };

  return (
    <div className={`live-preview ${className} ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="preview-header">
        <h2>Live Preview</h2>
        <PreviewControls
          selectedDevice={selectedDevice}
          onDeviceChange={setSelectedDevice}
          isFullscreen={isFullscreen}
          onFullscreenToggle={handleFullscreenToggle}
          zoomLevel={zoomLevel}
          onZoomChange={setZoomLevel}
          onRefresh={handleRefresh}
          previewUrl={`preview-${refreshKey}.html`}
        />
      </div>

      <div className="preview-content" ref={containerRef}>
        {isLoading && (
          <div className="preview-loading">
            <div className="loading-spinner"></div>
            <p>Loading preview...</p>
          </div>
        )}

        {error && (
          <div className="preview-error">
            <div className="error-icon">⚠️</div>
            <h3>Preview Error</h3>
            <p>{error}</p>
            <button onClick={handleRefresh} className="retry-button">
              Try Again
            </button>
          </div>
        )}

        <div className="iframe-container" style={containerStyle}>
          <iframe
            ref={iframeRef}
            className="preview-iframe"
            style={iframeStyle}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
            loading="lazy"
            title="Live Preview"
            aria-label="Website preview"
          />
        </div>

        {/* Device frame overlay for visual context */}
        <div className="device-frame" style={containerStyle}>
          <div className="device-info">
            {selectedDevice.icon} {selectedDevice.name}
          </div>
        </div>
      </div>

      {isFullscreen && (
        <button
          className="fullscreen-close"
          onClick={handleFullscreenToggle}
          title="Exit fullscreen"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default LivePreview;
