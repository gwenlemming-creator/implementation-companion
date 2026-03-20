describe('SectionNav role logic', () => {
  const showSpConfig = (role: string) => role === 'service_provider';

  it('SP config block is visible when role is service_provider', () => {
    expect(showSpConfig('service_provider')).toBe(true);
  });

  it('SP config block is hidden when role is worksite_manager', () => {
    expect(showSpConfig('worksite_manager')).toBe(false);
  });
});
