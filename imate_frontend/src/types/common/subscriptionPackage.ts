export interface SubscriptionPackageItem {
  id: number;
  name: string;
  price: number;
  duration: string;
  benefits: string[];
  isRecommended: boolean;
}

export interface GetSubscriptionPackagesResponse {
  data: SubscriptionPackageItem[];
}
