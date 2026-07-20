import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import ConfirmDialog from './ConfirmDialog';

const meta = {
  title: 'Future Studio/Confirm Dialog',
  component: ConfirmDialog,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    open: false,
    title: 'Publish this project?',
    description: 'The project will appear in the selected product category.',
    onOpenChange: () => undefined,
    onConfirm: () => undefined,
  },
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button type="button" className="confirm-dialog-button confirm-dialog-button--primary" onClick={() => setOpen(true)}>Open confirmation</button>
        <ConfirmDialog open={open} onOpenChange={setOpen} title="Publish this project?" description="The project will appear in the selected product category." confirmLabel="Publish project" onConfirm={() => setOpen(false)} />
      </>
    );
  },
};
