import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
const isPublicRoute = createRouteMatcher(["/", "/biography", "/songs", "/albums", "/contact"]);
const isAuthRoute = createRouteMatcher(["/sign-in", "/sign-up"]);

export default clerkMiddleware(async (auth, req) => {
	const { userId } = await auth();

	// Redirect from auth routes if user is already authenticated
	if (userId && isAuthRoute(req)) {
		return NextResponse.redirect(new URL("/admin", req.url));
	}

	// Allow public routes without auth
	if (isPublicRoute(req)) {
		return NextResponse.next();
	}

	// Protect all other routes
	if (!userId) {
		return NextResponse.next();
	}

	// Check admin role for admin routes
	if (isAdminRoute(req)) {
		try {
			const client = await clerkClient();
			const user = await client.users.getUser(userId);

			if (user.publicMetadata?.role !== "admin") {
				return NextResponse.redirect(new URL("/dashboard", req.url));
			}
		} catch (error) {
			console.error("Error checking user role in proxy:", error);
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
