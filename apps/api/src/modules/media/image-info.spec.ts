import { readImageInfo } from './image-info.js';

// 3×2 images written by a real encoder (sharp/libvips).
const FIXTURES = {
  jpeg: '/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAACAAMDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAj/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAH/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCVgBH/2Q==',
  png: 'iVBORw0KGgoAAAANSUhEUgAAAAMAAAACCAYAAACddGYaAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAEUlEQVQImWNgZGJugGEGZA4AJHQDJRUa8K0AAAAASUVORK5CYII=',
  webpLossy: 'UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoDAAIAAUAmJaQAA3AA/v0gUAA=',
  webpLossless: 'UklGRiAAAABXRUJQVlA4TBQAAAAvAkAAEAdQgVQIIAAKmgLGiIj+Bw==',
  webpExtended:
    'UklGRkYAAABXRUJQVlA4WAoAAAAQAAAAAgAAAQAAQUxQSAcAAAAAgICAgICAAFZQOCAYAAAAMAEAnQEqAwACAAFAJiWkAANwAP79IFAA',
};

describe('readImageInfo', () => {
  it.each([
    ['jpeg', 'image/jpeg', 'jpg'],
    ['png', 'image/png', 'png'],
    ['webpLossy', 'image/webp', 'webp'],
    ['webpLossless', 'image/webp', 'webp'],
    ['webpExtended', 'image/webp', 'webp'],
  ] as const)('reads %s', (name, mimeType, ext) => {
    expect(readImageInfo(Buffer.from(FIXTURES[name], 'base64'))).toEqual({ mimeType, ext, width: 3, height: 2 });
  });

  it('rejects other formats and truncated files', () => {
    expect(readImageInfo(Buffer.from('GIF89a\x03\x00\x02\x00', 'latin1'))).toBeNull();
    expect(readImageInfo(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'))).toBeNull();
    expect(readImageInfo(Buffer.alloc(0))).toBeNull();
    expect(readImageInfo(Buffer.from(FIXTURES.jpeg, 'base64').subarray(0, 40))).toBeNull();
    expect(readImageInfo(Buffer.from(FIXTURES.png, 'base64').subarray(0, 20))).toBeNull();
  });
});
