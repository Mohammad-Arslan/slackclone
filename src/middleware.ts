// import {
//   convexAuthNextjsMiddleware,
//   createRouteMatcher,
//   isAuthenticatedNextjs,
//   nextjsMiddlewareRedirect,
// } from "@convex-dev/auth/nextjs/server";
// import { request } from "http";

// const isPublicPage = createRouteMatcher(["/"]);

// export default convexAuthNextjsMiddleware((request) => {
//   if (!isPublicPage(request)) {
//     return nextjsMiddlewareRedirect(request, "/");
//   }
// });

// export const config = {
//   // The following matcher runs middleware on all routes
//   // except static assets.
//   matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
// };

// import {
//   convexAuthNextjsMiddleware,
//   createRouteMatcher,
//   isAuthenticatedNextjs,
//   nextjsMiddlewareRedirect,
// } from "@convex-dev/auth/nextjs/server";

// const isPublicPage = createRouteMatcher(["/auth"]);

// export default convexAuthNextjsMiddleware((request) => {
//   // Await the authentication status
//   const isAuthenticated = isAuthenticatedNextjs();

//   // Protect routes: redirect if the page is not public and the user is not authenticated
//   if (!isPublicPage(request) && !isAuthenticated) {
//     return nextjsMiddlewareRedirect(request, "/auth");
//   }
// });

import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/test"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  if (isProtectedRoute(request) && !(await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/auth");
  }
});

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
