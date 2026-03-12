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

  // Mentor endpoints (không leading slash để URL = baseURL + path)
  Mentor: {
    GetListPreviewMentors: "get-list-preview-mentors",
    SubmitMentorProfile: "profile/mentor",
  },

  // Question endpoints (không dùng leading slash để axios nối đúng baseURL .../api)
  Question: {
    GetListHotQuestions: "get-list-hot-questions",
    GetQuestionBankList: "get-question-bank-list",
    GetListQuestionCategories: "get-list-question-categories",
    GetAllSystemQuestionsForStaff: "/get-all-system-question-banks-for-staff",
    GetAllContributedQuestionsForStaff: "/get-all-contributed-question-banks-for-staff",
    CreateSystemQuestionForStaff: "/create-system-question-for-staff",
    UpdateSystemQuestionForStaff: "/update-system-question-for-staff/{questionId}",
    GetSystemQuestionDetail: "/get-system-question-by-id/{questionId}",
    ContributeQuestion: "/contribute-question",
  },

  // Category endpoints
  Category: {
    GetAllCategories: "/get-categories",
    AddCategory:"/categories",
    UpdateCategory: "/categories/{categoryId}",
    GetAffectedQuestions: "/categories/{categoryId}/affected-questions",
  },

  // Position endpoints (không dùng leading slash để axios nối đúng với baseURL .../api)
  Position: {
    GetAllPositions: "get-positions",
  },

  // Skills endpoints
  Skills: {
    GetAllSkills: "get-skills",
  },

  // Companies endpoints
  Companies: {
    GetAllCompanies: "get-companies",
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
    GetSubscriptionOverview: "/subscription-packages/overview",
    UpdateSubscriptionPackagePrice: "/subscription-packages",
  },
} as const;

export default APIConfig;
