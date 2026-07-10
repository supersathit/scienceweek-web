/**
 * competition-detail.js - สำหรับหน้าแสดงรายละเอียดการแข่งขัน
 */

document.addEventListener('DOMContentLoaded', () => {
    // Get ID from URL query string
    const urlParams = new URLSearchParams(window.location.search);
    const compId = urlParams.get('id');
    
    if (compId) {
        loadCompetitionDetail(compId);
    } else {
        showError();
    }
});

async function loadCompetitionDetail(id) {
    const loading = document.getElementById('detail-loading');
    const content = document.getElementById('detail-content');
    const errorState = document.getElementById('detail-error');
    
    try {
        const response = await apiGet('getCompetition', { id: id });
        
        loading.classList.add('hidden');
        
        if (response.success && response.data) {
            const data = response.data;
            content.classList.remove('hidden');
            
            // Populate data
            document.getElementById('c-title').textContent = data.title;
            document.getElementById('c-desc').textContent = data.description || '';
            document.getElementById('c-category').textContent = data.category;
            document.getElementById('c-level').textContent = data.level;
            document.getElementById('c-team').textContent = `${data.team_min} - ${data.team_max} คน/ทีม`;
            document.getElementById('c-date').textContent = formatThaiDateTime(data.competition_date || data.date) || '-';
            document.getElementById('c-location').textContent = data.location || '-';
            
            document.getElementById('c-rules').innerHTML = data.rules || '<p>ไม่มีระบุกติกาเพิ่มเติม</p>';
            document.getElementById('c-criteria').innerHTML = data.judging_criteria || '<p>ไม่มีระบุเกณฑ์การตัดสินเพิ่มเติม</p>';
            
            const statusBadge = document.getElementById('c-status');
            const btnRegister = document.getElementById('btn-register');
            const btnSubmit = document.getElementById('btn-submit');
            
            const isRegOpen = data.register_open === true || String(data.register_open).toUpperCase() === 'TRUE';
            const isSubOpen = data.submission_open === true || String(data.submission_open).toUpperCase() === 'TRUE';
            
            if (isRegOpen) {
                statusBadge.textContent = 'เปิดรับสมัคร';
                statusBadge.className = 'px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold border border-green-200';
                btnRegister.style.display = 'inline-flex';
                btnRegister.href = `register.html?id=${data.id}`;
            } else {
                statusBadge.textContent = 'ปิดรับสมัคร';
                statusBadge.className = 'px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm font-semibold border border-slate-200';
            }
            
            if (isSubOpen) {
                btnSubmit.style.display = 'inline-flex';
                btnSubmit.href = `submit.html?id=${data.id}`;
            }
            
        } else {
            showError();
        }
    } catch (error) {
        console.error(error);
        loading.classList.add('hidden');
        showError();
    }
}

function showError() {
    document.getElementById('detail-loading').classList.add('hidden');
    document.getElementById('detail-content').classList.add('hidden');
    document.getElementById('detail-error').classList.remove('hidden');
}
