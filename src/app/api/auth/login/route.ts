import { SignJWT } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

const getSecret = () => new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const correctPassword = process.env.ACCESS_PASSWORD;

    if (!password || password !== correctPassword) {
      return NextResponse.json({ error: '密码错误' }, { status: 401 });
    }

    // 签发 JWT，7 天有效
    const token = await new SignJWT({ role: 'admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(getSecret());

    const response = NextResponse.json({ success: true });
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 天
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: '登录失败' }, { status: 500 });
  }
}
