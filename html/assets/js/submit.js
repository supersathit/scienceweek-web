/**
 * submit.js - ลอจิกสำหรับหน้าส่งผลงานออนไลน์
 */

let availableCompetitions = [];
let currentCompetition = null;

document.addEventListener('DOMContentLoaded', () => {
    loadCompetitionsForSubmission();
    
    document.getElementById('comp-select').addEventListener('change', handleCompetitionSelect);
    document.getElementById('submission-form').addEventListener('submit', handleSubmissionSubmit);
});

async function loadCompetitionsForSubmission() {
    const select = document.getElementById('comp-select');
    const loadingState = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');
    const formContainer = document.getElementById('form-container');
    
    try {
        const response = await apiGet('getCompetitions');
        
        loadingState.classList.add('hidden');
        
        if (response.success && response.data) {
            availableCompetitions = response.data.filter(c => {
                if (c.submission_open !== undefined) {
                    return c.submission_open === true || String(c.submission_open).toUpperCase() === 'TRUE';
                }
                return true;
            });
            
            if (availableCompetitions.length === 0) {
                errorState.classList.remove('hidden');
                errorState.querySelector('p').textContent = 'ขณะนี้ไม่มีรายการแข่งขันที่เปิดให้ส่งผลงาน';
                errorState.querySelector('button').style.display = 'none';
                return;
            }
            
            formContainer.classList.remove('hidden');
            
            select.innerHTML = '<option value="">-- เลือกรายการแข่งขัน --</option>';
            availableCompetitions.forEach(c => {
                const option = document.createElement('option');
                option.value = c.id;
                option.textContent = `${c.title} (${c.level})`;
                select.appendChild(option);
            });
            
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
    
    if (!compId) {
        infoText.classList.add('hidden');
        currentCompetition = null;
        return;
    }
    
    currentCompetition = availableCompetitions.find(c => c.id === compId);
    if (!currentCompetition) return;
    
    infoText.classList.remove('hidden');
    const isSingle = parseInt(currentCompetition.team_max) === 1;
    const typeText = isSingle ? 'ประเภทเดี่ยว' : 'ประเภททีม';
    
    infoText.textContent = `รูปแบบ: ${typeText} | ระดับ: ${currentCompetition.level}`;
}

async function handleSubmissionSubmit(e) {
    e.preventDefault();
    
    if (!currentCompetition) {
        Swal.fire('ข้อผิดพลาด', 'กรุณาเลือกรายการแข่งขัน', 'error');
        return;
    }
    
    const regCode = document.getElementById('reg-code').value.trim();
    const workTitle = document.getElementById('work-title').value.trim();
    const workDesc = document.getElementById('work-desc').value.trim();
    const workLink = document.getElementById('work-link').value.trim();
    const fileInput = document.getElementById('work-file');
    
    if (fileInput.files.length === 0) {
        Swal.fire('ข้อผิดพลาด', 'กรุณาแนบไฟล์ผลงาน', 'error');
        return;
    }
    
    const file = fileInput.files[0];
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
        Swal.fire('ข้อผิดพลาด', 'ขนาดไฟล์เกิน 50MB กรุณาลดขนาดไฟล์', 'error');
        return;
    }
    
    const btnSubmit = document.getElementById('btn-submit');
    const originalBtnHtml = btnSubmit.innerHTML;
    
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
        
        const reader = new FileReader();
        reader.onload = async function() {
            const result = reader.result;
            const base64Data = result.split(',')[1];
            
            const payload = {
                registration_code: regCode,
                competition_id: currentCompetition.id,
                competition_title: currentCompetition.title,
                work_title: workTitle,
                work_description: workDesc,
                external_link: workLink,
                fileName: file.name,
                fileMimeType: file.type,
                fileBase64: base64Data
            };
            
            const response = await apiPost('submitWork', payload);
            
            if (response.success) {
                Swal.close();
                document.getElementById('form-container').classList.add('hidden');
                const successState = document.getElementById('success-state');
                successState.classList.remove('hidden');
                
                document.getElementById('success-reg-code').textContent = response.submission_id || "รับผลงานแล้ว";
                
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                Swal.fire('เกิดข้อผิดพลาด', response.message || 'ไม่สามารถส่งผลงานได้', 'error');
                btnSubmit.innerHTML = originalBtnHtml;
                btnSubmit.disabled = false;
            }
        };
        
        reader.onerror = function() {
            Swal.fire('ข้อผิดพลาด', 'เกิดปัญหาในการอ่านไฟล์', 'error');
            btnSubmit.innerHTML = originalBtnHtml;
            btnSubmit.disabled = false;
        };
        
        reader.readAsDataURL(file);
        
    } catch (error) {
        console.error(error);
        Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้', 'error');
        btnSubmit.innerHTML = originalBtnHtml;
        btnSubmit.disabled = false;
    }
}
