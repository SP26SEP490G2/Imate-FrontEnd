import APIConfig from "@/config/apiConfig";
import apiClient from "@/services/apiClient";
import type { GetSubscriptionPackagesResponse, SubscriptionPackageItem } from "@/types/common/subscriptionPackage";

export const getSubscriptionPackages = async (): Promise<SubscriptionPackageItem[]> => {
  const response = await apiClient.get<GetSubscriptionPackagesResponse>(APIConfig.Subscription.GetSubscriptionPackages);
  return response.data.data || [];
};
