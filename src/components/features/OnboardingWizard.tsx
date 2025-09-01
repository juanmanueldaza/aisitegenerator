import React, { useEffect, useState } from 'react';
import GitHubAuth from '@/components/auth/GitHubAuth';
import { HelpPanel } from '@/components/ui';
import { useSiteStore } from '@/store/siteStore';

export interface OnboardingWizardProps {
  open: boolean;
  onClose: () => void;
  onOpenEditor?: () => void;
  onOpenDeploy?: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  open,
  onClose,
  onOpenEditor,
  onOpenDeploy,
}) => {
  const wizardStepFromStore = useSiteStore((s) => s.wizardStep);
  const projectNameFromStore = useSiteStore((s) => s.projectName);
  const setWizardStepStore = useSiteStore((s) => s.setWizardStep);
  const setProjectNameStore = useSiteStore((s) => s.setProjectName);
  const setOnboardingCompleted = useSiteStore((s) => s.setOnboardingCompleted);

  const [step, setStep] = useState<number>(wizardStepFromStore || 1);
  const [projectName, setProjectName] = useState<string>(projectNameFromStore || 'my-site');
  const [helpOpen, setHelpOpen] = useState<false | 'auth' | 'pages'>(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Persist local step/name back to store as the user progresses (only when changed)
  useEffect(() => {
    if ((wizardStepFromStore as number) !== step) {
      setWizardStepStore(step as 1 | 2 | 3 | 4);
    }
  }, [step, wizardStepFromStore, setWizardStepStore]);
  useEffect(() => {
    if (projectNameFromStore !== projectName) {
      setProjectNameStore(projectName);
    }
  }, [projectName, projectNameFromStore, setProjectNameStore]);

  if (!open) return null;
  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Get started</h3>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
            ✕
          </button>
        </div>
        <p className="text-sm text-base-content/70 mb-4">
          This quick setup connects your GitHub account and creates a starter site you can preview
          and deploy.
        </p>
        <div className="mb-6">
          <div className="steps steps-vertical lg:steps-horizontal w-full">
            <div className={`step ${step >= 1 ? 'step-primary' : ''}`}>Connect GitHub</div>
            <div className={`step ${step >= 2 ? 'step-primary' : ''}`}>Name your project</div>
            <div className={`step ${step >= 3 ? 'step-primary' : ''}`}>Generate & preview</div>
            <div className={`step ${step >= 4 ? 'step-primary' : ''}`}>Deploy to Pages</div>
          </div>
        </div>
        {step === 1 && (
          <div className="space-y-4">
            <div className="alert alert-info">
              <span>ℹ️</span>
              <div>
                Use your GitHub account. We only request minimal permissions.{' '}
                <button className="btn btn-sm btn-ghost" onClick={() => setHelpOpen('auth')}>
                  Why?
                </button>
              </div>
            </div>
            <div className="flex justify-center">
              <GitHubAuth />
            </div>
            <div className="modal-action">
              <button className="btn btn-primary" onClick={() => setStep(2)}>
                Continue
              </button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Project name</span>
              </label>
              <input
                id="proj"
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter your project name"
                className="input input-bordered w-full"
              />
            </div>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setStep(1)}>
                Back
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setStep(3);
                  onOpenEditor?.();
                }}
                disabled={!projectName.trim()}
              >
                Continue
              </button>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <div className="alert alert-info">
              <span>ℹ️</span>
              <div>Preview will be generated from your content in the main editor.</div>
            </div>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setStep(2)}>
                Back
              </button>
              <button className="btn btn-primary" onClick={() => setStep(4)}>
                Continue
              </button>
            </div>
          </div>
        )}
        {step === 4 && (
          <div className="space-y-4">
            <div className="alert alert-success">
              <span>✅</span>
              <div>
                You can deploy from the Deploy tab when ready.{' '}
                <button className="btn btn-sm btn-ghost" onClick={() => setHelpOpen('pages')}>
                  Learn how
                </button>
              </div>
            </div>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setStep(3)}>
                Back
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setOnboardingCompleted(true);
                  onOpenDeploy?.();
                  onClose();
                }}
              >
                Finish
              </button>
            </div>
          </div>
        )}
        <HelpPanel open={helpOpen === 'auth'} onClose={() => setHelpOpen(false)} topic="auth" />
        <HelpPanel open={helpOpen === 'pages'} onClose={() => setHelpOpen(false)} topic="pages" />
      </div>
    </div>
  );
};

export default OnboardingWizard;
