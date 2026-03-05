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


  },
} as const;

export default APIConfig;
