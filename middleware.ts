import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
const isPublicRoute = createRouteMatcher(["/", "/sign-in", "/sign-up", "/bio", "/songs", "albums"]);

export default clerkMiddleware(async (auth, req) => {
	const { userId } = await auth();

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
