import { AuthService } from './auth.service';

describe('AuthService', () => {
  it('defaults to service_provider role', () => {
    const service = new AuthService();
    expect(service.currentRole()).toBe('service_provider');
  });

  it('can be set to worksite_manager', () => {
    const service = new AuthService();
    service.setRole('worksite_manager');
    expect(service.currentRole()).toBe('worksite_manager');
  });

  it('isWsm returns true for worksite_manager', () => {
    const service = new AuthService();
    service.setRole('worksite_manager');
    expect(service.isWsm()).toBe(true);
  });

  it('isWsm returns false for service_provider', () => {
    const service = new AuthService();
    expect(service.isWsm()).toBe(false);
  });
});
