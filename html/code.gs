// ตัวแปรเก็บ ID ของ Sheet (ไม่ต้องเปลี่ยนถ้าเปิด Apps Script จาก Sheet โดยตรง)
const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
// Folder ID สำหรับเก็บไฟล์ผลงาน
const SUBMISSION_FOLDER_ID = "1yVqwHwIrzqwxVe9bNsdw9SiEXc2Mgoeq";
// ข้อมูลล็อกอิน Admin
const ADMIN_USER = "admin";
const ADMIN_PASS = "admin1234"; 
// ข้อมูลล็อกอิน Teacher
const TEACHER_USER = "teacher";
const TEACHER_PASS = "teacher1234";

// ฟังก์ชันสำหรับบังคับขอสิทธิ์ Google Drive (รันฟังก์ชันนี้ใน Apps Script เพื่อขอสิทธิ์)
function authorizeDrive() {
  const folder = DriveApp.getRootFolder();
  const file = folder.createFile("test_auth.txt", "This is a test for authorization");
  file.setTrashed(true);
}

function doGet(e) {
  const action = e.parameter.action;
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    if (action === "getAnnouncements") {
      output.setContent(JSON.stringify({ success: true, data: getSheetData("announcements") }));
    } else if (action === "getSchedule") {
      output.setContent(JSON.stringify({ success: true, data: getSheetData("schedule") }));
    } else if (action === "getCompetitions") {
      output.setContent(JSON.stringify({ success: true, data: getSheetData("competitions") }));
    } else if (action === "getCompetition") {
      const allComps = getSheetData("competitions");
      const comp = allComps.find(c => c.id === e.parameter.id);
      output.setContent(JSON.stringify({ success: !!comp, data: comp || null, message: comp ? "" : "ไม่พบการแข่งขัน" }));
    } else {
      output.setContent(JSON.stringify({ success: false, message: "Invalid action" }));
    }
  } catch (error) {
    output.setContent(JSON.stringify({ success: false, message: error.toString() }));
  }
  
  return output;
}

function doPost(e) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  try {
    const data = JSON.parse(e.postData.contents);
    const action = e.parameter.action;
    // 0. Public Action (หน้าเว็บไซต์สาธารณะ)
    if(action === "registerCompetition") {
      const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("registrations");
      const lastRow = sheet.getLastRow();
      
      // หา ID ล่าสุด
      let nextNum = 1;
      if (lastRow > 1) {
        const lastReg = sheet.getRange(lastRow, 1).getValue(); // สมมติว่า Column A คือ registration_code (e.g., REG001)
        if (typeof lastReg === 'string' && lastReg.startsWith('REG')) {
          const numMatch = lastReg.match(/\d+/);
          if (numMatch) {
            nextNum = parseInt(numMatch[0]) + 1;
          }
        } else {
          nextNum = lastRow; // Fallback
        }
      }
      
      const regCode = "REG" + String(nextNum).padStart(3, '0');
      const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
      
      // Append: [registration_code, competition_id, competition_title, team_name, leader_student_code, leader_full_name, leader_class, leader_room, leader_number, contact_phone, members_json, status, created_at, updated_at]
      sheet.appendRow([
        regCode, 
        data.competition_id, 
        data.competition_title,
        data.team_name, 
        data.leader_student_code,
        data.leader_full_name, 
        data.leader_class,
        data.leader_room,
        data.leader_number,
        "'" + data.contact_phone, 
        data.members_json, 
        "pending",
        now, 
        now
      ]);
      
      output.setContent(JSON.stringify({ success: true, message: "สมัครการแข่งขันสำเร็จ", registration_code: regCode }));
      return output;
    }
    else if (action === "submitWork") {
      const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
      
      // ตรวจสอบรหัสการสมัครก่อน
      const regSheet = spreadsheet.getSheetByName("registrations");
      const regData = regSheet.getDataRange().getValues();
      let foundReg = false;
      let compMatch = false;
      
      for (let i = 1; i < regData.length; i++) {
        if (regData[i][0] === data.registration_code) {
          foundReg = true;
          if (regData[i][1] === data.competition_id) {
            compMatch = true;
          }
          break;
        }
      }
      
      if (!foundReg) {
        output.setContent(JSON.stringify({ success: false, message: "ไม่พบรหัสการสมัครนี้ในระบบ กรุณาตรวจสอบอีกครั้ง" }));
        return output;
      }
      
      if (!compMatch) {
        output.setContent(JSON.stringify({ success: false, message: "รหัสการสมัครนี้ไม่ได้ลงทะเบียนในรายการแข่งขันที่คุณเลือก" }));
        return output;
      }
      
      const sheet = spreadsheet.getSheetByName("submissions");
      
      // ตรวจสอบว่าส่งผลงานไปแล้วหรือยัง
      if (sheet.getLastRow() > 0) {
        const subData = sheet.getDataRange().getValues();
        for (let i = 1; i < subData.length; i++) {
          // Column B (index 1) คือ registration_code
          if (subData[i][1] === data.registration_code) {
            output.setContent(JSON.stringify({ success: false, message: "รหัสการสมัครนี้ได้ทำการส่งผลงานเข้าระบบไปแล้ว ไม่สามารถส่งซ้ำได้" }));
            return output;
          }
        }
      }
      
      const lastRow = sheet.getLastRow();
      
      // หา ID ล่าสุด
      let nextNum = 1;
      if (lastRow > 1) {
        const lastSub = sheet.getRange(lastRow, 1).getValue(); // สมมติว่า Column A คือ submission_id (e.g., SUB001)
        if (typeof lastSub === 'string' && lastSub.startsWith('SUB')) {
          const numMatch = lastSub.match(/\d+/);
          if (numMatch) {
            nextNum = parseInt(numMatch[0]) + 1;
          }
        } else {
          nextNum = lastRow; // Fallback
        }
      }
      
      const subCode = "SUB" + String(nextNum).padStart(3, '0');
      const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
      
      let fileUrl = "";
      if (data.fileBase64 && data.fileName) {
         try {
           const folder = DriveApp.getFolderById(SUBMISSION_FOLDER_ID);
           const decodedData = Utilities.base64Decode(data.fileBase64);
           const extension = data.fileName.includes('.') ? data.fileName.split('.').pop() : '';
           const newFileName = extension ? `${data.registration_code}.${extension}` : data.registration_code;
           const blob = Utilities.newBlob(decodedData, data.fileMimeType || "application/octet-stream", newFileName);
           const file = folder.createFile(blob);
           try {
               file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
           } catch (shareErr) {
               // Ignore sharing error (common in Education workspaces)
               console.log("Could not set sharing permissions: " + shareErr);
           }
           fileUrl = file.getUrl();
         } catch (e) {
           output.setContent(JSON.stringify({ success: false, message: "อัปโหลดไฟล์ล้มเหลว: " + e.toString() }));
           return output;
         }
      }
      
      // columns: submission_id, registration_code, competition_id, competition_title, work_title, work_description, file_url, external_link, status, submitted_at, updated_at
      sheet.appendRow([
        subCode, 
        data.registration_code,
        data.competition_id, 
        data.competition_title,
        data.work_title,
        data.work_description || "",
        fileUrl,
        data.external_link || "",
        "ส่งแล้ว",
        now, 
        now
      ]);
      
      output.setContent(JSON.stringify({ success: true, message: "ส่งผลงานสำเร็จ", submission_id: subCode }));
      return output;
    }

    // 1. ระบบ Login
    if(action === "adminLogin") {
      if(data.username === ADMIN_USER && data.password === ADMIN_PASS) {
        output.setContent(JSON.stringify({ success: true, message: "เข้าสู่ระบบสำเร็จ", role: "admin" }));
      } else if(data.username === TEACHER_USER && data.password === TEACHER_PASS) {
        output.setContent(JSON.stringify({ success: true, message: "เข้าสู่ระบบสำเร็จ (สิทธิ์คุณครู)", role: "teacher" }));
      } else {
        output.setContent(JSON.stringify({ success: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }));
      }
      return output;
    }
    
    // *** ทุก Action หลังจากนี้ ต้องใช้รหัสผ่านที่ถูกต้อง ***
    if(data.password !== ADMIN_PASS && data.password !== TEACHER_PASS) {
      output.setContent(JSON.stringify({ success: false, message: "ไม่ได้รับอนุญาต (Unauthorized)" }));
      return output;
    }
    
    // ตรวจสอบสิทธิ์สำหรับ Teacher (Teacher จัดการได้แค่ competitions, registrations, submissions)
    const isTeacher = (data.password === TEACHER_PASS);
    const adminOnlyActions = [
      "addAnnouncement", "editAnnouncement", "deleteItem", // deleteItem for announcements/schedule
      "addSchedule", "editSchedule", "getSettings", "updateSettings"
    ];
    
    if (isTeacher) {
        if (adminOnlyActions.includes(action) || (action === "updateItemStatus" && (data.sheetName === "announcements" || data.sheetName === "schedule")) || (action === "deleteItem" && (data.sheetName === "announcements" || data.sheetName === "schedule"))) {
            output.setContent(JSON.stringify({ success: false, message: "สิทธิ์คุณครูไม่สามารถจัดการเมนูนี้ได้" }));
            return output;
        }
    }
    
    // 2. อัปเดตสถานะการแข่งขัน (Legacy)
    if (action === "updateCompetitionStatus") {
      const success = updateSheetData("competitions", "id", data.id, data.field, data.value);
      output.setContent(JSON.stringify({ success: success, message: success ? "อัปเดตสถานะแล้ว" : "ไม่พบข้อมูล" }));
    } 
    // 2.1 อัปเดตสถานะทั่วไป (Generic)
    else if (action === "updateItemStatus") {
      const success = updateSheetData(data.sheetName, data.idField || "id", data.id, data.field, data.value);
      output.setContent(JSON.stringify({ success: success, message: success ? "อัปเดตสถานะแล้ว" : "ไม่พบข้อมูล" }));
    }
    // 3. จัดการข่าวประกาศ (Announcements)
    else if (action === "addAnnouncement") {
      const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("announcements");
      const newId = (sheet.getLastRow() || 1); 
      const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
      sheet.appendRow([newId, data.title, data.content, data.published !== undefined ? data.published : true, today]);
      output.setContent(JSON.stringify({ success: true, message: "เพิ่มประกาศใหม่แล้ว" }));
    }
    else if (action === "editAnnouncement") {
      updateSheetRow("announcements", "id", data.id, { title: data.title, content: data.content, published: data.published });
      output.setContent(JSON.stringify({ success: true, message: "แก้ไขประกาศแล้ว" }));
    }
    // 4. จัดการรายการแข่งขัน (Competitions)
    else if (action === "addCompetition") {
      const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("competitions");
      const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
      sheet.appendRow([
        data.id, data.title, data.category, data.level, data.team_min, data.team_max, data.description, 
        data.rules || "", data.judging_criteria || "", data.location || "", data.competition_date || "", true, false, "none", today, today
      ]);
      output.setContent(JSON.stringify({ success: true, message: "เพิ่มการแข่งขันแล้ว" }));
    }
    else if (action === "editCompetition") {
      updateSheetRow("competitions", "id", data.old_id, {
        id: data.id, title: data.title, category: data.category, level: data.level, 
        team_min: data.team_min, team_max: data.team_max, description: data.description,
        rules: data.rules, judging_criteria: data.judging_criteria, location: data.location,
        competition_date: data.competition_date
      });
      output.setContent(JSON.stringify({ success: true, message: "แก้ไขการแข่งขันแล้ว" }));
    }
    // 5. จัดการกำหนดการ (Schedule)
    else if (action === "addSchedule") {
      const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("schedule");
      const newId = (sheet.getLastRow() || 1);
      sheet.appendRow([newId, data.date, data.start_time, data.end_time, data.title, data.location, data.description]);
      output.setContent(JSON.stringify({ success: true, message: "เพิ่มกำหนดการแล้ว" }));
    }
    else if (action === "editSchedule") {
      updateSheetRow("schedule", "id", data.id, {
        date: data.date, start_time: data.start_time, end_time: data.end_time,
        title: data.title, location: data.location, description: data.description
      });
      output.setContent(JSON.stringify({ success: true, message: "แก้ไขกำหนดการแล้ว" }));
    }
    // 6. จัดการการตั้งค่าเว็บ (Settings)
    else if (action === "getSettings") {
      output.setContent(JSON.stringify({ success: true, data: getSheetData("settings") }));
    }
    else if (action === "updateSetting") {
      const success = updateSheetData("settings", "key", data.key, "value", data.value);
      output.setContent(JSON.stringify({ success: success, message: success ? "อัปเดตการตั้งค่าแล้ว" : "ไม่พบ Key นี้" }));
    }
    // 7. จัดการข้อมูลผู้สมัคร (Registrations)
    else if (action === "getRegistrations") {
      const allRegs = getSheetData("registrations");
      const filtered = allRegs.filter(r => r.competition_id == data.compId);
      output.setContent(JSON.stringify({ success: true, data: filtered }));
    }
    else if (action === "editRegistration") {
      updateSheetRow("registrations", "registration_code", data.registration_code, {
        team_name: data.team_name,
        contact_phone: "'" + data.contact_phone,
        leader_full_name: data.leader_full_name,
        members_json: data.members_json,
        updated_at: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss")
      });
      output.setContent(JSON.stringify({ success: true, message: "แก้ไขข้อมูลผู้สมัครแล้ว" }));
    }
    // 8. จัดการผลงาน (Submissions)
    else if (action === "getSubmissions") {
      const allSubs = getSheetData("submissions");
      const filtered = allSubs.filter(r => r.competition_id == data.compId);
      output.setContent(JSON.stringify({ success: true, data: filtered }));
    }
    else if (action === "editSubmission") {
      updateSheetRow("submissions", "submission_id", data.id, {
        work_title: data.work_title,
        work_description: data.work_description,
        file_url: data.external_link, // Storing both in external_link or file_url for simplicity in admin
        external_link: data.external_link,
        status: data.status,
        updated_at: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss")
      });
      output.setContent(JSON.stringify({ success: true, message: "แก้ไขข้อมูลผลงานแล้ว" }));
    }
    // 9. ลบข้อมูล (ครอบจักรวาล)
    else if (action === "deleteItem") {
      const idField = data.idField || "id";
      const success = deleteSheetRow(data.sheetName, idField, data.id);
      output.setContent(JSON.stringify({ success: success, message: success ? "ลบข้อมูลแล้ว" : "ไม่พบข้อมูลที่ต้องการลบ" }));
    }
    else {
      output.setContent(JSON.stringify({ success: false, message: "Invalid action" }));
    }
    
  } catch (error) {
    output.setContent(JSON.stringify({ success: false, message: error.toString() }));
  }
  
  return output;
}

// ================= Helpers =================

// ฟังก์ชันแปลงข้อมูลจาก Sheet เป็น JSON Object
function getSheetData(sheetName) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const result = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    let obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    result.push(obj);
  }
  return result;
}

// ฟังก์ชันสำหรับค้นหาและอัปเดตข้อมูลแบบเฉพาะเจาะจงเซลล์
function updateSheetData(sheetName, searchField, searchValue, updateField, updateValue) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  if (!sheet) return false;
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const searchIndex = headers.indexOf(searchField);
  const updateIndex = headers.indexOf(updateField);
  
  if(searchIndex === -1 || updateIndex === -1) return false;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][searchIndex] == searchValue) {
      sheet.getRange(i + 1, updateIndex + 1).setValue(updateValue);
      return true;
    }
  }
  return false;
}

// ฟังก์ชันสำหรับค้นหาและอัปเดตข้อมูลทั้งแถว
function updateSheetRow(sheetName, searchField, searchValue, updatesObj) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  if (!sheet) return false;
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const searchIndex = headers.indexOf(searchField);
  
  if(searchIndex === -1) return false;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][searchIndex] == searchValue) {
      for (const key in updatesObj) {
        const updateIndex = headers.indexOf(key);
        if (updateIndex !== -1) {
          sheet.getRange(i + 1, updateIndex + 1).setValue(updatesObj[key]);
        }
      }
      return true;
    }
  }
  return false;
}

// ฟังก์ชันสำหรับค้นหาและลบข้อมูลทั้งแถว
function deleteSheetRow(sheetName, searchField, searchValue) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  if (!sheet) return false;
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const searchIndex = headers.indexOf(searchField);
  
  if(searchIndex === -1) return false;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][searchIndex] == searchValue) {
      sheet.deleteRow(i + 1); // +1 เพราะ array เริ่มที่ 0 แต่ row เริ่มที่ 1
      return true;
    }
  }
  return false;
}
