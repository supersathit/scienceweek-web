/**
 * home.js - สำหรับหน้าแรก (index.html)
 */

document.addEventListener('DOMContentLoaded', () => {
    loadAnnouncements();
    loadStats();
});

async function loadAnnouncements() {
    const listEl = document.getElementById('announcement-list');
    
    try {
        const response = await apiGet('getAnnouncements');
        
        if (response.success && response.data.length > 0) {
            listEl.innerHTML = ''; // Clear loading
            
            response.data.forEach(item => {
                const card = document.createElement('div');
                card.className = 'announcement-card';
                card.innerHTML = `
                    <span class="announcement-date"><i class='bx bx-calendar'></i> ${formatThaiDateTime(item.date || item.created_at, false)}</span>
                    <h3>${item.title}</h3>
                    <p>${item.content}</p>
                `;
                listEl.appendChild(card);
            });
        } else {
            listEl.innerHTML = '<div class="loading-state"><p>ยังไม่มีข่าวประกาศในขณะนี้</p></div>';
        }
    } catch (error) {
        listEl.innerHTML = '<div class="text-center text-red-500 py-10"><p>เกิดข้อผิดพลาดในการโหลดข้อมูล</p></div>';
        console.error(error);
    }
}

async function loadStats() {
    try {
        const response = await apiGet('getCompetitions');
        if (response.success && response.data) {
            const comps = response.data;
            const countEl = document.getElementById('stat-comp-count');
            if (countEl) countEl.textContent = comps.length;
            
            const categories = new Set();
            comps.forEach(c => {
                if (c.category) categories.add(c.category);
            });
            
            const catCountEl = document.getElementById('stat-cat-count');
            if (catCountEl) catCountEl.textContent = categories.size;
            
            const catNamesEl = document.getElementById('stat-cat-names');
            if (catNamesEl && categories.size > 0) {
                // Get up to 3 categories to display
                const catArray = Array.from(categories).slice(0, 3);
                catNamesEl.textContent = catArray.join(' ');
            }
        }
    } catch (error) {
        console.error("Failed to load stats:", error);
    }
}
