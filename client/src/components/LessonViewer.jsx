import React, { useState, useEffect } from 'react';
import { BookOpen, Layers, HelpCircle, PenTool, Lock, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import ReadingPlayer from './ReadingPlayer';
import SlideshowPlayer from './SlideshowPlayer';
import QuizPlayer from './QuizPlayer';
import AssignmentPlayer from './AssignmentPlayer';

export default function LessonViewer({ lessonId, onLessonCompleted, onSelectNextLesson, onOpenCurriculum }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!lessonId) return;
    fetchLesson(lessonId);
  }, [lessonId]);

  const fetchLesson = async (id) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/course/lesson/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'មិនអាចទាញយកទិន្នន័យមេរៀនបានទេ');
      }
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteNonQuiz = async (id) => {
    try {
      const res = await fetch(`/api/course/lesson/${id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'បរាជ័យក្នុងការបញ្ចប់មេរៀន');
      setData(prev => ({
        ...prev,
        meta: { ...prev.meta, isCompleted: true }
      }));
      if (onLessonCompleted) onLessonCompleted(result);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleQuizSuccess = (quizResult) => {
    setData(prev => ({
      ...prev,
      meta: {
        ...prev.meta,
        isCompleted: true,
        quizHistory: {
          scorePct: quizResult.scorePct,
          passed: quizResult.passed,
          attempts: quizResult.attempts
        }
      }
    }));
    if (onLessonCompleted) onLessonCompleted(quizResult);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs">កំពុងផ្ទុកខ្លឹមសារមេរៀន...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-rose-200 text-center shadow-lg">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">មេរៀនត្រូវបានចាក់សោ</h3>
          <p className="text-xs text-rose-700 leading-relaxed mb-6">{error}</p>
          <p className="text-xs text-slate-500">
            សូមត្រឡប់ទៅរៀនមេរៀនមុនៗឱ្យចប់សព្វគ្រប់ជាមុនសិន!
          </p>
        </div>
      </div>
    );
  }

  if (!data?.lesson) return null;

  const { lesson, meta } = data;

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50">
      
      {/* Top Header / Breadcrumb */}
      <div className="max-w-4xl mx-auto mb-6 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          {/* Mobile curriculum button */}
          {onOpenCurriculum && (
            <button
              onClick={onOpenCurriculum}
              className="md:hidden inline-flex items-center gap-1.5 px-3 py-1.5 mb-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 active:scale-95 transition shadow-sm"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>📖 មើលមាតិកាមេរៀន (Curriculum)</span>
            </button>
          )}

          <div className="text-xs font-semibold text-blue-600 flex items-center gap-1.5 mb-1">
            <span>{meta.moduleTitle}</span>
            {meta.submoduleTitle && (
              <>
                <span>&rsaquo;</span>
                <span>{meta.submoduleTitle}</span>
              </>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span>{lesson.titleKm}</span>
            {meta.isCompleted && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> បានបញ្ចប់
              </span>
            )}
          </h1>
        </div>

        {/* Lesson Index Indicator */}
        <div className="text-right">
          <div className="text-xs font-bold text-slate-500">
            មេរៀនទី {meta.globalIndex} / {meta.totalLessons}
          </div>
          <div className="text-[11px] text-slate-400">
            ប្រភេទ: {lesson.contentType}
          </div>
        </div>
      </div>

      {/* Render Appropriate Player */}
      {lesson.contentType === 'reading' && (
        <ReadingPlayer
          lesson={lesson}
          isCompleted={meta.isCompleted}
          onComplete={handleCompleteNonQuiz}
          onNext={onSelectNextLesson}
        />
      )}

      {lesson.contentType === 'slideshow' && (
        <SlideshowPlayer
          lesson={lesson}
          isCompleted={meta.isCompleted}
          onComplete={handleCompleteNonQuiz}
          onNext={onSelectNextLesson}
        />
      )}

      {lesson.contentType === 'quiz' && (
        <QuizPlayer
          lesson={lesson}
          quizHistory={meta.quizHistory}
          onNext={onSelectNextLesson}
          onQuizSubmitSuccess={handleQuizSuccess}
        />
      )}

      {lesson.contentType === 'assignment' && (
        <AssignmentPlayer
          lesson={lesson}
          isCompleted={meta.isCompleted}
          onNext={onSelectNextLesson}
          onRefreshProgress={() => fetchLesson(lessonId)}
        />
      )}

    </main>
  );
}

