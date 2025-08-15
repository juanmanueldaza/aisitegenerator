import React from 'react';
import type { PreviewControlsProps } from '../../types/preview';
import { DEVICE_TYPES, ZOOM_LEVELS } from '../../types/preview';
import './PreviewControls.css';

const PreviewControls: React.FC<PreviewControlsProps> = ({
  selectedDevice,
  onDeviceChange,
  isFullscreen,
  onFullscreenToggle,
  zoomLevel,
  onZoomChange,
  onRefresh,
}) => {
  return (
    <div className="preview-controls">
      <div className="controls-section">
        <label htmlFor="device-select" className="control-label">
          Device:
        </label>
        <select
          id="device-select"
          value={selectedDevice.name}
          onChange={(e) => {
            const device = DEVICE_TYPES.find((d) => d.name === e.target.value);
            if (device) onDeviceChange(device);
          }}
          className="device-select"
        >
          {DEVICE_TYPES.map((device) => (
            <option key={device.name} value={device.name}>
              {device.icon} {device.name} ({device.width}×{device.height})
            </option>
          ))}
        </select>
      </div>

      <div className="controls-section">
        <label htmlFor="zoom-select" className="control-label">
          Zoom:
        </label>
        <select
          id="zoom-select"
          value={zoomLevel}
          onChange={(e) => onZoomChange(parseFloat(e.target.value))}
          className="zoom-select"
        >
          {ZOOM_LEVELS.map((zoom) => (
            <option key={zoom} value={zoom}>
              {Math.round(zoom * 100)}%
            </option>
          ))}
        </select>
      </div>

      <div className="controls-section">
        <button
          onClick={onRefresh}
          className="control-button refresh-button"
          title="Refresh preview"
        >
          🔄 Refresh
        </button>

        <button
          onClick={onFullscreenToggle}
          className="control-button fullscreen-button"
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? '🗗' : '🗖'} {isFullscreen ? 'Exit' : 'Fullscreen'}
        </button>
      </div>

      {/* URL de preview omitida para evitar confusión en UI */}
    </div>
  );
};

export default PreviewControls;
