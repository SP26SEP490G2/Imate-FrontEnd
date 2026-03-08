/**
 * API Configuration - Contains all API endpoint URIs
 */

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

  // Mentor endpoints
  Mentor: {
    GetListPreviewMentors: "/get-list-preview-mentors",
    SubmitMentorProfile: "/profile/mentor",


  },

  // Question endpoints
  Question: {
    GetListHotQuestions: "/get-list-hot-questions",
    GetQuestionBankList: "/get-question-bank-list",
    GetListQuestionCategories: "/get-list-question-categories",
    GetAllSystemQuestionsForStaff: "/get-all-system-question-banks-for-staff",
    GetAllContributedQuestionsForStaff: "/get-all-contributed-question-banks-for-staff",
    CreateSystemQuestionForStaff: "/create-system-question-for-staff",
    UpdateSystemQuestionForStaff: "/update-system-question-for-staff/{questionId}",
    GetSystemQuestionDetail: "/get-system-question-detail/{questionId}",
  },

  // Position endpoints
  Position: {
    GetAllPositions: "/get-positions",
  },

  // Skills endpoints
  Skills: {
    GetAllSkills: "/get-skills",
  },

  // Companies endpoints
  Companies: {
    GetAllCompanies: "/get-companies",
  },

  // Recruiter endpoints
  Recruiter: {
    SubmitRecruiterProfile: "/recruiters/submit-profile",
    GetJobApplicationList: "job-applications",
    GetRecruiterJobApplication: "recruiter-job-applications"
  },

  // Staff review endpoints (baseURL thường đã có /api)
  StaffReview: {
    GetPendingMentors: "/staff-review/mentors/pending",
    GetMentorById: "/staff-review/mentors",
    ReviewMentor: "/staff-review/mentors",
  },
  // Subscription endpoints
  Subscription: {
    GetSubscriptionPackages: "/subscription-packages",
  },
} as const;

export default APIConfig;
