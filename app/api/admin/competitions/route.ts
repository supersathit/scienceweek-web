import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { 
      password, 
      id, 
      title, 
      category, 
      level, 
      teamMin, 
      teamMax, 
      description, 
      rules, 
      judgingCriteria, 
      location, 
      competitionDate 
    } = data;

    if (!password || (password !== process.env.ADMIN_PASS && password !== process.env.TEACHER_PASS)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Insert or update? The requirement is "เพิ่มรายการใหม่" but we can use upsert or just create
    const existing = await prisma.competition.findUnique({ where: { id } });
    if (existing) {
      return NextResponse.json({ success: false, message: 'รหัสการแข่งขันนี้มีอยู่ในระบบแล้ว' });
    }

    const comp = await prisma.competition.create({
      data: {
        id,
        title,
        category: category || "",
        level: level || "",
        teamMin: teamMin ? parseInt(teamMin) : 1,
        teamMax: teamMax ? parseInt(teamMax) : 1,
        description: description || "",
        rules: rules || "",
        judgingCriteria: judgingCriteria || "",
        location: location || "",
        competitionDate: competitionDate ? String(competitionDate) : null,
        registerOpen: false,
        submissionOpen: false,
      }
    });

    return NextResponse.json({ success: true, message: 'บันทึกสำเร็จ', data: comp });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { password, id, title, category, level, teamMin, teamMax, description, rules, judgingCriteria, location, competitionDate } = data;

    if (!password || (password !== process.env.ADMIN_PASS && password !== process.env.TEACHER_PASS)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const comp = await prisma.competition.update({
      where: { id },
      data: {
        title,
        category: category || "",
        level: level || "",
        teamMin: teamMin ? parseInt(teamMin) : 1,
        teamMax: teamMax ? parseInt(teamMax) : 1,
        description: description || "",
        rules: rules || "",
        judgingCriteria: judgingCriteria || "",
        location: location || "",
        competitionDate: competitionDate ? String(competitionDate) : null,
      }
    });

    return NextResponse.json({ success: true, message: 'อัปเดตสำเร็จ', data: comp });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const password = searchParams.get('password');

    if (!password || (password !== process.env.ADMIN_PASS && password !== process.env.TEACHER_PASS)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    if (!id) return NextResponse.json({ success: false, message: 'Missing ID' }, { status: 400 });

    // ตรวจสอบว่ามีผู้สมัครหรือผลงานที่ผูกไว้หรือไม่
    const registrations = await prisma.registration.count({ where: { competitionId: id } });
    const submissions = await prisma.submission.count({ where: { competitionId: id } });

    if (registrations > 0 || submissions > 0) {
      // Option 1: Cascade delete if needed, but safer to block
      return NextResponse.json({ success: false, message: 'ไม่สามารถลบได้เนื่องจากมีข้อมูลผู้สมัครหรือผลงานผูกอยู่กับรายการนี้' });
    }

    await prisma.competition.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'ลบรายการแข่งขันสำเร็จ' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
