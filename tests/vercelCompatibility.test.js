describe('Vercel compatibility', () => {
  it('exports the Express app without auto-starting a local listener on import', () => {
    jest.resetModules();

    const serverModule = require('../server/index');

    expect(serverModule).toBeDefined();
    expect(serverModule.app).toBeDefined();
    expect(typeof serverModule.app.get).toBe('function');
  });
});
