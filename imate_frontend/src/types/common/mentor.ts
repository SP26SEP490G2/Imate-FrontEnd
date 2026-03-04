/**
 * Mentor related types and interfaces
 */

export interface ListPreviewMentorResponse {
  fullName: string;
  position: string;
  yoe: number;
  company: string;
  avgRatings: number | null;
  totalRatingCount: number | null;
}

// API Response wrapper
export interface GetListPreviewMentorsResponse {
  data: ListPreviewMentorResponse[];
}
