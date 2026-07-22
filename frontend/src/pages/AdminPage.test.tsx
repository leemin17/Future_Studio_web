import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminPage from './AdminPage';

const navigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const original = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...original,
    useNavigate: () => navigate,
  };
});

vi.mock('../components/ProductAdminModal', () => ({
  default: ({ onAuthenticated }: { onAuthenticated?: () => void }) => (
    <button type="button" onClick={onAuthenticated}>Complete admin sign in</button>
  ),
}));

describe('AdminPage', () => {
  beforeEach(() => navigate.mockReset());

  it('returns to the home page after successful authentication', () => {
    render(<AdminPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Complete admin sign in' }));

    expect(navigate).toHaveBeenCalledWith('/', { replace: true });
  });
});
