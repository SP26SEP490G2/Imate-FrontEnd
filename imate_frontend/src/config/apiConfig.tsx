/**
 * API Configuration - Contains all API endpoint URIs
 */

import { CreateJobPost } from "@/services/recruiterService";

const APIConfig = {
  // Auth endpoints
  Auth: {
    LoginEmail: "/login-email",
    RegisterEmail: "/register-email",
    RegisterGoogle: "/google",
    ChangePassword: "/change-password",
    UpdateRole: "/profile/role",
    GenerateActionCode: "/generate-action-code",
    SendActionEmail: "/send-action-email",
  },

  // Mentor endpoints (không leading slash để URL = baseURL + path)
  Mentor: {
    GetListPreviewMentors: "get-list-preview-mentors",
    SubmitMentorProfile: "profile/mentor",
  },

  // Question endpoints (không dùng leading slash để axios nối đúng baseURL .../api)
  Question: {
    GetListHotQuestions: "get-list-hot-questions",
    GetQuestionBankList: "get-public-system-question-banks",
    GetPublicContributedQuestionBankList: "get-public-contributed-question-banks",
    GetMyContributedQuestions: "/get-my-contributed-questions",
    GetSavedSystemQuestions: "/savedquestions-system",
    GetSavedContributedQuestions: "/savedquestions-contributed",
    GetListQuestionCategories: "get-list-question-categories",
    GetAllSystemQuestionsForStaff: "/get-all-system-question-banks-for-staff",
    GetAllContributedQuestionsForStaff: "/get-all-contributed-question-banks-for-staff",
    GetAllPendingContributedQuestionsForStaff: "/get-all-pending-contributed-questions-for-staff",
    CreateSystemQuestionForStaff: "/create-system-question-for-staff",
    UpdateSystemQuestionForStaff: "/update-system-question-for-staff/{questionId}",
    GetSystemQuestionDetail: "/get-system-question-by-id/{questionId}",
    GetContributedQuestionDetail: "/get-contributed-question-by-id/{questionId}",
    ChangeContributedQuestionStatusStaff: "/change-contributed-question-status-staff/{questionId}",
    ExportSystemQuestions: "/export-system-questions",
    ContributeQuestion: "/contribute-question",
    SaveQuestion: "/save-question",
  },

  // Category endpoints
  Category: {
    GetAllCategories: "/get-categories",
    AddCategory: "/categories",
    UpdateCategory: "/categories/{categoryId}",
    GetAffectedQuestions: "/categories/{categoryId}/affected-questions",
  },

  // Position endpoints (không dùng leading slash để axios nối đúng với baseURL .../api)
  Position: {
    GetAllPositions: "/get-positions",
    AddPosition: "/positions",
    UpdatePosition: "/positions/{positionId}",
    GetAffectedQuestions: "/positions/{positionId}/affected-questions",
  },

  // Skills endpoints
  Skills: {
    GetAllSkills: "/get-skills",
    AddSkill: "/skills",
    UpdateSkill: "/skills/{skillId}",
    GetAffectedQuestions: "/skills/{skillId}/affected-questions",
  },

  // Companies endpoints
  Companies: {
    GetAllCompanies: "get-companies",
  },

  // Recruiter endpoints
  Recruiter: {
    SubmitRecruiterProfile: "/recruiters/submit-profile",
    GetJobApplicationList: "job-applications",
    GetRecruiterJobApplication: "recruiter-job-applications",
    UpdateRecruiterProfile: "/recruiter-profile",
    CreateJobPost: "/create-job-posts",
    UpdateJob: "/update-job",
    CloseJob: "/close-job",
    GetAppliedCandidate: (jobId: number) => `${jobId}/applied-candidates`,
    UpdateJobApplication: "/update-job-application",
  },

  Candidate: {
    GetAllOpenedJob: "get-all-jobs",
    GetJobDetail: (jobId: number) => `get-job-detail/${jobId}`

  },

  // Staff review endpoints (baseURL thường đã có /api)
  StaffReview: {
    GetPendingMentors: "/staff-review/mentors/pending",
    GetMentorById: "/staff-review/mentors",
    ReviewMentor: "/staff-review/mentors",
    GetPendingRecruiters: "/staff-review/recruiters/pending",
    ReviewRecruiter: "/staff-review/recruiters",
  },

  // Subscription endpoints
  Subscription: {
    GetSubscriptionPackages: "/subscription-packages",
    GetSubscriptionOverview: "/subscription-packages/overview",
    UpdateSubscriptionPackagePrice: "/subscription-packages",
  },

  // Comment endpoints
  Comment: {
    Create: "/create-comment",
    Update: "/update-comment/{commentId}",
    Delete: "/delete-comment/{commentId}",
    Vote: "/vote-comment/{commentId}",
  },
} as const;

export default APIConfig;
