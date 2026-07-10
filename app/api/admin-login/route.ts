import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    
    // In a real application, you would check against database or environment variables
    const adminUser = process.env.ADMIN_USER || 'admin';
    const adminPass = process.env.ADMIN_PASS || 'admin123';
    
    const teacherUser = process.env.TEACHER_USER || 'teacher';
    const teacherPass = process.env.TEACHER_PASS || 'teacher123';

    if (username === adminUser && password === adminPass) {
      return NextResponse.json({ success: true, role: 'admin' });
    }
    
    if (username === teacherUser && password === teacherPass) {
      return NextResponse.json({ success: true, role: 'teacher' });
    }

    return NextResponse.json({ success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
