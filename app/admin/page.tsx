"use client";

import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import buddhistEra from 'dayjs/plugin/buddhistEra';

dayjs.extend(buddhistEra);
dayjs.locale('th');

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState('admin');
  const [password, setPassword] = useState('');
  
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('competitions');

  // Data states
  const [competitions, setCompetitions] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  
  // Filters
  const [regCompFilter, setRegCompFilter] = useState('');
  const [subCompFilter, setSubCompFilter] = useState('');

  // Add/Edit Competition Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditComp, setIsEditComp] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newComp, setNewComp] = useState({
    id: '', title: '', category: 'วิชาการ', level: '',
    type: 'team', teamMin: 1, teamMax: 3,
    description: '', rules: '', judgingCriteria: '', location: '',
    competitionDate: ''
  });

  // Add/Edit Announcements
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [isEditAnn, setIsEditAnn] = useState(false);
  const [newAnn, setNewAnn] = useState<any>({ id: null, title: '', content: '', date: '', published: true });

  // Add/Edit Schedule
  const [showSchModal, setShowSchModal] = useState(false);
  const [isEditSch, setIsEditSch] = useState(false);
  const [newSch, setNewSch] = useState<any>({ id: null, time: '', event: '', details: '', location: '', date: '' });

  // Registration/Submission Edit
  const [showRegModal, setShowRegModal] = useState(false);
  const [newReg, setNewReg] = useState<any>({ registrationCode: '', status: 'pending' });

  const [showSubModal, setShowSubModal] = useState(false);
  const [newSub, setNewSub] = useState<any>({ submissionId: '', status: 'submitted' });

  // View Details
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewData, setViewData] = useState<any>(null);
  const [viewType, setViewType] = useState('');

  useEffect(() => {
    const savedPass = sessionStorage.getItem('adminPass');
    const savedRole = sessionStorage.getItem('userRole');
    if (savedPass) {
      setPassword(savedPass);
      setRole(savedRole || 'admin');
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      if (role === 'teacher') setActiveTab('competitions');
      loadCompetitions();
      if (role === 'admin') {
        loadAnnouncements();
        loadSchedule();
      }
    }
  }, [isLoggedIn, role]);

  useEffect(() => {
    if (isLoggedIn && regCompFilter) {
      loadRegistrations();
    }
  }, [regCompFilter]);

  useEffect(() => {
    if (isLoggedIn && subCompFilter) {
      loadSubmissions();
    }
  }, [subCompFilter]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput })
      }).then(r => r.json());

      if (res.success) {
        sessionStorage.setItem('adminPass', passwordInput);
        sessionStorage.setItem('adminUser', usernameInput);
        sessionStorage.setItem('userRole', res.role || 'admin');
        setPassword(passwordInput);
        setRole(res.role || 'admin');
        setIsLoggedIn(true);
        Swal.fire({ title: 'สำเร็จ', text: 'เข้าสู่ระบบสำเร็จ', icon: 'success', timer: 1500, showConfirmButton: false });
      } else {
        Swal.fire('ข้อผิดพลาด', res.message || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง", 'error');
      }
    } catch (err) {
      Swal.fire('ข้อผิดพลาด', "เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย", 'error');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'ยืนยันการออกจากระบบ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'ออกจากระบบ',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        sessionStorage.clear();
        setIsLoggedIn(false);
        setPassword('');
        setRole('admin');
      }
    });
  };

  const loadCompetitions = async () => {
    const res = await fetch('/api/competitions').then(r => r.json());
    if (res.success) setCompetitions(res.data);
  };

  const loadAnnouncements = async () => {
    const res = await fetch('/api/announcements').then(r => r.json());
    if (res.success) setAnnouncements(res.data);
  };

  const loadSchedule = async () => {
    const res = await fetch('/api/schedule').then(r => r.json());
    if (res.success) setSchedule(res.data);
  };

  const loadRegistrations = async () => {
    if (!regCompFilter) return;
    const res = await fetch(`/api/admin/registrations?compId=${regCompFilter}&password=${password}`).then(r => r.json());
    if (res.success) setRegistrations(res.data);
  };

  const loadSubmissions = async () => {
    if (!subCompFilter) return;
    const res = await fetch(`/api/admin/submissions?compId=${subCompFilter}&password=${password}`).then(r => r.json());
    if (res.success) setSubmissions(res.data);
  };

  const toggleCompetitionStatus = async (id: string, type: 'register' | 'submission', currentValue: boolean) => {
    try {
      Swal.fire({ title: 'กำลังปรับปรุงสถานะ...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      const payload = { password, id };
      if (type === 'register') (payload as any).registerOpen = !currentValue;
      if (type === 'submission') (payload as any).submissionOpen = !currentValue;
      
      const res = await fetch('/api/admin/competitions/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(r => r.json());

      if (res.success) {
        Swal.fire('สำเร็จ', 'อัปเดตสถานะเรียบร้อย', 'success');
        loadCompetitions();
      } else {
        Swal.fire('ข้อผิดพลาด', res.message, 'error');
      }
    } catch (e) {
      Swal.fire('ข้อผิดพลาด', 'เชื่อมต่อขัดข้อง', 'error');
    }
  };

  const handleSaveCompetition = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        password,
        ...newComp,
        teamMin: newComp.type === 'single' ? 1 : newComp.teamMin,
        teamMax: newComp.type === 'single' ? 1 : newComp.teamMax
      };
      
      const res = await fetch('/api/admin/competitions', {
        method: isEditComp ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(r => r.json());

      if (res.success) {
        Swal.fire('สำเร็จ', isEditComp ? 'อัปเดตรายการแข่งขันเรียบร้อยแล้ว' : 'เพิ่มรายการแข่งขันเรียบร้อยแล้ว', 'success');
        setShowAddModal(false);
        loadCompetitions();
      } else {
        Swal.fire('ข้อผิดพลาด', res.message, 'error');
      }
    } catch (e) {
      Swal.fire('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteCompetition = async (id: string) => {
    if (!await confirmDelete()) return;
    try {
      const res = await fetch(`/api/admin/competitions?id=${id}&password=${password}`, { method: 'DELETE' }).then(r => r.json());
      if (res.success) { Swal.fire('สำเร็จ', 'ลบข้อมูลสำเร็จ', 'success'); loadCompetitions(); }
      else Swal.fire('ข้อผิดพลาด', res.message, 'error');
    } catch (e) { Swal.fire('ข้อผิดพลาด', 'เชื่อมต่อขัดข้อง', 'error'); }
  };

  const handleSaveAnn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/announcements', {
        method: isEditAnn ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, ...newAnn })
      }).then(r => r.json());
      if (res.success) { Swal.fire('สำเร็จ', 'บันทึกสำเร็จ', 'success'); setShowAnnModal(false); loadAnnouncements(); }
      else Swal.fire('ข้อผิดพลาด', res.message, 'error');
    } catch (e) { Swal.fire('ข้อผิดพลาด', 'เชื่อมต่อขัดข้อง', 'error'); }
    finally { setSaving(false); }
  };

  const deleteAnn = async (id: string) => {
    if (!await confirmDelete()) return;
    const res = await fetch(`/api/admin/announcements?id=${id}&password=${password}`, { method: 'DELETE' }).then(r => r.json());
    if (res.success) { Swal.fire('สำเร็จ', 'ลบข้อมูลสำเร็จ', 'success'); loadAnnouncements(); }
  };

  const handleSaveSch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/schedule', {
        method: isEditSch ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, ...newSch })
      }).then(r => r.json());
      if (res.success) { Swal.fire('สำเร็จ', 'บันทึกสำเร็จ', 'success'); setShowSchModal(false); loadSchedule(); }
      else Swal.fire('ข้อผิดพลาด', res.message, 'error');
    } catch (e) { Swal.fire('ข้อผิดพลาด', 'เชื่อมต่อขัดข้อง', 'error'); }
    finally { setSaving(false); }
  };

  const deleteSch = async (id: string) => {
    if (!await confirmDelete()) return;
    const res = await fetch(`/api/admin/schedule?id=${id}&password=${password}`, { method: 'DELETE' }).then(r => r.json());
    if (res.success) { Swal.fire('สำเร็จ', 'ลบข้อมูลสำเร็จ', 'success'); loadSchedule(); }
  };

  const confirmDelete = async () => {
    const result = await Swal.fire({ title: 'ยืนยันการลบ?', text: "ข้อมูลนี้จะถูกลบและไม่สามารถกู้คืนได้!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6', confirmButtonText: 'ลบเลย', cancelButtonText: 'ยกเลิก' });
    return result.isConfirmed;
  };

  const handleSaveReg = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/registrations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, ...newReg })
      }).then(r => r.json());
      if (res.success) { Swal.fire('สำเร็จ', 'อัปเดตสถานะสำเร็จ', 'success'); setShowRegModal(false); loadRegistrations(); }
      else Swal.fire('ข้อผิดพลาด', res.message, 'error');
    } catch (e) { Swal.fire('ข้อผิดพลาด', 'เชื่อมต่อขัดข้อง', 'error'); }
    finally { setSaving(false); }
  };

  const updateRegistrationStatus = async (registrationCode: string, newStatus: string) => {
    try {
      Swal.fire({ title: 'กำลังปรับปรุงสถานะ...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      const res = await fetch('/api/admin/registrations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, registrationCode, status: newStatus })
      }).then(r => r.json());
      if (res.success) { 
        Swal.fire({ title: 'สำเร็จ', text: 'อัปเดตสถานะสำเร็จ', icon: 'success', timer: 1500, showConfirmButton: false }); 
        loadRegistrations(); 
      }
      else Swal.fire('ข้อผิดพลาด', res.message, 'error');
    } catch (e) { Swal.fire('ข้อผิดพลาด', 'เชื่อมต่อขัดข้อง', 'error'); }
  };

  const deleteReg = async (id: string) => {
    if (!await confirmDelete()) return;
    const res = await fetch(`/api/admin/registrations?id=${id}&password=${password}`, { method: 'DELETE' }).then(r => r.json());
    if (res.success) { Swal.fire('สำเร็จ', 'ลบข้อมูลสำเร็จ', 'success'); loadRegistrations(); }
    else Swal.fire('ข้อผิดพลาด', res.message, 'error');
  };

  const handleSaveSub = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/submissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, ...newSub })
      }).then(r => r.json());
      if (res.success) { Swal.fire('สำเร็จ', 'อัปเดตข้อมูลผลงานสำเร็จ', 'success'); setShowSubModal(false); loadSubmissions(); }
      else Swal.fire('ข้อผิดพลาด', res.message, 'error');
    } catch (e) { Swal.fire('ข้อผิดพลาด', 'เชื่อมต่อขัดข้อง', 'error'); }
    finally { setSaving(false); }
  };

  const updateSubmissionStatus = async (submissionId: string, newStatus: string) => {
    try {
      Swal.fire({ title: 'กำลังปรับปรุงสถานะ...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      const res = await fetch('/api/admin/submissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, submissionId, status: newStatus })
      }).then(r => r.json());
      if (res.success) { 
        Swal.fire({ title: 'สำเร็จ', text: 'อัปเดตสถานะสำเร็จ', icon: 'success', timer: 1500, showConfirmButton: false }); 
        loadSubmissions(); 
      }
      else Swal.fire('ข้อผิดพลาด', res.message, 'error');
    } catch (e) { Swal.fire('ข้อผิดพลาด', 'เชื่อมต่อขัดข้อง', 'error'); }
  };


  const deleteSub = async (id: string) => {
    if (!await confirmDelete()) return;
    const res = await fetch(`/api/admin/submissions?id=${id}&password=${password}`, { method: 'DELETE' }).then(r => r.json());
    if (res.success) { Swal.fire('สำเร็จ', 'ลบข้อมูลสำเร็จ', 'success'); loadSubmissions(); }
    else Swal.fire('ข้อผิดพลาด', res.message, 'error');
  };

  const openView = (data: any, type: string) => {
    setViewData(data);
    setViewType(type);
    setShowViewModal(true);
  };

  const formatThaiDateTime = (dateStr: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' น.';
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="glass-panel p-8 rounded-2xl w-full max-w-md shadow-xl relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent rounded-full filter blur-3xl opacity-60"></div>
            <div className="text-center mb-8 relative z-10">
                <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center text-3xl mx-auto mb-4"><i className='bx bx-lock-alt'></i></div>
                <h1 className="text-2xl font-bold font-heading text-slate-800">Admin Login</h1>
                <p className="text-slate-500 mt-2">เข้าสู่ระบบจัดการสัปดาห์วิทยาศาสตร์</p>
            </div>
            <form onSubmit={handleLogin} className="relative z-10 space-y-5">
                <div>
                    <label className="block text-sm font-semibold tracking-wide text-slate-700 mb-2">ชื่อผู้ใช้งาน</label>
                    <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white" required value={usernameInput} onChange={e => setUsernameInput(e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm font-semibold tracking-wide text-slate-700 mb-2">รหัสผ่าน</label>
                    <input type="password" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white" required value={passwordInput} onChange={e => setPasswordInput(e.target.value)} />
                </div>
                <button type="submit" className="w-full inline-flex items-center justify-center px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg transition-all" disabled={loginLoading}>
                    {loginLoading ? <i className='bx bx-loader-alt bx-spin mr-2'></i> : null} {loginLoading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
                </button>
            </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
                <div className="flex items-center">
                    <span className="text-xl font-heading font-bold text-slate-800 flex items-center gap-2">
                        <i className='bx bx-atom text-primary text-2xl'></i>
                        ScienceWeek <span className="text-primary hidden sm:inline">Admin</span>
                    </span>
                    <span className="ml-4 px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md font-medium uppercase">{role}</span>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={handleLogout} className="text-slate-500 hover:text-red-500 transition-colors text-sm font-medium flex items-center gap-1">
                        <i className='bx bx-log-out text-lg'></i> <span className="hidden sm:inline">ออกจากระบบ</span>
                    </button>
                </div>
            </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Menu</h3>
                </div>
                <ul className="flex flex-col py-2">
                    <li>
                        <button onClick={() => setActiveTab('competitions')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'competitions' ? 'bg-pink-50 text-primary border-r-2 border-primary' : 'text-slate-600 hover:bg-slate-50 hover:text-primary'}`}>
                            <i className='bx bx-trophy text-lg'></i> จัดการการแข่งขัน
                        </button>
                    </li>
                    {role === 'admin' && (
                        <li>
                            <button onClick={() => setActiveTab('announcements')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'announcements' ? 'bg-pink-50 text-primary border-r-2 border-primary' : 'text-slate-600 hover:bg-slate-50 hover:text-primary'}`}>
                                <i className='bx bx-news text-lg'></i> จัดการข่าวประกาศ
                            </button>
                        </li>
                    )}
                    <li>
                        <button onClick={() => setActiveTab('registrations')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'registrations' ? 'bg-pink-50 text-primary border-r-2 border-primary' : 'text-slate-600 hover:bg-slate-50 hover:text-primary'}`}>
                            <i className='bx bx-group text-lg'></i> ดูรายชื่อผู้สมัคร
                        </button>
                    </li>
                    <li>
                        <button onClick={() => setActiveTab('submissions')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'submissions' ? 'bg-pink-50 text-primary border-r-2 border-primary' : 'text-slate-600 hover:bg-slate-50 hover:text-primary'}`}>
                            <i className='bx bx-upload text-lg'></i> ดูผลงานที่ส่ง
                        </button>
                    </li>
                    {role === 'admin' && (
                        <li>
                            <button onClick={() => setActiveTab('schedule')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'schedule' ? 'bg-pink-50 text-primary border-r-2 border-primary' : 'text-slate-600 hover:bg-slate-50 hover:text-primary'}`}>
                                <i className='bx bx-calendar-event text-lg'></i> กำหนดการกิจกรรม
                            </button>
                        </li>
                    )}
                </ul>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-grow">
          {activeTab === 'competitions' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">จัดการรายการแข่งขัน</h2>
                        <p className="text-sm text-slate-500">เปิด-ปิดรับสมัคร / เปิด-ปิดส่งผลงาน</p>
                    </div>
                    <button onClick={() => {
                        let nextId = "C01";
                        if (competitions && competitions.length > 0) {
                            let max = 0;
                            competitions.forEach(c => {
                                const match = c.id.match(/\d+/);
                                if (match) {
                                    const num = parseInt(match[0]);
                                    if (num > max) max = num;
                                }
                            });
                            nextId = "C" + String(max + 1).padStart(2, '0');
                        }
                        setNewComp({
                          id: nextId, title: '', category: 'วิชาการ', level: '',
                          type: 'team', teamMin: 1, teamMax: 3,
                          description: '', rules: '', judgingCriteria: '', location: '',
                          competitionDate: ''
                        });
                        setShowAddModal(true);
                    }} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-md hover:bg-primary/90 transition-colors whitespace-nowrap">
                        + เพิ่มรายการใหม่
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                                <th className="p-4 font-semibold">รายการแข่งขัน</th>
                                <th className="p-4 font-semibold text-center w-24">รับสมัคร</th>
                                <th className="p-4 font-semibold text-center w-24">ส่งผลงาน</th>
                                <th className="p-4 font-semibold text-center w-32">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {competitions.length === 0 ? (
                                <tr><td colSpan={4} className="p-8 text-center text-slate-500">กำลังโหลด หรือไม่มีข้อมูล</td></tr>
                            ) : competitions.map(c => (
                                <tr key={c.id} className="hover:bg-slate-50/50">
                                    <td className="p-4">
                                        <div className="font-semibold text-slate-800">{c.title}</div>
                                        <div className="text-slate-500 text-xs mt-1">{c.level}</div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button 
                                          onClick={() => toggleCompetitionStatus(c.id, 'register', c.registerOpen)}
                                          className={`px-3 py-1 rounded-full text-xs font-bold ${c.registerOpen ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                                          {c.registerOpen ? 'เปิด' : 'ปิด'}
                                        </button>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button 
                                          onClick={() => toggleCompetitionStatus(c.id, 'submission', c.submissionOpen)}
                                          className={`px-3 py-1 rounded-full text-xs font-bold ${c.submissionOpen ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'}`}>
                                          {c.submissionOpen ? 'เปิด' : 'ปิด'}
                                        </button>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => openView(c, 'competition')} className="text-blue-500 hover:text-blue-700 bg-blue-50 w-8 h-8 rounded-full flex items-center justify-center" title="ดูรายละเอียด"><i className='bx bx-show'></i></button>
                                            <button onClick={() => { setIsEditComp(true); setNewComp(c); setShowAddModal(true); }} className="text-orange-500 hover:text-orange-700 bg-orange-50 w-8 h-8 rounded-full flex items-center justify-center" title="แก้ไข"><i className='bx bx-edit'></i></button>
                                            <button onClick={() => deleteCompetition(c.id)} className="text-red-500 hover:text-red-700 bg-red-50 w-8 h-8 rounded-full flex items-center justify-center" title="ลบ"><i className='bx bx-trash'></i></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
          )}

          {activeTab === 'registrations' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">รายชื่อผู้สมัคร</h2>
                    <div className="flex gap-2">
                        <select className="flex-1 px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary text-sm bg-slate-50" value={regCompFilter} onChange={(e) => setRegCompFilter(e.target.value)}>
                            <option value="">-- เลือกรายการแข่งขัน --</option>
                            {competitions.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                        <button onClick={loadRegistrations} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"><i className='bx bx-refresh'></i></button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                                <th className="p-4 font-semibold w-24">รหัส</th>
                                <th className="p-4 font-semibold">ชื่อทีม</th>
                                <th className="p-4 font-semibold">หัวหน้าทีม</th>
                                <th className="p-4 font-semibold w-48">สมาชิก</th>
                                <th className="p-4 font-semibold">วันที่สมัคร</th>
                                <th className="p-4 font-semibold text-center w-32">สถานะ</th>
                                <th className="p-4 font-semibold text-center w-32">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {!regCompFilter ? (
                                <tr><td colSpan={7} className="p-8 text-center text-slate-500">กรุณาเลือกรายการแข่งขัน</td></tr>
                            ) : registrations.length === 0 ? (
                                <tr><td colSpan={7} className="p-8 text-center text-slate-500">ไม่มีข้อมูลผู้สมัคร</td></tr>
                            ) : registrations.map(reg => (
                                <tr key={reg.registrationCode} className="hover:bg-slate-50/50">
                                    <td className="p-4 font-semibold text-slate-700">{reg.registrationCode}</td>
                                    <td className="p-4">{reg.teamName || '-'}</td>
                                    <td className="p-4">
                                        {reg.leaderFullName}<br/>
                                        <span className="text-slate-400 text-xs"><i className='bx bx-phone'></i> {reg.contactPhone}</span>
                                    </td>
                                    <td className="p-4 text-xs text-slate-600">
                                        {reg.membersJson ? (() => {
                                            try {
                                                const members = typeof reg.membersJson === 'string' ? JSON.parse(reg.membersJson) : reg.membersJson;
                                                if (!Array.isArray(members) || members.length === 0) return '-';
                                                return <ul className="list-disc pl-3 space-y-1">{members.map((m: any, i: number) => <li key={i}>{m.full_name}</li>)}</ul>;
                                            } catch(e) { return '-'; }
                                        })() : '-'}
                                    </td>
                                    <td className="p-4 text-slate-500 text-xs">{formatThaiDateTime(reg.createdAt)}</td>
                                    <td className="p-4 text-center">
                                        <select 
                                            value={reg.status}
                                            onChange={(e) => updateRegistrationStatus(reg.registrationCode, e.target.value)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer ${reg.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : reg.status === 'approved' ? 'bg-green-50 text-green-700 border border-green-200' : reg.status === 'submitted' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-red-50 text-red-700 border border-red-200'}`}
                                        >
                                            <option value="pending" className="text-slate-800 font-medium">รอตรวจสอบ</option>
                                            <option value="approved" className="text-slate-800 font-medium">อนุมัติแล้ว</option>
                                            <option value="submitted" className="text-slate-800 font-medium">ส่งงานแล้ว</option>
                                            <option value="rejected" className="text-slate-800 font-medium">ปฏิเสธ</option>
                                        </select>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => openView(reg, 'registration')} className="text-blue-500 hover:text-blue-700 bg-blue-50 w-8 h-8 rounded-full flex items-center justify-center" title="ดูรายละเอียด"><i className='bx bx-show'></i></button>
                                            <button onClick={() => { setNewReg(reg); setShowRegModal(true); }} className="text-orange-500 hover:text-orange-700 bg-orange-50 w-8 h-8 rounded-full flex items-center justify-center" title="แก้ไขข้อมูลผู้สมัคร"><i className='bx bx-edit'></i></button>
                                            <button onClick={() => deleteReg(reg.registrationCode)} className="text-red-500 hover:text-red-700 bg-red-50 w-8 h-8 rounded-full flex items-center justify-center" title="ลบ"><i className='bx bx-trash'></i></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
          )}

          {activeTab === 'submissions' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">ผลงานที่ส่ง</h2>
                    <div className="flex gap-2">
                        <select className="flex-1 px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary text-sm bg-slate-50" value={subCompFilter} onChange={(e) => setSubCompFilter(e.target.value)}>
                            <option value="">-- เลือกรายการแข่งขัน --</option>
                            {competitions.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                        <button onClick={loadSubmissions} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"><i className='bx bx-refresh'></i></button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                                <th className="p-4 font-semibold w-24">รหัสอ้างอิง</th>
                                <th className="p-4 font-semibold">ชื่อผลงาน</th>
                                <th className="p-4 font-semibold">ไฟล์แนบ</th>
                                <th className="p-4 font-semibold">เวลาที่ส่ง</th>
                                <th className="p-4 font-semibold text-center w-32">สถานะ</th>
                                <th className="p-4 font-semibold text-center w-32">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {!subCompFilter ? (
                                <tr><td colSpan={6} className="p-8 text-center text-slate-500">กรุณาเลือกรายการแข่งขัน</td></tr>
                            ) : submissions.length === 0 ? (
                                <tr><td colSpan={6} className="p-8 text-center text-slate-500">ไม่มีข้อมูลผลงาน</td></tr>
                            ) : submissions.map(sub => (
                                <tr key={sub.submissionId} className="hover:bg-slate-50/50">
                                    <td className="p-4 font-semibold text-slate-700">{sub.registrationCode}</td>
                                    <td className="p-4">{sub.workTitle}</td>
                                    <td className="p-4">
                                        {sub.fileUrl ? <a href={sub.fileUrl} target="_blank" className="text-blue-500 underline text-xs">ดาวน์โหลดไฟล์</a> : '-'}
                                        {sub.externalLink && <><br/><a href={sub.externalLink} target="_blank" className="text-secondary underline text-xs">ลิงก์ภายนอก</a></>}
                                    </td>
                                    <td className="p-4 text-slate-500 text-xs">{formatThaiDateTime(sub.submittedAt)}</td>
                                    <td className="p-4 text-center">
                                        <select 
                                            value={sub.status}
                                            onChange={(e) => updateSubmissionStatus(sub.submissionId, e.target.value)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer ${sub.status === 'submitted' ? 'bg-blue-50 text-blue-700 border border-blue-200' : sub.status === 'reviewed' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}
                                        >
                                            <option value="submitted" className="text-slate-800 font-medium">ส่งแล้ว</option>
                                            <option value="reviewed" className="text-slate-800 font-medium">ตรวจแล้ว</option>
                                            <option value="rejected" className="text-slate-800 font-medium">ไม่ผ่านเกณฑ์</option>
                                        </select>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => openView(sub, 'submission')} className="text-blue-500 hover:text-blue-700 bg-blue-50 w-8 h-8 rounded-full flex items-center justify-center" title="ดูรายละเอียด"><i className='bx bx-show'></i></button>
                                            <button onClick={() => deleteSub(sub.submissionId)} className="text-red-500 hover:text-red-700 bg-red-50 w-8 h-8 rounded-full flex items-center justify-center" title="ลบ"><i className='bx bx-trash'></i></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
          )}

          {activeTab === 'announcements' && role === 'admin' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">ข่าวประกาศ</h2>
                    <button onClick={() => { setIsEditAnn(false); setNewAnn({ id: null, title: '', content: '', date: '', published: true }); setShowAnnModal(true); }} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-md hover:bg-primary/90 transition-colors whitespace-nowrap">
                        + เพิ่มประกาศใหม่
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                                <th className="p-4 font-semibold w-40">วันที่</th>
                                <th className="p-4 font-semibold">หัวข้อประกาศ</th>
                                <th className="p-4 font-semibold text-center w-32">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {announcements.length === 0 ? (
                                <tr><td colSpan={3} className="p-8 text-center text-slate-500">ไม่มีข้อมูล</td></tr>
                            ) : announcements.map(ann => (
                                <tr key={ann.id} className="hover:bg-slate-50/50">
                                    <td className="p-4 text-slate-500 text-xs whitespace-nowrap">{formatThaiDateTime(ann.date || ann.createdAt)}</td>
                                    <td className="p-4 text-slate-800">{ann.title}</td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => openView(ann, 'announcement')} className="text-blue-500 hover:text-blue-700 bg-blue-50 w-8 h-8 rounded-full flex items-center justify-center" title="ดูรายละเอียด"><i className='bx bx-show'></i></button>
                                            <button onClick={() => { setIsEditAnn(true); setNewAnn(ann); setShowAnnModal(true); }} className="text-orange-500 hover:text-orange-700 bg-orange-50 w-8 h-8 rounded-full flex items-center justify-center" title="แก้ไข"><i className='bx bx-edit'></i></button>
                                            <button onClick={() => deleteAnn(ann.id)} className="text-red-500 hover:text-red-700 bg-red-50 w-8 h-8 rounded-full flex items-center justify-center" title="ลบ"><i className='bx bx-trash'></i></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
          )}

          {activeTab === 'schedule' && role === 'admin' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">กำหนดการ</h2>
                    <button onClick={() => { setIsEditSch(false); setNewSch({ id: null, time: '', event: '', details: '', location: '', date: '' }); setShowSchModal(true); }} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-md hover:bg-primary/90 transition-colors whitespace-nowrap">
                        + เพิ่มกำหนดการ
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                                <th className="p-4 font-semibold whitespace-nowrap">วันที่ / เวลา</th>
                                <th className="p-4 font-semibold">กิจกรรม</th>
                                <th className="p-4 font-semibold">สถานที่</th>
                                <th className="p-4 font-semibold text-center w-32">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {schedule.length === 0 ? (
                                <tr><td colSpan={4} className="p-8 text-center text-slate-500">ไม่มีข้อมูล</td></tr>
                            ) : schedule.map(sch => (
                                <tr key={sch.id} className="hover:bg-slate-50/50">
                                    <td className="p-4 text-slate-500 text-xs whitespace-nowrap">
                                        <span className="font-semibold text-primary">{formatThaiDateTime(sch.date).split('เวลา')[0]}</span><br/>
                                        {sch.time}
                                    </td>
                                    <td className="p-4 text-slate-800 font-semibold">{sch.event}</td>
                                    <td className="p-4 text-slate-600">{sch.location}</td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => openView(sch, 'schedule')} className="text-blue-500 hover:text-blue-700 bg-blue-50 w-8 h-8 rounded-full flex items-center justify-center" title="ดูรายละเอียด"><i className='bx bx-show'></i></button>
                                            <button onClick={() => { setIsEditSch(true); setNewSch(sch); setShowSchModal(true); }} className="text-orange-500 hover:text-orange-700 bg-orange-50 w-8 h-8 rounded-full flex items-center justify-center" title="แก้ไข"><i className='bx bx-edit'></i></button>
                                            <button onClick={() => deleteSch(sch.id)} className="text-red-500 hover:text-red-700 bg-red-50 w-8 h-8 rounded-full flex items-center justify-center" title="ลบ"><i className='bx bx-trash'></i></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
          )}

        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-2xl">
              <h3 className="text-xl font-bold text-slate-800 flex items-center"><i className='bx bx-plus-circle text-primary mr-2'></i> {isEditComp ? 'แก้ไขรายการแข่งขัน' : 'เพิ่มรายการแข่งขันใหม่'}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-red-500 bg-slate-50 w-8 h-8 rounded-full flex items-center justify-center"><i className='bx bx-x text-2xl'></i></button>
            </div>
            
            <form onSubmit={handleSaveCompetition} className="p-6 space-y-5">
              {/* Form fields same as before... */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">รหัสการแข่งขัน <span className="text-red-500">*</span></label>
                  <input type="text" required placeholder="เช่น C05" className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-500 text-sm cursor-not-allowed" 
                    value={newComp.id} readOnly />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">หมวดหมู่ <span className="text-red-500">*</span></label>
                  <select className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm" 
                    value={newComp.category} onChange={e => setNewComp({...newComp, category: e.target.value})}>
                    <option value="วิชาการ">วิชาการ</option>
                    <option value="โครงงาน">โครงงาน</option>
                    <option value="สื่อสร้างสรรค์">สื่อสร้างสรรค์</option>
                    <option value="อื่นๆ">อื่นๆ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">ชื่อการแข่งขัน <span className="text-red-500">*</span></label>
                <input type="text" required placeholder="ชื่อรายการแข่งขัน" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm" 
                  value={newComp.title} onChange={e => setNewComp({...newComp, title: e.target.value})} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">ระดับชั้น <span className="text-red-500">*</span></label>
                  <input type="text" required placeholder="เช่น ม.1-ม.6" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm" 
                    value={newComp.level} onChange={e => setNewComp({...newComp, level: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">รูปแบบ <span className="text-red-500">*</span></label>
                  <select className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm" 
                    value={newComp.type} onChange={e => setNewComp({...newComp, type: e.target.value})}>
                    <option value="single">ประเภทเดี่ยว (1 คน)</option>
                    <option value="team">ประเภททีม</option>
                  </select>
                </div>
              </div>

              {newComp.type === 'team' && (
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">สมาชิกขั้นต่ำ <span className="text-red-500">*</span></label>
                    <input type="number" min="1" required className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm" 
                      value={newComp.teamMin} onChange={e => setNewComp({...newComp, teamMin: parseInt(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">สมาชิกสูงสุด <span className="text-red-500">*</span></label>
                    <input type="number" min="1" required className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm" 
                      value={newComp.teamMax} onChange={e => setNewComp({...newComp, teamMax: parseInt(e.target.value)})} />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">คำอธิบายย่อ</label>
                <input type="text" placeholder="คำอธิบายสั้นๆ" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm" 
                  value={newComp.description} onChange={e => setNewComp({...newComp, description: e.target.value})} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">สถานที่จัดแข่ง</label>
                  <input type="text" placeholder="เช่น หอประชุม" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm" 
                    value={newComp.location} onChange={e => setNewComp({...newComp, location: e.target.value})} />
                </div>
                <div className="flex flex-col">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">วันที่และเวลาแข่งขัน</label>
                  <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
                    <DateTimePicker 
                      value={newComp.competitionDate ? dayjs(newComp.competitionDate) : null}
                      onChange={(newValue: any) => setNewComp({...newComp, competitionDate: newValue ? newValue.toISOString() : ''})}
                      format="DD/MM/YYYY HH:mm"
                      ampm={false}
                      sx={{ 
                        width: '100%', 
                        backgroundColor: 'white',
                        '& .MuiInputBase-root': { 
                          height: '42px', 
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem'
                        } 
                      }}
                    />
                  </LocalizationProvider>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">กติกา (Rules)</label>
                <textarea rows={3} placeholder="กติกาการแข่งขัน" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm resize-none" 
                  value={newComp.rules} onChange={e => setNewComp({...newComp, rules: e.target.value})}></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">เกณฑ์การตัดสิน (Judging Criteria)</label>
                <textarea rows={3} placeholder="เกณฑ์การให้คะแนน" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm resize-none" 
                  value={newComp.judgingCriteria} onChange={e => setNewComp({...newComp, judgingCriteria: e.target.value})}></textarea>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2.5 rounded-lg font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors text-sm">
                  ยกเลิก
                </button>
                <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-lg font-bold text-white bg-primary hover:bg-primary/90 transition-colors text-sm shadow-md shadow-primary/20 flex items-center">
                  {saving ? <i className='bx bx-loader-alt bx-spin mr-2'></i> : <i className='bx bx-save mr-2'></i>}
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Announcements Modal */}
      {showAnnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl my-8">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white z-10 rounded-t-2xl">
              <h3 className="text-xl font-bold text-slate-800">{isEditAnn ? 'แก้ไขประกาศ' : 'เพิ่มข่าวประกาศ'}</h3>
              <button onClick={() => setShowAnnModal(false)} className="text-slate-400 hover:text-red-500"><i className='bx bx-x text-2xl'></i></button>
            </div>
            <form onSubmit={handleSaveAnn} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">หัวข้อประกาศ <span className="text-red-500">*</span></label>
                <input type="text" required className="w-full px-4 py-2 rounded-lg border border-slate-200" value={newAnn.title} onChange={e => setNewAnn({...newAnn, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">เนื้อหาประกาศ</label>
                <textarea rows={4} className="w-full px-4 py-2 rounded-lg border border-slate-200" value={newAnn.content} onChange={e => setNewAnn({...newAnn, content: e.target.value})}></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowAnnModal(false)} className="px-4 py-2 rounded-lg font-bold text-slate-500 bg-slate-100">ยกเลิก</button>
                <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg font-bold text-white bg-primary">บันทึกข้อมูล</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showSchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl my-8">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white z-10 rounded-t-2xl">
              <h3 className="text-xl font-bold text-slate-800">{isEditSch ? 'แก้ไขกำหนดการ' : 'เพิ่มกำหนดการ'}</h3>
              <button onClick={() => setShowSchModal(false)} className="text-slate-400 hover:text-red-500"><i className='bx bx-x text-2xl'></i></button>
            </div>
            <form onSubmit={handleSaveSch} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">กิจกรรม <span className="text-red-500">*</span></label>
                <input type="text" required className="w-full px-4 py-2 rounded-lg border border-slate-200" value={newSch.event} onChange={e => setNewSch({...newSch, event: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">รายละเอียดกิจกรรม</label>
                <textarea rows={3} className="w-full px-4 py-2 rounded-lg border border-slate-200" value={newSch.details || ''} onChange={e => setNewSch({...newSch, details: e.target.value})}></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">เวลา (เช่น 08:30 - 16:30 น.)</label>
                <input type="text" className="w-full px-4 py-2 rounded-lg border border-slate-200" value={newSch.time} onChange={e => setNewSch({...newSch, time: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">สถานที่</label>
                <input type="text" className="w-full px-4 py-2 rounded-lg border border-slate-200" value={newSch.location} onChange={e => setNewSch({...newSch, location: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">วันที่จัดกิจกรรม</label>
                <input type="datetime-local" className="w-full px-4 py-2 rounded-lg border border-slate-200" value={newSch.date ? new Date(new Date(newSch.date).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''} onChange={e => setNewSch({...newSch, date: new Date(e.target.value).toISOString()})} />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowSchModal(false)} className="px-4 py-2 rounded-lg font-bold text-slate-500 bg-slate-100">ยกเลิก</button>
                <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg font-bold text-white bg-primary">บันทึกข้อมูล</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Registrations Status Edit Modal */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl my-8">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white z-10 rounded-t-2xl">
              <h3 className="text-xl font-bold text-slate-800">แก้ไขข้อมูลผู้สมัคร</h3>
              <button onClick={() => setShowRegModal(false)} className="text-slate-400 hover:text-red-500"><i className='bx bx-x text-2xl'></i></button>
            </div>
            <form onSubmit={handleSaveReg} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">รหัสการสมัคร</label>
                  <input type="text" className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed" value={newReg.registrationCode} readOnly />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">สถานะ</label>
                  <select className="w-full px-4 py-2 rounded-lg border border-slate-200" value={newReg.status} onChange={e => setNewReg({...newReg, status: e.target.value})}>
                    <option value="pending">รอตรวจสอบ (Pending)</option>
                    <option value="approved">อนุมัติแล้ว (Approved)</option>
                    <option value="submitted">ส่งงานแล้ว (Submitted)</option>
                    <option value="rejected">ปฏิเสธ (Rejected)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">ชื่อทีม (ถ้ามี)</label>
                <input type="text" className="w-full px-4 py-2 rounded-lg border border-slate-200" value={newReg.teamName || ''} onChange={e => setNewReg({...newReg, teamName: e.target.value})} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">ชื่อ-นามสกุล (หัวหน้าทีม)</label>
                  <input type="text" className="w-full px-4 py-2 rounded-lg border border-slate-200" value={newReg.leaderFullName || ''} onChange={e => setNewReg({...newReg, leaderFullName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">เบอร์โทรติดต่อ</label>
                  <input type="text" className="w-full px-4 py-2 rounded-lg border border-slate-200" value={newReg.contactPhone || ''} onChange={e => setNewReg({...newReg, contactPhone: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowRegModal(false)} className="px-4 py-2 rounded-lg font-bold text-slate-500 bg-slate-100 hover:bg-slate-200">ยกเลิก</button>
                <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg font-bold text-white bg-primary hover:bg-primary/90">บันทึกข้อมูล</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submissions Status Edit Modal */}
      {showSubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm my-8">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white z-10 rounded-t-2xl">
              <h3 className="text-xl font-bold text-slate-800">แก้ไขสถานะผลงาน</h3>
              <button onClick={() => setShowSubModal(false)} className="text-slate-400 hover:text-red-500"><i className='bx bx-x text-2xl'></i></button>
            </div>
            <form onSubmit={handleSaveSub} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">สถานะ</label>
                <select className="w-full px-4 py-2 rounded-lg border border-slate-200" value={newSub.status} onChange={e => setNewSub({...newSub, status: e.target.value})}>
                  <option value="submitted">ส่งแล้ว (Submitted)</option>
                  <option value="reviewed">ตรวจแล้ว (Reviewed)</option>
                  <option value="rejected">ไม่ผ่านเกณฑ์ (Rejected)</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowSubModal(false)} className="px-4 py-2 rounded-lg font-bold text-slate-500 bg-slate-100">ยกเลิก</button>
                <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg font-bold text-white bg-primary">บันทึกข้อมูล</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && viewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl my-8 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white z-10 rounded-t-2xl">
              <h3 className="text-xl font-bold text-slate-800">รายละเอียด</h3>
              <button onClick={() => setShowViewModal(false)} className="text-slate-400 hover:text-red-500"><i className='bx bx-x text-2xl'></i></button>
            </div>
            <div className="p-6 overflow-y-auto bg-slate-50 text-sm flex-1">
                <div className="w-full">
                  {(() => {
                    const row = (label: string, value: any) => (
                        <div className="flex flex-col sm:flex-row py-3 border-b border-slate-100 last:border-0">
                            <span className="text-slate-500 font-medium sm:w-1/3 shrink-0">{label}</span>
                            <span className="text-slate-800 break-words">{value || '-'}</span>
                        </div>
                    );

                    if (viewType === 'competition') {
                        return (
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                <h4 className="text-lg font-bold text-primary mb-4 border-b pb-2">{viewData.title}</h4>
                                {row("รหัสอ้างอิง", viewData.id)}
                                {row("หมวดหมู่", viewData.category)}
                                {row("ระดับชั้น", viewData.level)}
                                {row("รูปแบบ", viewData.type === 'team' ? 'ประเภททีม' : 'ประเภทเดี่ยว')}
                                {viewData.type === 'team' && row("จำนวนสมาชิก (คน)", `${viewData.teamMin} - ${viewData.teamMax}`)}
                                {row("รายละเอียด", viewData.description)}
                                {row("กติกา", viewData.rules)}
                                {row("เกณฑ์การให้คะแนน", viewData.judgingCriteria)}
                                {row("สถานที่", viewData.location)}
                                {row("วัน-เวลาแข่งขัน", formatThaiDateTime(viewData.competitionDate))}
                                {row("เปิดรับสมัคร", viewData.registerOpen ? "เปิด" : "ปิด")}
                                {row("เปิดส่งผลงาน", viewData.submissionOpen ? "เปิด" : "ปิด")}
                            </div>
                        );
                    }

                    if (viewType === 'announcement') {
                        return (
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                <h4 className="text-lg font-bold text-primary mb-4 border-b pb-2">{viewData.title}</h4>
                                {row("วันที่ประกาศ", formatThaiDateTime(viewData.date || viewData.createdAt))}
                                {row("เนื้อหา", viewData.content)}
                                {row("สถานะการเผยแพร่", viewData.published ? "เผยแพร่อยู่" : "ซ่อน")}
                            </div>
                        );
                    }

                    if (viewType === 'schedule') {
                        return (
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                <h4 className="text-lg font-bold text-primary mb-4 border-b pb-2">{viewData.event}</h4>
                                {viewData.details && row("รายละเอียด", <div className="whitespace-pre-wrap">{viewData.details}</div>)}
                                {row("วันเวลา", `${formatThaiDateTime(viewData.date)} (${viewData.time})`)}
                                {row("สถานที่", viewData.location)}
                            </div>
                        );
                    }

                    if (viewType === 'registration') {
                        let membersInfo = null;
                        try {
                            const members = typeof viewData.membersJson === 'string' ? JSON.parse(viewData.membersJson) : viewData.membersJson;
                            if (Array.isArray(members) && members.length > 0) {
                                membersInfo = (
                                    <div className="mt-4">
                                        <span className="text-slate-500 font-medium block mb-2">รายชื่อสมาชิก:</span>
                                        <div className="grid gap-2">
                                            {members.map((m: any, i: number) => (
                                                <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm flex flex-col sm:flex-row sm:items-center gap-2">
                                                    <div className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0">{i+1}</div>
                                                    <div>
                                                        <div className="font-semibold text-slate-800">{m.full_name} (รหัส: {m.student_code})</div>
                                                        <div className="text-slate-500 text-xs mt-1">ชั้น: {m.class}/{m.room}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }
                        } catch(e) {}

                        return (
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                <h4 className="text-lg font-bold text-primary mb-4 border-b pb-2">รหัสการสมัคร: <span className="text-slate-800">{viewData.registrationCode}</span></h4>
                                {row("สถานะ", viewData.status === 'pending' ? <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-md text-xs font-bold">รอตรวจสอบ</span> : viewData.status === 'approved' ? <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold">อนุมัติแล้ว</span> : viewData.status === 'submitted' ? <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-bold">ส่งงานแล้ว</span> : <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-bold">ปฏิเสธ</span>)}
                                {row("วันที่สมัคร", formatThaiDateTime(viewData.createdAt))}
                                {row("รหัสรายการแข่งขัน", viewData.competitionId)}
                                {row("ชื่อทีม", viewData.teamName)}
                                {row("หัวหน้าทีม", `${viewData.leaderFullName} (ชั้น ${viewData.leaderClass})`)}
                                {row("เบอร์โทรศัพท์ติดต่อ", viewData.contactPhone)}
                                {membersInfo}
                            </div>
                        );
                    }

                    if (viewType === 'submission') {
                        return (
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                <h4 className="text-lg font-bold text-primary mb-4 border-b pb-2">ข้อมูลผลงาน</h4>
                                {row("รหัสการสมัคร", viewData.registrationCode)}
                                {row("รหัสรายการแข่งขัน", viewData.competitionId)}
                                {row("ชื่อผลงาน", viewData.workTitle)}
                                {row("รายละเอียดผลงาน", viewData.workDescription)}
                                {row("สถานะ", viewData.status === 'submitted' ? <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-bold">ส่งแล้ว</span> : viewData.status === 'reviewed' ? <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold">ตรวจแล้ว</span> : <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-bold">ไม่ผ่านเกณฑ์</span>)}
                                {row("วันที่ส่งผลงาน", formatThaiDateTime(viewData.submittedAt))}
                                <div className="flex flex-col sm:flex-row py-3 border-b border-slate-100 last:border-0">
                                    <span className="text-slate-500 font-medium sm:w-1/3 shrink-0">ไฟล์ที่อัปโหลด</span>
                                    <span className="text-slate-800 break-words">
                                        {viewData.fileUrl ? <a href={viewData.fileUrl} target="_blank" className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-primary rounded-lg transition-colors text-xs font-medium"><i className='bx bx-file'></i> เปิดไฟล์แนบ</a> : '-'}
                                    </span>
                                </div>
                                <div className="flex flex-col sm:flex-row py-3 border-b border-slate-100 last:border-0">
                                    <span className="text-slate-500 font-medium sm:w-1/3 shrink-0">ลิงก์ผลงานภายนอก</span>
                                    <span className="text-slate-800 break-words">
                                        {viewData.externalLink ? <a href={viewData.externalLink} target="_blank" className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors text-xs font-medium"><i className='bx bx-link-external'></i> เปิดลิงก์</a> : '-'}
                                    </span>
                                </div>
                            </div>
                        );
                    }

                    return <pre className="whitespace-pre-wrap bg-slate-800 text-green-400 p-4 rounded-xl overflow-x-auto">{JSON.stringify(viewData, null, 2)}</pre>;
                  })()}
                </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end bg-white rounded-b-2xl">
              <button onClick={() => setShowViewModal(false)} className="px-5 py-2.5 rounded-lg font-bold text-white bg-primary hover:bg-primary/90">ปิดหน้าต่าง</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
