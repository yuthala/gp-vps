// Here you can seed "Orderes" tableimport { NextResponse } from 'next/server';

import { NextResponse } from "next/server";

// Обработка GET-запроса
export async function GET() {
  return NextResponse.json(
    { message: 'Привет из API Next.js!' },
    { status: 200 }
  );
}

// Обработка POST-запроса
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    return NextResponse.json(
      { 
        message: 'Данные успешно получены', 
        receivedData: body 
      }, 
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Неверный формат JSON' }, 
      { status: 400 }
    );
  }
}
