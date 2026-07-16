"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { isRegistrationOpen } from '@/lib/competitionUtils';

function renderHTML(content: string | undefined | null) {
    if (!content) return { __html: '' };
    if (/<[a-z][\s\S]*>/i.test(content)) {
        return { __html: content };
    }
    return { __html: content.replace(/\n/g, '<br/>') };
}

export default function CompetitionDetail() {
  const params = useParams();
  const id = params.id as string;
  const [comp, setComp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function loadDetail() {
      try {
        const res = await fetch(`/api/competitions?id=${id}`).then(r => r.json());
        if (res.success && res.data) {
          setComp(res.data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [id]);

  const formatThaiDate = (dateString: string) => {
    if (!dateString) return 'ไม่ได้ระบุ';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' น.';
  };

  const formatThaiDateOnly = (dateString: string) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center text-slate-500 glass-panel rounded-2xl mt-8">
          <i className='bx bx-loader-alt bx-spin text-4xl mb-4 text-primary'></i>
          <p>กำลังโหลดข้อมูลการแข่งขัน...</p>
      </div>
    );
  }

  if (error || !comp) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center text-red-500 glass-panel rounded-2xl mt-8">
          <i className='bx bx-error-circle text-4xl mb-4'></i>
          <p>ไม่พบข้อมูลการแข่งขันที่ระบุ</p>
          <Link href="/competitions" className="btn btn-outline mt-4">กลับไปหน้ารายการแข่งขัน</Link>
      </div>
    );
  }

  const isRegOpen = isRegistrationOpen(comp);
  let isSubOpen = comp.submissionOpen === true || String(comp.submissionOpen).toUpperCase() === 'TRUE';
  if (isSubOpen && comp.competitionDate) {
    const compDate = new Date(comp.competitionDate);
    if (new Date() < compDate) {
      isSubOpen = false;
    }
  }

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6">
          <Link href="/competitions" className="inline-flex items-center text-slate-500 hover:text-primary transition-colors font-medium">
              <i className='bx bx-arrow-back mr-2'></i> กลับไปหน้ารายการแข่งขัน
          </Link>
      </div>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="glass-panel p-6 md:p-10 rounded-t-3xl border-b-0 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent rounded-full filter blur-3xl opacity-50 pointer-events-none"></div>
              
              <div className="flex flex-wrap items-center gap-3 mb-6 relative z-10">
                  <span className="px-3 py-1 rounded-full bg-accent text-primary text-sm font-semibold uppercase tracking-wide border border-pink-100">{comp.category || comp.level}</span>
                  {isRegOpen ? (
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold border border-green-200">เปิดรับสมัคร</span>
                  ) : (
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm font-semibold border border-slate-200">ปิดรับสมัคร</span>
                  )}
              </div>
              
              <h1 className="text-3xl md:text-5xl font-heading font-bold mb-4 text-slate-800 leading-tight relative z-10">{comp.title}</h1>
              <div className="text-lg text-slate-600 mb-8 max-w-3xl relative z-10 markdown-content" dangerouslySetInnerHTML={renderHTML(comp.description)} />
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 bg-white/60 p-6 rounded-2xl border border-white/60 relative z-10 shadow-sm">
                  <div className="flex items-start gap-3">
                      <i className='bx bx-group text-2xl text-primary mt-1'></i>
                      <div>
                          <span className="block text-[11px] text-slate-500 uppercase tracking-widest font-bold mb-1">ระดับชั้น</span>
                          <strong className="text-slate-800 text-sm md:text-base">{comp.level}</strong>
                      </div>
                  </div>
                  <div className="flex items-start gap-3">
                      <i className='bx bx-user text-2xl text-secondary mt-1'></i>
                      <div>
                          <span className="block text-[11px] text-slate-500 uppercase tracking-widest font-bold mb-1">สมาชิก</span>
                          <strong className="text-slate-800 text-sm md:text-base">{parseInt(comp.teamMax) === 1 ? "1 คน/ทีม" : `${comp.teamMin || 1}-${comp.teamMax} คน/ทีม`}</strong>
                      </div>
                  </div>
                  <div className="flex items-start gap-3">
                      <i className='bx bx-calendar text-2xl text-primary mt-1'></i>
                      <div>
                          <span className="block text-[11px] text-slate-500 uppercase tracking-widest font-bold mb-1">วันและเวลาแข่งขัน</span>
                          <strong className="text-slate-800 text-sm md:text-base">{formatThaiDate(comp.competitionDate || comp.createdAt)}</strong>
                      </div>
                  </div>
                  <div className="flex items-start gap-3">
                      <i className='bx bx-map text-2xl text-secondary mt-1'></i>
                      <div>
                          <span className="block text-[11px] text-slate-500 uppercase tracking-widest font-bold mb-1">สถานที่</span>
                          <strong className="text-slate-800 text-sm md:text-base">{comp.location || 'ไม่ได้ระบุ'}</strong>
                      </div>
                  </div>
                  {(comp.registerStartDate || comp.registerEndDate) && (
                  <div className="flex items-start gap-3">
                      <i className='bx bx-edit text-2xl text-green-600 mt-1'></i>
                      <div>
                          <span className="block text-[11px] text-slate-500 uppercase tracking-widest font-bold mb-1">ช่วงเวลารับสมัคร</span>
                          <strong className="text-slate-800 text-sm md:text-base">{formatThaiDateOnly(comp.registerStartDate)} - {formatThaiDateOnly(comp.registerEndDate)}</strong>
                      </div>
                  </div>
                  )}
              </div>
              
              <div className="mt-8 flex flex-wrap gap-4 relative z-10">
                  {isRegOpen && (
                      <Link href={`/register?id=${comp.id}`} className="btn btn-primary shadow-primary/30"><i className='bx bx-edit mr-2'></i> สมัครแข่งขัน</Link>
                  )}
                  {isSubOpen && (
                      <Link href={`/submit?id=${comp.id}`} className="btn btn-secondary shadow-secondary/30"><i className='bx bx-upload mr-2'></i> ส่งผลงานออนไลน์</Link>
                  )}
              </div>
          </div>

          <div className="bg-white rounded-b-3xl shadow-xl border border-t-0 border-slate-100 overflow-hidden relative">
              <div className="p-6 md:p-10 border-b border-slate-100">
                  <h2 className="text-2xl font-bold font-heading mb-6 flex items-center gap-3 text-slate-800">
                      <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-primary"><i className='bx bx-list-check'></i></div>
                      กติกาการแข่งขัน
                  </h2>
                  <div className="markdown-content pl-2 md:pl-12" dangerouslySetInnerHTML={renderHTML(comp.rules || 'ไม่มีข้อมูลกติกา')} />
              </div>

              <div className="p-6 md:p-10">
                  <h2 className="text-2xl font-bold font-heading mb-6 flex items-center gap-3 text-slate-800">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-secondary"><i className='bx bx-check-shield'></i></div>
                      เกณฑ์การตัดสิน
                  </h2>
                  <div className="markdown-content pl-2 md:pl-12" dangerouslySetInnerHTML={renderHTML(comp.judgingCriteria || 'ไม่มีข้อมูลเกณฑ์การตัดสิน')} />
              </div>
          </div>
      </section>
    </>
  );
}
