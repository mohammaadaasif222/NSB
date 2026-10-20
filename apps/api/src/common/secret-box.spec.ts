import { SecretBox } from './secret-box.js';

describe('SecretBox', () => {
  const box = new SecretBox('a-key-of-at-least-thirty-two-characters!!');

  it('round-trips without storing the plain text', () => {
    const sealed = box.seal('my-api-secret');
    expect(sealed).not.toContain('my-api-secret');
    expect(box.seal('my-api-secret')).not.toBe(sealed); // random IV
    expect(box.open(sealed)).toBe('my-api-secret');
  });

  it('rejects another key and tampering', () => {
    const sealed = box.seal('my-api-secret');
    expect(() => new SecretBox('a-different-key-of-thirty-two-characters').open(sealed)).toThrow();
    const parts = sealed.split('.');
    parts[3] = Buffer.from('tampered').toString('base64url');
    expect(() => box.open(parts.join('.'))).toThrow();
    expect(() => box.open('plain text')).toThrow();
  });
});
