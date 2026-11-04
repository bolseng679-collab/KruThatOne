import React, { useState } from 'react';
import { PenTool, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AssignmentPlayer({ lesson, isCompleted, onNext, onRefreshProgress }) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(isCompleted);

  const ref = lesson?.contentRef || {};
  const promptHtml = ref.text || '<p>សូមសរសេរកិច្ចការរបស់អ្នកតាមការណែនាំខាងក្រោម។</p>';
  const minChars = ref.min_chars || 50;
  const maxChars = ref.max_chars || 1200;

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const isValidLength = charCount >= 20;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidLength) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/course/lesson/${lesson.id}/assignment-submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ការបញ្ជូនកិច្ចការបរាជ័យ');
      setSubmitted(true);
      if (onRefreshProgress) onRefreshProgress();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      
      {/* Prompt Card */}
      <div 
        className="lesson-html-content bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-slate-200"
        dangerouslySetInnerHTML={{ __html: promptHtml }}
      />

      {/* Writing Box Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PenTool className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-sm">ចម្លើយកិច្ចការសរសេររបស់អ្នក (Writing Submission)</h3>
          </div>
          <div className="text-xs text-slate-500">
            ចំនួនពាក្យ: <strong className="text-emerald-700">{wordCount}</strong> | តួអក្សរ: {charCount}
          </div>
        </div>

        <textarea
          rows={7}
          disabled={submitted}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="សរសេរកថាខណ្ឌ ឬចម្លើយភាសាអង់គ្លេសរបស់អ្នកនៅទីនេះ... (Write your response in English here)"
          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition disabled:bg-slate-100 disabled:opacity-80"
        />

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="text-xs text-slate-500">
            {submitted ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> អ្នកបានបញ្ជូនកិច្ចការនេះរួចរាល់ហើយ
              </span>
            ) : (
              <span>សូមពិនិត្យអក្ខរាវិរុទ្ធ និងវេយ្យាករណ៍មុនពេលបញ្ជូន</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!submitted ? (
              <button
                onClick={handleSubmit}
                disabled={submitting || !isValidLength}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-600/20 disabled:opacity-40 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{submitting ? 'កំពុងបញ្ជូន...' : 'បញ្ជូនកិច្ចការ (Submit)'}</span>
              </button>
            ) : (
              <button
                onClick={onNext}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/20 transition"
              >
                <span>បន្តទៅមេរៀនបន្ទាប់</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}

