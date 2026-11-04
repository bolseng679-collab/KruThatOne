import React, { useState, useEffect } from 'react';
import { CheckCircle2, ArrowRight, Clock, AlertCircle } from 'lucide-react';

export default function ReadingPlayer({ lesson, isCompleted, onComplete, onNext }) {
  const [completing, setCompleting] = useState(false);
  const [countdown, setCountdown] = useState(isCompleted ? 0 : 15); // 15-second reading timer
  const htmlContent = lesson?.contentRef?.text || '<p>មិនមានខ្លឹមសារអត្ថបទឡើយ។</p>';

  useEffect(() => {
    if (isCompleted) {
      setCountdown(0);
      return;
    }
    setCountdown(15);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lesson.id, isCompleted]);

  const handleComplete = async () => {
    if (countdown > 0) return;
    setCompleting(true);
    await onComplete(lesson.id);
    setCompleting(false);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* HTML Content Render */}
      <div 
        className="lesson-html-content bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-slate-200"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />

      {/* Completion & Next Footer */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="text-xs text-slate-500">
          {isCompleted ? (
            <span className="text-emerald-600 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> អ្នកបានអាន និងបញ្ចប់មេរៀននេះរួចរាល់ហើយ
            </span>
          ) : countdown > 0 ? (
            <span className="text-amber-700 font-medium flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              សូមចំណាយពេលអានខ្លឹមសារ (នៅសល់ <strong>{countdown}</strong> វិនាទី ទើបអាចចុចបញ្ចប់បាន)
            </span>
          ) : (
            <span className="text-blue-700 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              អ្នកបានអានគ្រប់ពេលវេលាកំណត់ហើយ! សូមចុចបញ្ចប់មេរៀនដើម្បីបន្ត
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!isCompleted ? (
            <button
              onClick={handleComplete}
              disabled={completing || countdown > 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold shadow-md transition ${
                countdown > 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-blue-500/20'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {completing
                  ? 'កំពុងកត់ត្រា...'
                  : countdown > 0
                  ? `កំពុងអាន (${countdown}វ)...`
                  : 'ខ្ញុំបានអានចប់ហើយ — បញ្ចប់មេរៀន'}
              </span>
            </button>
          ) : (
            <button
              onClick={onNext}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-600/20 transition animate-bounce-subtle"
            >
              <span>បន្តទៅមេរៀនបន្ទាប់</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
