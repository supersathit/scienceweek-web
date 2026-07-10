import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const comp = await prisma.competition.findUnique({
        where: { id }
      });
      return NextResponse.json({
        success: !!comp,
        data: comp || null,
        message: comp ? "" : "ไม่พบการแข่งขัน"
      });
    } else {
      const competitions = await prisma.competition.findMany();
      return NextResponse.json({ success: true, data: competitions });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
