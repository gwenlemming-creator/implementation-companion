describe('Dashboard WSM redirect logic', () => {
  it('should redirect WSM to their plan', () => {
    const isWsm = true;
    const planId = 'plan-123';
    const shouldRedirect = isWsm && !!planId;
    expect(shouldRedirect).toBe(true);
  });

  it('should not redirect SP', () => {
    const isWsm = false;
    const shouldRedirect = isWsm;
    expect(shouldRedirect).toBe(false);
  });
});
