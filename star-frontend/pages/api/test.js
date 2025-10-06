import { NextResponse } from 'next/server';

export const GET = async (request) => {
  return NextResponse.json({
    success: true,
    message: "API is working!",
    timestamp: new Date().toISOString()
  });
};