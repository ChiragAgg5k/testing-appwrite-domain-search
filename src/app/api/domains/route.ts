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

  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const fallbackCookies = process.env.APPWRITE_FALLBACK_COOKIES;

  if (!projectId || !fallbackCookies) {
    console.error('Missing environment variables:', {
      hasProjectId: !!projectId,
      hasCookies: !!fallbackCookies,
    });
    return NextResponse.json(
      { error: 'Server configuration error: Missing API credentials' },
      { status: 500 }
    );
  }

  try {
    const url = new URL('https://cloud.appwrite.io/v1/domains/suggestions');
    url.searchParams.append('query', query);
    url.searchParams.append('filterType', 'suggestion');
    if (tld) {
      url.searchParams.append('tlds[]', tld);
    }

    console.log('Fetching domains with project ID:', projectId);
    
    const response = await fetch(url.toString(), {
      headers: {
        'x-appwrite-project': projectId,
        'x-fallback-cookies': fallbackCookies,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Appwrite API error:', response.status, errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Domain search error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch domain suggestions' },
      { status: 500 }
    );
  }
}
