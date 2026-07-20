import React from 'react';
import { AlertDialog } from 'radix-ui';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  danger = false,
  busy = false,
  onOpenChange,
  onConfirm,
}) => (
  <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
    <AlertDialog.Portal>
      <AlertDialog.Overlay className="confirm-dialog-overlay" />
      <AlertDialog.Content className="confirm-dialog-content">
        <AlertDialog.Title className="confirm-dialog-title">{title}</AlertDialog.Title>
        <AlertDialog.Description className="confirm-dialog-description">{description}</AlertDialog.Description>
        <div className="confirm-dialog-actions">
          <AlertDialog.Cancel asChild>
            <button type="button" className="confirm-dialog-button confirm-dialog-button--cancel" disabled={busy}>Cancel</button>
          </AlertDialog.Cancel>
          <AlertDialog.Action asChild>
            <button type="button" className={`confirm-dialog-button ${danger ? 'confirm-dialog-button--danger' : 'confirm-dialog-button--primary'}`} disabled={busy} onClick={onConfirm}>
              {busy ? 'Processing...' : confirmLabel}
            </button>
          </AlertDialog.Action>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  </AlertDialog.Root>
);

export default ConfirmDialog;
