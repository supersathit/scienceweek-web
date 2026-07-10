---
name: Update ScienceWeek Changelog
description: Trigger this skill when modifying the scienceweek project to maintain a record of system architecture and changes.
---

# ScienceWeek System Context & Changelog

## System Architecture
1. **Frontend**: HTML, Vanilla JS, TailwindCSS (via CDN).
2. **Backend**: Google Apps Script (code.gs) serving as an API.
3. **Database**: Google Sheets (stores competitions, registrations, submissions).
4. **Storage**: Google Drive (stores uploaded submission files).

## Core Features & Workflows
- **Registration**: 
  - `register.html` and `assets/js/register.js`.
  - Prompts users to save their generated Registration Code for submitting work later.
  - Supports "Single" (1 member) and "Team" types.
  - Phone numbers are stored as text in Sheets (prepended with `'` in code.gs).
- **Submission**: 
  - `submit.html` and `assets/js/submit.js`.
  - Uses SweetAlert2 for loading state during file uploads.
  - Uploads files as Base64 to `code.gs`.
  - Backend validation: verifies if the `registration_code` exists, if it matches the selected `competition_id`, and prevents duplicate submissions.
  - Uploaded files are renamed to the registration code (e.g., `REG001.pdf`) when saved in Google Drive.
  - The default status for new submissions is "ส่งแล้ว".
  - Records submission to `submissions` sheet.
- **Admin**:
  - `admin.html` and `assets/js/admin.js`.
  - Views and toggles statuses for registrations and submissions.
  - Displays submitted dates in formatted Thai date-time.

## Instruction to Agent
Whenever you make a modification to this system (e.g., adding a new feature, changing the Google Apps Script logic, or altering the database structure), you MUST update the **Core Features & Workflows** section in this file (`.agents/skills/scienceweek_context/SKILL.md`) to reflect the changes.
