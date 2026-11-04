import React from 'react';
import { GraduationCap, LogOut, ShieldCheck, User, LayoutDashboard, BookOpen, Settings, Award, Menu } from 'lucide-react';

export default function Navbar({
  user,
  onLogout,
  viewMode,
  setViewMode,
  studentStats,
  onOpenProfile,
  onOpenCertificate,
  onToggleSidebar
}) {
  const isAdmin = user?.role === 'admin';
  const isCompleted = studentStats?.progressPct === 100 || (studentStats?.completedCount && studentStats?.totalLessons && studentStats.completedCount >= studentStats.totalLessons);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo + Mobile Menu Button */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {viewMode === 'student' && onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition active:scale-95 text-xs font-bold shrink-0 shadow-sm"
              title="បើក/បិទមាតិកាមេរៀន (Curriculum)"
            >
              <Menu className="w-4 h-4" />
              <span>មាតិកា</span>
            </button>
          )}

          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-base md:text-lg font-bold text-slate-900 leading-tight truncate">
              English for Education Studies I
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 truncate hidden xs:block">
              ប្រព័ន្ធសិក្សាអនឡាញ &middot; គ្រូបឋម
            </p>
          </div>
        </div>

        {/* Right Actions & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {isAdmin && (
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('student')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'student' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ទិដ្ឋភាពមេរៀន</span>
              </button>
              <button
                onClick={() => setViewMode('admin')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'admin' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin Dashboard</span>
              </button>
            </div>
          )}

          {/* Student Progress Badge */}
          {!isAdmin && studentStats && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-xl">
              <div className="text-right">
                <div className="text-xs font-bold text-blue-900">
                  វឌ្ឍនភាព: {studentStats.progressPct}%
                </div>
                <div className="text-[11px] text-blue-600">
                  {studentStats.completedCount} / {studentStats.totalLessons} មេរៀន
                </div>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-blue-500/30 flex items-center justify-center font-bold text-xs text-blue-700 bg-white shadow-inner">
                {studentStats.progressPct}%
              </div>
            </div>
          )}

          {/* Certificate Button (Available when course 100% complete or for Admin) */}
          {(isCompleted || isAdmin) && (
            <button
              onClick={onOpenCertificate}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 transition"
              title="មើល និងបោះពុម្ពវិញ្ញាបនបត្រ (Certificate)"
            >
              <Award className="w-4 h-4 text-amber-200" />
              <span className="hidden sm:inline">វិញ្ញាបនបត្រ</span>
              <span>🏆</span>
            </button>
          )}

          {/* User info - Clickable to open ProfileModal */}
          <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-slate-200">
            <button
              onClick={onOpenProfile}
              title="កែប្រែព័ត៌មានផ្ទាល់ខ្លួន (Edit Profile)"
              className="flex items-center gap-2 p-1 sm:p-1.5 rounded-xl hover:bg-slate-100 transition group text-left"
            >
              <div className="w-8 h-8 rounded-full bg-slate-200 group-hover:bg-blue-100 flex items-center justify-center text-slate-700 group-hover:text-blue-700 font-bold text-xs transition">
                {isAdmin ? <ShieldCheck className="w-4 h-4 text-emerald-600" /> : <User className="w-4 h-4 text-blue-600" />}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold text-slate-800 leading-none group-hover:text-blue-600 transition flex items-center gap-1">
                  <span>{user?.fullName}</span>
                  <Settings className="w-3 h-3 text-slate-400 group-hover:text-blue-500" />
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {isAdmin ? 'គ្រូគ្រប់គ្រង (Admin)' : (user?.school ? user.school : `@${user?.username}`)}
                </div>
              </div>
            </button>

            {/* Logout button */}
            <button
              onClick={onLogout}
              title="ចាកចេញ (Logout)"
              className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </header>
  );
}
