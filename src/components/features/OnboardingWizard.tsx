import React, { useEffect, useState } from 'react';
import GitHubAuth from '@/components/auth/GitHubAuth';
import { InlineCallout, HelpPanel } from '@/components/ui';
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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 70,
      }}
    >
      <div
        style={{ background: 'white', borderRadius: 8, width: '96%', maxWidth: 760, padding: 16 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 id="onboarding-title" style={{ margin: 0 }}>
            Get started
          </h3>
          <button className="btn btn-secondary btn-small" onClick={onClose}>
            Close
          </button>
        </div>
        <p style={{ color: '#6b7280', fontSize: 14, marginTop: 8 }}>
          This quick setup connects your GitHub account and creates a starter site you can preview
          and deploy.
        </p>
        <div style={{ marginTop: 12 }}>
          <ol style={{ paddingLeft: 16 }}>
            <li style={{ fontWeight: step === 1 ? 700 : 400 }}>Connect GitHub</li>
            <li style={{ fontWeight: step === 2 ? 700 : 400 }}>Name your project</li>
            <li style={{ fontWeight: step === 3 ? 700 : 400 }}>Generate & preview</li>
            <li style={{ fontWeight: step === 4 ? 700 : 400 }}>Deploy to Pages (optional)</li>
          </ol>
        </div>
        {step === 1 && (
          <div style={{ marginTop: 12 }}>
            <InlineCallout tone="info">
              Use your GitHub account. We only request minimal permissions.{' '}
              <button
                className="btn btn-secondary btn-small"
                onClick={() => setHelpOpen('auth')}
                style={{ marginLeft: 6 }}
              >
                Why?
              </button>
            </InlineCallout>
            <div style={{ marginTop: 8 }}>
              <GitHubAuth />
            </div>
            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={() => setStep(2)}>
                Continue
              </button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div style={{ marginTop: 12 }}>
            <label htmlFor="proj" style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>
              Project name
            </label>
            <input
              id="proj"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                border: '1px solid #e5e7eb',
                borderRadius: 6,
              }}
            />
            <div style={{ marginTop: 8, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setStep(1)}>
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
          <div style={{ marginTop: 12 }}>
            <InlineCallout tone="info">
              Preview will be generated from your content in the main editor.
            </InlineCallout>
            <div style={{ marginTop: 8, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setStep(2)}>
                Back
              </button>
              <button className="btn btn-primary" onClick={() => setStep(4)}>
                Continue
              </button>
            </div>
          </div>
        )}
        {step === 4 && (
          <div style={{ marginTop: 12 }}>
            <InlineCallout tone="success">
              You can deploy from the Deploy tab when ready.{' '}
              <button
                className="btn btn-secondary btn-small"
                onClick={() => setHelpOpen('pages')}
                style={{ marginLeft: 6 }}
              >
                Learn how
              </button>
            </InlineCallout>
            <div style={{ marginTop: 8, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setStep(3)}>
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
