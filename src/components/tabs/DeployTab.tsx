import { useDeployment } from '@/hooks/useDeployment';
import { DeployTabView } from './DeployTabView';

interface DeployTabProps {
  className?: string;
}

const DeployTab: React.FC<DeployTabProps> = ({ className = '' }) => {
  const deployment = useDeployment();

  const handleDeploymentComplete = (url: string) => {
    console.log('Deployment completed:', url);
  };

  return (
    <DeployTabView
      activeSection={deployment.activeSection}
      content={deployment.content}
      sections={deployment.sections}
      onSectionChange={deployment.setActiveSection}
      onDeploymentComplete={handleDeploymentComplete}
      className={className}
    />
  );
};

export { DeployTab };
export default DeployTab;
