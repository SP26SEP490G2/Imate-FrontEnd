import { isAxiosError } from "axios";
import apiClient from "./apiClient";
import type { AuthResponse, ChangePasswordData, LoginEmailData, RegisterEmailData, RegisterGoogleData } from "@/types/common/auth";

export const verifyTokenAndLogin = (data: { firebaseIdToken: string }): Promise<AuthResponse> => {
  return apiClient.post("/login-email", data).then((res) => res.data);
};

export const registerWithEmail = (data: RegisterEmailData): Promise<AuthResponse> => {
  return apiClient.post<AuthResponse>("/register-email", data).then((res) => res.data);
};

export const registerWithGoogle = (data: RegisterGoogleData): Promise<AuthResponse> => {
  return apiClient.post<AuthResponse>("/google", data).then((res) => res.data);
};

export const changePassword = async (data: ChangePasswordData) => {
  try {
    const response = await apiClient.put("/change-password", data);
    return response.data;
  } catch (error) {
    throw error;  
  }
}

export const updateUserRole = async (role: "Candidate" | "Mentor") => {
  return apiClient.put("/profile/role", { role });
}

export const generateActionCode = async (email: string, actionType: "VERIFY_EMAIL" | "PASSWORD_RESET") => {
  try {
    const response = await apiClient.post<{ oobCode: string }>("/generate-action-code", {
      email,
      actionType,
    });
    return response.data.oobCode;
  } catch (error) {
    throw error;
  }
};

export const sendActionEmail = async (oobCode: string, email: string, actionType: "VERIFY_EMAIL" | "PASSWORD_RESET") => {
  try {
    const response = await apiClient.post("/send-action-email", {
      oobCode,
      email,
      actionType,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};