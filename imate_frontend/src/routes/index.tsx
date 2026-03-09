// routes/index.js
import AuthRouters from "./AuthRouter";
import CommonRouter from "./CommonRouter";
import AuthenticatedRouter from "./AuthenticatedRouter";
import RecruiterRouter from "./RecruiterRouter";
export const routeConfig = [...AuthRouters, ...CommonRouter, ...AuthenticatedRouter, ...RecruiterRouter];
