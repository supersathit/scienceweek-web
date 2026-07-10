import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ success: false, message: "กรุณาระบุรหัสการสมัคร" });
    }

    const reg = await prisma.registration.findUnique({
      where: { registrationCode: code },
      include: {
        competition: true,
        submissions: true
      }
    });

    if (!reg) {
      return NextResponse.json({ success: false, message: "ไม่พบข้อมูลการสมัคร" });
    }

    return NextResponse.json({
      success: true,
      data: {
        registration: reg,
        submission: reg.submissions.length > 0 ? reg.submissions[0] : null
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
