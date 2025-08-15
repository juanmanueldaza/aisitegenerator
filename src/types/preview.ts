export interface DeviceType {
  name: string;
  width: number;
  height: number;
  icon: string;
}

export interface PreviewMode {
  id: string;
  label: string;
  icon: string;
}

export interface LivePreviewProps {
  content: string;
  className?: string;
}

export interface PreviewControlsProps {
  selectedDevice: DeviceType;
  onDeviceChange: (device: DeviceType) => void;
  isFullscreen: boolean;
  onFullscreenToggle: () => void;
  zoomLevel: number;
  onZoomChange: (zoom: number) => void;
  onRefresh: () => void;
}

export const DEVICE_TYPES: DeviceType[] = [
  {
    name: 'Desktop',
    width: 1200,
    height: 800,
    icon: '🖥️',
  },
  {
    name: 'Tablet',
    width: 768,
    height: 1024,
    icon: '�',
  },
  {
    name: 'Mobile',
    width: 375,
    height: 667,
    icon: '📱',
  },
];

export const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];
