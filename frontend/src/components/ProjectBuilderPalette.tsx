import React from 'react';
import { Box, Code2, Grid2X2, Image, PlayCircle, Settings, Type } from 'lucide-react';

type BuilderAction = {
  label: string;
  targetId: string;
  mode: 'click' | 'focus';
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
};

const actions: BuilderAction[] = [
  { label: 'Image', targetId: 'product-thumbnail-file', mode: 'click', icon: Image },
  { label: 'Text', targetId: 'product-description', mode: 'focus', icon: Type },
  { label: 'Photo Grid', targetId: 'product-gallery-files', mode: 'click', icon: Grid2X2 },
  { label: 'Video', targetId: 'product-video-files', mode: 'click', icon: PlayCircle },
  { label: 'Embed', targetId: 'product-video-urls', mode: 'focus', icon: Code2 },
  { label: '3D', targetId: 'product-model-url', mode: 'focus', icon: Box },
];

const activateTarget = ({ targetId, mode }: BuilderAction) => {
  const target = document.getElementById(targetId) as HTMLInputElement | HTMLTextAreaElement | null;
  if (!target) return;
  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  if (mode === 'click') target.click();
  else target.focus({ preventScroll: true });
};

const ActionButton: React.FC<{ action: BuilderAction; compact?: boolean }> = ({ action, compact = false }) => {
  const Icon = action.icon;
  return (
    <button
      type="button"
      className={`project-builder-action ${compact ? 'project-builder-action--compact' : ''}`}
      onClick={() => activateTarget(action)}
    >
      <span><Icon size={compact ? 18 : 22} strokeWidth={1.8} /></span>
      <strong>{action.label}</strong>
    </button>
  );
};

const ProjectBuilderPalette: React.FC = () => (
  <section className="project-builder-shell">
    <div className="project-builder-canvas">
      <div className="project-builder-intro">
        <span className="project-builder-kicker">Future Studio Project Builder</span>
        <h3>Start building your project</h3>
        <p>Add content blocks, then complete the project details below.</p>
      </div>
      <div className="project-builder-actions">
        {actions.map((action) => <ActionButton key={action.label} action={action} />)}
      </div>
    </div>

    <aside className="project-builder-sidebar">
      <header>Add content</header>
      <div className="project-builder-sidebar-grid">
        {actions.map((action) => <ActionButton key={action.label} action={action} compact />)}
      </div>
      <header>Edit project</header>
      <div className="project-builder-edit-tools">
        <button type="button" onClick={() => document.getElementById('product-description')?.focus()}><Type size={18} /><span>Content</span></button>
        <button type="button" onClick={() => document.getElementById('product-category')?.focus()}><Settings size={18} /><span>Settings</span></button>
      </div>
      <div className="project-builder-tip">
        <strong>Project media</strong>
        <p>Upload original files or combine them with Vimeo and YouTube links.</p>
      </div>
    </aside>
  </section>
);

export default ProjectBuilderPalette;
