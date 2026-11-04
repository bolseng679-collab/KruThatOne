import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Lock, CheckCircle2, PlayCircle, BookOpen, Search, X } from 'lucide-react';

export default function SidebarCurriculum({
  modules,
  currentLessonId,
  onSelectLesson,
  studentStats,
  isOpenMobile,
  onCloseMobile
}) {
  const [openModules, setOpenModules] = useState({ 0: true, 1: true });
  const [openSubmodules, setOpenSubmodules] = useState({ 0: true });
  const [searchTerm, setSearchTerm] = useState('');

  // Auto-expand module containing current lesson
  useEffect(() => {
    if (!modules || !currentLessonId) return;
    modules.forEach((mod, mIdx) => {
      let containsCurrent = mod.lessons?.some(l => l.id === currentLessonId);
      if (containsCurrent) {
        setOpenModules(prev => ({ ...prev, [mIdx]: true }));
      }
      mod.submodules?.forEach((sub, sIdx) => {
        if (sub.lessons?.some(l => l.id === currentLessonId)) {
          setOpenModules(prev => ({ ...prev, [mIdx]: true }));
          setOpenSubmodules(prev => ({ ...prev, [`${mIdx}_${sIdx}`]: true }));
        }
      });
    });
  }, [currentLessonId, modules]);

  const toggleModule = (idx) => {
    setOpenModules(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleSubmodule = (key) => {
    setOpenSubmodules(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLessonClick = (les) => {
    if (les.isLocked) {
      alert(`🔒 មេរៀនទី ${les.globalIndex} «${les.titleKm}» ត្រូវបានចាក់សោ!\n\nអ្នកមិនអាចរៀនរំលងបានឡើយ។ សូមរៀន និងបញ្ចប់មេរៀនមុនៗឱ្យចប់សិនតាមលំដាប់លំដោយ។`);
      return;
    }
    onSelectLesson(les.id);
    // On mobile, close sidebar immediately after selecting a lesson
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'reading': return <span className="text-[10px] bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded font-medium">អាន</span>;
      case 'slideshow': return <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-medium">ស្លាយ</span>;
      case 'quiz': return <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-bold">តេស្ត ≥80%</span>;
      case 'assignment': return <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium">កិច្ចការ</span>;
      default: return null;
    }
  };

  // The inner content of the curriculum list (reused in desktop and mobile drawer)
  const curriculumContent = (
    <div className="flex flex-col h-full bg-white select-none">
      {/* Search Header */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/70">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ស្វែងរកមេរៀន ឬសប្តាហ៍..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500 px-1">
          <span>មេរៀនសរុប: {studentStats?.totalLessons || 938}</span>
          <span className="text-blue-600 font-bold">បញ្ចប់: {studentStats?.completedCount || 0}</span>
        </div>
      </div>

      {/* Curriculum Tree */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
        {modules?.map((mod, mIdx) => {
          const isModOpen = openModules[mIdx] ?? false;

          return (
            <div key={mod.id} className="pt-1">
              {/* Module Header */}
              <button
                onClick={() => toggleModule(mIdx)}
                className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-slate-100 transition group"
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                    {mIdx}
                  </span>
                  <span className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition">
                    {mod.titleKm || mod.titleEn}
                  </span>
                </div>
                {isModOpen ? (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>

              {/* Module Content */}
              {isModOpen && (
                <div className="pl-2 pr-1 py-1 space-y-1">
                  
                  {/* Direct module lessons */}
                  {mod.lessons?.map(les => {
                    const isActive = les.id === currentLessonId;
                    const isLocked = les.isLocked;
                    const isCompleted = les.isCompleted;
                    const isCurrent = les.isCurrent;

                    if (searchTerm && !les.titleKm.toLowerCase().includes(searchTerm.toLowerCase())) {
                      return null;
                    }

                    return (
                      <button
                        key={les.id}
                        onClick={() => handleLessonClick(les)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition relative ${
                          isActive
                            ? 'bg-blue-600 text-white font-semibold shadow-sm ring-2 ring-blue-600/30'
                            : isLocked
                            ? 'text-slate-400 bg-slate-50/50 hover:bg-slate-100 cursor-not-allowed opacity-60'
                            : isCompleted
                            ? 'text-slate-700 hover:bg-emerald-50/60'
                            : isCurrent
                            ? 'text-blue-900 bg-blue-50/70 border border-blue-200 font-bold'
                            : 'text-slate-800 hover:bg-blue-50/70'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          {isLocked ? (
                            <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          ) : isCompleted ? (
                            <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-emerald-600'}`} />
                          ) : (
                            <PlayCircle className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-blue-600 animate-pulse'}`} />
                          )}
                          <span className="truncate">{les.titleKm}</span>
                        </div>
                        <div className="shrink-0 flex items-center gap-1">
                          {isCurrent && !isActive && (
                            <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold animate-pulse">
                              បច្ចុប្បន្ន
                            </span>
                          )}
                          {!isActive && !isCurrent && getTypeBadge(les.contentType)}
                        </div>
                      </button>
                    );
                  })}

                  {/* Submodules (Weeks) */}
                  {mod.submodules?.map((sub, sIdx) => {
                    const subKey = `${mIdx}_${sIdx}`;
                    const isSubOpen = openSubmodules[subKey] ?? true;

                    return (
                      <div key={sub.id} className="pt-0.5">
                        <button
                          onClick={() => toggleSubmodule(subKey)}
                          className="w-full flex items-center justify-between py-1.5 px-2 rounded-lg text-left bg-slate-50/80 hover:bg-slate-100 transition"
                        >
                          <div className="flex items-center gap-1.5 min-w-0 pr-2">
                            <span className="text-[11px] font-semibold text-slate-700 truncate">
                              {sub.titleKm || sub.titleEn}
                            </span>
                          </div>
                          {isSubOpen ? (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                        </button>

                        {isSubOpen && (
                          <div className="pl-3 py-1 space-y-0.5">
                            {sub.lessons?.map(les => {
                              const isActive = les.id === currentLessonId;
                              const isLocked = les.isLocked;
                              const isCompleted = les.isCompleted;
                              const isCurrent = les.isCurrent;

                              if (searchTerm && !les.titleKm.toLowerCase().includes(searchTerm.toLowerCase())) {
                                return null;
                              }

                              return (
                                <button
                                  key={les.id}
                                  onClick={() => handleLessonClick(les)}
                                  className={`w-full flex items-center justify-between p-1.5 rounded-lg text-left text-xs transition ${
                                    isActive
                                      ? 'bg-blue-600 text-white font-semibold shadow-sm ring-2 ring-blue-600/30'
                                      : isLocked
                                      ? 'text-slate-400 bg-slate-50/50 hover:bg-slate-100 cursor-not-allowed opacity-60'
                                      : isCompleted
                                      ? 'text-slate-700 hover:bg-emerald-50/60'
                                      : isCurrent
                                      ? 'text-blue-900 bg-blue-50/70 border border-blue-200 font-bold'
                                      : 'text-slate-800 hover:bg-blue-50/70'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0 pr-2">
                                    {isLocked ? (
                                      <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    ) : isCompleted ? (
                                      <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-emerald-600'}`} />
                                    ) : (
                                      <PlayCircle className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-blue-600 animate-pulse'}`} />
                                    )}
                                    <span className="truncate">{les.titleKm}</span>
                                  </div>
                                  <div className="shrink-0 flex items-center gap-1">
                                    {isCurrent && !isActive && (
                                      <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold animate-pulse">
                                        បច្ចុប្បន្ន
                                      </span>
                                    )}
                                    {!isActive && !isCurrent && getTypeBadge(les.contentType)}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}

                      </div>
                    );
                  })}

                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Sidebar (Always visible on md screens and up) */}
      <aside className="hidden md:flex w-80 lg:w-96 border-r border-slate-200 flex-col h-[calc(100vh-4rem)] sticky top-16 shadow-sm shrink-0">
        {curriculumContent}
      </aside>

      {/* 2. Mobile Drawer (Only visible when toggled open on phone) */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Dark backdrop overlay - clicking outside closes drawer */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer content sliding in from left */}
          <div className="relative w-5/6 max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {/* Header with clear Close button */}
            <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h2 className="font-bold text-sm text-slate-800">មាតិកាវគ្គសិក្សា</h2>
              </div>
              <button
                onClick={onCloseMobile}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition active:scale-95"
                title="បិទមាតិកា"
              >
                <X className="w-4 h-4" />
                <span>បិទ</span>
              </button>
            </div>

            {/* Curriculum body */}
            <div className="flex-1 overflow-hidden">
              {curriculumContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
