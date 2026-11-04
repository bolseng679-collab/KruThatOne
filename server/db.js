const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_PATH = path.join(__dirname, 'data', 'db.json');

// Default database state
const DEFAULT_DB = {
  users: [
    {
      id: 'admin_1',
      fullName: 'Teacher That (Admin)',
      username: 'teacherThat',
      passwordHash: hashPassword('teacher@123'),
      phone: '012345678',
      role: 'admin',
      inviteCodeUsed: 'SYSTEM_ADMIN',
      createdAt: new Date().toISOString(),
      progress: {
        completedLessons: [],
        currentLessonIndex: 938, // Admin has access to all
        quizScores: {},
        assignmentSubmissions: {}
      }
    }
  ],
  codes: [
    {
      code: '12345678901',
      createdBy: 'teacherThat',
      note: 'លេខកូដទូទៅសម្រាប់ថ្នាក់រៀនទី១',
      maxUses: 100,
      usedCount: 0,
      usedBy: [],
      createdAt: new Date().toISOString(),
      active: true
    },
    {
      code: '98765432109',
      createdBy: 'teacherThat',
      note: 'លេខកូដសម្រាប់ថ្នាក់រៀនទី២',
      maxUses: 50,
      usedCount: 0,
      usedBy: [],
      createdAt: new Date().toISOString(),
      active: true
    },
    {
      code: '40603712345',
      createdBy: 'teacherThat',
      note: 'លេខកូដពិសេសពីលោកគ្រូ teacherThat',
      maxUses: 200,
      usedCount: 0,
      usedBy: [],
      createdAt: new Date().toISOString(),
      active: true
    }
  ]
};

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function initDB() {
  if (!fs.existsSync(path.dirname(DB_PATH))) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2), 'utf-8');
  }
}

function readDB() {
  initDB();
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading DB, restoring default:', e);
    return DEFAULT_DB;
  }
}

function writeDB(data) {
  initDB();
  const tempPath = `${DB_PATH}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempPath, DB_PATH);
}

module.exports = {
  hashPassword,
  readDB,
  writeDB
};

