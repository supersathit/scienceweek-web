"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [stats, setStats] = useState({ comps: 0, categories: 0, catNames: '' });

  useEffect(() => {
    async function loadData() {
      try {
        const [annRes, compRes] = await Promise.all([
          fetch('/api/announcements').then(res => res.json()),
          fetch('/api/competitions').then(res => res.json())
        ]);

        if (annRes.success) {
          setAnnouncements(annRes.data);
        }
        
        if (compRes.success && compRes.data) {
          const comps = compRes.data;
          const categories = new Set<string>();
          comps.forEach((c: any) => {
            if (c.category) categories.add(c.category);
          });
          const catArray = Array.from(categories).slice(0, 3);
          setStats({
            comps: comps.length,
            categories: categories.size,
            catNames: catArray.join(' ')
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingAnnouncements(false);
      }
    }
    loadData();
  }, []);

  const formatThaiDate = (dateString: string) => {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <>
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-24 flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 z-10 text-center lg:text-left">
              <span className="inline-block py-1 px-4 rounded-full bg-accent text-primary text-sm font-medium mb-4 shadow-sm">ปีการศึกษา 2569</span>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-bold leading-tight mb-4 sm:mb-6">
                  สัปดาห์วิทยาศาสตร์<br/>
                  <span className="text-gradient">โรงเรียนวัชรวิทยา</span>
              </h1>
              <p className="text-slate-600 text-base sm:text-lg mb-8 max-w-2xl mx-auto lg:mx-0">
                  เปิดประตูสู่โลกแห่งนวัตกรรมและการค้นพบ ร่วมสนุกกับกิจกรรมและการแข่งขันทางวิทยาศาสตร์มากมาย พร้อมชิงรางวัลสุดพิเศษ
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link href="/competitions" className="btn btn-primary"><i className='bx bx-rocket'></i> ดูรายการแข่งขัน</Link>
                  <Link href="/schedule" className="btn btn-secondary"><i className='bx bx-calendar-event'></i> กำหนดการ</Link>
              </div>
          </div>
          
          <div className="lg:w-1/2 relative mt-16 lg:mt-0 w-full flex justify-center">
              <div className="orb orb-1"></div>
              <div className="orb orb-2"></div>
              
              {/* Floating Glass Cards */}
              {/* Floating Glass Cards */}
              <div className="relative w-full max-w-md h-[300px] sm:h-[400px]">
                  <div className="glass-panel floating absolute top-2 sm:top-10 right-0 sm:right-4 md:right-0 p-4 sm:p-6 rounded-2xl w-[60%] sm:w-64 z-10">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-pink-100 text-primary flex items-center justify-center text-xl sm:text-2xl mb-3 sm:mb-4">
                          <i className='bx bx-trophy'></i>
                      </div>
                      <h3 className="font-bold text-base sm:text-xl mb-1"><span>{stats.comps || '10+'}</span> รายการ</h3>
                      <p className="text-slate-500 text-xs sm:text-sm">รายการแข่งขันสุดท้าทาย</p>
                  </div>
                  
                  <div className="glass-panel floating floating-delay absolute bottom-2 sm:bottom-10 left-0 sm:left-4 md:left-0 p-4 sm:p-6 rounded-2xl w-[60%] sm:w-64">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 text-secondary flex items-center justify-center text-xl sm:text-2xl mb-3 sm:mb-4">
                          <i className='bx bx-brain'></i>
                      </div>
                      <h3 className="font-bold text-base sm:text-xl mb-1"><span>{stats.categories || '3'}</span> หมวดหมู่</h3>
                      <p className="text-slate-500 text-xs sm:text-sm">{stats.catNames || 'วิชาการ โครงงาน นวัตกรรม'}</p>
                  </div>
              </div>
          </div>
      </section>

      {/* Announcements Section */}
      <section className="bg-white py-16 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3 mb-8">
                  <i className='bx bx-news text-3xl text-primary'></i>
                  <h2 className="text-2xl font-bold font-heading">ข่าวประกาศ</h2>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {loadingAnnouncements ? (
                      <div className="animate-pulse flex space-x-4">
                          <div className="flex-1 space-y-6 py-1">
                            <div className="h-2 bg-slate-200 rounded"></div>
                            <div className="space-y-3">
                              <div className="grid grid-cols-3 gap-4">
                                <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                                <div className="h-2 bg-slate-200 rounded col-span-1"></div>
                              </div>
                              <div className="h-2 bg-slate-200 rounded"></div>
                            </div>
                          </div>
                      </div>
                  ) : announcements.length === 0 ? (
                      <p className="text-slate-500 col-span-full">ยังไม่มีข่าวประกาศในขณะนี้</p>
                  ) : (
                      announcements.map((ann) => (
                          <div key={ann.id} className="glass-panel p-6 rounded-2xl border-l-4 border-l-primary hover:-translate-y-1 transition-transform duration-300">
                              <span className="text-xs font-semibold text-secondary mb-2 block"><i className='bx bx-calendar'></i> {formatThaiDate(ann.date || ann.createdAt)}</span>
                              <h3 className="font-bold text-lg mb-2 text-slate-800">{ann.title}</h3>
                              <p className="text-slate-600 text-sm line-clamp-3">{ann.content}</p>
                          </div>
                      ))
                  )}
              </div>
          </div>
      </section>
    </>
  );
}
