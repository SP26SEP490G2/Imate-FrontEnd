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
  },

  // Question endpoints
  Question: {
    GetListHotQuestions: "/get-list-hot-questions",
    GetQuestionBankList: "/get-question-bank-list",
    GetListQuestionCategories: "/get-list-question-categories",
  },
} as const;

export default APIConfig;
