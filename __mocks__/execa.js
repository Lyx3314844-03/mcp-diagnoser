// Mock for execa ESM module
module.exports = {
  execa: jest.fn().mockResolvedValue({ stdout: '' }),
  execaSync: jest.fn().mockReturnValue({ stdout: '' }),
  $: jest.fn(),
  execaNode: jest.fn().mockResolvedValue({ stdout: '' }),
};
