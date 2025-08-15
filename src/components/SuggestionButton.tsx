import React from 'react';
import { SuggestionButtonProps } from '../types/gemini';

const SuggestionButton: React.FC<SuggestionButtonProps> = ({
  action,
  onAction,
  variant = 'primary',
  size = 'medium'
}) => {
  const handleClick = () => {
    onAction(action);
  };

  const getButtonIcon = () => {
    switch (action.type) {
      case 'apply':
        return <ApplyIcon />;
      case 'preview':
        return <PreviewIcon />;
      case 'copy':
        return <CopyIcon />;
      case 'modify':
        return <ModifyIcon />;
      default:
        return null;
    }
  };

  const getButtonClass = () => {
    const base = 'suggestion-button';
    const variantClass = `suggestion-button--${variant}`;
    const sizeClass = `suggestion-button--${size}`;
    const typeClass = `suggestion-button--${action.type}`;
    
    return `${base} ${variantClass} ${sizeClass} ${typeClass}`;
  };

  return (
    <button
      onClick={handleClick}
      className={getButtonClass()}
      title={`${action.label} - ${action.type}`}
      aria-label={action.label}
    >
      {getButtonIcon()}
      <span className="suggestion-button__label">{action.label}</span>
    </button>
  );
};

// Icon components
const ApplyIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20,6 9,17 4,12"></polyline>
  </svg>
);

const PreviewIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const CopyIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const ModifyIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

export default SuggestionButton;