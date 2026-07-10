/**
 * api.js - จัดการการเชื่อมต่อกับ Google Apps Script Backend
 */

async function apiGet(action, params = {}) {
    // กรณีเปิดโหมด Mock Data หรือ URL ยังเป็น Placeholder ให้คืนค่า Mock Data
    if (CONFIG.USE_MOCK_DATA || CONFIG.API_URL.includes('placeholder')) {
        return getMockData(action, params);
    }

    try {
        const url = new URL(CONFIG.API_URL);
        url.searchParams.set("action", action);
        
        Object.keys(params).forEach((key) => {
            url.searchParams.set(key, params[key]);
        });
        
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error("API Fetch Error:", error);
        // Fallback to mock data on error for demo purposes
        return getMockData(action, params);
    }
}

async function apiPost(action, data = {}) {
    if (CONFIG.USE_MOCK_DATA || CONFIG.API_URL.includes('placeholder')) {
        return { success: true, message: "Mock: ทำรายการสำเร็จ", data: data };
    }

    try {
        const url = new URL(CONFIG.API_URL);
        url.searchParams.set("action", action);
        
        const response = await fetch(url, {
            method: "POST",
            body: JSON.stringify(data)
        });
        
        return await response.json();
    } catch (error) {
        console.error("API Fetch Error:", error);
        return { success: false, message: "เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย" };
    }
}

// ----------------------------------------------------
// ระบบจำลองข้อมูล (Mock Data) สำหรับการพัฒนา (Phase 1)
// ----------------------------------------------------
function getMockData(action, params) {
    return new Promise((resolve) => {
        // หน่วงเวลาจำลอง network latency (500ms)
        setTimeout(() => {
            switch(action) {
                case 'getAnnouncements':
                    resolve({
                        success: true,
                        data: [
                            { id: 1, title: "เปิดรับสมัครแข่งขันทุกรายการแล้ววันนี้!", date: "10 ก.ค. 2569", content: "เริ่มสมัครได้ตั้งแต่วันที่ 10-31 ก.ค. นี้" },
                            { id: 2, title: "อัปเดตเกณฑ์การแข่งขันตอบปัญหา", date: "12 ก.ค. 2569", content: "เพิ่มเนื้อหาเกี่ยวกับเทคโนโลยี AI ในหมวดหมู่ ม.ปลาย" }
                        ]
                    });
                    break;
                case 'getSchedule':
                    resolve({
                        success: true,
                        data: [
                            { date: "18 ส.ค. 2569", start_time: "08.30", end_time: "09.00", title: "พิธีเปิดงานสัปดาห์วิทยาศาสตร์", location: "หอประชุมใหญ่", description: "โดยท่านผู้อำนวยการโรงเรียน" },
                            { date: "18 ส.ค. 2569", start_time: "09.30", end_time: "12.00", title: "แข่งขันตอบปัญหาวิทยาศาสตร์ รอบคัดเลือก", location: "ห้องประชุม 1 และ 2", description: "ทุกระดับชั้น" },
                            { date: "18 ส.ค. 2569", start_time: "13.00", end_time: "15.30", title: "ประกวดโครงงานวิทยาศาสตร์และนวัตกรรม", location: "ลานกิจกรรม", description: "นำเสนอผลงานพร้อมบูธจัดแสดง" }
                        ]
                    });
                    break;
                case 'getCompetitions':
                    resolve({
                        success: true,
                        data: [
                            { id: "C001", title: "ตอบปัญหาวิทยาศาสตร์", category: "วิชาการ", level: "ม.1-ม.6", team_min: 2, team_max: 2, register_open: true, submission_open: false, submission_type: "none" },
                            { id: "C002", title: "โครงงานวิทยาศาสตร์ประเภททดลอง", category: "โครงงาน", level: "ม.1-ม.6", team_min: 2, team_max: 3, register_open: true, submission_open: true, submission_type: "file" },
                            { id: "C003", title: "ประกวดคลิปสั้น นวัตกรรมรักษ์โลก", category: "สื่อสร้างสรรค์", level: "ม.1-ม.6", team_min: 1, team_max: 3, register_open: true, submission_open: true, submission_type: "link" },
                            { id: "C004", title: "แข่งขัน E-Sports เกมสร้างเมือง", category: "สื่อสร้างสรรค์", level: "ม.4-ม.6", team_min: 5, team_max: 5, register_open: false, submission_open: false, submission_type: "none" }
                        ]
                    });
                    break;
                case 'getCompetition':
                    const comps = {
                        "C001": { id: "C001", title: "ตอบปัญหาวิทยาศาสตร์", category: "วิชาการ", level: "ม.1-ม.6", team_min: 2, team_max: 2, register_open: true, submission_open: false, date: "18 ส.ค. 2569", location: "ห้องประชุม 1", description: "การแข่งขันตอบปัญหาทางวิทยาศาสตร์ครอบคลุมเนื้อหา ฟิสิกส์ เคมี ชีววิทยา และวิทยาศาสตร์ทั่วไป", rules: "<ul><li>ทีมละ 2 คน</li><li>ข้อสอบปรนัย 100 ข้อ เวลา 90 นาที</li><li>ห้ามนำเครื่องมือสื่อสารเข้าห้องสอบ</li></ul>", judging_criteria: "<ul><li>คะแนนสูงสุด 3 ลำดับแรก ได้รับรางวัล</li><li>กรณีคะแนนเท่ากัน จะพิจารณาจากเวลาที่ส่งข้อสอบ</li></ul>" },
                        "C002": { id: "C002", title: "โครงงานวิทยาศาสตร์", category: "โครงงาน", level: "ม.1-ม.6", team_min: 2, team_max: 3, register_open: true, submission_open: true, date: "18 ส.ค. 2569", location: "ลานกิจกรรม", description: "ประกวดโครงงานประเภททดลอง หรือสิ่งประดิษฐ์", rules: "<ul><li>ต้องส่งเล่มรายงานล่วงหน้าเป็นไฟล์ PDF</li><li>นำเสนอผลงาน 10 นาที ตอบคำถาม 5 นาที</li></ul>", judging_criteria: "<ul><li>ความคิดสร้างสรรค์ 30%</li><li>ความถูกต้องตามหลักวิทยาศาสตร์ 40%</li><li>การนำเสนอ 30%</li></ul>" }
                    };
                    resolve({
                        success: true,
                        data: comps[params.id] || comps["C001"]
                    });
                    break;
                default:
                    resolve({ success: false, message: "Action not found" });
            }
        }, 500);
    });
}

// ----------------------------------------------------
// Helpers
// ----------------------------------------------------
function formatThaiDateTime(dateString, includeTime = true) {
    if (!dateString) return '-';
    // Check if it's already in Thai format
    if (/[ก-๙]/.test(dateString)) return dateString;
    
    // Check if it's just a time "HH:mm" or "HH:mm:ss" or "HH.mm"
    if (/^\d{2}[:.]\d{2}([:.]\d{2})?$/.test(dateString)) {
        return `${dateString.substring(0, 5).replace(':', '.')} น.`;
    }
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        
        const thaiMonths = [
            "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
            "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
        ];
        
        const d = date.getDate();
        const m = thaiMonths[date.getMonth()];
        const y = date.getFullYear() + 543;
        
        // Handle Google Sheets Time-only values (which default to year 1899)
        if (date.getFullYear() === 1899) {
            const hrs = String(date.getHours()).padStart(2, '0');
            const mins = String(date.getMinutes()).padStart(2, '0');
            return `${hrs}.${mins} น.`;
        }
        
        if (includeTime && (dateString.includes('T') || dateString.includes(' '))) {
            const hrs = String(date.getHours()).padStart(2, '0');
            const mins = String(date.getMinutes()).padStart(2, '0');
            return `${d} ${m} ${y} เวลา ${hrs}.${mins} น.`;
        }
        return `${d} ${m} ${y}`;
    } catch(e) {
        return dateString;
    }
}
