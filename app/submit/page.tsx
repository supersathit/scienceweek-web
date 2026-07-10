"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Swal from 'sweetalert2';
import Link from 'next/link';

function SubmitFormContent() {
  const searchParams = useSearchParams();
  const defaultCompId = searchParams.get('id') || '';

  const [competitions, setCompetitions] = useState<any[]>([]);
  const [currentComp, setCurrentComp] = useState<any>(null);
  const [selectedCompId, setSelectedCompId] = useState(defaultCompId);
  const [loadingComps, setLoadingComps] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [regCode, setRegCode] = useState('');
  const [workTitle, setWorkTitle] = useState('');
  const [workDesc, setWorkDesc] = useState('');
  const [workLink, setWorkLink] = useState('');
  const [file, setFile] = useState<File | null>(null);
  useEffect(() => {
    async function loadComps() {
      try {
        const res = await fetch('/api/competitions').then(r => r.json());
        if (res.success && res.data) {
          const available = res.data.filter((c: any) => {
            let isOpen = true;
            if (c.submissionOpen !== undefined) {
              isOpen = c.submissionOpen === true || String(c.submissionOpen).toUpperCase() === 'TRUE';
            }
            if (isOpen && c.competitionDate) {
              const compDate = new Date(c.competitionDate);
              if (new Date() < compDate) {
                isOpen = false;
              }
            }
            return isOpen;
          });
          setCompetitions(available);
          
          if (available.length === 0) {
            setErrorMsg('ขณะนี้ไม่มีรายการแข่งขันที่เปิดให้ส่งผลงาน');
          } else if (defaultCompId) {
            const exists = available.find((c: any) => c.id === defaultCompId);
            if (exists) {
              handleSelectComp(defaultCompId, available);
            }
          }
        } else {
          setErrorMsg('ไม่สามารถโหลดข้อมูลได้');
        }
      } catch (err) {
        setErrorMsg('เกิดข้อผิดพลาดในการเชื่อมต่อ');
      } finally {
        setLoadingComps(false);
      }
    }
    loadComps();
  }, [defaultCompId]);

  const handleSelectComp = (compId: string, availableList = competitions) => {
    setSelectedCompId(compId);
    if (!compId) {
      setCurrentComp(null);
      return;
    }
    const comp = availableList.find((c: any) => c.id === compId);
    if (comp) {
      setCurrentComp(comp);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentComp) {
      Swal.fire('ข้อผิดพลาด', 'กรุณาเลือกรายการแข่งขัน', 'error');
      return;
    }

    if (!file) {
      Swal.fire('ข้อผิดพลาด', 'กรุณาแนบไฟล์ผลงาน', 'error');
      return;
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      Swal.fire('ข้อผิดพลาด', 'ขนาดไฟล์เกิน 50MB กรุณาลดขนาดไฟล์', 'error');
      return;
    }

    const btnSubmit = document.getElementById('btn-submit') as HTMLButtonElement;
    const originalText = btnSubmit.innerHTML;

    try {
      btnSubmit.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i> กำลังอัปโหลด...";
      btnSubmit.disabled = true;

      Swal.fire({
        title: 'กำลังอัปโหลดไฟล์และส่งข้อมูล...',
        html: 'กรุณารอสักครู่ อาจใช้เวลา 1-2 นาทีขึ้นอยู่กับขนาดไฟล์ (ห้ามปิดหน้านี้)',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const formData = new FormData();
      formData.append('registration_code', regCode);
      formData.append('competition_id', currentComp.id);
      formData.append('work_title', workTitle);
      formData.append('work_description', workDesc);
      formData.append('external_link', workLink);
      formData.append('file', file);

      const response = await fetch('/api/submit', {
        method: 'POST',
        body: formData
      }).then(r => r.json());

      if (response.success) {
        Swal.close();
        Swal.fire({
          title: 'สำเร็จ!',
          text: 'ส่งผลงานเข้าระบบเรียบร้อยแล้ว',
          icon: 'success'
        }).then(() => {
          window.location.href = `/check?code=${regCode}`;
        });
      } else {
        Swal.fire('เกิดข้อผิดพลาด', response.message || 'ไม่สามารถส่งผลงานได้', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้', 'error');
    } finally {
      btnSubmit.innerHTML = originalText;
      btnSubmit.disabled = false;
    }
  };

  if (loadingComps) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 glass-panel rounded-2xl max-w-3xl mx-auto mt-8">
          <i className='bx bx-loader-alt bx-spin text-4xl mb-4 text-primary'></i>
          <p>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-red-500 glass-panel rounded-2xl max-w-3xl mx-auto mt-8">
          <i className='bx bx-error-circle text-4xl mb-4'></i>
          <p>{errorMsg}</p>
          <Link href="/competitions" className="btn btn-outline mt-4">ดูรายการแข่งขัน</Link>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 md:p-10 rounded-2xl max-w-3xl mx-auto mt-8 relative overflow-hidden">
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-50 rounded-full filter blur-3xl opacity-60 pointer-events-none"></div>
      
      <form onSubmit={handleSubmit} className="relative z-10">
          <div className="mb-8 border-b border-slate-100 pb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center text-slate-800"><i className='bx bx-trophy mr-2 text-primary'></i> เลือกรายการแข่งขัน</h2>
              <select 
                  className="form-control" 
                  value={selectedCompId}
                  onChange={(e) => handleSelectComp(e.target.value)}
                  required
              >
                  <option value="">-- เลือกรายการแข่งขัน --</option>
                  {competitions.map(c => (
                    <option key={c.id} value={c.id}>{c.title} ({c.level})</option>
                  ))}
              </select>
              
              {currentComp && (
                  <p className="mt-3 text-sm text-secondary bg-blue-50 px-4 py-2 rounded-lg inline-block font-medium">
                      <i className='bx bx-info-circle mr-1'></i> 
                      รูปแบบ: {parseInt(currentComp.teamMax) === 1 ? 'ประเภทเดี่ยว' : 'ประเภททีม'} | ระดับ: {currentComp.level}
                  </p>
              )}
          </div>
          
          <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center text-slate-800"><i className='bx bx-file mr-2 text-secondary'></i> ข้อมูลผลงาน</h2>
              
              <div className="space-y-5">
                  <div>
                      <label className="form-label">รหัสการสมัคร (Registration Code) <span className="text-red-500">*</span></label>
                      <input type="text" className="form-control uppercase" required placeholder="เช่น REG001" value={regCode} onChange={e => setRegCode(e.target.value.toUpperCase())} />
                      <p className="text-xs text-slate-500 mt-1">นำรหัสจากหน้าที่ได้หลังจากสมัครแข่งขันมาใส่ หากจำไม่ได้ให้ติดต่อครูผู้จัด</p>
                  </div>
                  
                  <div>
                      <label className="form-label">ชื่อผลงาน / โครงงาน <span className="text-red-500">*</span></label>
                      <input type="text" className="form-control" required placeholder="ระบุชื่อผลงานของคุณ" value={workTitle} onChange={e => setWorkTitle(e.target.value)} />
                  </div>
                  
                  <div>
                      <label className="form-label">คำอธิบายผลงาน (ย่อ) <span className="text-slate-400">(ไม่บังคับ)</span></label>
                      <textarea className="form-control" rows={3} placeholder="อธิบายแนวคิดหรือจุดเด่นของผลงานสั้นๆ" value={workDesc} onChange={e => setWorkDesc(e.target.value)}></textarea>
                  </div>
                  
                  <div>
                      <label className="form-label">อัปโหลดไฟล์ผลงาน <span className="text-red-500">*</span></label>
                      <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center bg-slate-50 hover:bg-slate-100 transition-colors relative">
                          <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required onChange={handleFileChange} />
                          <i className='bx bx-cloud-upload text-4xl text-primary mb-2'></i>
                          <p className="text-sm font-medium text-slate-700">{file ? file.name : "คลิกหรือลากไฟล์มาวางที่นี่"}</p>
                          <p className="text-xs text-slate-500 mt-1">รองรับไฟล์ PDF, DOCX, PPTX, MP4, ZIP ขนาดไม่เกิน 50MB</p>
                      </div>
                  </div>
                  
                  <div>
                      <label className="form-label">ลิงก์ผลงานเพิ่มเติม <span className="text-slate-400">(ไม่บังคับ)</span></label>
                      <input type="url" className="form-control" placeholder="เช่น YouTube, Google Drive (ต้องเปิดแชร์สาธารณะ)" value={workLink} onChange={e => setWorkLink(e.target.value)} />
                      <p className="text-xs text-slate-500 mt-1">ในกรณีที่ไฟล์ใหญ่เกินไป ให้สร้างโฟลเดอร์ใน Google Drive อัปโหลดไฟล์ แล้วนำลิงก์มาแปะที่นี่แทน</p>
                  </div>
              </div>
          </div>
          
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-slate-500"><i className='bx bx-info-circle text-primary mr-1'></i> ตรวจสอบไฟล์ให้ถูกต้องก่อนกดยืนยัน</p>
              <button type="submit" id="btn-submit" className="btn btn-secondary w-full sm:w-auto px-8 py-3 text-lg shadow-secondary/30">
                  <i className='bx bx-upload mr-2'></i> ส่งผลงาน
              </button>
          </div>
      </form>
    </div>
  );
}

export default function Submit() {
  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 text-center">
          <span className="inline-block py-1 px-4 rounded-full bg-accent text-primary text-sm font-medium mb-4 shadow-sm">Submit Work</span>
          <h1 className="text-4xl sm:text-5xl font-heading font-bold mb-4 text-slate-800">ส่งผลงานออนไลน์</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">อัปโหลดไฟล์ผลงานของคุณตามรายการที่ได้ลงทะเบียนไว้</p>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Suspense fallback={<div className="text-center py-10">กำลังโหลด...</div>}>
          <SubmitFormContent />
        </Suspense>
      </section>
    </>
  );
}
