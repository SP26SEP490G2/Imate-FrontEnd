// routes/index.js
import AuthRouters from "./AuthRouter";
import CommonRouter from "./CommonRouter";
export const routeConfig = [...AuthRouters, ...CommonRouter];
