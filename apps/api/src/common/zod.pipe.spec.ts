import { BadRequestException } from '@nestjs/common';
import { enquiryInputSchema } from '@nsb/shared';
import { ZodPipe } from './zod.pipe.js';

describe('ZodPipe', () => {
  const pipe = new ZodPipe(enquiryInputSchema);
  const valid = {
    listingId: '7f9c2c1e-3b4a-4c5d-9e8f-0a1b2c3d4e5f',
    name: ' Asha ',
    mobile: '+91 98765-43210',
    message: 'Need a quote',
    preferredDate: '2027-02-14',
  };

  it('returns parsed, normalised data', () => {
    expect(pipe.transform(valid)).toMatchObject({ name: 'Asha', mobile: '9876543210' });
  });

  it.each(['12345', '5876543210', '98765432101'])('rejects mobile %s', (mobile) => {
    expect(() => pipe.transform({ ...valid, mobile })).toThrow(BadRequestException);
  });

  it('lists every failing field', () => {
    try {
      pipe.transform({});
      expect.unreachable();
    } catch (err) {
      const body = (err as BadRequestException).getResponse() as { issues: { path: string }[] };
      expect(body.issues.map((i) => i.path)).toEqual(
        expect.arrayContaining(['listingId', 'name', 'mobile', 'message', 'preferredDate']),
      );
    }
  });
});
