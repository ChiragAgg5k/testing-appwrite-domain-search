import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const tld = searchParams.get('tld');

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    );
  }

  try {
    const url = new URL('https://cloud.appwrite.io/v1/domains/suggestions');
    url.searchParams.append('query', query);
    url.searchParams.append('filterType', 'suggestion');
    if (tld) {
      url.searchParams.append('tlds[]', tld);
    }

    const response = await fetch(url.toString(), {
      headers: {
        'x-appwrite-project': process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'console',
        'x-fallback-cookies': process.env.APPWRITE_FALLBACK_COOKIES || '',
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch domain suggestions' },
      { status: 500 }
    );
  }
}
