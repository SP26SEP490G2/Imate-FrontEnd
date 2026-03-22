export interface BookingDetailResponse {
  bookingId: number;
  mentorId: number;
  candidateId: number;
  profileName: string;
  profileAvatarUrl?: string;
  jobTitle?: string;
  startTime: string; // ISO DateTime
  endTime: string;   // ISO DateTime
  bookDate: string;  // YYYY-MM-DD
  status: number;
  meetingRoomId?: string;
  price: number;
  ratingScore?: number;
  reviewText?: string;
  ratingCreatedAt?: string;
}
