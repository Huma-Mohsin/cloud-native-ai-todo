import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:8002';

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/backend-api/')) {
    const path = request.nextUrl.pathname.replace('/backend-api', '');
    const backendUrl = `${BACKEND_URL}${path}${request.nextUrl.search}`;

    // Forward cookies from the incoming request to the backend
    const cookies = request.cookies.getAll();
    let cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join('; ');

    // If Authorization Bearer token is present, inject it as a session_token cookie.
    // The frontend sends the Better Auth session token via Bearer header, but the
    // backend's get_current_user reads it from cookies only. Injecting it here bridges
    // the gap when cookies aren't forwarded through rewrites.
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      cookieHeader = cookieHeader
        ? `${cookieHeader}; session_token=${token}`
        : `session_token=${token}`;
    }

    const headers: Record<string, string> = {};
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    const contentType = request.headers.get('Content-Type');
    if (contentType) {
      headers['Content-Type'] = contentType;
    }

    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const options: RequestInit = {
      method: request.method,
      headers,
    };

    if (['POST', 'PATCH', 'PUT'].includes(request.method)) {
      options.body = await request.text();
    }

    const response = await fetch(backendUrl, options);
    const body = await response.text();

    return new NextResponse(body, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/backend-api/:path*'],
};
