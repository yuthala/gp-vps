import { NextRequest, NextResponse } from 'next/server';

const WIDGET_VERSION = '4.0.0';

async function getAuthToken(): Promise<string> {
  const apiUrl = (process.env.CDEK_API_URL || 'https://cdek.ru').trim().replace(/\/$/, '');
  const clientId = (process.env.CDEK_CLIENT_ID || '').trim();
  const clientSecret = (process.env.CDEK_CLIENT_SECRET || '').trim();

  if (!clientId || !clientSecret) {
    throw new Error('Не заданы CDEK_CLIENT_ID или CDEK_CLIENT_SECRET в .env.local');
  }

  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch(`${apiUrl}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: params.toString(),
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Ошибка авторизации СДЭК:', response.status, errorText);
    throw new Error(`Ошибка авторизации СДЭК (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function handleRequest(request: NextRequest) {
  try {
    const apiUrl = (process.env.CDEK_API_URL || 'https://cdek.ru').trim().replace(/\/$/, '');
    const { searchParams } = new URL(request.url);
    
    const queryParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    let bodyData: Record<string, unknown> = {};
    if (request.method === 'POST') {
      try {
        bodyData = await request.json();
      } catch {
        bodyData = {};
      }
    }

    const requestData = { ...queryParams, ...bodyData };
    const action = requestData.action as string | undefined;

    if (!action) {
      return NextResponse.json(
        { message: 'Action is required' },
        { status: 400, headers: { 'X-Service-Version': WIDGET_VERSION } }
      );
    }

    // Удаляем служебный параметр action перед отправкой в API СДЭК
    const cdekPayload = { ...requestData };
    delete cdekPayload.action;

    const token = await getAuthToken();

    const baseHeaders: Record<string, string> = {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'X-App-Name': 'widget_pvz',
      'X-App-Version': WIDGET_VERSION,
    };

    let cdekResponse: Response;

    if (action === 'offices') {
      const url = new URL(`${apiUrl}/deliverypoints`);
      Object.entries(cdekPayload).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          url.searchParams.append(key, String(val));
        }
      });
      cdekResponse = await fetch(url.toString(), { headers: baseHeaders, cache: 'no-store' });
    } else if (action === 'calculate') {
      cdekResponse = await fetch(`${apiUrl}/calculator/tarifflist`, {
        method: 'POST',
        headers: {
          ...baseHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cdekPayload),
        cache: 'no-store',
      });
    } else if (action === 'byCoordinate') {
      const url = new URL(`${apiUrl}/deliverypoints/byPolygons`);
      Object.entries(cdekPayload).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          url.searchParams.append(key, String(val));
        }
      });
      cdekResponse = await fetch(url.toString(), { headers: baseHeaders, cache: 'no-store' });
    } else {
      return NextResponse.json(
        { message: 'Unknown action' },
        { status: 400, headers: { 'X-Service-Version': WIDGET_VERSION } }
      );
    }

    const rawText = await cdekResponse.text();
    let responseData: unknown = [];

    if (rawText) {
      try {
        responseData = JSON.parse(rawText);
      } catch {
        console.error('СДЭК вернул не-JSON ответ:', cdekResponse.status, rawText);
        return NextResponse.json(
          { message: 'Invalid JSON from CDEK', raw: rawText },
          { status: 502 }
        );
      }
    }

    const responseHeaders = new Headers({
      'Content-Type': 'application/json',
      'X-Service-Version': WIDGET_VERSION,
    });

    cdekResponse.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (lowerKey.startsWith('x-') && lowerKey !== 'x-powered-by') {
        responseHeaders.set(key, value);
      }
    });

    return NextResponse.json(responseData, {
      status: cdekResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Критическая ошибка в /api/cdek:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}
