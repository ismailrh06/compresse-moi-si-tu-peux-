import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const onboarding = request.cookies.get("onboarding_done")?.value;
  const { pathname } = request.nextUrl;
  const isOnboardingPage = pathname === "/onboarding";

  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/signup");

  // Pas connecté → tout, sauf /login et /signup, redirigé vers /login
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Connecté mais onboarding pas fait → forcer /onboarding
  if (token && !onboarding && !isOnboardingPage) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // Déjà onboardé → ne pas afficher /onboarding
  if (token && onboarding && isOnboardingPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
