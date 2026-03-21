import APIConfig from "@/config/apiConfig";
import apiClient from "./apiClient";
import type { BookingDetailResponse } from "@/types/response/booking.response";

export interface BookingCreateRequest {
  mentorId: number;
  slotId: number;
  bookDate: string; // YYYY-MM-DD format
}

/**
 * [POST] Tạo booking mới với mentor
 */
export const createBooking = async (request: BookingCreateRequest) => {
  try {
    const res = await apiClient.post<{
      success: boolean;
      data: any;
      message: string;
    }>(`/bookings`, {
      MentorId: request.mentorId,
      SlotId: request.slotId,
      BookDate: request.bookDate,
    });

    return res.data;
  } catch (error) {
    console.error("Error creating booking: ", error);
    throw error;
  }
};

/**
 * [GET] Lấy danh sách booking của candidate
 */
export const getCandidateBookings = async () => {
  try {
    const res = await apiClient.get<BookingDetailResponse[]>(`/candidates/bookings`);
    return res.data;
  } catch (error) {
    console.error("Error fetching candidate bookings: ", error);
    throw error;
  }
};

/**
 * [GET] Lấy danh sách booking của mentor
 */
export const getMentorBookings = async () => {
  try {
    const res = await apiClient.get<BookingDetailResponse[]>(`/bookings/mentor/my-bookings`);
    return res.data;
  } catch (error) {
    console.error("Error fetching mentor bookings: ", error);
    throw error;
  }
};

/**
 * [PUT] Hủy booking
 */
export const cancelBooking = async (bookingId: number) => {
  try {
    const url = APIConfig.Mentor.CancelBooking.replace("{bookingId}", bookingId.toString());
    const res = await apiClient.put(url);
    return res.data;
  } catch (error) {
    console.error("Error cancelling booking: ", error);
    throw error;
  }
};
