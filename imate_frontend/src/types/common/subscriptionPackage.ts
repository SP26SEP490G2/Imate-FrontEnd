export interface SubscriptionPackageItem {
  id: number;
  name: string;
  price: number;
  duration: string;
  benefits: string[];
  isRecommended: boolean;
  rank: number;
  totalInterviewLimit: number | null;
}

export interface GetSubscriptionPackagesResponse {
  data: SubscriptionPackageItem[];
}
