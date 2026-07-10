"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import React from 'react';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <>
      {!isAdmin && (
        <header className="fixed top-0 w-full z-50 glass-panel border-b-0 border-x-0 border-t-0 rounded-none transition-all duration-300 py-3">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
              <Link href="/" className="flex items-center gap-2 text-2xl font-heading font-bold text-gradient">
                  <i className='bx bx-atom text-primary'></i>
                  <span>ScienceWeek</span>
              </Link>
              
              <ul className="hidden md:flex space-x-8 text-sm font-medium">
                  <li><Link href="/" className="text-slate-600 hover:text-primary transition-colors">หน้าแรก</Link></li>
                  <li><Link href="/schedule" className="text-slate-600 hover:text-primary transition-colors">กำหนดการ</Link></li>
                  <li><Link href="/competitions" className="text-slate-600 hover:text-primary transition-colors">รายการแข่งขัน</Link></li>
                  <li><Link href="/submit" className="text-slate-600 hover:text-primary transition-colors">ส่งผลงาน</Link></li>
              </ul>
              
              <div className="hidden md:flex items-center space-x-2">
                  <Link href="/check" className="btn bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm px-4 py-2">ตรวจสอบสถานะ</Link>
                  <Link href="/register" className="btn btn-outline text-sm px-5 py-2">สมัครแข่งขัน</Link>
                  <Link href="/admin" className="text-slate-400 hover:text-primary transition-colors text-xl p-2" title="Admin Dashboard"><i className='bx bx-cog'></i></Link>
              </div>
              
              <button className="md:hidden text-2xl text-slate-700 focus:outline-none"><i className='bx bx-menu'></i></button>
          </nav>
        </header>
      )}

      <main className={!isAdmin ? "flex-grow pt-24" : "flex-grow"}>
        {children}
      </main>

      {!isAdmin && (
        <footer className="bg-dark text-slate-300 py-10 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left">
                  <h3 className="text-white font-heading font-bold text-xl mb-2 flex items-center justify-center md:justify-start gap-2">
                      <i className='bx bx-atom text-primary'></i> ScienceWeek
                  </h3>
                  <p className="text-sm">กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี<br/>โรงเรียนวัชรวิทยา</p>
              </div>
              <div className="text-center md:text-right text-sm">
                  <p>&copy; 2026 ScienceWeek Vacharawittaya. All rights reserved.</p>
                  <div className="mt-4 flex gap-4 justify-center md:justify-end text-xl">
                      <a href="#" className="hover:text-primary transition-colors"><i className='bx bxl-facebook-circle'></i></a>
                      <a href="#" className="hover:text-secondary transition-colors"><i className='bx bx-globe'></i></a>
                  </div>
              </div>
          </div>
        </footer>
      )}
    </>
  );
}
