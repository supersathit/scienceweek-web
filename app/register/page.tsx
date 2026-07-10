"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Swal from 'sweetalert2';
import Link from 'next/link';

function RegisterFormContent() {
  const searchParams = useSearchParams();
  const defaultCompId = searchParams.get('id') || '';

  const [competitions, setCompetitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [selectedCompId, setSelectedCompId] = useState(defaultCompId);
  const [currentComp, setCurrentComp] = useState<any>(null);

  const [teamName, setTeamName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    async function loadComps() {
      try {
        const res = await fetch('/api/competitions').then(r => r.json());
        if (res.success && res.data) {
          const available = res.data.filter((c: any) => c.registerOpen === true || String(c.registerOpen).toUpperCase() === 'TRUE');
          setCompetitions(available);
          
          if (available.length === 0) {
            setErrorMsg('ขณะนี้ไม่มีรายการแข่งขันที่เปิดรับสมัคร');
          } else if (defaultCompId) {
            const exists = available.find((c: any) => c.id === defaultCompId);
            if (exists) {
              handleSelectComp(defaultCompId, available);
            }
          }
        } else {
          setErrorMsg('ไม่สามารถโหลดข้อมูลการแข่งขันได้');
        }
      } catch (err) {
        setErrorMsg('เกิดข้อผิดพลาดในการเชื่อมต่อ');
      } finally {
        setLoading(false);
      }
    }
    loadComps();
  }, [defaultCompId]);

  const handleSelectComp = (compId: string, availableList = competitions) => {
    setSelectedCompId(compId);
    if (!compId) {
      setCurrentComp(null);
      setMembers([]);
      setTeamName('');
      return;
    }

    const comp = availableList.find((c: any) => c.id === compId);
    if (comp) {
      setCurrentComp(comp);
      const min = parseInt(comp.teamMin) || 1;
      
      const newMembers = [];
      for(let i=0; i<min; i++) {
        newMembers.push({ code: '', name: '', class: '', room: '' });
      }
      setMembers(newMembers);
      
      if (parseInt(comp.teamMax) === 1) {
        setTeamName('');
      }
    }
  };

  const updateMember = (index: number, field: string, value: string) => {
    const newMembers = [...members];
    newMembers[index][field] = value;
    setMembers(newMembers);
  };

  const addMember = () => {
    if (!currentComp) return;
    const max = parseInt(currentComp.teamMax) || 1;
    if (members.length >= max) {
      Swal.fire('แจ้งเตือน', `รายการนี้รับสมาชิกได้สูงสุด ${max} คน`, 'warning');
      return;
    }
    setMembers([...members, { code: '', name: '', class: '', room: '' }]);
  };

  const removeMember = (index: number) => {
    if (!currentComp) return;
    const min = parseInt(currentComp.teamMin) || 1;
    if (members.length <= min) {
      Swal.fire('แจ้งเตือน', `รายการนี้ต้องมีสมาชิกอย่างน้อย ${min} คน`, 'warning');
      return;
    }
    const newMembers = [...members];
    newMembers.splice(index, 1);
    setMembers(newMembers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentComp) return;

    if (members.length === 0) {
      Swal.fire('ข้อผิดพลาด', 'กรุณาระบุข้อมูลผู้สมัครอย่างน้อย 1 คน', 'error');
      return;
    }

    const isSingle = parseInt(currentComp.teamMax) === 1;
    const finalTeamName = isSingle ? members[0].name : teamName;
    const leader = members[0];

    const formattedMembers = members.map(m => ({
      student_code: m.code,
      full_name: m.name,
      class: m.class,
      room: m.room
    }));

    const payload = {
      competition_id: currentComp.id,
      competition_title: currentComp.title,
      team_name: finalTeamName,
      leader_student_code: leader.code,
      leader_full_name: leader.name,
      leader_class: leader.class,
      leader_room: leader.room,
      leader_number: "",
      contact_phone: contactPhone,
      members_json: JSON.stringify(formattedMembers)
    };

    const btn = document.getElementById('btn-submit') as HTMLButtonElement;
    const originalText = btn.innerHTML;
    btn.innerHTML = "<i class='bx bx-loader-alt bx-spin mr-2'></i> กำลังส่งข้อมูล...";
    btn.disabled = true;

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(r => r.json());

      if (res.success) {
        Swal.fire('สำเร็จ!', 'ลงทะเบียนเข้าร่วมการแข่งขันเรียบร้อยแล้ว', 'success').then(() => {
          Swal.fire({
            title: 'รหัสอ้างอิงของคุณ',
            html: `<p class="mb-4">ใช้รหัสนี้สำหรับตรวจสอบสถานะและส่งผลงานออนไลน์</p><div class="text-3xl font-bold text-primary tracking-widest bg-slate-50 py-4 rounded-xl border border-dashed border-slate-300">${res.registration_code}</div>`,
            icon: 'info'
          }).then(() => {
            window.location.href = `/check?code=${res.registration_code}`;
          });
        });
      } else {
        Swal.fire('ข้อผิดพลาด', res.message || 'ไม่สามารถลงทะเบียนได้', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง', 'error');
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 glass-panel rounded-2xl max-w-4xl mx-auto mt-8">
          <i className='bx bx-loader-alt bx-spin text-4xl mb-4 text-primary'></i>
          <p>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-red-500 glass-panel rounded-2xl max-w-4xl mx-auto mt-8">
          <i className='bx bx-error-circle text-4xl mb-4'></i>
          <p>{errorMsg}</p>
          <Link href="/competitions" className="btn btn-outline mt-4">ดูรายการแข่งขัน</Link>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 md:p-10 rounded-2xl max-w-4xl mx-auto mt-8 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent rounded-full filter blur-3xl opacity-50 pointer-events-none"></div>
      
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
                      รูปแบบ: {parseInt(currentComp.teamMax) === 1 ? 'ประเภทเดี่ยว' : 'ประเภททีม'} | ระดับ: {currentComp.level} | สมาชิก: {parseInt(currentComp.teamMax) === 1 ? '1' : `${currentComp.teamMin} - ${currentComp.teamMax}`} คน
                  </p>
              )}
          </div>
          
          {currentComp && (
            <>
              {parseInt(currentComp.teamMax) > 1 && (
                <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4 flex items-center text-slate-800"><i className='bx bx-group mr-2 text-secondary'></i> ข้อมูลทีม</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="form-label">ชื่อทีม <span className="text-red-500">*</span></label>
                            <input type="text" className="form-control" required placeholder="ตั้งชื่อทีมของคุณ" value={teamName} onChange={e => setTeamName(e.target.value)} />
                        </div>
                        <div>
                            <label className="form-label">เบอร์โทรศัพท์ติดต่อ <span className="text-red-500">*</span></label>
                            <input type="tel" className="form-control" required placeholder="08X-XXX-XXXX" maxLength={10} value={contactPhone} onChange={e => setContactPhone(e.target.value)} />
                        </div>
                    </div>
                </div>
              )}
              {parseInt(currentComp.teamMax) === 1 && (
                <div className="mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="form-label">เบอร์โทรศัพท์ติดต่อ <span className="text-red-500">*</span></label>
                        <input type="tel" className="form-control" required placeholder="08X-XXX-XXXX" maxLength={10} value={contactPhone} onChange={e => setContactPhone(e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold flex items-center text-slate-800"><i className='bx bx-user-circle mr-2 text-primary'></i> ข้อมูลสมาชิก</h2>
                      <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-500 tracking-wider">
                          {members.length} / {currentComp.teamMax} คน
                      </span>
                  </div>
                  
                  <div className="space-y-4">
                      {members.map((m, index) => (
                        <div key={index} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm relative overflow-hidden">
                            <div className="absolute -top-3 -right-3 w-12 h-12 bg-slate-50 text-slate-300 rounded-full flex items-end justify-start p-3 text-2xl font-bold italic">{index + 1}</div>
                            {index >= (parseInt(currentComp.teamMin) || 1) && (
                              <button type="button" className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 hover:bg-red-50 w-8 h-8 rounded-full flex items-center justify-center z-10" onClick={() => removeMember(index)} title="ลบสมาชิก"><i className='bx bx-trash'></i></button>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-2">
                                <div className="lg:col-span-1">
                                    <label className="form-label text-xs">รหัสนักเรียน <span className="text-red-500">*</span></label>
                                    <input type="text" className="form-control text-sm py-2" required placeholder="เช่น 12345" maxLength={5} minLength={5} value={m.code} onChange={e => updateMember(index, 'code', e.target.value)} />
                                </div>
                                <div className="lg:col-span-2">
                                    <label className="form-label text-xs">ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
                                    <input type="text" className="form-control text-sm py-2" required placeholder="ด.ช./ด.ญ./นาย/นางสาว" value={m.name} onChange={e => updateMember(index, 'name', e.target.value)} />
                                </div>
                                <div className="flex gap-2 lg:col-span-2">
                                    <div className="w-1/2">
                                        <label className="form-label text-xs">ชั้น <span className="text-red-500">*</span></label>
                                        <input type="text" className="form-control text-sm py-2" required placeholder="ม.1" value={m.class} onChange={e => updateMember(index, 'class', e.target.value)} />
                                    </div>
                                    <div className="w-1/2">
                                        <label className="form-label text-xs">ห้อง <span className="text-red-500">*</span></label>
                                        <input type="text" className="form-control text-sm py-2" required placeholder="1" value={m.room} onChange={e => updateMember(index, 'room', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </div>
                      ))}
                  </div>

                  {members.length < (parseInt(currentComp.teamMax) || 1) && (
                    <button type="button" onClick={addMember} className="mt-4 w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-primary hover:text-primary hover:bg-pink-50 transition-all font-medium flex items-center justify-center">
                        <i className='bx bx-plus-circle text-xl mr-2'></i> เพิ่มสมาชิกคนที่ {members.length + 1}
                    </button>
                  )}
              </div>
              
              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-slate-500"><i className='bx bx-check-shield text-green-500 mr-1'></i> ข้อมูลจะถูกเก็บเป็นความลับเพื่อใช้ในการจัดการแข่งขันเท่านั้น</p>
                  <button type="submit" id="btn-submit" className="btn btn-primary w-full sm:w-auto px-8 py-3 text-lg shadow-primary/30">
                      <i className='bx bx-send mr-2'></i> ยืนยันการสมัคร
                  </button>
              </div>
            </>
          )}
      </form>
    </div>
  );
}

export default function Register() {
  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 text-center">
          <span className="inline-block py-1 px-4 rounded-full bg-accent text-primary text-sm font-medium mb-4 shadow-sm">Registration</span>
          <h1 className="text-4xl sm:text-5xl font-heading font-bold mb-4 text-slate-800">สมัครเข้าแข่งขัน</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">กรอกข้อมูลให้ครบถ้วนเพื่อลงทะเบียนเข้าร่วมกิจกรรมสัปดาห์วิทยาศาสตร์</p>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Suspense fallback={<div className="text-center py-10">กำลังโหลด...</div>}>
          <RegisterFormContent />
        </Suspense>
      </section>
    </>
  );
}
