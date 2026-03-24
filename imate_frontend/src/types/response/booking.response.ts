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

export interface SlotDetailResponse {
  id: number;
  dayOfWeek: number;
  dayOfWeekName: string;
  startTime: string; // "HH:mm:ss"
  endTime: string;   // "HH:mm:ss"
}

export interface MentorSlotDetailResponse {
  id: number; // MentorRecurringSlotId
  mentorId: number;
  slotId: number;
  slot: SlotDetailResponse;
  isBooked: boolean;
}

export interface SlotsByDayResponse {
  dayOfWeek: number;
  dayName: string;
  slots: MentorSlotDetailResponse[];
}

export interface MentorRecurringSlotsResponse {
  mentorId: number;
  slotsByDay: SlotsByDayResponse[];
}
