import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hasSeenWalkthrough = request.cookies.get('hasSeenWalkthrough');

  // Если пользователь заходит на корень (/) и уже видел онбординг
  if (request.nextUrl.pathname === '/' && hasSeenWalkthrough) {
    return NextResponse.redirect(new URL('/main', request.url));
  }

  return NextResponse.next();
}

// Применяем middleware только к главной странице
export const config = {
  matcher: '/',
};