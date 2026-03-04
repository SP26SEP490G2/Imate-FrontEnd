// routes/index.js
import AuthRouters from "./AuthRouter";
import CommonRouter from "./CommonRouter";
import AuthenticatedRouter from "./AuthenticatedRouter";
export const routeConfig = [...AuthRouters, ...CommonRouter, ...AuthenticatedRouter];
