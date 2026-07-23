import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import Header from './Header';

vi.mock('lenis/react', () => ({ useLenis: () => null }));
vi.mock('../hooks/useAdminSession', () => ({ useAdminSession: () => true }));
vi.mock('../hooks/useSiteContent', () => ({
  useSiteContent: <T,>(_key: string, fallback: T) => fallback,
}));
vi.mock('../lib/supabase', () => ({ supabase: null }));

beforeAll(() => {
  class IntersectionObserverMock {
    observe() {}
    disconnect() {}
  }
  vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);
});

afterEach(cleanup);

const CurrentPath = () => <output aria-label="Current path">{useLocation().pathname}</output>;

const renderHeader = () => render(
  <MemoryRouter>
    <Header
      onLogoClick={() => undefined}
      showFixedHeader
      isAtDetailPage
      isMobileMenuOpen={false}
      setIsMobileMenuOpen={() => undefined}
    />
    <CurrentPath />
  </MemoryRouter>,
);

describe('Header admin actions', () => {
  it('shows project and collaboration actions for an administrator', () => {
    renderHeader();

    expect(screen.getByRole('menuitem', { name: 'Create a project' })).toBeTruthy();
    expect(screen.getByRole('menuitem', { name: 'Manage collaborations' })).toBeTruthy();
  });

  it('opens the dedicated create-project route', () => {
    renderHeader();

    fireEvent.click(screen.getByRole('menuitem', { name: 'Create a project' }));
    expect(screen.getByRole('status', { name: 'Current path' }).textContent).toBe('/admin/projects/new');
  });

  it('opens the collaboration manager route', () => {
    renderHeader();

    fireEvent.click(screen.getByRole('menuitem', { name: 'Manage collaborations' }));
    expect(screen.getByRole('status', { name: 'Current path' }).textContent).toBe('/admin/collaborations');
  });
});
