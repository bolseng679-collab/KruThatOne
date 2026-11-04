const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { hashPassword, readDB, writeDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'teacherThat-secret-key-11digits-plpedtech-clone';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Load full course data
const COURSE_PATH = path.join(__dirname, 'data', 'course.json');
let courseData = null;
let flatLessonMap = new Map(); // id -> flatLesson

try {
  const raw = fs.readFileSync(COURSE_PATH, 'utf-8');
  courseData = JSON.parse(raw);
  for (const l of courseData.flatLessons) {
    flatLessonMap.set(l.id, l);
  }
  console.log(`✅ បានផ្ទុកវគ្គសិក្សាជោគជ័យ: ${courseData.course.titleKm} (${courseData.flatLessons.length} មេរៀន)`);
} catch (e) {
  console.error('❌ Error loading course data:', e);
}

// Auth Middleware
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'សូមចូលគណនីជាមុនសិន' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = readDB();
    const user = db.users.find(u => u.id === decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'រកមិនឃើញគណនីអ្នកប្រើប្រាស់' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session ផុតកំណត់ សូមចូលគណនីម្តងទៀត' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'អ្នកមិនមានសិទ្ធិជា Admin ឡើយ' });
  }
  next();
}

// ---------------- AUTH ROUTES ----------------

// 1. Student Registration
app.post('/api/auth/register', (req, res) => {
  const { fullName, username, password, phone, inviteCode } = req.body;

  if (!fullName || !username || !password || !inviteCode) {
    return res.status(400).json({ error: 'សូមបំពេញព័ត៌មានចាំបាច់ទាំងអស់ (ឈ្មោះ, ឈ្មោះគណនី, ពាក្យសម្ងាត់, លេខកូដ ១១ ខ្ទង់)' });
  }

  // Validate 11-digit code format
  const cleanCode = String(inviteCode).trim();
  if (!/^\d{11}$/.test(cleanCode)) {
    return res.status(400).json({ error: 'លេខកូដចុះឈ្មោះត្រូវតែមាន ១១ ខ្ទង់គត់ (ឧទាហរណ៍៖ 12345678901) ទទួលបានពីលោកគ្រូ teacherThat' });
  }

  const db = readDB();

  // Check username uniqueness
  const cleanUsername = String(username).trim().toLowerCase();
  if (db.users.some(u => u.username.toLowerCase() === cleanUsername)) {
    return res.status(400).json({ error: 'ឈ្មោះគណនីនេះត្រូវបានប្រើប្រាស់រួចហើយ សូមជ្រើសរើសឈ្មោះផ្សេង' });
  }

  // Verify invite code in DB
  const codeRecord = db.codes.find(c => c.code === cleanCode && c.active);
  if (!codeRecord) {
    return res.status(400).json({ error: 'លេខកូដ ១១ ខ្ទង់នេះមិនត្រឹមត្រូវ ឬត្រូវបានបិទដំណើរការ។ សូមទាក់ទងលោកគ្រូ teacherThat ដើម្បីទទួលលេខកូដថ្មី' });
  }

  if (codeRecord.maxUses && codeRecord.usedCount >= codeRecord.maxUses) {
    return res.status(400).json({ error: 'លេខកូដ ១១ ខ្ទង់នេះបានអស់ចំនួនកំណត់ក្នុងការប្រើប្រាស់ហើយ' });
  }

  const newUserId = 'student_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
  const newUser = {
    id: newUserId,
    fullName: fullName.trim(),
    username: cleanUsername,
    passwordHash: hashPassword(password),
    phone: phone ? phone.trim() : '',
    role: 'student',
    inviteCodeUsed: cleanCode,
    createdAt: new Date().toISOString(),
    progress: {
      completedLessons: [],
      currentLessonIndex: 1, // STRICTLY start at Lesson 1
      quizScores: {},
      assignmentSubmissions: {}
    }
  };

  // Update code usage
  codeRecord.usedCount += 1;
  codeRecord.usedBy.push({
    studentId: newUserId,
    studentName: newUser.fullName,
    usedAt: new Date().toISOString()
  });

  db.users.push(newUser);
  writeDB(db);

  const token = jwt.sign({ userId: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '30d' });

  res.status(201).json({
    message: 'ការចុះឈ្មោះបានជោគជ័យ! សូមស្វាគមន៍មកកាន់វគ្គសិក្សា',
    token,
    user: {
      id: newUser.id,
      fullName: newUser.fullName,
      username: newUser.username,
      phone: newUser.phone,
      role: newUser.role,
      progress: newUser.progress
    }
  });
});

// 2. Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'សូមបញ្ចូលឈ្មោះគណនី និងពាក្យសម្ងាត់' });
  }

  const db = readDB();
  const cleanUsername = String(username).trim().toLowerCase();
  const user = db.users.find(u => u.username.toLowerCase() === cleanUsername);

  if (!user || user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: 'ឈ្មោះគណនី ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវឡើយ' });
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });

  res.json({
    message: 'ចូលប្រព័ន្ធបានជោគជ័យ',
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      phone: user.phone,
      role: user.role,
      progress: user.progress
    }
  });
});

// 3. Current User Profile & Progress
app.get('/api/auth/me', authenticate, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      fullName: req.user.fullName,
      username: req.user.username,
      phone: req.user.phone,
      school: req.user.school || '',
      role: req.user.role,
      inviteCodeUsed: req.user.inviteCodeUsed,
      progress: req.user.progress
    }
  });
});

// 4. Update Profile
app.put('/api/auth/profile', authenticate, (req, res) => {
  const { fullName, phone, school, newPassword } = req.body;

  if (!fullName || !fullName.trim()) {
    return res.status(400).json({ error: 'សូមបញ្ចូលឈ្មោះពេញរបស់អ្នក' });
  }

  const db = readDB();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'រកមិនឃើញគណនីអ្នកប្រើប្រាស់' });
  }

  user.fullName = fullName.trim();
  if (phone !== undefined) user.phone = phone ? phone.trim() : '';
  if (school !== undefined) user.school = school ? school.trim() : '';
  user.updatedAt = new Date().toISOString();

  // If student wants to update password
  if (newPassword && newPassword.trim().length >= 6) {
    user.passwordHash = hashPassword(newPassword.trim());
  }

  writeDB(db);

  res.json({
    message: 'ព័ត៌មានផ្ទាល់ខ្លួនត្រូវបានកែប្រែជោគជ័យ!',
    user: {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      phone: user.phone,
      school: user.school,
      role: user.role,
      inviteCodeUsed: user.inviteCodeUsed,
      progress: user.progress
    }
  });
});

// ---------------- COURSE & LEARNING ROUTES ----------------

// 1. Get Course Curriculum Overview (With Strict Sequential Progression Status)
app.get('/api/course/overview', authenticate, (req, res) => {
  if (!courseData) {
    return res.status(500).json({ error: 'ទិន្នន័យវគ្គសិក្សាមិនទាន់រួចរាល់' });
  }

  const userProgress = req.user.progress || { currentLessonIndex: 1, completedLessons: [] };
  const currentIdx = Number(userProgress.currentLessonIndex) || 1;
  const isPreview = req.query.preview === 'true' && req.user.role === 'admin';

  // Build curriculum tree with strict locked/unlocked state
  const modulesWithStatus = courseData.modules.map(mod => {
    return {
      id: mod.id,
      sortOrder: mod.sortOrder,
      titleKm: mod.titleKm,
      titleEn: mod.titleEn,
      descriptionKm: mod.descriptionKm,
      lessons: mod.lessons.map(l => {
        const isCompleted = userProgress.completedLessons.includes(l.id);
        // STRICT RULE: Can only access if lesson globalIndex <= currentLessonIndex
        const isLocked = isPreview ? false : (l.globalIndex > currentIdx);
        const isCurrent = l.globalIndex === currentIdx;

        return {
          id: l.id,
          globalIndex: l.globalIndex,
          titleKm: l.titleKm,
          contentType: l.contentType,
          durationMin: l.durationMin,
          minScore: l.minScore,
          isCompleted,
          isLocked,
          isCurrent
        };
      }),
      submodules: mod.submodules.map(sm => ({
        id: sm.id,
        sortOrder: sm.sortOrder,
        titleKm: sm.titleKm,
        titleEn: sm.titleEn,
        lessons: sm.lessons.map(l => {
          const isCompleted = userProgress.completedLessons.includes(l.id);
          const isLocked = isPreview ? false : (l.globalIndex > currentIdx);
          const isCurrent = l.globalIndex === currentIdx;

          return {
            id: l.id,
            globalIndex: l.globalIndex,
            titleKm: l.titleKm,
            contentType: l.contentType,
            durationMin: l.durationMin,
            minScore: l.minScore,
            isCompleted,
            isLocked,
            isCurrent
          };
        })
      }))
    };
  });

  const totalLessons = courseData.course.totalLessons;
  const completedCount = userProgress.completedLessons ? userProgress.completedLessons.length : 0;
  const progressPct = Math.min(100, Math.round((completedCount / totalLessons) * 100));

  res.json({
    course: courseData.course,
    modules: modulesWithStatus,
    studentStats: {
      totalLessons,
      completedCount,
      progressPct,
      currentLessonIndex: currentIdx
    }
  });
});

// Helper to find lesson full data
function findFullLesson(lessonId) {
  for (const mod of courseData.modules) {
    for (const l of mod.lessons) {
      if (l.id === lessonId) return l;
    }
    for (const sm of mod.submodules) {
      for (const l of sm.lessons) {
        if (l.id === lessonId) return l;
      }
    }
  }
  return null;
}

// 2. Get Single Lesson Content (Strict Progression Gating Check)
app.get('/api/course/lesson/:id', authenticate, (req, res) => {
  const lessonId = req.params.id;
  const flat = flatLessonMap.get(lessonId);

  if (!flat) {
    return res.status(404).json({ error: 'រកមិនឃើញមេរៀននេះឡើយ' });
  }

  const isPreview = req.query.preview === 'true' && req.user.role === 'admin';
  const currentIdx = Number(req.user.progress.currentLessonIndex) || 1;

  // STRICT GATING: Cannot access if lesson index > current allowed index
  if (!isPreview && flat.globalIndex > currentIdx) {
    return res.status(403).json({
      error: `មេរៀនទី ${flat.globalIndex} «${flat.title}» ត្រូវបានចាក់សោ (Locked)!\n\nអ្នកមិនអាចរៀនរំលងបានឡើយ។ អ្នកត្រូវរៀន និងឆ្លងកាត់មេរៀនទី ${currentIdx} ឱ្យចប់សព្វគ្រប់ជាមុនសិន!`,
      locked: true,
      requiredIndex: currentIdx,
      requestedIndex: flat.globalIndex
    });
  }

  const fullLesson = findFullLesson(lessonId);
  if (!fullLesson) {
    return res.status(404).json({ error: 'រកមិនឃើញទិន្នន័យមេរៀន' });
  }

  const userProgress = req.user.progress;
  const quizHistory = userProgress.quizScores ? userProgress.quizScores[lessonId] : null;

  res.json({
    lesson: fullLesson,
    meta: {
      globalIndex: flat.globalIndex,
      moduleTitle: flat.moduleTitle,
      submoduleTitle: flat.submoduleTitle,
      totalLessons: courseData.course.totalLessons,
      isCompleted: userProgress.completedLessons.includes(lessonId),
      isCurrent: flat.globalIndex === currentIdx,
      quizHistory
    }
  });
});

// 3. Complete Non-Quiz Lesson (Reading, Slideshow)
app.post('/api/course/lesson/:id/complete', authenticate, (req, res) => {
  const lessonId = req.params.id;
  const flat = flatLessonMap.get(lessonId);

  if (!flat) {
    return res.status(404).json({ error: 'រកមិនឃើញមេរៀន' });
  }

  if (flat.contentType === 'quiz') {
    return res.status(400).json({ error: 'មេរៀនប្រភេទតេស្ត (Quiz) តម្រូវឱ្យធ្វើតេស្ត និងទទួលបានពិន្ទុចាប់ពី 80% ឡើងទៅ ទើបអាចបញ្ចប់បាន!' });
  }

  const db = readDB();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'រកមិនឃើញគណនី' });

  const currentIdx = Number(user.progress.currentLessonIndex) || 1;

  // STRICT RULE: Cannot complete a future lesson that hasn't been reached
  if (flat.globalIndex > currentIdx) {
    return res.status(403).json({
      error: 'អ្នកមិនអាចបញ្ចប់មេរៀនរំលងបានឡើយ! សូមរៀនតាមលំដាប់លំដោយ។'
    });
  }

  if (!user.progress.completedLessons.includes(lessonId)) {
    user.progress.completedLessons.push(lessonId);
  }

  // Advance currentLessonIndex strictly sequentially by 1
  if (currentIdx === flat.globalIndex) {
    user.progress.currentLessonIndex = flat.globalIndex + 1;
  }

  writeDB(db);

  res.json({
    success: true,
    message: 'បានបញ្ចប់មេរៀនដោយជោគជ័យ! មេរៀនបន្ទាប់ត្រូវបានបើកដំណើរការ។',
    currentLessonIndex: user.progress.currentLessonIndex,
    completedLessons: user.progress.completedLessons
  });
});

// 4. Submit Quiz / Test (Strict >= 80% Rule)
app.post('/api/course/lesson/:id/quiz-submit', authenticate, (req, res) => {
  const lessonId = req.params.id;
  const flat = flatLessonMap.get(lessonId);

  if (!flat) {
    return res.status(404).json({ error: 'រកមិនឃើញមេរៀន' });
  }

  const fullLesson = findFullLesson(lessonId);
  if (!fullLesson || !fullLesson.contentRef || !fullLesson.contentRef.questions) {
    return res.status(400).json({ error: 'មិនមានទិន្នន័យសំណួរតេស្តឡើយ' });
  }

  const { answers } = req.body; // { [qId]: selectedIndex }
  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ error: 'សូមបញ្ចូលចម្លើយរបស់អ្នក' });
  }

  const questions = fullLesson.contentRef.questions;
  let correctCount = 0;
  const details = [];

  questions.forEach((q, idx) => {
    const selected = answers[q.id];
    const correctIndices = q.correctOptionIndices || [0];
    const isCorrect = correctIndices.includes(Number(selected));
    if (isCorrect) correctCount++;

    details.push({
      questionId: q.id,
      selected,
      isCorrect,
      correctIndices,
      explanation: q.explanation
    });
  });

  const total = questions.length;
  const scorePct = Math.round((correctCount / total) * 100);
  const passed = scorePct >= 80; // REQUIREMENT: >= 80% TO ADVANCE!

  const db = readDB();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'រកមិនឃើញគណនី' });

  const currentIdx = Number(user.progress.currentLessonIndex) || 1;

  if (!user.progress.quizScores) user.progress.quizScores = {};
  const prevRecord = user.progress.quizScores[lessonId] || { attempts: 0 };

  user.progress.quizScores[lessonId] = {
    scorePct,
    correctCount,
    total,
    passed,
    attempts: (prevRecord.attempts || 0) + 1,
    lastAttemptAt: new Date().toISOString()
  };

  if (passed) {
    if (!user.progress.completedLessons.includes(lessonId)) {
      user.progress.completedLessons.push(lessonId);
    }
    // Only advance currentLessonIndex if this was the current pending lesson
    if (currentIdx === flat.globalIndex) {
      user.progress.currentLessonIndex = flat.globalIndex + 1;
    }
  }

  writeDB(db);

  if (passed) {
    return res.json({
      passed: true,
      scorePct,
      correctCount,
      total,
      attempts: user.progress.quizScores[lessonId].attempts,
      message: `🎉 អបអរសាទរ! អ្នកទទួលបានពិន្ទុ ${scorePct}% (ជាប់ចាប់ពី ៨០% ឡើង)។ មេរៀនបន្ទាប់ត្រូវបានបើកដំណើរការ!`,
      currentLessonIndex: user.progress.currentLessonIndex,
      details
    });
  } else {
    return res.json({
      passed: false,
      scorePct,
      correctCount,
      total,
      attempts: user.progress.quizScores[lessonId].attempts,
      message: `⚠️ អ្នកទទួលបានពិន្ទុ ${scorePct}% (មិនទាន់គ្រប់ ៨០% ទេ)។ តាមគោលការណ៍កំណត់ អ្នកត្រូវតែធ្វើតេស្ដសារថ្មីរហូតដល់ទទួលបានពិន្ទុយ៉ាងតិច ៨០% ឡើងទៅ ទើបអាចបន្តទៅមេរៀនបន្ទាប់បាន!`,
      currentLessonIndex: user.progress.currentLessonIndex,
      details
    });
  }
});

// 5. Submit Assignment / Writing
app.post('/api/course/lesson/:id/assignment-submit', authenticate, (req, res) => {
  const lessonId = req.params.id;
  const flat = flatLessonMap.get(lessonId);
  const { text } = req.body;

  if (!flat) return res.status(404).json({ error: 'រកមិនឃើញមេរៀន' });
  if (!text || text.trim().length < 10) {
    return res.status(400).json({ error: 'សូមសរសេរខ្លឹមសារកិច្ចការឱ្យបានយ៉ាងតិច ១០ តួអក្សរ' });
  }

  const db = readDB();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'រកមិនឃើញគណនី' });

  const currentIdx = Number(user.progress.currentLessonIndex) || 1;

  if (!user.progress.assignmentSubmissions) user.progress.assignmentSubmissions = {};
  user.progress.assignmentSubmissions[lessonId] = {
    text: text.trim(),
    submittedAt: new Date().toISOString()
  };

  if (!user.progress.completedLessons.includes(lessonId)) {
    user.progress.completedLessons.push(lessonId);
  }

  if (currentIdx === flat.globalIndex) {
    user.progress.currentLessonIndex = flat.globalIndex + 1;
  }

  writeDB(db);

  res.json({
    success: true,
    message: 'កិច្ចការរបស់អ្នកត្រូវបានបញ្ជូន និងរក្សាទុកដោយជោគជ័យ!',
    currentLessonIndex: user.progress.currentLessonIndex
  });
});

// 6. Get Certificate for Current User
app.get('/api/course/certificate', authenticate, (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'រកមិនឃើញគណនី' });

  const totalLessons = courseData ? courseData.course.totalLessons : 938;
  const completedCount = user.progress.completedLessons ? user.progress.completedLessons.length : 0;
  const isCompleted = completedCount >= totalLessons || user.progress.currentLessonIndex > totalLessons;

  // Admin can preview certificate anytime, students must be completed
  if (!isCompleted && req.user.role !== 'admin') {
    return res.status(403).json({
      error: `អ្នកមិនទាន់បានបញ្ចប់គ្រប់មេរៀនទាំងអស់នៅឡើយទេ (បញ្ចប់បាន ${completedCount} / ${totalLessons} មេរៀន)។ សូមរៀនឱ្យចប់គ្រប់មេរៀន និងប្រឡងជាប់ Final Assessment ដើម្បីទទួលបានវិញ្ញាបនបត្រ!`,
      isCompleted: false,
      completedCount,
      totalLessons
    });
  }

  // Generate deterministic certificate serial number
  const crypto = require('crypto');
  const certCode = 'CERT-EES1-' + crypto.createHash('md5').update(user.id + '_cert').digest('hex').substring(0, 8).toUpperCase();
  
  if (!user.progress.certificateIssuedAt) {
    user.progress.certificateIssuedAt = new Date().toISOString();
    writeDB(db);
  }

  res.json({
    certificate: {
      serialNumber: certCode,
      studentName: user.fullName,
      username: user.username,
      school: user.school || 'Primary Education Institution',
      courseTitle: courseData.course.titleKm || 'English for Education Studies I',
      courseCode: courseData.course.courseCode || 'EES-01',
      totalLessons,
      issueDate: user.progress.certificateIssuedAt,
      instructor: 'Teacher That (លោកគ្រូ teacherThat)',
      instructorTitle: 'Master Trainer & Course Creator',
      organization: 'គ្រូបឋម — Primary Learning Platform (PLP EdTech)',
      verified: true
    }
  });
});

// 7. Get Certificate for Specific Student (Admin)
app.get('/api/course/certificate/student/:studentId', authenticate, requireAdmin, (req, res) => {
  const { studentId } = req.params;
  const db = readDB();
  const user = db.users.find(u => u.id === studentId);
  if (!user) return res.status(404).json({ error: 'រកមិនឃើញសិស្ស' });

  const totalLessons = courseData ? courseData.course.totalLessons : 938;
  const crypto = require('crypto');
  const certCode = 'CERT-EES1-' + crypto.createHash('md5').update(user.id + '_cert').digest('hex').substring(0, 8).toUpperCase();

  res.json({
    certificate: {
      serialNumber: certCode,
      studentName: user.fullName,
      username: user.username,
      school: user.school || 'Primary Education Institution',
      courseTitle: courseData.course.titleKm || 'English for Education Studies I',
      courseCode: courseData.course.courseCode || 'EES-01',
      totalLessons,
      issueDate: user.progress.certificateIssuedAt || new Date().toISOString(),
      instructor: 'Teacher That (លោកគ្រូ teacherThat)',
      instructorTitle: 'Master Trainer & Course Creator',
      organization: 'គ្រូបឋម — Primary Learning Platform (PLP EdTech)',
      verified: true
    }
  });
});

// ---------------- ADMIN DASHBOARD ROUTES ----------------

// 1. Admin Stats Overview
app.get('/api/admin/stats', authenticate, requireAdmin, (req, res) => {
  const db = readDB();
  const students = db.users.filter(u => u.role === 'student');
  const totalStudents = students.length;

  let totalCompleted = 0;
  let totalPctSum = 0;
  let totalQuizzesAttempted = 0;
  let totalQuizzesPassed = 0;

  const totalCourseLessons = courseData ? courseData.course.totalLessons : 938;

  students.forEach(s => {
    const completedCount = s.progress.completedLessons ? s.progress.completedLessons.length : 0;
    const pct = Math.min(100, Math.round((completedCount / totalCourseLessons) * 100));
    totalPctSum += pct;
    if (pct === 100) totalCompleted++;

    if (s.progress.quizScores) {
      Object.values(s.progress.quizScores).forEach(q => {
        totalQuizzesAttempted += (q.attempts || 1);
        if (q.passed) totalQuizzesPassed++;
      });
    }
  });

  const avgProgress = totalStudents > 0 ? Math.round(totalPctSum / totalStudents) : 0;
  const activeCodesCount = db.codes.filter(c => c.active).length;

  res.json({
    totalStudents,
    totalCompleted,
    avgProgress,
    totalQuizzesAttempted,
    totalQuizzesPassed,
    activeCodesCount,
    courseTitle: courseData.course.titleKm,
    totalCourseLessons
  });
});

// 2. Student List with Detailed Progress
app.get('/api/admin/students', authenticate, requireAdmin, (req, res) => {
  const db = readDB();
  const totalCourseLessons = courseData ? courseData.course.totalLessons : 938;

  const studentList = db.users
    .filter(u => u.role === 'student')
    .map(s => {
      const completedCount = s.progress.completedLessons ? s.progress.completedLessons.length : 0;
      const progressPct = Math.min(100, Math.round((completedCount / totalCourseLessons) * 100));

      const quizScores = s.progress.quizScores || {};
      const testsAttempted = Object.keys(quizScores).length;
      const testsPassed = Object.values(quizScores).filter(q => q.passed).length;

      const currentIdx = s.progress.currentLessonIndex || 1;
      const currentLesson = courseData.flatLessons.find(l => l.globalIndex === currentIdx);

      return {
        id: s.id,
        fullName: s.fullName,
        username: s.username,
        phone: s.phone,
        school: s.school || '',
        inviteCodeUsed: s.inviteCodeUsed,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt || null,
        currentLessonIndex: currentIdx,
        currentLessonTitle: currentLesson ? currentLesson.title : 'បញ្ចប់វគ្គសិក្សា',
        completedLessonsCount: completedCount,
        progressPct,
        testsAttempted,
        testsPassed
      };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({ students: studentList });
});

// 3. Reset Student Progress (or Reset Admin testing progress)
app.post('/api/admin/students/:id/reset', authenticate, requireAdmin, (req, res) => {
  const targetId = req.params.id;
  const db = readDB();
  const targetUser = db.users.find(u => u.id === targetId);

  if (!targetUser) {
    return res.status(404).json({ error: 'រកមិនឃើញគណនីនេះ' });
  }

  targetUser.progress = {
    completedLessons: [],
    currentLessonIndex: 1, // Reset strictly to lesson 1
    quizScores: {},
    assignmentSubmissions: {}
  };

  writeDB(db);
  res.json({ message: `បានកំណត់វឌ្ឍនភាពរបស់ ${targetUser.fullName} ឱ្យចាប់ផ្តើមពីមេរៀនទី១ ឡើងវិញជោគជ័យ!` });
});

// 4. List 11-Digit Invite Codes
app.get('/api/admin/codes', authenticate, requireAdmin, (req, res) => {
  const db = readDB();
  res.json({ codes: db.codes });
});

// 5. Generate New 11-Digit Invite Code
app.post('/api/admin/codes/generate', authenticate, requireAdmin, (req, res) => {
  const { customCode, note, maxUses } = req.body;

  let code = customCode ? String(customCode).trim() : '';

  if (!code) {
    let digits = '';
    for (let i = 0; i < 11; i++) {
      digits += Math.floor(Math.random() * 10).toString();
    }
    if (digits[0] === '0') digits = '1' + digits.slice(1);
    code = digits;
  }

  if (!/^\d{11}$/.test(code)) {
    return res.status(400).json({ error: 'លេខកូដត្រូវតែមាន ១១ ខ្ទង់គត់ (លេខទាំងអស់)' });
  }

  const db = readDB();
  if (db.codes.some(c => c.code === code)) {
    return res.status(400).json({ error: 'លេខកូដ ១១ ខ្ទង់នេះមាននៅក្នុងប្រព័ន្ធរួចហើយ' });
  }

  const newCode = {
    code,
    createdBy: req.user.username || 'teacherThat',
    note: note ? note.trim() : 'បង្កើតដោយ Admin',
    maxUses: maxUses ? Number(maxUses) : 100,
    usedCount: 0,
    usedBy: [],
    createdAt: new Date().toISOString(),
    active: true
  };

  db.codes.unshift(newCode);
  writeDB(db);

  res.status(201).json({
    message: `លេខកូដ ១១ ខ្ទង់ ${code} ត្រូវបានបង្កើតដោយជោគជ័យ!`,
    code: newCode
  });
});

// 6. Toggle 11-Digit Code Status
app.post('/api/admin/codes/:code/toggle', authenticate, requireAdmin, (req, res) => {
  const targetCode = req.params.code;
  const db = readDB();
  const found = db.codes.find(c => c.code === targetCode);

  if (!found) {
    return res.status(404).json({ error: 'រកមិនឃើញលេខកូដនេះ' });
  }

  found.active = !found.active;
  writeDB(db);

  res.json({
    message: `លេខកូដ ${targetCode} ត្រូវបាន ${found.active ? 'បើក' : 'បិទ'} ដំណើរការ!`,
    active: found.active
  });
});

// Serve frontend in production
const CLIENT_DIST = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.get('*', (req, res) => {
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🎓 កម្មវិធីសិក្សា English for Education Studies I`);
  console.log(`📡 Backend Server កំពុងដំណើរការលើ Port: http://localhost:${PORT}`);
  console.log(`👨‍🏫 គណនី Admin លំនាំដើម: teacherThat / teacher@123`);
  console.log(`🔑 លេខកូដ ១១ ខ្ទង់លំនាំដើម: 12345678901, 98765432109, 40603712345`);
  console.log(`======================================================\n`);
});
