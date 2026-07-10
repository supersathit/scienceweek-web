/**
 * register.js - ลอจิกสำหรับหน้าสมัครการแข่งขัน
 */

let availableCompetitions = [];
let currentCompetition = null;

document.addEventListener('DOMContentLoaded', () => {
    loadCompetitionsForRegistration();
    
    document.getElementById('comp-select').addEventListener('change', handleCompetitionSelect);
    document.getElementById('btn-add-member').addEventListener('click', () => addMemberField(false));
    document.getElementById('registration-form').addEventListener('submit', handleRegistrationSubmit);
});

async function loadCompetitionsForRegistration() {
    const select = document.getElementById('comp-select');
    const loadingState = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');
    const formContainer = document.getElementById('form-container');
    
    try {
        const response = await apiGet('getCompetitions');
        
        loadingState.classList.add('hidden');
        
        if (response.success && response.data) {
            // กรองเฉพาะรายการที่เปิดรับสมัคร
            availableCompetitions = response.data.filter(c => c.register_open === true || String(c.register_open).toUpperCase() === 'TRUE');
            
            if (availableCompetitions.length === 0) {
                errorState.classList.remove('hidden');
                errorState.querySelector('p').textContent = 'ขณะนี้ไม่มีรายการแข่งขันที่เปิดรับสมัคร';
                errorState.querySelector('button').style.display = 'none';
                return;
            }
            
            formContainer.classList.remove('hidden');
            
            // สร้างตัวเลือก
            select.innerHTML = '<option value="">-- เลือกรายการแข่งขัน --</option>';
            availableCompetitions.forEach(c => {
                const option = document.createElement('option');
                option.value = c.id;
                option.textContent = `${c.title} (${c.level})`;
                select.appendChild(option);
            });
            
            // เช็คว่ามี id ใน url หรือไม่
            const urlParams = new URLSearchParams(window.location.search);
            const compId = urlParams.get('id');
            if (compId) {
                const exists = availableCompetitions.find(c => c.id === compId);
                if (exists) {
                    select.value = compId;
                    handleCompetitionSelect();
                }
            }
            
        } else {
            errorState.classList.remove('hidden');
        }
    } catch (e) {
        loadingState.classList.add('hidden');
        errorState.classList.remove('hidden');
    }
}

function handleCompetitionSelect() {
    const compId = document.getElementById('comp-select').value;
    const infoText = document.getElementById('comp-info-text');
    const teamNameGroup = document.getElementById('team-name-group');
    const teamNameInput = document.getElementById('team-name');
    const container = document.getElementById('members-container');
    
    if (!compId) {
        infoText.classList.add('hidden');
        container.innerHTML = '';
        currentCompetition = null;
        updateMemberBadge();
        return;
    }
    
    currentCompetition = availableCompetitions.find(c => c.id === compId);
    if (!currentCompetition) return;
    
    // แสดงรายละเอียดคร่าวๆ
    infoText.classList.remove('hidden');
    const isSingle = parseInt(currentCompetition.team_max) === 1;
    const typeText = isSingle ? 'ประเภทเดี่ยว' : 'ประเภททีม';
    
    if (isSingle) {
        infoText.textContent = `รูปแบบ: ${typeText} | ระดับ: ${currentCompetition.level} | แข่งขัน 1 คน`;
    } else {
        infoText.textContent = `รูปแบบ: ${typeText} | ระดับ: ${currentCompetition.level} | สมาชิก: ${currentCompetition.team_min} - ${currentCompetition.team_max} คน`;
    }
    
    // ซ่อน/แสดง ชื่อทีม ตามจำนวน max
    if (parseInt(currentCompetition.team_max) === 1) {
        teamNameGroup.classList.add('hidden');
        teamNameInput.removeAttribute('required');
        teamNameInput.value = '';
    } else {
        teamNameGroup.classList.remove('hidden');
        teamNameInput.setAttribute('required', 'required');
    }
    
    // ล้างและสร้างฟิลด์สมาชิกใหม่ตามค่า team_min
    container.innerHTML = '';
    const min = parseInt(currentCompetition.team_min) || 1;
    
    for (let i = 0; i < min; i++) {
        addMemberField(true); // true = ไม่ให้มีปุ่มลบ
    }
    
    updateMemberBadge();
}

function addMemberField(isMandatory = false) {
    if (!currentCompetition) return;
    
    const container = document.getElementById('members-container');
    const max = parseInt(currentCompetition.team_max) || 1;
    const currentCount = container.children.length;
    
    if (currentCount >= max && !isMandatory) {
        Swal.fire('แจ้งเตือน', `รายการนี้รับสมาชิกได้สูงสุด ${max} คน`, 'warning');
        return;
    }
    
    const index = currentCount + 1;
    const div = document.createElement('div');
    div.className = 'member-card';
    div.dataset.index = index;
    
    let deleteBtnHtml = '';
    if (!isMandatory) {
        deleteBtnHtml = `<button type="button" class="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 hover:bg-red-50 w-8 h-8 rounded-full flex items-center justify-center" onclick="removeMemberField(this)" title="ลบสมาชิก"><i class='bx bx-trash'></i></button>`;
    }
    
    div.innerHTML = `
        <div class="member-number">${index}</div>
        ${deleteBtnHtml}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-2">
            <div class="lg:col-span-1">
                <label class="form-label text-xs">รหัสนักเรียน <span class="text-red-500">*</span></label>
                <input type="text" class="form-control text-sm py-2 m-code" required placeholder="เช่น 12345">
            </div>
            <div class="lg:col-span-2">
                <label class="form-label text-xs">ชื่อ-นามสกุล <span class="text-red-500">*</span></label>
                <input type="text" class="form-control text-sm py-2 m-name" required placeholder="ด.ช./ด.ญ./นาย/นางสาว">
            </div>
            <div class="flex gap-2 lg:col-span-2">
                <div class="w-1/2">
                    <label class="form-label text-xs">ชั้น <span class="text-red-500">*</span></label>
                    <input type="text" class="form-control text-sm py-2 m-class" required placeholder="ม.1">
                </div>
                <div class="w-1/2">
                    <label class="form-label text-xs">ห้อง <span class="text-red-500">*</span></label>
                    <input type="text" class="form-control text-sm py-2 m-room" required placeholder="1">
                </div>
            </div>
        </div>
    `;
    
    container.appendChild(div);
    updateMemberBadge();
}

window.removeMemberField = function(btn) {
    if (!currentCompetition) return;
    
    const min = parseInt(currentCompetition.team_min) || 1;
    const container = document.getElementById('members-container');
    
    if (container.children.length <= min) {
        Swal.fire('แจ้งเตือน', `รายการนี้ต้องมีสมาชิกอย่างน้อย ${min} คน`, 'warning');
        return;
    }
    
    btn.closest('.member-card').remove();
    
    // Re-index cards
    Array.from(container.children).forEach((card, idx) => {
        const newIndex = idx + 1;
        card.dataset.index = newIndex;
        card.querySelector('.member-number').textContent = newIndex;
    });
    
    updateMemberBadge();
}

function updateMemberBadge() {
    if (!currentCompetition) return;
    
    const container = document.getElementById('members-container');
    const currentCount = container.children.length;
    const max = parseInt(currentCompetition.team_max) || 1;
    
    document.getElementById('member-count-badge').textContent = `${currentCount} / ${max} คน`;
    
    const btnAdd = document.getElementById('btn-add-member');
    if (currentCount < max) {
        btnAdd.classList.remove('hidden');
    } else {
        btnAdd.classList.add('hidden');
    }
}

async function handleRegistrationSubmit(e) {
    e.preventDefault();
    if (!currentCompetition) return;
    
    const compId = document.getElementById('comp-select').value;
    const isSingle = parseInt(currentCompetition.team_max) === 1;
    
    const members = [];
    document.querySelectorAll('.member-card').forEach(card => {
        members.push({
            student_code: card.querySelector('.m-code').value,
            full_name: card.querySelector('.m-name').value,
            class: card.querySelector('.m-class').value,
            room: card.querySelector('.m-room').value
        });
    });
    
    if (members.length === 0) {
        Swal.fire('ข้อผิดพลาด', 'กรุณาระบุข้อมูลผู้สมัครอย่างน้อย 1 คน', 'error');
        return;
    }
    
    let teamName = document.getElementById('team-name').value;
    if (isSingle) {
        teamName = members[0].full_name; // ถ้าเดี่ยว ใช้ชื่อ-สกุล เป็นชื่อทีมไปเลย
    }
    
    const contactPhone = document.getElementById('contact-phone').value;
    const leader = members[0];
    
    const payload = {
        competition_id: compId,
        competition_title: currentCompetition.title,
        team_name: teamName,
        leader_student_code: leader.student_code,
        leader_full_name: leader.full_name,
        leader_class: leader.class,
        leader_room: leader.room,
        leader_number: "",
        contact_phone: contactPhone,
        members_json: JSON.stringify(members)
    };
    
    const btn = document.getElementById('btn-submit');
    const originalText = btn.innerHTML;
    btn.innerHTML = "<i class='bx bx-loader-alt bx-spin mr-2'></i> กำลังส่งข้อมูล...";
    btn.disabled = true;
    
    try {
        const response = await apiPost('registerCompetition', payload);
        
        if (response.success) {
            document.getElementById('form-container').classList.add('hidden');
            const successState = document.getElementById('success-state');
            successState.classList.remove('hidden');
            
            document.getElementById('success-reg-code').textContent = response.registration_code;
            
            Swal.fire('สำเร็จ!', 'ลงทะเบียนเข้าร่วมการแข่งขันเรียบร้อยแล้ว', 'success');
        } else {
            Swal.fire('ข้อผิดพลาด', response.message || 'ไม่สามารถลงทะเบียนได้', 'error');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    } catch (error) {
        Swal.fire('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง', 'error');
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}
