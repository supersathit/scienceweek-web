/**
 * schedule.js - สำหรับหน้ากำหนดการ (schedule.html)
 */

document.addEventListener('DOMContentLoaded', () => {
    loadSchedule();
});

async function loadSchedule() {
    const listEl = document.getElementById('schedule-list');
    
    try {
        const response = await apiGet('getSchedule');
        
        if (response.success && response.data.length > 0) {
            listEl.innerHTML = ''; 
            // Sort data by date and then by start time
            response.data.sort((a, b) => {
                const dateA = a.date || '';
                const dateB = b.date || '';
                const compDate = dateA.localeCompare(dateB);
                if (compDate !== 0) return compDate;
                
                const timeA = a.start_time || '';
                const timeB = b.start_time || '';
                return timeA.localeCompare(timeB);
            });
            
            response.data.forEach((item, index) => {
                const row = document.createElement('div');
                row.className = 'relative flex gap-4 md:gap-8 w-full mb-8 group overflow-hidden';
                row.innerHTML = `
                    <!-- Date Column -->
                    <div class="w-24 md:w-32 flex-shrink-0 text-right pt-2">
                        <span class="block font-bold text-primary text-sm md:text-base leading-tight">${formatThaiDateTime(item.date, false)}</span>
                    </div>
                    
                    <!-- Timeline Line & Dot -->
                    <div class="flex flex-col items-center relative">
                        <div class="w-4 h-4 md:w-5 md:h-5 rounded-full bg-primary border-4 border-white shadow-sm z-10 mt-2 group-hover:scale-125 transition-transform"></div>
                        ${index !== response.data.length - 1 ? '<div class="w-0.5 bg-slate-200 flex-grow mt-2 -mb-12"></div>' : ''}
                    </div>
                    
                    <!-- Content Card -->
                    <div class="flex-grow pb-2">
                        <div class="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 group-hover:shadow-md transition-shadow group-hover:border-primary/20">
                            <h3 class="text-base md:text-lg font-bold text-slate-800 mb-2">${item.title}</h3>
                            <div class="text-sm font-medium text-slate-500 mb-2"><i class='bx bx-time'></i> ${formatThaiDateTime(item.start_time).replace(' น.', '')} - ${formatThaiDateTime(item.end_time)}</div>
                            <p class="text-slate-600 text-sm md:text-base mb-4">${item.description}</p>
                            <div class="inline-flex items-center text-xs font-medium text-secondary bg-blue-50 px-3 py-1.5 rounded-full">
                                <i class='bx bx-map mr-1.5'></i> ${item.location}
                            </div>
                        </div>
                    </div>
                `;
                listEl.appendChild(row);
            });
        } else {
            listEl.innerHTML = '<div class="text-center text-slate-500 py-10"><p>ไม่พบข้อมูลกำหนดการ</p></div>';
        }
    } catch (error) {
        listEl.innerHTML = '<div class="text-center text-red-500 py-10"><p>เกิดข้อผิดพลาดในการโหลดข้อมูล</p></div>';
        console.error(error);
    }
}
