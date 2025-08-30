import React, { useState } from 'react';
import RepositoryCreator from './RepositoryCreator';
import { useSiteStore } from '../../store/siteStore';
import './DeployTab.css';

interface DeployTabProps {
  className?: string;
}

const DeployTab: React.FC<DeployTabProps> = ({ className = '' }) => {
  const [activeSection, setActiveSection] = useState<'repository' | 'deployment'>('repository');
  const { content } = useSiteStore();

  const sections = [
    {
      id: 'repository' as const,
      label: 'Repository Setup',
      description: 'Configure your GitHub repository settings',
      icon: '📁'
    },
    {
      id: 'deployment' as const,
      label: 'Deploy Website',
      description: 'Deploy your website to GitHub Pages',
      icon: '🚀'
    }
  ];

  return (
    <div className={`deploy-tab ${className}`}>
      <div className="deploy-tab-header">
        <h2>Deploy Your Website</h2>
        <p>Publish your AI-generated website to GitHub Pages</p>
      </div>

      <div className="deploy-tab-content">
        <div className="deploy-sections">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`deploy-section-button ${
                activeSection === section.id ? 'active' : ''
              }`}
            >
              <div className="section-icon">{section.icon}</div>
              <div className="section-info">
                <h3>{section.label}</h3>
                <p>{section.description}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="deploy-section-content">
          {activeSection === 'repository' && (
            <div className="repository-section">
              <h3>Repository Configuration</h3>
              <p>
                Set up your GitHub repository details. Your website will be deployed to
                GitHub Pages and available at your GitHub username's subdomain.
              </p>
              <div className="repository-info">
                <div className="info-item">
                  <strong>Repository URL:</strong> https://github.com/your-username/repository-name
                </div>
                <div className="info-item">
                  <strong>Website URL:</strong> https://your-username.github.io/repository-name
                </div>
              </div>
            </div>
          )}

          {activeSection === 'deployment' && (
            <div className="deployment-section">
              <RepositoryCreator
                content={content}
                onDeploymentComplete={(url) => {
                  console.log('Deployment completed:', url);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeployTab;
