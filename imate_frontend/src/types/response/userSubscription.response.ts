export interface UpgradePreview {
  newPackageName: string;
  newPackagePrice: number;
  isEligible: boolean;
  message: string;
}

export interface CurrentPackage {
  packageId: number;
  packageName: string;
  rank: number;
  price: number;
}

export interface CurrentSubscriptionDetail {
  packageName: string;
  rank: number;
  startedAt: string | null;
  expiresAt: string | null;
  remainingDays: number | null;
  isExpired: boolean;
  mockInterviewUsed: number;
  initialMockLimit: number;
}