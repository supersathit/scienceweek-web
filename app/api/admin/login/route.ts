import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { username, password } = data;

    const adminUser = process.env.ADMIN_USER || 'admin';
    const adminPass = process.env.ADMIN_PASS || 'admin1234';
    const teacherUser = process.env.TEACHER_USER || 'teacher';
    const teacherPass = process.env.TEACHER_PASS || 'teacher1234';

    if (username === adminUser && password === adminPass) {
      return NextResponse.json({ success: true, message: "เข้าสู่ระบบสำเร็จ", role: "admin" });
    } else if (username === teacherUser && password === teacherPass) {
      return NextResponse.json({ success: true, message: "เข้าสู่ระบบสำเร็จ (สิทธิ์คุณครู)", role: "teacher" });
    } else {
      return NextResponse.json({ success: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
