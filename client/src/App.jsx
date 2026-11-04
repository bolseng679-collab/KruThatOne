import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import SidebarCurriculum from './components/SidebarCurriculum';
import LessonViewer from './components/LessonViewer';
import AdminDashboard from './components/AdminDashboard';
import ProfileModal from './components/ProfileModal';
import CertificateModal from './components/CertificateModal';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [authView, setAuthView] = useState('login'); // 'login' or 'register'
  const [viewMode, setViewMode] = useState('student'); // 'student' or 'admin'
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [certificateData, setCertificateData] = useState(null);

  // Course overview and curriculum
  const [courseData, setCourseData] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState(null);

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      loadCourseOverview();
    }
  }, [user]);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (data.user.role === 'admin') {
          setViewMode('admin');
        }
      } else {
        handleLogout();
      }
    } catch (e) {
      console.error(e);
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const loadCourseOverview = async () => {
    try {
      const res = await fetch('/api/course/overview', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCourseData(data);

        // Auto select current lesson if none selected
        if (!selectedLessonId && data.modules?.length > 0) {
          const currentIdx = data.studentStats?.currentLessonIndex || 1;
          let targetLesson = null;

          // Find lesson by currentIdx
          for (const m of data.modules) {
            for (const l of m.lessons || []) {
              if (l.globalIndex === currentIdx) { targetLesson = l; break; }
            }
            if (targetLesson) break;
            for (const sm of m.submodules || []) {
              for (const l of sm.lessons || []) {
                if (l.globalIndex === currentIdx) { targetLesson = l; break; }
              }
              if (targetLesson) break;
            }
            if (targetLesson) break;
          }

          // Fallback to first lesson
          if (!targetLesson && data.modules[0]?.lessons?.[0]) {
            targetLesson = data.modules[0].lessons[0];
          }
          if (targetLesson) {
            setSelectedLessonId(targetLesson.id);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLoginSuccess = (newToken, loggedUser) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(loggedUser);
    if (loggedUser.role === 'admin') {
      setViewMode('admin');
    } else {
      setViewMode('student');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setCourseData(null);
    setSelectedLessonId(null);
    setViewMode('student');
  };

  const handleOpenCertificate = async (studentId) => {
    try {
      const url = studentId
        ? `/api/course/certificate/student/${studentId}`
        : `/api/course/certificate`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'មិនអាចទាញយកវិញ្ញាបនបត្របានទេ');
      setCertificateData(data.certificate);
      setShowCertificateModal(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLessonCompleted = async () => {
    // Reload overview to update completion status and unlock next lesson
    await loadCourseOverview();
  };

  const handleSelectLesson = (lessonId) => {
    // Strict client-side check
    if (!courseData?.modules) return;

    let targetLesson = null;
    for (const m of courseData.modules) {
      for (const l of m.lessons || []) {
        if (l.id === lessonId) { targetLesson = l; break; }
      }
      if (targetLesson) break;
      for (const sm of m.submodules || []) {
        for (const l of sm.lessons || []) {
          if (l.id === lessonId) { targetLesson = l; break; }
        }
        if (targetLesson) break;
      }
      if (targetLesson) break;
    }

    if (targetLesson && targetLesson.isLocked) {
      alert(`🔒 មេរៀនទី ${targetLesson.globalIndex} «${targetLesson.titleKm}» ត្រូវបានចាក់សោ!\n\nអ្នកមិនអាចរៀនរំលងបានឡើយ។ សូមរៀន និងបញ្ចប់មេរៀនមុនៗតាមលំដាប់លំដោយជាមុនសិន។`);
      return;
    }

    setSelectedLessonId(lessonId);
  };

  const handleSelectNextLesson = () => {
    if (!courseData?.modules) return;

    // Find current lesson and find next lesson in order
    let nextLesson = null;
    let foundCurrent = false;

    for (const m of courseData.modules) {
      for (const l of m.lessons || []) {
        if (foundCurrent) { nextLesson = l; break; }
        if (l.id === selectedLessonId) foundCurrent = true;
      }
      if (nextLesson) break;
      for (const sm of m.submodules || []) {
        for (const l of sm.lessons || []) {
          if (foundCurrent) { nextLesson = l; break; }
          if (l.id === selectedLessonId) foundCurrent = true;
        }
        if (nextLesson) break;
      }
      if (nextLesson) break;
    }

    if (nextLesson) {
      if (nextLesson.isLocked) {
        alert(`🔒 មេរៀនបន្ទាប់ «${nextLesson.titleKm}» ត្រូវបានចាក់សោ!\n\nអ្នកត្រូវតែបញ្ចប់មេរៀនបច្ចុប្បន្នឱ្យបានជោគជ័យជាមុនសិន ទើបអាចបន្តបាន!`);
        return;
      }
      setSelectedLessonId(nextLesson.id);
    } else {
      alert('🎉 អបអរសាទរ! អ្នកបានបញ្ចប់គ្រប់មេរៀនទាំងអស់នៃវគ្គសិក្សានេះហើយ!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-sm font-bold text-slate-700">English for Education Studies I</h2>
        <p className="text-xs text-slate-400 mt-1">កំពុងរៀបចំប្រព័ន្ធសិក្សា...</p>
      </div>
    );
  }

  // Not logged in -> Show Login or Register
  if (!user) {
    if (authView === 'register') {
      return (
        <RegisterModal
          onRegisterSuccess={handleLoginSuccess}
          onSwitchToLogin={() => setAuthView('login')}
        />
      );
    }
    return (
      <LoginModal
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={() => setAuthView('register')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Navbar */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        viewMode={viewMode}
        setViewMode={setViewMode}
        studentStats={courseData?.studentStats}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenCertificate={() => handleOpenCertificate()}
      />

      {/* Main View Area */}
      {viewMode === 'admin' ? (
        <AdminDashboard onViewCertificate={(sId) => handleOpenCertificate(sId)} />
      ) : (
        <div className="flex-1 flex flex-col md:flex-row">
          <SidebarCurriculum
            modules={courseData?.modules}
            currentLessonId={selectedLessonId}
            onSelectLesson={handleSelectLesson}
            studentStats={courseData?.studentStats}
          />
          <LessonViewer
            lessonId={selectedLessonId}
            onLessonCompleted={handleLessonCompleted}
            onSelectNextLesson={handleSelectNextLesson}
          />
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          user={user}
          onClose={() => setShowProfileModal(false)}
          onUpdateSuccess={(updatedUser) => {
            setUser(updatedUser);
          }}
        />
      )}

      {/* Certificate Modal */}
      {showCertificateModal && (
        <CertificateModal
          certificate={certificateData}
          onClose={() => setShowCertificateModal(false)}
        />
      )}

    </div>
  );
}
