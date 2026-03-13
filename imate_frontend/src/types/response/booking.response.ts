export interface Booking {
  bookingId: number;
  candidateName: string;
  mentorName: string;
  mentorAvatarUrl: string | null;
  startTime: string;
}

export interface BookingStatusResponse {
  success: boolean;
  data: any;
  message: string;
}
