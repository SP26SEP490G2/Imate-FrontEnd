import APIConfig from "@/config/apiConfig";
import apiClient from "@/services/apiClient";
import type { GetSubscriptionPackagesResponse, SubscriptionPackageItem } from "@/types/common/subscriptionPackage";

export interface MonthlySalesItem {
  month: number;
  year: number;
  packageSales: Record<string, number>;
}

export interface SubscriptionOverviewResponse {
  totalSold: number;
  totalRevenue: number;
  featuredPackageName: string | null;
  monthlySales: MonthlySalesItem[];
}

export const getSubscriptionPackages = async (): Promise<SubscriptionPackageItem[]> => {
  const response = await apiClient.get<GetSubscriptionPackagesResponse>(APIConfig.Subscription.GetSubscriptionPackages);
  return response.data.data || [];
};

export const getSubscriptionOverview = async (): Promise<SubscriptionOverviewResponse> => {
  const response = await apiClient.get<SubscriptionOverviewResponse>(APIConfig.Subscription.GetSubscriptionOverview);
  return response.data;
};

export const updateSubscriptionPackagePrice = async (id: number, price: number): Promise<void> => {
  await apiClient.put(`${APIConfig.Subscription.UpdateSubscriptionPackagePrice}/${id}/price`, { price });
};

export const updateSubscriptionPackageBenefits = async (id: number, benefits: string[]): Promise<void> => {
  await apiClient.put(`${APIConfig.Subscription.UpdateSubscriptionPackageBenefits}/${id}/benefits`, { benefits });
};

export const updateSubscriptionPackageName = async (id: number, name: string): Promise<void> => {
  await apiClient.put(`${APIConfig.Subscription.UpdateSubscriptionPackageName}/${id}/name`, { name });
};

export const createSubscriptionPackage = async (
  name: string,
  price: number,
  durationDays: number,
  benefits: string[],
  isRecommended: boolean
): Promise<SubscriptionPackageItem> => {
  const response = await apiClient.post(APIConfig.Subscription.CreateSubscriptionPackage, {
    name,
    price,
    durationDays,
    benefits,
    isRecommended,
  });
  return response.data.data;
};

export const deactivateSubscriptionPackage = async (id: number): Promise<void> => {
  await apiClient.delete(`${APIConfig.Subscription.DeleteSubscriptionPackage}/${id}`);
};
