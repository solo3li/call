import { describe, it, expect, vi } from 'vitest';

const { mockApi } = vi.hoisted(() => ({
  mockApi: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    },
    defaults: { headers: { common: {} } }
  }
}));

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockApi)
  }
}));

// Import after mocking axios
import { authApi, dashboardApi, branchesApi } from './api';

describe('Frontend API Utils', () => {
  it('authApi.login should call /auth/login with credentials', async () => {
    mockApi.post.mockResolvedValue({ data: { token: 'test-token' } });
    const credentials = { email: 'admin@foodrms.com', password: 'password' };
    await authApi.login(credentials);
    expect(mockApi.post).toHaveBeenCalledWith('/auth/login', credentials);
  });

  it('dashboardApi.getStats should call /dashboard/stats', async () => {
    mockApi.get.mockResolvedValue({ data: {} });
    await dashboardApi.getStats();
    expect(mockApi.get).toHaveBeenCalledWith('/dashboard/stats');
  });

  it('branchesApi.getAll should call /branches', async () => {
    mockApi.get.mockResolvedValue({ data: [] });
    await branchesApi.getAll();
    expect(mockApi.get).toHaveBeenCalledWith('/branches');
  });
});
