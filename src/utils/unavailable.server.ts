import type { GetServerSidePropsContext } from 'next';

export const markUnavailable = ({
  req,
  res,
}: Pick<GetServerSidePropsContext, 'req' | 'res'>): void => {
  if (req.headers['x-nextjs-data']) {
    return;
  }
  res.statusCode = 503;
  res.setHeader('Retry-After', '120');
};
