# โครงสร้างระบบเว็บไซต์สัปดาห์วิทยาศาสตร์โรงเรียน

## แนวคิดหลักของระบบ

ระบบนี้ออกแบบสำหรับใช้ประชาสัมพันธ์กิจกรรม **สัปดาห์วิทยาศาสตร์ของโรงเรียน** โดยเน้นให้ระบบไม่ใหญ่เกินไป ดูแลง่าย และเหมาะกับการใช้งานจริงในโรงเรียน

แนวทางที่เลือกใช้คือ

- **หน้าบ้าน:** GitHub Pages
- **หลังบ้าน:** Google Apps Script
- **ฐานข้อมูล:** Google Sheet
- **ที่เก็บไฟล์ผลงาน:** Google Drive

ระบบนี้เหมาะสำหรับปีแรกที่ต้องการทดลองใช้งานจริง โดยยังไม่จำเป็นต้องมี Server, Database Server หรือระบบ Login ที่ซับซ้อน

---

## ภาพรวมโครงสร้างระบบ

```text
นักเรียน / ครู / ผู้ปกครอง
        |
        v
GitHub Pages
- หน้าแรกประชาสัมพันธ์
- รายการแข่งขัน
- สมัครแข่งขัน
- ส่งผลงานออนไลน์บางรายการ
- ตรวจสอบสถานะ
        |
        v
Google Apps Script Web App
- รับข้อมูลสมัคร
- ตรวจสอบข้อมูล
- บันทึกลง Google Sheet
- รับข้อมูลการส่งผลงาน
- อัปโหลดไฟล์เข้า Google Drive
        |
        +-------------------+
        |                   |
        v                   v
Google Sheet            Google Drive
เก็บข้อมูลระบบ          เก็บไฟล์ผลงาน
```

---

## เหตุผลที่เลือกโครงสร้างนี้

โครงสร้างนี้เหมาะกับงานโรงเรียน เพราะ

1. ใช้บริการฟรีหรือมีต้นทุนต่ำ
2. ไม่ต้องเช่า Hosting หรือ VPS
3. ไม่ต้องติดตั้งฐานข้อมูลเอง
4. ครูสามารถดูข้อมูลผ่าน Google Sheet ได้ทันที
5. สามารถ Export ข้อมูลเป็น Excel หรือ CSV ได้ง่าย
6. GitHub Pages เหมาะกับเว็บประชาสัมพันธ์
7. Google Apps Script ใช้เป็น API หลังบ้านได้
8. Google Drive เหมาะกับการเก็บไฟล์ผลงานของนักเรียน
9. ระบบไม่ใหญ่เกินไปสำหรับใช้งานปีแรก

---

# 1. ขอบเขตระบบ

## 1.1 ฟีเจอร์หลัก

ระบบควรมีฟีเจอร์หลักดังนี้

```text
1. หน้าแรกประชาสัมพันธ์กิจกรรม
2. แสดงกำหนดการสัปดาห์วิทยาศาสตร์
3. แสดงรายการแข่งขัน
4. แสดงรายละเอียดการแข่งขันแต่ละรายการ
5. สมัครแข่งขันออนไลน์
6. ส่งผลงานออนไลน์ได้เฉพาะบางรายการ
7. ตรวจสอบสถานะการสมัคร
8. ตรวจสอบสถานะการส่งผลงาน
9. หน้า Admin แบบง่าย
10. Export ข้อมูลจาก Google Sheet
```

---

## 1.2 ฟีเจอร์ที่ยังไม่ควรทำในปีแรก

เพื่อไม่ให้ระบบใหญ่เกินไป ปีแรกยังไม่ควรทำฟีเจอร์ต่อไปนี้

```text
- ระบบ Login นักเรียนเต็มรูปแบบ
- ระบบ Login ครูหลายระดับ
- ระบบให้คะแนนกรรมการออนไลน์
- ระบบประกาศผลแบบซับซ้อน
- ระบบออกเกียรติบัตรอัตโนมัติ
- ระบบแจ้งเตือนผ่าน Line หรือ Email
- ระบบ Dashboard เชิงวิเคราะห์ขั้นสูง
```

สามารถเพิ่มในปีถัดไปได้ หากระบบปีแรกใช้งานได้ดี

---

# 2. โครงสร้างหน้าเว็บ

## 2.1 หน้าแรก `/`

หน้าแรกใช้สำหรับประชาสัมพันธ์ภาพรวมของงาน

เนื้อหาที่ควรมี

```text
- ชื่อกิจกรรม: สัปดาห์วิทยาศาสตร์ โรงเรียนวัชรวิทยา
- ปีการศึกษา
- วันที่จัดกิจกรรม
- สถานที่จัดกิจกรรม
- ภาพ Banner
- คำอธิบายกิจกรรมสั้น ๆ
- ปุ่มดูรายการแข่งขัน
- ปุ่มสมัครแข่งขัน
- ข่าวประกาศล่าสุด
```

---

## 2.2 หน้ากำหนดการ `/schedule`

ใช้แสดงตารางกิจกรรมตลอดงาน

ข้อมูลที่ควรแสดง

```text
- วันจัดกิจกรรม
- เวลา
- ชื่อกิจกรรม
- สถานที่
- ผู้รับผิดชอบ
```

ตัวอย่าง

| เวลา | กิจกรรม | สถานที่ |
|---|---|---|
| 08.30 - 09.00 | พิธีเปิด | หอประชุม |
| 09.00 - 12.00 | การแข่งขันตอบปัญหาวิทยาศาสตร์ | ห้องวิทยาศาสตร์ |
| 13.00 - 15.00 | นิทรรศการวิทยาศาสตร์ | อาคารเรียนรวม |

---

## 2.3 หน้ารายการแข่งขัน `/competitions`

ใช้แสดงรายการแข่งขันทั้งหมด

ข้อมูลที่ควรแสดงในแต่ละรายการ

```text
- ชื่อการแข่งขัน
- หมวดหมู่
- ระดับชั้นที่สมัครได้
- จำนวนสมาชิกต่อทีม
- สถานะเปิด/ปิดรับสมัคร
- สถานะเปิด/ปิดส่งผลงาน
- ปุ่มดูรายละเอียด
```

---

## 2.4 หน้ารายละเอียดการแข่งขัน `/competition-detail.html?id=C001`

ใช้แสดงรายละเอียดของการแข่งขันแต่ละรายการ

ข้อมูลที่ควรมี

```text
- ชื่อการแข่งขัน
- คำอธิบาย
- กติกา
- เกณฑ์การตัดสิน
- ระดับชั้นที่สมัครได้
- จำนวนสมาชิกขั้นต่ำ
- จำนวนสมาชิกสูงสุด
- วันและเวลาการแข่งขัน
- สถานที่แข่งขัน
- สถานะการรับสมัคร
- สถานะการส่งผลงาน
- ปุ่มสมัครแข่งขัน
- ปุ่มส่งผลงาน หากรายการนั้นเปิดให้ส่งออนไลน์
```

---

## 2.5 หน้าสมัครแข่งขัน `/register`

ข้อมูลที่นักเรียนต้องกรอก

```text
- เลือกรายการแข่งขัน
- ชื่อทีม ถ้ามี
- รหัสนักเรียนหัวหน้าทีม
- ชื่อ-สกุลหัวหน้าทีม
- ชั้น
- ห้อง
- เลขที่
- เบอร์โทรติดต่อ
- สมาชิกในทีมเพิ่มเติม
```

เมื่อสมัครสำเร็จ ระบบจะสร้างรหัสการสมัคร เช่น

```text
SCI2026-0001
```

นักเรียนควรบันทึกรหัสนี้ไว้สำหรับ

```text
- ตรวจสอบสถานะการสมัคร
- ส่งผลงานออนไลน์
- ติดต่อครูผู้รับผิดชอบ
```

---

## 2.6 หน้าส่งผลงาน `/submit`

ใช้สำหรับรายการแข่งขันที่อนุญาตให้ส่งผลงานออนไลน์เท่านั้น

ข้อมูลที่ต้องกรอก

```text
- รหัสการสมัคร
- รหัสนักเรียนหัวหน้าทีม
- ชื่อผลงาน
- คำอธิบายผลงาน
- แนบไฟล์ผลงาน หรือวางลิงก์ผลงาน
```

ประเภทการส่งผลงานที่รองรับ

```text
none       = ไม่ต้องส่งผลงานออนไลน์
file       = ส่งเป็นไฟล์
link       = ส่งเป็นลิงก์
both       = ส่งได้ทั้งไฟล์และลิงก์
```

---

## 2.7 หน้าตรวจสอบสถานะ `/check`

ใช้สำหรับตรวจสอบข้อมูลหลังสมัคร

นักเรียนกรอก

```text
- รหัสการสมัคร
```

ระบบแสดง

```text
- ชื่อรายการแข่งขัน
- ชื่อทีม
- รายชื่อสมาชิก
- สถานะการสมัคร
- สถานะการส่งผลงาน
- วันที่สมัคร
- วันที่ส่งผลงาน
```

---

## 2.8 หน้า Admin `/admin`

ปีแรกควรทำเป็นหน้า Admin แบบง่าย

ฟีเจอร์ที่ควรมี

```text
- กรอกรหัสผ่านครูแบบง่าย
- ดูรายชื่อผู้สมัคร
- ค้นหาตามรายการแข่งขัน
- ดูรายการส่งผลงาน
- เปิด/ปิดรับสมัคร
- เปิด/ปิดส่งผลงาน
- Export CSV
```

หมายเหตุ: ถ้ายังไม่อยากทำหน้า Admin ในปีแรก สามารถให้ครูจัดการข้อมูลผ่าน Google Sheet โดยตรงก่อนได้

---

# 3. โครงสร้าง Google Sheet

ใช้ Google Sheet 1 ไฟล์ แล้วแบ่งเป็นหลายชีต

```text
science_week_database
├── competitions
├── registrations
├── submissions
├── announcements
├── schedule
├── settings
└── admin_logs
```

---

## 3.1 Sheet: `competitions`

ใช้เก็บข้อมูลรายการแข่งขัน

| Column | คำอธิบาย |
|---|---|
| id | รหัสรายการแข่งขัน |
| title | ชื่อการแข่งขัน |
| category | หมวดหมู่การแข่งขัน |
| level | ระดับชั้นที่สมัครได้ |
| team_min | จำนวนสมาชิกขั้นต่ำ |
| team_max | จำนวนสมาชิกสูงสุด |
| description | รายละเอียดการแข่งขัน |
| rules | กติกา |
| judging_criteria | เกณฑ์การตัดสิน |
| location | สถานที่แข่งขัน |
| competition_date | วันและเวลาแข่งขัน |
| register_open | เปิดรับสมัครหรือไม่ |
| submission_open | เปิดส่งผลงานหรือไม่ |
| submission_type | none/file/link/both |
| created_at | วันที่สร้างข้อมูล |
| updated_at | วันที่แก้ไขล่าสุด |

ตัวอย่างข้อมูล

| id | title | category | level | team_min | team_max | register_open | submission_open | submission_type |
|---|---|---|---|---:|---:|---|---|---|
| C001 | ตอบปัญหาวิทยาศาสตร์ | วิชาการ | ม.1-ม.3 | 2 | 2 | TRUE | FALSE | none |
| C002 | โครงงานวิทยาศาสตร์ | โครงงาน | ม.4-ม.6 | 2 | 3 | TRUE | TRUE | file |
| C003 | คลิปสั้นวิทยาศาสตร์ | สื่อสร้างสรรค์ | ม.1-ม.6 | 1 | 3 | TRUE | TRUE | link |

---

## 3.2 Sheet: `registrations`

ใช้เก็บข้อมูลการสมัครแข่งขัน

| Column | คำอธิบาย |
|---|---|
| registration_code | รหัสการสมัคร |
| competition_id | รหัสรายการแข่งขัน |
| competition_title | ชื่อการแข่งขัน |
| team_name | ชื่อทีม |
| leader_student_code | รหัสนักเรียนหัวหน้าทีม |
| leader_full_name | ชื่อ-สกุลหัวหน้าทีม |
| leader_class | ชั้น |
| leader_room | ห้อง |
| leader_number | เลขที่ |
| contact_phone | เบอร์โทรติดต่อ |
| members_json | ข้อมูลสมาชิกในทีมแบบ JSON |
| status | pending/approved/rejected |
| created_at | วันที่สมัคร |
| updated_at | วันที่แก้ไข |

ตัวอย่าง `members_json`

```json
[
  {
    "student_code": "12345",
    "full_name": "เด็กชายตัวอย่าง หนึ่ง",
    "class": "ม.4",
    "room": "1",
    "number": "12"
  },
  {
    "student_code": "12346",
    "full_name": "เด็กหญิงตัวอย่าง สอง",
    "class": "ม.4",
    "room": "1",
    "number": "15"
  }
]
```

---

## 3.3 Sheet: `submissions`

ใช้เก็บข้อมูลการส่งผลงาน

| Column | คำอธิบาย |
|---|---|
| submission_id | รหัสการส่งผลงาน |
| registration_code | รหัสการสมัคร |
| competition_id | รหัสการแข่งขัน |
| competition_title | ชื่อการแข่งขัน |
| work_title | ชื่อผลงาน |
| work_description | คำอธิบายผลงาน |
| file_url | ลิงก์ไฟล์ใน Google Drive |
| external_link | ลิงก์ผลงานภายนอก |
| status | submitted/checked |
| submitted_at | วันที่ส่ง |
| updated_at | วันที่แก้ไข |

---

## 3.4 Sheet: `announcements`

ใช้เก็บข่าวประกาศ

| Column | คำอธิบาย |
|---|---|
| id | รหัสข่าว |
| title | หัวข้อข่าว |
| content | เนื้อหา |
| published | แสดงบนเว็บหรือไม่ |
| created_at | วันที่ประกาศ |

---

## 3.5 Sheet: `schedule`

ใช้เก็บกำหนดการกิจกรรม

| Column | คำอธิบาย |
|---|---|
| id | รหัสกำหนดการ |
| date | วันที่ |
| start_time | เวลาเริ่ม |
| end_time | เวลาสิ้นสุด |
| title | ชื่อกิจกรรม |
| location | สถานที่ |
| description | รายละเอียด |

---

## 3.6 Sheet: `settings`

ใช้เก็บค่าพื้นฐานของระบบ

| key | value |
|---|---|
| site_title | สัปดาห์วิทยาศาสตร์ โรงเรียนวัชรวิทยา |
| academic_year | 2569 |
| event_date | 18 สิงหาคม 2569 |
| register_enabled | TRUE |
| submission_enabled | TRUE |
| contact_teacher | กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี |

---

## 3.7 Sheet: `admin_logs`

ใช้เก็บประวัติการทำงานของผู้ดูแลระบบ

| Column | คำอธิบาย |
|---|---|
| id | รหัส log |
| action | การกระทำ |
| detail | รายละเอียด |
| created_at | วันที่ทำรายการ |

---

# 4. โครงสร้าง API ด้วย Google Apps Script

## 4.1 รูปแบบ API

ใช้ URL ของ Apps Script Web App แล้วแยกคำสั่งด้วย `action`

ตัวอย่าง

```text
GET  https://script.google.com/macros/s/xxxxx/exec?action=getCompetitions
GET  https://script.google.com/macros/s/xxxxx/exec?action=getCompetition&id=C001
GET  https://script.google.com/macros/s/xxxxx/exec?action=getAnnouncements
GET  https://script.google.com/macros/s/xxxxx/exec?action=getSchedule
GET  https://script.google.com/macros/s/xxxxx/exec?action=checkStatus&code=SCI2026-0001

POST https://script.google.com/macros/s/xxxxx/exec?action=register
POST https://script.google.com/macros/s/xxxxx/exec?action=submitWork
POST https://script.google.com/macros/s/xxxxx/exec?action=adminLogin
POST https://script.google.com/macros/s/xxxxx/exec?action=updateCompetitionStatus
```

---

## 4.2 รายการ API ที่ควรมี

| Method | Action | หน้าที่ |
|---|---|---|
| GET | getSettings | ดึงค่าพื้นฐานของระบบ |
| GET | getAnnouncements | ดึงข่าวประกาศ |
| GET | getSchedule | ดึงกำหนดการ |
| GET | getCompetitions | ดึงรายการแข่งขันทั้งหมด |
| GET | getCompetition | ดึงรายละเอียดการแข่งขัน |
| GET | checkStatus | ตรวจสอบสถานะการสมัคร |
| POST | register | สมัครแข่งขัน |
| POST | submitWork | ส่งผลงาน |
| POST | adminLogin | เข้าสู่ระบบ Admin แบบง่าย |
| POST | updateCompetitionStatus | เปิด/ปิดรับสมัครหรือส่งผลงาน |

---

## 4.3 ตัวอย่าง Response

### สมัครสำเร็จ

```json
{
  "success": true,
  "message": "สมัครแข่งขันสำเร็จ",
  "registration_code": "SCI2026-0001"
}
```

### ตรวจสอบสถานะ

```json
{
  "success": true,
  "data": {
    "registration_code": "SCI2026-0001",
    "competition_title": "โครงงานวิทยาศาสตร์",
    "team_name": "ทีมวิทย์สร้างสรรค์",
    "status": "pending",
    "submission_status": "submitted"
  }
}
```

### เกิดข้อผิดพลาด

```json
{
  "success": false,
  "message": "ไม่พบรหัสการสมัคร"
}
```

---

# 5. โครงสร้างไฟล์ Frontend

แนะนำให้เริ่มจาก HTML/CSS/JavaScript ธรรมดาก่อน เพราะระบบไม่ใหญ่และดูแลง่าย

```text
science-week-web/
├── index.html
├── schedule.html
├── competitions.html
├── competition-detail.html
├── register.html
├── submit.html
├── check.html
├── admin.html
├── assets/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── config.js
│   │   ├── api.js
│   │   ├── home.js
│   │   ├── schedule.js
│   │   ├── competitions.js
│   │   ├── competition-detail.js
│   │   ├── register.js
│   │   ├── submit.js
│   │   ├── check.js
│   │   └── admin.js
│   └── images/
│       ├── logo.png
│       └── banner.png
└── README.md
```

---

## 5.1 หน้าที่ของแต่ละไฟล์

| ไฟล์ | หน้าที่ |
|---|---|
| index.html | หน้าแรก |
| schedule.html | แสดงกำหนดการ |
| competitions.html | แสดงรายการแข่งขัน |
| competition-detail.html | แสดงรายละเอียดการแข่งขัน |
| register.html | ฟอร์มสมัครแข่งขัน |
| submit.html | ฟอร์มส่งผลงาน |
| check.html | ตรวจสอบสถานะ |
| admin.html | หน้า Admin |
| config.js | เก็บ URL ของ Apps Script |
| api.js | รวมฟังก์ชันเรียก API |
| style.css | ตกแต่งเว็บ |

---

## 5.2 ตัวอย่าง `config.js`

```javascript
const CONFIG = {
  API_URL: "https://script.google.com/macros/s/ใส่รหัสของคุณ/exec",
  SITE_TITLE: "สัปดาห์วิทยาศาสตร์ โรงเรียนวัชรวิทยา"
};
```

---

## 5.3 ตัวอย่าง `api.js`

```javascript
async function apiGet(action, params = {}) {
  const url = new URL(CONFIG.API_URL);
  url.searchParams.set("action", action);

  Object.keys(params).forEach((key) => {
    url.searchParams.set(key, params[key]);
  });

  const response = await fetch(url);
  return await response.json();
}

async function apiPost(action, data = {}) {
  const url = new URL(CONFIG.API_URL);
  url.searchParams.set("action", action);

  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(data)
  });

  return await response.json();
}
```

---

# 6. โครงสร้างไฟล์ Google Apps Script

```text
apps-script/
├── Code.gs
├── Config.gs
├── Api.gs
├── CompetitionService.gs
├── RegistrationService.gs
├── SubmissionService.gs
├── SheetService.gs
├── DriveService.gs
└── AdminService.gs
```

ถ้าต้องการทำแบบง่ายมาก สามารถรวมทั้งหมดไว้ใน `Code.gs` ไฟล์เดียวก่อนได้

---

## 6.1 ตัวอย่าง `Code.gs`

```javascript
function doGet(e) {
  const action = e.parameter.action;

  try {
    if (action === "getSettings") {
      return jsonResponse(getSettings());
    }

    if (action === "getAnnouncements") {
      return jsonResponse(getAnnouncements());
    }

    if (action === "getSchedule") {
      return jsonResponse(getSchedule());
    }

    if (action === "getCompetitions") {
      return jsonResponse(getCompetitions());
    }

    if (action === "getCompetition") {
      return jsonResponse(getCompetition(e.parameter.id));
    }

    if (action === "checkStatus") {
      return jsonResponse(checkStatus(e.parameter.code));
    }

    return jsonResponse({
      success: false,
      message: "Invalid action"
    });
  } catch (error) {
    return jsonResponse({
      success: false,
      message: error.message
    });
  }
}

function doPost(e) {
  const action = e.parameter.action;
  const data = JSON.parse(e.postData.contents);

  try {
    if (action === "register") {
      return jsonResponse(registerStudent(data));
    }

    if (action === "submitWork") {
      return jsonResponse(submitWork(data));
    }

    if (action === "adminLogin") {
      return jsonResponse(adminLogin(data));
    }

    if (action === "updateCompetitionStatus") {
      return jsonResponse(updateCompetitionStatus(data));
    }

    return jsonResponse({
      success: false,
      message: "Invalid action"
    });
  } catch (error) {
    return jsonResponse({
      success: false,
      message: error.message
    });
  }
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

---

# 7. Flow การทำงานของระบบ

## 7.1 Flow การดูรายการแข่งขัน

```text
1. ผู้ใช้เปิดหน้า competitions.html
2. JavaScript เรียก API action=getCompetitions
3. Apps Script อ่านข้อมูลจาก Sheet competitions
4. ส่งข้อมูลกลับเป็น JSON
5. Frontend แสดงรายการแข่งขันบนหน้าเว็บ
```

---

## 7.2 Flow การสมัครแข่งขัน

```text
1. นักเรียนเปิดหน้า register.html
2. เลือกรายการแข่งขัน
3. กรอกข้อมูลหัวหน้าทีมและสมาชิก
4. Frontend ส่งข้อมูลไปที่ Apps Script
5. Apps Script ตรวจสอบว่ารายการเปิดรับสมัครหรือไม่
6. Apps Script ตรวจสอบจำนวนสมาชิกตาม team_min/team_max
7. Apps Script สร้าง registration_code
8. Apps Script บันทึกข้อมูลลง Sheet registrations
9. ระบบแสดงรหัสการสมัครให้นักเรียน
```

---

## 7.3 Flow การส่งผลงาน

```text
1. นักเรียนเปิดหน้า submit.html
2. กรอกรหัสการสมัคร
3. กรอกรหัสนักเรียนหัวหน้าทีม
4. กรอกชื่อผลงานและคำอธิบาย
5. แนบไฟล์หรือวางลิงก์ผลงาน
6. Apps Script ตรวจสอบรหัสการสมัคร
7. Apps Script ตรวจสอบว่ารายการนั้นเปิดให้ส่งผลงานหรือไม่
8. ถ้ามีไฟล์ ให้บันทึกไฟล์ลง Google Drive
9. Apps Script บันทึกข้อมูลลง Sheet submissions
10. ระบบแสดงข้อความส่งผลงานสำเร็จ
```

---

## 7.4 Flow การตรวจสอบสถานะ

```text
1. นักเรียนเปิดหน้า check.html
2. กรอกรหัสการสมัคร
3. Frontend เรียก API action=checkStatus
4. Apps Script ค้นหาข้อมูลใน Sheet registrations
5. Apps Script ค้นหาข้อมูลการส่งผลงานใน Sheet submissions
6. ส่งข้อมูลกลับไปแสดงบนหน้าเว็บ
```

---

# 8. ข้อเสนอแนะด้านความปลอดภัย

ระบบปีแรกไม่จำเป็นต้องมี Login ซับซ้อน แต่ควรมีการป้องกันพื้นฐาน

```text
1. ไม่แสดงข้อมูลส่วนตัวนักเรียนแบบสาธารณะ
2. ตรวจสอบข้อมูลฝั่ง Apps Script เสมอ
3. จำกัดชนิดไฟล์ที่อนุญาตให้ส่ง
4. จำกัดขนาดไฟล์
5. ตั้งค่า Google Drive Folder ให้เหมาะสม
6. ใช้รหัสการสมัครแทนการค้นหาด้วยชื่อ
7. หน้า Admin ต้องมีรหัสผ่าน
8. ไม่ควรใส่ข้อมูลสำคัญ เช่น password จริง ลงในไฟล์ frontend
```

---

## 8.1 ข้อมูลที่ไม่ควรแสดงสาธารณะ

```text
- เบอร์โทรนักเรียน
- รายชื่อสมาชิกแบบเต็มทุกทีมในหน้าสาธารณะ
- Link ไฟล์ผลงานที่ยังไม่ตรวจสอบ
- ข้อมูลหลังบ้านของครู
```

---

## 8.2 ข้อจำกัดของ Google Apps Script

ควรออกแบบให้เหมาะสมกับการใช้งานระดับโรงเรียน

```text
- ไม่ควรให้มีการเรียก API ถี่เกินไป
- ไม่ควรอัปโหลดไฟล์ขนาดใหญ่มาก
- ไม่ควรทำระบบ realtime
- ไม่ควรให้ผู้ใช้จำนวนมากกดส่งข้อมูลพร้อมกันมากเกินไป
```

ขนาดไฟล์ผลงานที่แนะนำ

```text
- รูปภาพ: ไม่เกิน 10 MB
- PDF: ไม่เกิน 20 MB
- ZIP: ไม่เกิน 50 MB
- วิดีโอ: แนะนำให้ส่งเป็นลิงก์ Google Drive / YouTube แทนการอัปโหลดตรง
```

---

# 9. แผนการพัฒนาแบบไม่ใหญ่เกินไป

## Phase 1: โครงเว็บประชาสัมพันธ์

```text
- ทำหน้าแรก
- ทำหน้ากำหนดการ
- ทำหน้ารายการแข่งขัน
- ดึงข้อมูลจาก Google Sheet ผ่าน Apps Script
```

ผลลัพธ์: เว็บประชาสัมพันธ์ใช้งานได้

---

## Phase 2: ระบบสมัครแข่งขัน

```text
- ทำฟอร์มสมัคร
- บันทึกข้อมูลลง Google Sheet
- สร้าง registration_code
- ตรวจสอบจำนวนสมาชิกต่อทีม
- แสดงผลสมัครสำเร็จ
```

ผลลัพธ์: นักเรียนสมัครแข่งขันออนไลน์ได้

---

## Phase 3: ระบบตรวจสอบสถานะ

```text
- ทำหน้าตรวจสอบสถานะ
- ค้นหาด้วย registration_code
- แสดงข้อมูลการสมัคร
```

ผลลัพธ์: นักเรียนตรวจสอบสถานะได้เอง

---

## Phase 4: ระบบส่งผลงาน

```text
- ทำหน้าส่งผลงาน
- ตรวจสอบรหัสการสมัคร
- รองรับการส่งลิงก์
- รองรับการอัปโหลดไฟล์บางประเภท
- บันทึกข้อมูลลง Google Sheet
```

ผลลัพธ์: นักเรียนส่งผลงานออนไลน์ได้เฉพาะบางรายการ

---

## Phase 5: หน้า Admin แบบง่าย

```text
- หน้า Login ครูแบบง่าย
- ดูรายชื่อผู้สมัคร
- ดูผลงานที่ส่ง
- เปิด/ปิดรับสมัคร
- เปิด/ปิดส่งผลงาน
```

ผลลัพธ์: ครูจัดการข้อมูลผ่านหน้าเว็บได้บางส่วน

---

# 10. ตัวอย่างโครงสร้างข้อมูล JSON

## 10.1 สมัครแข่งขัน

```json
{
  "competition_id": "C002",
  "team_name": "ทีมวิทย์สร้างสรรค์",
  "leader": {
    "student_code": "12345",
    "full_name": "เด็กชายตัวอย่าง หนึ่ง",
    "class": "ม.4",
    "room": "1",
    "number": "12",
    "phone": "0812345678"
  },
  "members": [
    {
      "student_code": "12346",
      "full_name": "เด็กหญิงตัวอย่าง สอง",
      "class": "ม.4",
      "room": "1",
      "number": "15"
    }
  ]
}
```

---

## 10.2 ส่งผลงาน

```json
{
  "registration_code": "SCI2026-0001",
  "leader_student_code": "12345",
  "work_title": "เครื่องคัดแยกขยะด้วย AI",
  "work_description": "ผลงานสิ่งประดิษฐ์เพื่อช่วยแยกขยะในโรงเรียน",
  "external_link": "https://drive.google.com/..."
}
```

---

# 11. ข้อสรุป

โครงสร้างที่แนะนำสำหรับระบบสัปดาห์วิทยาศาสตร์ของโรงเรียนคือ

```text
Frontend:
GitHub Pages

Backend:
Google Apps Script

Database:
Google Sheet

File Storage:
Google Drive
```

ระบบนี้เหมาะกับการใช้งานปีแรก เพราะ

```text
- ทำง่าย
- ใช้งบประมาณน้อย
- ไม่ต้องดูแล Server
- ครูดูข้อมูลผ่าน Google Sheet ได้
- นักเรียนสมัครแข่งขันได้
- รองรับการส่งผลงานออนไลน์บางรายการ
- ขยายต่อได้ในอนาคต
```

หากใช้งานปีแรกแล้วระบบนิ่ง สามารถต่อยอดในปีถัดไปได้ เช่น

```text
- ระบบ Login นักเรียน
- ระบบตรวจสอบรหัสนักเรียนจากฐานข้อมูลกลาง
- ระบบกรรมการให้คะแนน
- ระบบประกาศผล
- ระบบดาวน์โหลดเกียรติบัตร
- Dashboard สรุปรายงาน
```
