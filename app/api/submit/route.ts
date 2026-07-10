import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const registration_code = formData.get('registration_code') as string;
    const competition_id = formData.get('competition_id') as string;
    const work_title = formData.get('work_title') as string;
    const work_description = formData.get('work_description') as string;
    const external_link = formData.get('external_link') as string;
    const file = formData.get('file') as File;

    if (!registration_code || !competition_id) {
      return NextResponse.json({ success: false, message: "ข้อมูลไม่ครบถ้วน" });
    }

    // Validate Registration
    const reg = await prisma.registration.findUnique({
      where: { registrationCode: registration_code },
      include: { competition: true }
    });

    if (!reg) {
      return NextResponse.json({ success: false, message: "ไม่พบรหัสการสมัครนี้ในระบบ กรุณาตรวจสอบอีกครั้ง" });
    }

    if (reg.competitionId !== competition_id) {
      return NextResponse.json({ success: false, message: "รหัสการสมัครนี้ไม่ได้ลงทะเบียนในรายการแข่งขันที่คุณเลือก" });
    }

    if (!reg.competition.submissionOpen) {
      return NextResponse.json({ success: false, message: "รายการแข่งขันนี้ยังไม่เปิดรับผลงาน หรือปิดรับผลงานไปแล้ว" });
    }

    if (reg.competition.competitionDate) {
      const compDate = new Date(reg.competition.competitionDate);
      const now = new Date();
      if (now < compDate) {
        return NextResponse.json({ success: false, message: "ยังไม่ถึงเวลาแข่งขันที่กำหนดไว้ จึงยังไม่สามารถส่งผลงานได้" });
      }
    }

    // Check if already submitted
    const existingSubmission = await prisma.submission.findFirst({
      where: { registrationCode: registration_code }
    });

    if (existingSubmission) {
      return NextResponse.json({ success: false, message: "รหัสการสมัครนี้ได้ทำการส่งผลงานเข้าระบบไปแล้ว ไม่สามารถส่งซ้ำได้" });
    }

    // Handle File Upload
    let fileUrl = "";
    if (file && file.size > 0) {
      const extension = file.name.includes('.') ? file.name.split('.').pop() : '';
      const newFileName = extension ? `${registration_code}.${extension}` : registration_code;
      
      // Ensure uploads directory exists
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });

      const filePath = path.join(uploadDir, newFileName);
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      await fs.writeFile(filePath, buffer);
      fileUrl = `/uploads/${newFileName}`;
    }

    // Generate Submission ID
    const lastSub = await prisma.submission.findFirst({
      orderBy: { submittedAt: 'desc' }
    });
    let nextNum = 1;
    if (lastSub && lastSub.submissionId.startsWith('SUB')) {
      const numMatch = lastSub.submissionId.match(/\d+/);
      if (numMatch) {
        nextNum = parseInt(numMatch[0]) + 1;
      }
    }
    const subCode = "SUB" + String(nextNum).padStart(3, '0');

    // Save to Database
    await prisma.submission.create({
      data: {
        submissionId: subCode,
        registrationCode: registration_code,
        competitionId: competition_id,
        workTitle: work_title || "",
        workDescription: work_description || "",
        fileUrl: fileUrl,
        externalLink: external_link || "",
        status: "submitted"
      }
    });

    // Update Registration Status
    await prisma.registration.update({
      where: { registrationCode: registration_code },
      data: { status: 'submitted' }
    });

    return NextResponse.json({ success: true, message: "ส่งผลงานสำเร็จ", submission_id: subCode });
    
  } catch (error: any) {
    console.error("Submit API Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
