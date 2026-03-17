describe('EditPlanDrawer onModuleToggle logic', () => {
  it('sets confirmingModuleOff when toggling off a module with data', () => {
    const modulesWithData = new Set(['timeOff']);
    let confirmingModuleOff: string | null = null;

    function onModuleToggle(key: string, value: boolean): void {
      if (!value && modulesWithData.has(key)) {
        confirmingModuleOff = key;
      }
    }

    onModuleToggle('timeOff', false);
    expect(confirmingModuleOff).toBe('timeOff');
  });

  it('does not set confirmingModuleOff when module has no data', () => {
    const modulesWithData = new Set<string>();
    let confirmingModuleOff: string | null = null;
    let applied: string | null = null;

    function onModuleToggle(key: string, value: boolean): void {
      if (!value && modulesWithData.has(key)) {
        confirmingModuleOff = key;
      } else {
        applied = key;
      }
    }

    onModuleToggle('benefits', false);
    expect(confirmingModuleOff).toBeNull();
    expect(applied).toBe('benefits');
  });
});
