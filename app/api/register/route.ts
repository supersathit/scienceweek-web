import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isRegistrationOpen } from '@/lib/competitionUtils';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { action, competition_id, team_name, leader_student_code, leader_full_name, leader_class, leader_room, leader_number, contact_phone, members_json } = data;

    // Check competition
    const comp = await prisma.competition.findUnique({ where: { id: competition_id } });
    if (!comp) {
      return NextResponse.json({ success: false, message: "ไม่พบการแข่งขันนี้" });
    }
    if (!isRegistrationOpen(comp)) {
      return NextResponse.json({ success: false, message: "การแข่งขันนี้ปิดรับสมัครแล้ว" });
    }

    // Generate registration code e.g. REG001
    const lastReg = await prisma.registration.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    let nextNum = 1;
    if (lastReg && lastReg.registrationCode.startsWith('REG')) {
      const numMatch = lastReg.registrationCode.match(/\d+/);
      if (numMatch) {
        nextNum = parseInt(numMatch[0]) + 1;
      }
    }
    const regCode = "REG" + String(nextNum).padStart(3, '0');

    let combinedClass = leader_class || '';
    if (leader_room) {
      combinedClass += `/${leader_room}`;
    }

    let parsedMembers = members_json;
    if (typeof members_json === 'string') {
      try {
        parsedMembers = JSON.parse(members_json);
      } catch(e) {
        parsedMembers = {};
      }
    }

    // Create Registration
    await prisma.registration.create({
      data: {
        registrationCode: regCode,
        competitionId: competition_id,
        teamName: team_name || null,
        leaderStudentCode: leader_student_code,
        leaderFullName: leader_full_name,
        leaderClass: combinedClass,
        leaderNumber: leader_number,
        contactPhone: contact_phone,
        membersJson: parsedMembers || {},
      }
    });

    return NextResponse.json({ success: true, message: "สมัครการแข่งขันสำเร็จ", registration_code: regCode });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
