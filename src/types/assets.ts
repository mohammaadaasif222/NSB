export interface SignedAsset {
  key: string;
  url: string;
}

export interface SignedAssetsData {
  assets: SignedAsset[];
  expiresIn: number;
  expiresAt: string;
}
