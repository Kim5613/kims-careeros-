import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

const getSecret = () => new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

// 不需要登录就能访问的路径
const PUBLIC_PATHS = ['/login', '/api/auth/login'];

// 静态资源和 API 不需要拦截
const SKIP_PREFIXES = ['/_next', '/favicon.ico', '/api/auth/', '/logos/', '/api/chat', '/api/pet/'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 公开路径放行
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next();
  for (const prefix of SKIP_PREFIXES) {
    if (pathname.startsWith(prefix)) return NextResponse.next();
  }

  // 检查 cookie
  const token = req.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.redirect(new URL('/login', req.url));

  try {
    await jwtVerify(token, getSecret());
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
