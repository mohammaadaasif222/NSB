import type { ComponentPropsWithoutRef, FC, ReactNode } from 'react';

import { useSignedAsset } from '@/hooks/useSignedAsset';

interface PrivateImageProps extends Omit<ComponentPropsWithoutRef<'img'>, 'src'> {
  assetKey: string;
  fallback?: ReactNode;
}

const PrivateImage: FC<PrivateImageProps> = ({
  assetKey,
  fallback = null,
  alt = '',
  ...img
}) => {
  const { src, retry } = useSignedAsset(assetKey);

  if (!src) return <>{fallback}</>;

  return <img {...img} alt={alt} src={src} onError={retry} />;
};

export default PrivateImage;
