export interface ProgressProps {
  value?: number;
  max?: number;
  variant?: 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
  animated?: boolean;
  striped?: boolean;
}
