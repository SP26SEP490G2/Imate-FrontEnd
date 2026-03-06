import apiClient from "@/services/apiClient";
import type { User } from "@/types/common/auth";



export const updateRecruiterProfile = async (data: User) => {
  try {
    const res = await apiClient.put("/recruiter-profile", data);

    return res.data;
  } catch (error) {
    console.log("Error updating recruiter profile: ", error);
    throw error;
  }
};