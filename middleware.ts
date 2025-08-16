import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
const isPublicRoute = createRouteMatcher(["/", "/sign-in", "/sign-up"]);

export default clerkMiddleware(async (auth, req) => {
	const { userId } = auth();

	// Allow public routes without auth
	if (isPublicRoute(req)) {
		return NextResponse.next();
	}

	// Protect all other routes
	if (!userId) {
		return auth().redirectToSignIn({ returnBackUrl: req.url });
	}

	// Check admin role for admin routes
	if (isAdminRoute(req)) {
		try {
			const user = await clerkClient.users.getUser(userId);
			if (user.publicMetadata?.role !== "admin") {
				console.log(`Non-admin user ${userId} attempted to access ${req.url}`);
				return NextResponse.redirect(new URL("/dashboard", req.url)); // Redirect non-admins to user dashboard
			}
		} catch (error) {
			console.error("Error checking user role in middleware:", error);
			return NextResponse.redirect(new URL("/sign-in", req.url));
		}
	}

	// Allow access to protected routes (e.g., /dashboard) for authenticated users
	if (isProtectedRoute(req)) {
		return NextResponse.next();
	}

	return NextResponse.next();
});

export const config = {
	matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
