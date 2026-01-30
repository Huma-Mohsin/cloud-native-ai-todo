import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // Await params (required in Next.js 15)
    const resolvedParams = await params;

    // Get the full path
    let path = resolvedParams.path.join('/');

    // Remove leading 'api/' if present (to avoid double /api/api/)
    if (path.startsWith('api/')) {
      path = path.substring(4);
    }

    // Get request body
    const body = await request.json();

    // Get all cookies from the request
    const cookies = request.cookies.getAll();
    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');

    // Get Authorization header from request
    const authHeader = request.headers.get('Authorization');

    // Forward to backend (port 8001)
    const backendUrl = `http://localhost:8001/api/${path}`;

    console.log('Proxying to:', backendUrl);
    console.log('Cookies:', cookieHeader);
    console.log('Authorization:', authHeader ? 'Present' : 'Missing');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cookie': cookieHeader,
    };

    // Forward Authorization header if present
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Proxy error', detail: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
