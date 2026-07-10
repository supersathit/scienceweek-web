"use client";

import { useEffect, useState } from 'react';

export default function Schedule() {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSchedule() {
      try {
        const res = await fetch('/api/schedule').then(r => r.json());
        if (res.success) {
          setSchedule(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSchedule();
  }, []);

  const formatThaiDate = (dateString: string) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="text-center mb-12 relative">
              <span className="inline-block py-1 px-4 rounded-full bg-accent text-primary text-sm font-medium mb-4 shadow-sm">Event Schedule</span>
              <h1 className="text-4xl sm:text-5xl font-heading font-bold mb-4 text-slate-800">กำหนดการกิจกรรม</h1>
              <p className="text-slate-600 max-w-2xl mx-auto">ตารางกิจกรรมและการแข่งขันตลอดสัปดาห์วิทยาศาสตร์</p>
          </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="glass-panel rounded-2xl overflow-hidden shadow-lg">
              <div className="flex overflow-x-auto border-b border-slate-200">
                  <button className="px-6 py-4 font-semibold text-primary border-b-2 border-primary whitespace-nowrap">กำหนดการสัปดาห์วิทยาศาสตร์</button>
              </div>
              
              <div className="p-6 md:p-10 relative">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                        <i className='bx bx-loader-alt bx-spin text-4xl mb-4 text-primary'></i>
                        <p>กำลังโหลดกำหนดการ...</p>
                    </div>
                  ) : schedule.length > 0 ? (
                    schedule.map((item, index) => (
                      <div key={item.id} className="relative flex gap-4 md:gap-8 w-full mb-8 group overflow-hidden">
                          <div className="w-24 md:w-32 flex-shrink-0 text-right pt-2">
                              <span className="block font-bold text-primary text-sm md:text-base leading-tight">
                                {formatThaiDate(item.date)}
                              </span>
                          </div>
                          
                          <div className="flex flex-col items-center relative">
                              <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-primary border-4 border-white shadow-sm z-10 mt-2 group-hover:scale-125 transition-transform"></div>
                              {index !== schedule.length - 1 && (
                                <div className="w-0.5 bg-slate-200 flex-grow mt-2 -mb-12"></div>
                              )}
                          </div>
                          
                          <div className="flex-grow pb-2">
                              <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 group-hover:shadow-md transition-shadow group-hover:border-primary/20">
                                  <h3 className="text-base md:text-lg font-bold text-slate-800 mb-2">{item.event}</h3>
                                  {item.details && (
                                      <div className="text-sm text-slate-600 mb-3 whitespace-pre-wrap">
                                          {item.details}
                                      </div>
                                  )}
                                  <div className="text-sm font-medium text-slate-500 mb-2">
                                    <i className='bx bx-time'></i> {item.time}
                                  </div>
                                  <div className="inline-flex items-center text-xs font-medium text-secondary bg-blue-50 px-3 py-1.5 rounded-full mt-2">
                                      <i className='bx bx-map mr-1.5'></i> {item.location}
                                  </div>
                              </div>
                          </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-slate-500 py-10"><p>ไม่พบข้อมูลกำหนดการ</p></div>
                  )}
              </div>
          </div>
      </section>
    </>
  );
}
