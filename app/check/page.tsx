"use client";

import { useState } from 'react';
import Swal from 'sweetalert2';

export default function CheckStatus() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`/api/check-status?code=${encodeURIComponent(code.trim())}`).then(r => r.json());
      if (res.success) {
        setResult(res.data);
      } else {
        Swal.fire('ไม่พบข้อมูล', res.message || 'ไม่พบรหัสการสมัครนี้ในระบบ', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('ข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 text-center">
          <span className="inline-block py-1 px-4 rounded-full bg-accent text-primary text-sm font-medium mb-4 shadow-sm">Check Status</span>
          <h1 className="text-4xl font-heading font-bold mb-4 text-slate-800">ตรวจสอบสถานะ</h1>
          <p className="text-slate-600 mb-8">ตรวจสอบสถานะการสมัครและการส่งผลงานด้วยรหัส Registration Code</p>
          
          <form onSubmit={handleCheck} className="flex max-w-md mx-auto gap-2">
              <input 
                  type="text" 
                  className="form-control" 
                  placeholder="เช่น REG001" 
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required 
              />
              <button type="submit" className="btn btn-primary whitespace-nowrap" disabled={loading}>
                  {loading ? <i className='bx bx-loader-alt bx-spin'></i> : <i className='bx bx-search'></i>} ตรวจสอบ
              </button>
          </form>
      </section>

      {result && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pb-16">
            <div className="glass-panel p-8 rounded-2xl">
                <h2 className="text-2xl font-bold mb-6 text-slate-800 border-b pb-4">ผลการตรวจสอบ: <span className="text-primary">{result.registration.registrationCode}</span></h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center"><i className='bx bx-user mr-2 text-secondary'></i> ข้อมูลการสมัคร</h3>
                        <ul className="space-y-3 text-slate-600">
                            <li><strong className="text-slate-800">การแข่งขัน:</strong> {result.registration.competition?.title}</li>
                            <li><strong className="text-slate-800">ชื่อทีม/ผู้สมัคร:</strong> {result.registration.teamName || result.registration.leaderFullName}</li>
                            <li><strong className="text-slate-800">สถานะการสมัคร:</strong> 
                                <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${result.registration.status === 'approved' ? 'bg-green-100 text-green-700' : result.registration.status === 'submitted' ? 'bg-blue-100 text-blue-700' : result.registration.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {result.registration.status === 'pending' ? 'รอตรวจสอบ' : result.registration.status === 'approved' ? 'อนุมัติแล้ว' : result.registration.status === 'submitted' ? 'ส่งงานแล้ว' : result.registration.status === 'rejected' ? 'ปฏิเสธ' : result.registration.status.toUpperCase()}
                                </span>
                            </li>
                        </ul>
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center"><i className='bx bx-upload mr-2 text-primary'></i> สถานะผลงาน</h3>
                        {result.submission ? (
                            <ul className="space-y-3 text-slate-600">
                                <li><strong className="text-slate-800">รหัสผลงาน:</strong> {result.submission.submissionId}</li>
                                <li><strong className="text-slate-800">ชื่อผลงาน:</strong> {result.submission.workTitle}</li>
                                <li><strong className="text-slate-800">ไฟล์แนบ:</strong> <a href={result.submission.fileUrl} target="_blank" className="text-primary underline">ดูไฟล์</a></li>
                                <li><strong className="text-slate-800">สถานะ:</strong> 
                                    <span className="ml-2 px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-700">
                                        {result.submission.status}
                                    </span>
                                </li>
                            </ul>
                        ) : (
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-center">
                                <p className="text-slate-500 mb-3">ยังไม่ได้ส่งผลงาน</p>
                                {(() => {
                                  let isSubOpen = false;
                                  if (result.registration.competition) {
                                    const comp = result.registration.competition;
                                    isSubOpen = comp.submissionOpen === true || String(comp.submissionOpen).toUpperCase() === 'TRUE';
                                    if (isSubOpen && comp.competitionDate) {
                                      const compDate = new Date(comp.competitionDate);
                                      if (new Date() < compDate) {
                                        isSubOpen = false;
                                      }
                                    }
                                  }
                                  return isSubOpen ? (
                                    <a href={`/submit?id=${result.registration.competitionId}`} className="btn btn-outline text-sm py-1.5 px-4">ส่งผลงานเดี๋ยวนี้</a>
                                  ) : null;
                                })()}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
      )}
    </>
  );
}
