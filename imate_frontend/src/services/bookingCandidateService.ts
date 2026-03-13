import apiClient from "./apiClient";

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
