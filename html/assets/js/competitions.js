/**
 * competitions.js - สำหรับหน้ารายการแข่งขัน (competitions.html)
 */

let allCompetitions = [];

document.addEventListener('DOMContentLoaded', () => {
    loadCompetitions();
    setupFilters();
});

async function loadCompetitions() {
    const listEl = document.getElementById('competition-list');
    
    try {
        const response = await apiGet('getCompetitions');
        
        if (response.success && response.data.length > 0) {
            allCompetitions = response.data;
            renderCompetitions(allCompetitions);
        } else {
            listEl.innerHTML = '<div class="loading-state" style="grid-column: 1 / -1;"><p>ไม่พบรายการแข่งขัน</p></div>';
        }
    } catch (error) {
        listEl.innerHTML = '<div class="loading-state" style="grid-column: 1 / -1;"><p>เกิดข้อผิดพลาดในการโหลดข้อมูล</p></div>';
        console.error(error);
    }
}

function renderCompetitions(data) {
    const listEl = document.getElementById('competition-list');
    listEl.innerHTML = '';
    
    if(data.length === 0) {
        listEl.innerHTML = '<div class="col-span-full text-center py-10 text-slate-500"><p>ไม่พบรายการแข่งขันที่ตรงกับเงื่อนไข</p></div>';
        return;
    }
    
    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'glass-panel p-6 rounded-2xl flex flex-col hover:-translate-y-2 transition-transform duration-300';
        
        const isRegOpen = item.register_open === true || String(item.register_open).toUpperCase() === 'TRUE';
        const statusBadge = isRegOpen
            ? '<span class="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold border border-green-200">เปิดรับสมัคร</span>'
            : '<span class="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200">ปิดรับสมัคร</span>';

        card.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <span class="text-xs font-semibold text-primary uppercase tracking-wider bg-accent px-3 py-1 rounded-full">${item.category}</span>
                ${statusBadge}
            </div>
            <h3 class="text-xl font-bold mb-4 text-slate-800 line-clamp-2 min-h-[3.5rem]">${item.title}</h3>
            <div class="space-y-3 mb-6 flex-grow border-t border-slate-100 pt-4">
                <div class="flex items-center text-sm text-slate-600">
                    <div class="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3 text-secondary">
                        <i class='bx ${parseInt(item.team_max) === 1 ? "bx-user" : "bx-group"}'></i>
                    </div>
                    <span>${parseInt(item.team_max) === 1 ? "ประเภทเดี่ยว (1 คน)" : `ประเภททีม (${item.team_min}-${item.team_max} คน)`}</span>
                </div>
                <div class="flex items-center text-sm text-slate-600">
                    <div class="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center mr-3 text-primary">
                        <i class='bx bx-group'></i>
                    </div>
                    <span>${item.level}</span>
                </div>
            </div>
            <a href="competition-detail.html?id=${item.id}" class="btn btn-outline w-full text-center group">
                ดูรายละเอียด <i class='bx bx-right-arrow-alt ml-1 group-hover:translate-x-1 transition-transform'></i>
            </a>
        `;
        listEl.appendChild(card);
    });
}

function setupFilters() {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Update active state
            buttons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            // Filter data
            const filterValue = e.target.getAttribute('data-filter');
            if (filterValue === 'all') {
                renderCompetitions(allCompetitions);
            } else {
                const filtered = allCompetitions.filter(c => c.category === filterValue);
                renderCompetitions(filtered);
            }
        });
    });
}
