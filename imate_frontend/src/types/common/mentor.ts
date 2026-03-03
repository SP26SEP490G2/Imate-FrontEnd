/**
 * Mentor related types and interfaces
 */

export interface ListPreviewMentor {
  fullName: string;
  position: string;
  yoe: number;
  company: string;
  avgRatings: number | null;
  totalRatingCount: number | null;
}

export interface MentorResponse {
  listPreviewMentors: ListPreviewMentor[];
}
