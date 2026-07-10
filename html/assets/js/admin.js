/**
 * admin.js - ลอจิกสำหรับหน้าแอดมิน (Full CRUD with SweetAlert2)
 */

let adminPass = sessionStorage.getItem('adminPass') || null;
let userRole = sessionStorage.getItem('userRole') || 'admin';
let allCompetitions = [];
let allAnnouncements = [];

document.addEventListener('DOMContentLoaded', () => {
    
    if(adminPass) {
        showDashboard();
    } else {
        document.getElementById('login-screen').classList.remove('hidden');
    }

    // Login Form Submit
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = document.getElementById('admin-user').value;
        const pass = document.getElementById('admin-pass').value;
        const btn = e.target.querySelector('button');
        
        btn.textContent = "กำลังตรวจสอบ...";
        btn.disabled = true;

        try {
            const response = await apiPost('adminLogin', { username: user, password: pass });
            if (response.success) {
                adminPass = pass;
                userRole = response.role || 'admin';
                sessionStorage.setItem('adminPass', pass);
                sessionStorage.setItem('adminUser', user);
                sessionStorage.setItem('userRole', userRole);
                
                Swal.fire({
                    title: 'สำเร็จ',
                    text: 'เข้าสู่ระบบสำเร็จ',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });

                showDashboard();
            } else {
                Swal.fire('ข้อผิดพลาด', response.message || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง", 'error');
            }
        } catch (error) {
            Swal.fire('ข้อผิดพลาด', "เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย", 'error');
        } finally {
            btn.textContent = "เข้าสู่ระบบ";
            btn.disabled = false;
        }
    });

    // Logout
    document.getElementById('btn-logout').addEventListener('click', () => {
        Swal.fire({
            title: 'ยืนยันการออกจากระบบ?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'ออกจากระบบ',
            cancelButtonText: 'ยกเลิก'
        }).then((result) => {
            if (result.isConfirmed) {
                sessionStorage.removeItem('adminPass');
                sessionStorage.removeItem('adminUser');
                sessionStorage.removeItem('userRole');
                adminPass = null;
                userRole = 'admin';
                window.location.reload();
            }
        });
    });

    // Navigation Menu
    document.querySelectorAll('.nav-item[data-target]').forEach(item => {
        item.addEventListener('click', (e) => {
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            document.querySelectorAll('.admin-section').forEach(sec => sec.classList.add('hidden'));
            item.classList.add('active');
            document.getElementById(item.getAttribute('data-target')).classList.remove('hidden');
        });
    });

    // Handle Close Modals
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal-overlay').classList.remove('active');
        });
    });

    // ==========================================
    // ANNOUNCEMENTS
    // ==========================================
    document.getElementById('btn-add-ann').addEventListener('click', () => {
        document.getElementById('form-ann').reset();
        document.getElementById('ann-mode').value = 'add';
        document.getElementById('ann-modal-title').textContent = 'เขียนข่าวประกาศใหม่';
        openModal('modal-ann');
    });

    document.getElementById('form-ann').addEventListener('submit', async (e) => {
        e.preventDefault();
        const mode = document.getElementById('ann-mode').value;
        const action = mode === 'add' ? 'addAnnouncement' : 'editAnnouncement';
        
        submitFormDataWithSwal(e, action, {
            password: adminPass,
            id: document.getElementById('ann-id').value,
            title: document.getElementById('ann-title').value,
            content: document.getElementById('ann-content').value,
            published: document.getElementById('ann-status').value === 'true'
        }, () => {
            closeModal('modal-ann');
            loadAnnouncements();
        });
    });

    window.editAnnouncement = function(id) {
        const ann = allAnnouncements.find(a => a.id == id);
        if(!ann) return;
        document.getElementById('form-ann').reset();
        document.getElementById('ann-mode').value = 'edit';
        document.getElementById('ann-id').value = ann.id;
        document.getElementById('ann-title').value = ann.title;
        document.getElementById('ann-content').value = ann.content;
        document.getElementById('ann-status').value = (ann.published === true || String(ann.published).toUpperCase() === 'TRUE') ? 'true' : 'false';
        document.getElementById('ann-modal-title').textContent = 'แก้ไขข่าวประกาศ';
        openModal('modal-ann');
    }

    window.deleteAnnouncement = async function(id) {
        Swal.fire({
            title: 'ยืนยันการลบ?',
            text: `คุณแน่ใจหรือไม่ว่าต้องการลบข่าวประกาศ รหัส ${id}? (ลบแล้วไม่สามารถกู้คืนได้)`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ลบข้อมูล',
            cancelButtonText: 'ยกเลิก'
        }).then(async (result) => {
            if (result.isConfirmed) {
                Swal.fire({ title: 'กำลังลบ...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); }});
                try {
                    const res = await apiPost('deleteItem', { password: adminPass, sheetName: 'announcements', id: id });
                    if(res.success) {
                        Swal.fire('ลบข้อมูลสำเร็จ!', '', 'success');
                        loadAnnouncements();
                    } else {
                        Swal.fire('ข้อผิดพลาด', res.message, 'error');
                    }
                } catch(e) {
                    Swal.fire('ข้อผิดพลาด', 'Network error', 'error');
                }
            }
        });
    }

    // ==========================================
    // COMPETITIONS
    // ==========================================
    document.getElementById('comp-type-select').addEventListener('change', (e) => {
        const type = e.target.value;
        const minInput = document.getElementById('comp-tmin');
        const maxInput = document.getElementById('comp-tmax');
        if (type === 'single') {
            minInput.value = 1;
            maxInput.value = 1;
            minInput.readOnly = true;
            maxInput.readOnly = true;
            minInput.classList.add('bg-slate-100');
            maxInput.classList.add('bg-slate-100');
        } else {
            minInput.readOnly = false;
            maxInput.readOnly = false;
            minInput.classList.remove('bg-slate-100');
            maxInput.classList.remove('bg-slate-100');
        }
    });

    document.getElementById('btn-add-comp').addEventListener('click', () => {
        document.getElementById('form-comp').reset();
        document.getElementById('comp-mode').value = 'add';
        document.getElementById('comp-modal-title').textContent = 'เพิ่มรายการแข่งขันใหม่';
        
        // Auto-generate ID (e.g. C01, C02, etc.)
        let nextId = "C01";
        if (allCompetitions && allCompetitions.length > 0) {
            let max = 0;
            allCompetitions.forEach(c => {
                const match = c.id.match(/\d+/);
                if (match) {
                    const num = parseInt(match[0]);
                    if (num > max) max = num;
                }
            });
            nextId = "C" + String(max + 1).padStart(2, '0');
        }
        
        document.getElementById('comp-id').value = nextId;
        document.getElementById('comp-id').readOnly = true;
        document.getElementById('comp-id').classList.add('bg-slate-100'); // Optional: make it look readonly
        
        document.getElementById('comp-type-select').value = 'team';
        document.getElementById('comp-type-select').dispatchEvent(new Event('change'));
        
        openModal('modal-comp');
    });

    document.getElementById('form-comp').addEventListener('submit', async (e) => {
        e.preventDefault();
        const mode = document.getElementById('comp-mode').value;
        const action = mode === 'add' ? 'addCompetition' : 'editCompetition';
        
        submitFormDataWithSwal(e, action, {
            password: adminPass,
            old_id: document.getElementById('comp-old-id').value,
            id: document.getElementById('comp-id').value,
            title: document.getElementById('comp-title').value,
            category: document.getElementById('comp-cat').value,
            level: document.getElementById('comp-level').value,
            team_min: document.getElementById('comp-tmin').value,
            team_max: document.getElementById('comp-tmax').value,
            description: document.getElementById('comp-desc').value,
            rules: document.getElementById('comp-rules').value,
            judging_criteria: document.getElementById('comp-criteria').value,
            location: document.getElementById('comp-location').value,
            competition_date: document.getElementById('comp-date').value
        }, () => {
            closeModal('modal-comp');
            loadCompetitions();
        });
    });

    window.editCompetition = function(id) {
        const comp = allCompetitions.find(c => c.id == id);
        if(!comp) return;
        document.getElementById('form-comp').reset();
        document.getElementById('comp-mode').value = 'edit';
        document.getElementById('comp-old-id').value = comp.id;
        document.getElementById('comp-id').value = comp.id;
        document.getElementById('comp-id').readOnly = true;
        document.getElementById('comp-id').classList.add('bg-slate-100');
        
        document.getElementById('comp-title').value = comp.title;
        document.getElementById('comp-cat').value = comp.category;
        document.getElementById('comp-level').value = comp.level;
        
        const isSingle = (parseInt(comp.team_max) === 1);
        document.getElementById('comp-type-select').value = isSingle ? 'single' : 'team';
        document.getElementById('comp-type-select').dispatchEvent(new Event('change'));
        
        document.getElementById('comp-tmin').value = comp.team_min;
        document.getElementById('comp-tmax').value = comp.team_max;
        document.getElementById('comp-desc').value = comp.description || '';
        document.getElementById('comp-rules').value = comp.rules || '';
        document.getElementById('comp-criteria').value = comp.judging_criteria || '';
        document.getElementById('comp-location').value = comp.location || '';
        document.getElementById('comp-date').value = comp.competition_date || '';
        
        document.getElementById('comp-modal-title').textContent = 'แก้ไขรายการแข่งขัน';
        openModal('modal-comp');
    }

    window.deleteCompetition = async function(id) {
        Swal.fire({
            title: 'ยืนยันการลบ?',
            text: `คุณแน่ใจหรือไม่ว่าต้องการลบรายการแข่งขัน รหัส ${id}? (ลบแล้วไม่สามารถกู้คืนได้)`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ลบข้อมูล',
            cancelButtonText: 'ยกเลิก'
        }).then(async (result) => {
            if (result.isConfirmed) {
                Swal.fire({ title: 'กำลังลบ...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); }});
                try {
                    const res = await apiPost('deleteItem', { password: adminPass, sheetName: 'competitions', id: id });
                    if(res.success) {
                        Swal.fire('ลบข้อมูลสำเร็จ!', '', 'success');
                        loadCompetitions();
                    } else {
                        Swal.fire('ข้อผิดพลาด', res.message, 'error');
                    }
                } catch(e) {
                    Swal.fire('ข้อผิดพลาด', 'Network error', 'error');
                }
            }
        });
    }

    window.viewCompetition = function(id) {
        const comp = allCompetitions.find(c => c.id == id);
        if(!comp) return;
        
        const content = `
            <h3>${comp.title} (${comp.id})</h3>
            <hr style="margin: 10px 0; border: 0; border-top: 1px solid #eee;">
            <p><strong>หมวดหมู่:</strong> ${comp.category}</p>
            <p><strong>ระดับชั้น:</strong> ${comp.level}</p>
            <p><strong>จำนวนสมาชิก:</strong> ${comp.team_min} - ${comp.team_max} คน</p>
            <p><strong>รายละเอียด:</strong> ${comp.description || '-'}</p>
            <p><strong>กติกา:</strong> ${comp.rules || '-'}</p>
            <p><strong>เกณฑ์ตัดสิน:</strong> ${comp.judging_criteria || '-'}</p>
            <p><strong>สถานที่:</strong> ${comp.location || '-'}</p>
            <p><strong>วันที่แข่ง:</strong> ${comp.competition_date ? formatThaiDateTime(comp.competition_date) : '-'}</p>
        `;
        document.getElementById('view-details-content').innerHTML = content;
        openModal('modal-view-details');
    }

    // ==========================================
    // REGISTRATIONS
    // ==========================================
    document.getElementById('reg-comp-filter').addEventListener('change', loadRegistrations);
    document.getElementById('btn-refresh-reg').addEventListener('click', loadRegistrations);
});

function showDashboard() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('dashboard-screen').classList.remove('hidden');
    
    // RBAC: Handle Teacher Role
    if (userRole === 'teacher') {
        // Hide admin-only nav items
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
        // Set default tab to competitions
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        document.querySelectorAll('.admin-section').forEach(sec => sec.classList.add('hidden'));
        const compTab = document.querySelector('.nav-item[data-target="panel-competitions"]');
        if (compTab) {
            compTab.classList.add('active');
            document.getElementById('panel-competitions').classList.remove('hidden');
        }
    }
    
    loadCompetitions();
    if (userRole === 'admin') {
        loadAnnouncements();
        loadSchedule();
        loadSettings();
    }
}

async function loadCompetitions() {
    const tbody = document.getElementById('comp-table-body');
    const response = await apiGet('getCompetitions');
    
    if (response.success) {
        allCompetitions = response.data;
        tbody.innerHTML = '';
        
        const filterSelect = document.getElementById('reg-comp-filter');
        const subFilterSelect = document.getElementById('sub-comp-filter');
        filterSelect.innerHTML = '<option value="">-- เลือกรายการแข่งขัน --</option>';
        if(subFilterSelect) subFilterSelect.innerHTML = '<option value="">-- เลือกรายการแข่งขัน --</option>';

        allCompetitions.forEach(item => {
            const tr = document.createElement('tr');
            
            const regStatus = (item.register_open === true || String(item.register_open).toUpperCase() === 'TRUE') 
                              ? `<button class="status-toggle status-on" onclick="toggleStatus('${item.id}', 'register', false)">เปิด</button>`
                              : `<button class="status-toggle status-off" onclick="toggleStatus('${item.id}', 'register', true)">ปิด</button>`;
                              
            const subStatus = (item.submission_open === true || String(item.submission_open).toUpperCase() === 'TRUE')
                              ? `<button class="status-toggle status-on" onclick="toggleStatus('${item.id}', 'submission', false)">เปิด</button>`
                              : `<button class="status-toggle status-off" onclick="toggleStatus('${item.id}', 'submission', true)">ปิด</button>`;
            
            tr.innerHTML = `
                <td>${item.id}</td>
                <td><strong>${item.title}</strong><br><small>${item.level}</small></td>
                <td>${regStatus}</td>
                <td>${subStatus}</td>
                <td>
                    <div class="flex items-center gap-2 flex-nowrap">
                        <button class="btn-icon btn-view flex-shrink-0" onclick="viewCompetition('${item.id}')" title="ดูรายละเอียด"><i class='bx bx-search'></i></button>
                        <button class="btn-icon btn-edit flex-shrink-0" onclick="editCompetition('${item.id}')" title="แก้ไข"><i class='bx bx-edit-alt'></i></button>
                        <button class="btn-icon btn-delete flex-shrink-0" onclick="deleteCompetition('${item.id}')" title="ลบ"><i class='bx bx-trash'></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);

            const opt = document.createElement('option');
            opt.value = item.id;
            opt.textContent = `${item.id}: ${item.title}`;
            filterSelect.appendChild(opt);
            
            if(subFilterSelect) {
                const optSub = document.createElement('option');
                optSub.value = item.id;
                optSub.textContent = `${item.id}: ${item.title}`;
                subFilterSelect.appendChild(optSub);
            }
        });
    } else {
        tbody.innerHTML = `<tr><td colspan="5">โหลดข้อมูลล้มเหลว: ${response.message}</td></tr>`;
    }
}

async function loadAnnouncements() {
    const tbody = document.getElementById('ann-table-body');
    const response = await apiGet('getAnnouncements');
    
    if (response.success) {
        allAnnouncements = response.data.slice().reverse(); 
        tbody.innerHTML = '';
        
        allAnnouncements.forEach(item => {
            // Support both 'published' and 'is_active' for backward compatibility just in case
            const isPub = item.published !== undefined ? item.published : item.is_active;
            const statusBadge = (isPub === true || String(isPub).toUpperCase() === 'TRUE')
                              ? `<button class="status-toggle status-on" onclick="toggleItemStatus('announcements', '${item.id}', 'id', 'published', false, 'ประกาศ')">แสดงผล</button>`
                              : `<button class="status-toggle status-off" onclick="toggleItemStatus('announcements', '${item.id}', 'id', 'published', true, 'ประกาศ')">ซ่อน</button>`;
            
            const dispDate = formatThaiDateTime(item.date || item.created_at, false);
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.id}</td>
                <td>${dispDate}</td>
                <td><strong>${item.title}</strong></td>
                <td>${statusBadge}</td>
                <td>
                    <div class="flex items-center gap-2 flex-nowrap">
                        <button class="btn-icon btn-edit flex-shrink-0" onclick="editAnnouncement('${item.id}')" title="แก้ไข"><i class='bx bx-edit-alt'></i></button>
                        <button class="btn-icon btn-delete flex-shrink-0" onclick="deleteAnnouncement('${item.id}')" title="ลบ"><i class='bx bx-trash'></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

async function loadRegistrations() {
    const compId = document.getElementById('reg-comp-filter').value;
    const tbody = document.getElementById('reg-table-body');
    
    if(!compId) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">กรุณาเลือกรายการแข่งขันเพื่อดูผู้สมัคร</td></tr>`;
        return;
    }

    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">กำลังโหลดข้อมูล...</td></tr>`;
    
    try {
        const response = await apiPost('getRegistrations', { password: adminPass, compId: compId });
        
        if (response.success && response.data.length > 0) {
            tbody.innerHTML = '';
            response.data.forEach(reg => {
                let membersHtml = '';
                try {
                    const members = JSON.parse(reg.members_json || '[]');
                    membersHtml = members.map(m => `<li>${m.student_code} - ${m.full_name} (${m.class}/${m.room})</li>`).join('');
                } catch(e) {
                    membersHtml = '<i>ข้อมูลไม่สมบูรณ์</i>';
                }

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${reg.registration_code}</strong></td>
                    <td>${reg.team_name || '-'}</td>
                    <td>${reg.leader_full_name}<br><small>📞 ${reg.contact_phone || '-'}</small></td>
                    <td><ul style="margin:0; padding-left:1.2rem; font-size:0.9rem;">${membersHtml}</ul></td>
                    <td>${reg.created_at ? formatThaiDateTime(reg.created_at) : '-'}</td>
                    <td>
                        <div class="flex items-center gap-2 flex-nowrap">
                            <button class="btn-icon btn-edit flex-shrink-0" onclick="editRegistration('${reg.registration_code}')" title="แก้ไข"><i class='bx bx-edit-alt'></i></button>
                            <button class="btn-icon btn-delete flex-shrink-0" onclick="deleteItem('registrations', '${reg.registration_code}')" title="ลบ"><i class='bx bx-trash'></i></button>
                        </div>
                    </td>
                `;
                // Store original JSON data inside button for easy edit
                const editBtn = tr.querySelector('.btn-edit');
                editBtn.dataset.reg = JSON.stringify(reg);
                
                tbody.appendChild(tr);
            });
        } else {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">ยังไม่มีผู้สมัครในรายการนี้</td></tr>`;
        }
    } catch(e) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">เกิดข้อผิดพลาดในการโหลดข้อมูล</td></tr>`;
    }
}

// ==========================================
// SCHEDULE
// ==========================================
async function loadSchedule() {
    const tbody = document.getElementById('schedule-table-body');
    const response = await apiGet('getSchedule');
    
    if (response.success) {
        tbody.innerHTML = '';
        response.data.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.id}</td>
                <td>${formatThaiDateTime(item.date, false)}</td>
                <td><small>${formatThaiDateTime(item.start_time).replace(' น.', '')} - ${formatThaiDateTime(item.end_time)}</small></td>
                <td><strong>${item.title}</strong><br><small>${item.description || '-'}</small></td>
                <td>${item.location || '-'}</td>
                <td>
                    <div class="flex items-center gap-2 flex-nowrap">
                        <button class="btn-icon btn-edit flex-shrink-0" onclick="editSchedule('${item.id}')" title="แก้ไข"><i class='bx bx-edit-alt'></i></button>
                        <button class="btn-icon btn-delete flex-shrink-0" onclick="deleteItem('schedule', '${item.id}')" title="ลบ"><i class='bx bx-trash'></i></button>
                    </div>
                </td>
            `;
            const editBtn = tr.querySelector('.btn-edit');
            editBtn.dataset.item = JSON.stringify(item);
            tbody.appendChild(tr);
        });
    }
}

document.getElementById('btn-add-schedule').addEventListener('click', () => {
    document.getElementById('form-schedule').reset();
    document.getElementById('schedule-mode').value = 'add';
    document.getElementById('schedule-modal-title').textContent = 'เพิ่มกำหนดการใหม่';
    openModal('modal-schedule');
});

document.getElementById('form-schedule').addEventListener('submit', (e) => {
    e.preventDefault();
    const mode = document.getElementById('schedule-mode').value;
    const action = mode === 'add' ? 'addSchedule' : 'editSchedule';
    
    submitFormDataWithSwal(e, action, {
        password: adminPass,
        id: document.getElementById('schedule-id').value,
        date: document.getElementById('schedule-date').value,
        start_time: document.getElementById('schedule-start').value,
        end_time: document.getElementById('schedule-end').value,
        title: document.getElementById('schedule-title').value,
        location: document.getElementById('schedule-location').value,
        description: document.getElementById('schedule-desc').value
    }, () => {
        closeModal('modal-schedule');
        loadSchedule();
    });
});

window.editSchedule = function(id) {
    const btn = document.querySelector(`#schedule-table-body button[onclick="editSchedule('${id}')"]`);
    if(!btn) return;
    const item = JSON.parse(btn.dataset.item);
    
    document.getElementById('schedule-mode').value = 'edit';
    document.getElementById('schedule-id').value = item.id;
    document.getElementById('schedule-date').value = item.date;
    document.getElementById('schedule-start').value = item.start_time;
    document.getElementById('schedule-end').value = item.end_time;
    document.getElementById('schedule-title').value = item.title;
    document.getElementById('schedule-location').value = item.location;
    document.getElementById('schedule-desc').value = item.description || '';
    
    document.getElementById('schedule-modal-title').textContent = 'แก้ไขกำหนดการ';
    openModal('modal-schedule');
}

// ==========================================
// SETTINGS
// ==========================================
async function loadSettings() {
    const tbody = document.getElementById('setting-table-body');
    const response = await apiPost('getSettings', { password: adminPass });
    
    if (response.success) {
        tbody.innerHTML = '';
        response.data.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${item.key}</strong></td>
                <td>${item.value}</td>
                <td>
                    <div class="flex items-center gap-2 flex-nowrap">
                        <button class="btn-icon btn-edit flex-shrink-0" onclick="editSetting('${item.key}', '${item.value.replace(/'/g, "\\'")}')" title="แก้ไข"><i class='bx bx-edit-alt'></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

window.editSetting = function(key, value) {
    document.getElementById('setting-key').value = key;
    document.getElementById('setting-key-display').value = key;
    document.getElementById('setting-value').value = value;
    openModal('modal-settings');
}

document.getElementById('form-settings').addEventListener('submit', (e) => {
    e.preventDefault();
    submitFormDataWithSwal(e, 'updateSetting', {
        password: adminPass,
        key: document.getElementById('setting-key').value,
        value: document.getElementById('setting-value').value
    }, () => {
        closeModal('modal-settings');
        loadSettings();
    });
});

// ==========================================
// SUBMISSIONS
// ==========================================
document.getElementById('sub-comp-filter').addEventListener('change', loadSubmissions);
document.getElementById('btn-refresh-sub').addEventListener('click', loadSubmissions);

async function loadSubmissions() {
    const compId = document.getElementById('sub-comp-filter').value;
    const tbody = document.getElementById('sub-table-body');
    
    if(!compId) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8">กรุณาเลือกรายการแข่งขันเพื่อดูผลงาน</td></tr>';
        return;
    }
    
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8">กำลังโหลดข้อมูล...</td></tr>';
    
    const response = await apiPost('getSubmissions', { password: adminPass, compId: compId });
    if(response.success && response.data.length > 0) {
        tbody.innerHTML = '';
        response.data.forEach(sub => {
            let linkHtml = sub.file_url ? `<a href="${sub.file_url}" target="_blank" class="text-blue-500 underline">ไฟล์แนบ</a>` : '';
            if(sub.external_link) linkHtml += (linkHtml ? ' | ' : '') + `<a href="${sub.external_link}" target="_blank" class="text-blue-500 underline">ลิงก์ภายนอก</a>`;
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${sub.registration_code}</strong></td>
                <td>${sub.work_title}<br><span class="status-toggle status-off">${sub.status || 'ส่งแล้ว'}</span></td>
                <td>${linkHtml || '-'}</td>
                <td>${formatThaiDateTime(sub.submitted_at) || '-'}</td>
                <td>
                    <div class="flex items-center gap-2 flex-nowrap">
                        <button class="btn-icon btn-edit flex-shrink-0" onclick="editSubmission('${sub.submission_id}')" title="แก้ไข"><i class='bx bx-edit-alt'></i></button>
                        <button class="btn-icon btn-delete flex-shrink-0" onclick="deleteItem('submissions', '${sub.submission_id}', 'submission_id')" title="ลบ"><i class='bx bx-trash'></i></button>
                    </div>
                </td>
            `;
            const editBtn = tr.querySelector('.btn-edit');
            editBtn.dataset.sub = JSON.stringify(sub);
            tbody.appendChild(tr);
        });
    } else {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8">ยังไม่มีผลงานในรายการนี้</td></tr>';
    }
}

window.editSubmission = function(id) {
    const btn = document.querySelector(`#sub-table-body button[onclick="editSubmission('${id}')"]`);
    if(!btn) return;
    const sub = JSON.parse(btn.dataset.sub);
    
    document.getElementById('sub-id').value = sub.submission_id;
    document.getElementById('sub-reg-code').value = sub.registration_code;
    document.getElementById('sub-title').value = sub.work_title;
    document.getElementById('sub-desc').value = sub.work_description || '';
    document.getElementById('sub-url').value = sub.external_link || sub.file_url || '';
    document.getElementById('sub-status').value = sub.status || 'ส่งแล้ว';
    openModal('modal-submission');
}

document.getElementById('form-submission').addEventListener('submit', (e) => {
    e.preventDefault();
    submitFormDataWithSwal(e, 'editSubmission', {
        password: adminPass,
        id: document.getElementById('sub-id').value,
        work_title: document.getElementById('sub-title').value,
        work_description: document.getElementById('sub-desc').value,
        external_link: document.getElementById('sub-url').value,
        status: document.getElementById('sub-status').value
    }, () => {
        closeModal('modal-submission');
        loadSubmissions();
    });
});

// ==========================================
// REGISTRATION EDIT
// ==========================================
window.editRegistration = function(code) {
    const btn = document.querySelector(`#reg-table-body button[onclick="editRegistration('${code}')"]`);
    if(!btn) return;
    const reg = JSON.parse(btn.dataset.reg);
    
    document.getElementById('reg-code').value = reg.registration_code;
    document.getElementById('reg-comp-id').value = reg.competition_id;
    document.getElementById('reg-team-name').value = reg.team_name || '';
    document.getElementById('reg-contact').value = reg.contact_phone || '';
    
    const container = document.getElementById('reg-members-container');
    container.innerHTML = '';
    
    let members = [];
    try {
        members = JSON.parse(reg.members_json || '[]');
    } catch(e) {}
    
    members.forEach((m, index) => {
        addMemberToForm(m, index);
    });
    
    openModal('modal-registration');
}

document.getElementById('btn-add-member').addEventListener('click', () => {
    addMemberToForm({ student_code: '', full_name: '', class: '', room: '' }, document.querySelectorAll('.member-item').length);
});

function addMemberToForm(m, index) {
    const container = document.getElementById('reg-members-container');
    const div = document.createElement('div');
    div.className = 'member-item p-3 border border-slate-200 rounded-lg bg-slate-50 relative';
    div.innerHTML = `
        <button type="button" class="absolute top-2 right-2 text-red-500 hover:text-red-700" onclick="this.parentElement.remove()"><i class='bx bx-x text-xl'></i></button>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div><label class="text-xs text-slate-500">รหัส นร.</label><input type="text" class="form-control text-sm py-1 px-2 m-code" value="${m.student_code}" required></div>
            <div class="col-span-2"><label class="text-xs text-slate-500">ชื่อ-สกุล</label><input type="text" class="form-control text-sm py-1 px-2 m-name" value="${m.full_name}" required></div>
            <div class="flex gap-2">
                <div class="w-1/2"><label class="text-xs text-slate-500">ชั้น</label><input type="text" class="form-control text-sm py-1 px-2 m-class" value="${m.class}" placeholder="ม.1" required></div>
                <div class="w-1/2"><label class="text-xs text-slate-500">ห้อง</label><input type="text" class="form-control text-sm py-1 px-2 m-room" value="${m.room}" placeholder="1" required></div>
            </div>
        </div>
    `;
    container.appendChild(div);
}

document.getElementById('form-registration').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const members = [];
    document.querySelectorAll('.member-item').forEach(item => {
        members.push({
            student_code: item.querySelector('.m-code').value,
            full_name: item.querySelector('.m-name').value,
            class: item.querySelector('.m-class').value,
            room: item.querySelector('.m-room').value
        });
    });
    
    let leader_full_name = '';
    if(members.length > 0) {
        leader_full_name = members[0].full_name;
    }
    
    submitFormDataWithSwal(e, 'editRegistration', {
        password: adminPass,
        registration_code: document.getElementById('reg-code').value,
        team_name: document.getElementById('reg-team-name').value,
        contact_phone: document.getElementById('reg-contact').value,
        leader_full_name: leader_full_name,
        members_json: JSON.stringify(members)
    }, () => {
        closeModal('modal-registration');
        loadRegistrations();
    });
});

// ==========================================
// GENERIC DELETE
// ==========================================
window.deleteItem = function(sheetName, id, idField = 'id') {
    Swal.fire({
        title: 'ยืนยันการลบ?',
        text: `คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลรหัส ${id}? (ลบแล้วกู้คืนไม่ได้)`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'ลบข้อมูล',
        cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
        if (result.isConfirmed) {
            Swal.fire({ title: 'กำลังลบ...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); }});
            try {
                const res = await apiPost('deleteItem', { password: adminPass, sheetName: sheetName, id: id, idField: idField });
                if(res.success) {
                    Swal.fire('ลบข้อมูลสำเร็จ!', '', 'success');
                    if(sheetName === 'schedule') loadSchedule();
                    else if(sheetName === 'submissions') loadSubmissions();
                    else if(sheetName === 'registrations') loadRegistrations();
                } else {
                    Swal.fire('ข้อผิดพลาด', res.message, 'error');
                }
            } catch(e) {
                Swal.fire('ข้อผิดพลาด', 'Network error', 'error');
            }
        }
    });
}

// Global API Helper for forms with SweetAlert2
async function submitFormDataWithSwal(event, action, payload, onSuccess) {
    const btn = event.target.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    
    btn.textContent = "กำลังบันทึก...";
    btn.disabled = true;
    Swal.fire({ title: 'กำลังบันทึกข้อมูล...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); }});
    
    try {
        const response = await apiPost(action, payload);
        if (response.success) {
            Swal.fire({
                title: 'สำเร็จ!',
                text: response.message || "บันทึกข้อมูลสำเร็จ",
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
            setTimeout(() => { onSuccess(); }, 1500);
        } else {
            Swal.fire('ข้อผิดพลาด', response.message || "เกิดข้อผิดพลาดในการบันทึก", 'error');
        }
    } catch (error) {
        Swal.fire('ข้อผิดพลาด', "เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย", 'error');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

// Generic toggle status
window.toggleItemStatus = async function(sheetName, id, idField, statusField, newStatus, itemTypeLabel = 'รายการ') {
    Swal.fire({
        title: 'ยืนยันการเปลี่ยนสถานะ?',
        text: `ต้องการเปลี่ยนสถานะของ ${itemTypeLabel} (รหัส: ${id}) หรือไม่?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'ยืนยัน',
        cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
        if (result.isConfirmed) {
            Swal.fire({ title: 'กำลังอัปเดต...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); }});
            try {
                const payload = {
                    password: adminPass,
                    sheetName: sheetName,
                    idField: idField,
                    id: id,
                    field: statusField,
                    value: newStatus
                };
                const response = await apiPost('updateItemStatus', payload);
                
                if (response.success) {
                    Swal.fire({
                        title: 'อัปเดตสำเร็จ',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    if (sheetName === 'announcements') loadAnnouncements();
                    else if (sheetName === 'competitions') loadCompetitions();
                } else {
                    Swal.fire('ข้อผิดพลาด', response.message || "เกิดข้อผิดพลาดในการบันทึก", 'error');
                }
            } catch (error) {
                Swal.fire('ข้อผิดพลาด', "เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย", 'error');
            }
        }
    });
}

// Toggle status with SweetAlert2
window.toggleStatus = async function(compId, type, newStatus) {
    Swal.fire({
        title: 'ยืนยันการเปลี่ยนสถานะ?',
        text: `ต้องการเปลี่ยนสถานะ ${type} ของรายการ ${compId} หรือไม่?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'ยืนยัน',
        cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
        if (result.isConfirmed) {
            Swal.fire({ title: 'กำลังอัปเดต...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); }});
            try {
                const payload = {
                    password: adminPass,
                    id: compId,
                    field: type === 'register' ? 'register_open' : 'submission_open',
                    value: newStatus
                };
                const response = await apiPost('updateCompetitionStatus', payload);
                
                if (response.success) {
                    Swal.fire({
                        title: 'อัปเดตสำเร็จ',
                        icon: 'success',
                        timer: 1000,
                        showConfirmButton: false
                    });
                    loadCompetitions(); 
                } else {
                    Swal.fire('ข้อผิดพลาด', response.message, 'error');
                }
            } catch (e) {
                Swal.fire('ข้อผิดพลาด', 'Network Error', 'error');
            }
        }
    });
}

function openModal(id) {
    document.getElementById(id).classList.add('active');
}
function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}
