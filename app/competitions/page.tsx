"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { isRegistrationOpen } from '@/lib/competitionUtils';

export default function Competitions() {
  const [allCompetitions, setAllCompetitions] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    async function loadComps() {
      try {
        const res = await fetch('/api/competitions').then(r => r.json());
        if (res.success && res.data) {
          setAllCompetitions(res.data);
          setFiltered(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadComps();
  }, []);

  const handleFilter = (filter: string) => {
    setActiveFilter(filter);
    if (filter === 'all') {
      setFiltered(allCompetitions);
    } else {
      setFiltered(allCompetitions.filter(c => c.category === filter));
    }
  };

  const formatThaiDate = (dateString: string) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="text-center mb-12 relative">
              <span className="inline-block py-1 px-4 rounded-full bg-accent text-primary text-sm font-medium mb-4 shadow-sm">Competitions</span>
              <h1 className="text-4xl sm:text-5xl font-heading font-bold mb-4 text-slate-800">รายการแข่งขัน</h1>
              <p className="text-slate-600 max-w-2xl mx-auto">เลือกรายการที่คุณสนใจและสมัครเข้าร่วมการแข่งขัน</p>
              
              <div className="flex flex-wrap justify-center gap-3 mt-8">
                  <button onClick={() => handleFilter('all')} className={`px-5 py-2.5 rounded-full border-2 border-slate-200 font-medium transition-all shadow-sm ${activeFilter === 'all' ? 'bg-primary border-primary text-white shadow-md' : 'text-slate-600 hover:border-primary hover:text-primary bg-white'}`}>ทั้งหมด</button>
                  <button onClick={() => handleFilter('วิชาการ')} className={`px-5 py-2.5 rounded-full border-2 border-slate-200 font-medium transition-all shadow-sm ${activeFilter === 'วิชาการ' ? 'bg-primary border-primary text-white shadow-md' : 'text-slate-600 hover:border-primary hover:text-primary bg-white'}`}>วิชาการ</button>
                  <button onClick={() => handleFilter('โครงงาน')} className={`px-5 py-2.5 rounded-full border-2 border-slate-200 font-medium transition-all shadow-sm ${activeFilter === 'โครงงาน' ? 'bg-primary border-primary text-white shadow-md' : 'text-slate-600 hover:border-primary hover:text-primary bg-white'}`}>โครงงาน</button>
                  <button onClick={() => handleFilter('สื่อสร้างสรรค์')} className={`px-5 py-2.5 rounded-full border-2 border-slate-200 font-medium transition-all shadow-sm ${activeFilter === 'สื่อสร้างสรรค์' ? 'bg-primary border-primary text-white shadow-md' : 'text-slate-600 hover:border-primary hover:text-primary bg-white'}`}>สื่อสร้างสรรค์</button>
              </div>
          </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-500">
                    <i className='bx bx-loader-alt bx-spin text-4xl mb-4 text-primary'></i>
                    <p>กำลังโหลดรายการแข่งขัน...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="col-span-full text-center py-10 text-slate-500"><p>ไม่พบรายการแข่งขันที่ตรงกับเงื่อนไข</p></div>
              ) : (
                filtered.map(item => {
                  const isRegOpen = isRegistrationOpen(item);
                  const isSingle = parseInt(item.teamMax) === 1;
                  return (
                    <div key={item.id} className="glass-panel p-6 rounded-2xl flex flex-col hover:-translate-y-2 transition-transform duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-semibold text-primary uppercase tracking-wider bg-accent px-3 py-1 rounded-full">{item.category || item.level}</span>
                            {isRegOpen ? (
                                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold border border-green-200">เปิดรับสมัคร</span>
                            ) : (
                                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200">ปิดรับสมัคร</span>
                            )}
                        </div>
                        <h3 className="text-xl font-bold mb-4 text-slate-800 line-clamp-2 min-h-[3.5rem]">{item.title}</h3>
                        <div className="space-y-3 mb-6 flex-grow border-t border-slate-100 pt-4">
                            <div className="flex items-center text-sm text-slate-600">
                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3 text-secondary">
                                    <i className={`bx ${isSingle ? "bx-user" : "bx-group"}`}></i>
                                </div>
                                <span>{isSingle ? "ประเภทเดี่ยว (1 คน)" : `ประเภททีม (${item.teamMin || 1}-${item.teamMax} คน)`}</span>
                            </div>
                            <div className="flex items-center text-sm text-slate-600">
                                <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center mr-3 text-primary">
                                    <i className='bx bx-layer'></i>
                                </div>
                                <span>{item.level}</span>
                            </div>
                            {(item.registerStartDate || item.registerEndDate) && (
                            <div className="flex items-center text-sm text-slate-600">
                                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center mr-3 text-green-600">
                                    <i className='bx bx-calendar'></i>
                                </div>
                                <span>รับสมัคร: {formatThaiDate(item.registerStartDate)} - {formatThaiDate(item.registerEndDate)}</span>
                            </div>
                            )}
                        </div>
                        <Link href={`/competitions/${item.id}`} className="btn btn-outline w-full text-center group">
                            ดูรายละเอียด <i className='bx bx-right-arrow-alt ml-1 group-hover:translate-x-1 transition-transform'></i>
                        </Link>
                    </div>
                  );
                })
              )}
          </div>
      </section>
    </>
  );
}
