import { createVerify, generateKeyPairSync } from 'node:crypto';
import type { SettingsService } from '../../settings/settings.service.js';
import { CloudinaryImageStorage } from './cloudinary.storage.js';
import { FirebaseImageStorage } from './firebase.storage.js';
import { AccountChangedError } from './image-storage.js';

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const creds = {
  bucket: 'nsb-test.firebasestorage.app',
  projectId: 'nsb-test',
  clientEmail: 'uploader@nsb-test.iam.gserviceaccount.com',
  privateKey: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
  folder: 'nsb',
};
const settings = {
  firebaseCredentials: () => Promise.resolve(creds),
  cloudinaryCredentials: () => Promise.resolve({ cloudName: 'demo', apiKey: '123456789', apiSecret: 'secret-value-123', folder: 'nsb' }),
} as unknown as SettingsService;

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

describe('FirebaseImageStorage', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn((url: string) =>
      Promise.resolve(url.startsWith('https://oauth2') ? json({ access_token: 'ya29.token', expires_in: 3600 }) : json({})),
    );
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('signs in with the service account and uploads with a download token', async () => {
    const storage = new FirebaseImageStorage(settings);
    const image = Buffer.from('image-bytes');
    const stored = await storage.store({ buffer: image, ext: 'png', mimeType: 'image/png', folder: 'banners' });

    const [tokenUrl, tokenInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(tokenUrl).toBe('https://oauth2.googleapis.com/token');
    const assertion = (tokenInit.body as URLSearchParams).get('assertion')!;
    const [header, claims, signature] = assertion.split('.');
    expect(createVerify('RSA-SHA256').update(`${header}.${claims}`).verify(publicKey, signature, 'base64url')).toBe(true);
    expect(JSON.parse(Buffer.from(claims, 'base64url').toString())).toMatchObject({
      iss: creds.clientEmail,
      aud: 'https://oauth2.googleapis.com/token',
      scope: 'https://www.googleapis.com/auth/devstorage.read_write',
    });

    const [uploadUrl, uploadInit] = fetchMock.mock.calls[1] as [string, RequestInit & { headers: Record<string, string> }];
    expect(uploadUrl).toBe('https://storage.googleapis.com/upload/storage/v1/b/nsb-test.firebasestorage.app/o?uploadType=multipart');
    expect(uploadInit.headers.authorization).toBe('Bearer ya29.token');
    const body = Buffer.from(uploadInit.body as Uint8Array).toString();
    const token = /"firebaseStorageDownloadTokens":"([0-9a-f-]{36})"/.exec(body)![1];
    expect(body).toContain('image-bytes');
    expect(stored.key).toMatch(/^nsb\/banners\/[0-9a-f-]{36}\.png$/);
    expect(body).toContain(`"name":"${stored.key}"`);
    expect(stored).toMatchObject({
      account: creds.bucket,
      url: `https://firebasestorage.googleapis.com/v0/b/${creds.bucket}/o/${encodeURIComponent(stored.key)}?alt=media&token=${token}`,
    });
  });

  it('reuses the access token and treats a missing file as deleted', async () => {
    const storage = new FirebaseImageStorage(settings);
    await storage.store({ buffer: Buffer.from('x'), ext: 'png', mimeType: 'image/png', folder: 'banners' });
    fetchMock.mockImplementation(() => Promise.resolve(new Response(null, { status: 404 })));
    await storage.remove('nsb/banners/a.png', creds.bucket);
    const tokenCalls = fetchMock.mock.calls.filter(([url]) => String(url).startsWith('https://oauth2'));
    expect(tokenCalls).toHaveLength(1);
    expect(fetchMock.mock.calls.at(-1)).toEqual([
      'https://storage.googleapis.com/storage/v1/b/nsb-test.firebasestorage.app/o/nsb%2Fbanners%2Fa.png',
      expect.objectContaining({ method: 'DELETE' }),
    ]);
  });

  it('reports API errors and refuses to delete from another bucket', async () => {
    const storage = new FirebaseImageStorage(settings);
    await expect(storage.remove('nsb/a.png', 'old-project.appspot.com')).rejects.toBeInstanceOf(AccountChangedError);
    expect(fetchMock).not.toHaveBeenCalled();

    fetchMock.mockImplementation((url: string) =>
      Promise.resolve(url.startsWith('https://oauth2') ? json({ error_description: 'Invalid JWT Signature.' }, 400) : json({})),
    );
    await expect(storage.store({ buffer: Buffer.from('x'), ext: 'png', mimeType: 'image/png', folder: 'b' })).rejects.toThrow(
      'Invalid JWT Signature.',
    );
  });
});

describe('CloudinaryImageStorage', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('signs uploads and refuses to delete from another cloud', async () => {
    const fetchMock = vi.fn(() => Promise.resolve(json({ secure_url: 'https://res.cloudinary.com/demo/x.png', public_id: 'nsb/banners/x' })));
    vi.stubGlobal('fetch', fetchMock);
    const storage = new CloudinaryImageStorage(settings);
    const stored = await storage.store({ buffer: Buffer.from('x'), ext: 'png', mimeType: 'image/png', folder: 'banners' });
    expect(stored).toEqual({ url: 'https://res.cloudinary.com/demo/x.png', key: 'nsb/banners/x', account: 'demo' });

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://api.cloudinary.com/v1_1/demo/image/upload');
    const form = init.body as FormData;
    const { createHash } = await import('node:crypto');
    const expected = createHash('sha1').update(`folder=nsb/banners&timestamp=${form.get('timestamp')}secret-value-123`).digest('hex');
    expect(form.get('signature')).toBe(expected);
    expect(form.get('api_key')).toBe('123456789');

    await expect(storage.remove('nsb/banners/x', 'other-cloud')).rejects.toBeInstanceOf(AccountChangedError);
  });
});
