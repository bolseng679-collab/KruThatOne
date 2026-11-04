import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, RotateCcw, ArrowRight, AlertTriangle, Trophy } from 'lucide-react';

export default function QuizPlayer({ lesson, quizHistory, onNext, onQuizSubmitSuccess }) {
  const questions = lesson?.contentRef?.questions || [];
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [showReview, setShowReview] = useState(false);

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length && questions.length > 0;

  const handleSelect = (qId, optIdx) => {
    if (result) return; // Prevent changing after submission
    setAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allAnswered) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/course/lesson/${lesson.id}/quiz-submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ answers })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'មានបញ្ហាក្នុងការដាក់ពិន្ទុ');
      }
      setResult(data);
      if (data.passed && onQuizSubmitSuccess) {
        onQuizSubmitSuccess(data);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setResult(null);
    setShowReview(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      
      {/* Quiz Header & Gating Notice */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-amber-500/10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-semibold">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>ការធ្វើតេស្តវាយតម្លៃចំណេះដឹង</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">{lesson.titleKm}</h2>
            <p className="text-amber-100 text-xs sm:text-sm">
              សំណួរសរុប: {questions.length} សំណួរ &middot; ពិន្ទុជាប់កំណត់: <strong>៨០% (80%) ឡើងទៅ</strong>
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20 text-center min-w-[120px]">
            <div className="text-2xl font-extrabold">≥ 80%</div>
            <div className="text-[11px] text-amber-100 font-medium">លក្ខខណ្ឌជាប់ទៅមុខ</div>
          </div>
        </div>

        {/* Warning banner about progression */}
        <div className="mt-4 pt-4 border-t border-white/20 text-xs text-amber-50 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-200 shrink-0" />
          <span>
            បញ្ជាក់៖ អ្នកត្រូវតែឆ្លើយត្រូវយ៉ាងហោចណាស់ <strong>៨០%</strong> ទើបប្រព័ន្ធអនុញ្ញាតឱ្យបើកមេរៀនបន្ទាប់។ ប្រសិនបើក្រោម ៨០% ត្រូវធ្វើតេស្តសារថ្មីរហូតដល់ជាប់!
          </span>
        </div>
      </div>

      {/* Quiz Result Banner (If Submitted) */}
      {result && (
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-md transition animate-in fade-in ${
          result.passed 
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
            : 'bg-rose-50 border-rose-300 text-rose-900'
        }`}>
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shrink-0 shadow-md ${
              result.passed ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
            }`}>
              {result.passed ? <Trophy className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3 justify-center sm:justify-start">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  result.passed ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'
                }`}>
                  {result.passed ? 'ជាប់ជាស្ថាពរ (PASSED)' : 'ធ្លាក់មិនទាន់គ្រប់ ៨០% (FAILED)'}
                </span>
                <span className="text-xs text-slate-500">
                  សាកល្បងលើកទី {result.attempts}
                </span>
              </div>

              <div className="text-3xl font-black">
                ពិន្ទុរបស់អ្នក: {result.scorePct}%
                <span className="text-sm font-normal text-slate-600 ml-2">
                  ({result.correctCount} / {result.total} ត្រឹមត្រូវ)
                </span>
              </div>

              <p className="text-sm">
                {result.message}
              </p>
            </div>

            {/* Action based on pass/fail */}
            <div className="shrink-0 flex flex-col gap-2 w-full sm:w-auto">
              {result.passed ? (
                <button
                  onClick={onNext}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-2xl text-sm shadow-md shadow-emerald-600/30 transition"
                >
                  <span>បន្តទៅមេរៀនបន្ទាប់</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleRetake}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold rounded-2xl text-sm shadow-md shadow-rose-600/30 transition animate-pulse"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>ធ្វើតេស្តសារថ្មីឡើងវិញ</span>
                </button>
              )}

              <button
                onClick={() => setShowReview(!showReview)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 hover:bg-white text-slate-700 transition"
              >
                {showReview ? 'លាក់ចម្លើយលម្អិត' : 'មើលចម្លើយលម្អិត និងពន្យល់'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Answer Progress Tracker (Before Submit) */}
      {!result && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between text-xs text-slate-600 shadow-sm">
          <span>បានឆ្លើយ: <strong className="text-blue-600">{answeredCount}</strong> / {questions.length} សំណួរ</span>
          <div className="w-48 bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300"
              style={{ width: `${(answeredCount / (questions.length || 1)) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Questions List */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {questions.map((q, idx) => {
          const selected = answers[q.id];
          const hasSelected = selected !== undefined;
          const detail = result?.details?.find(d => d.questionId === q.id);

          return (
            <div 
              key={q.id || idx}
              className={`p-6 bg-white rounded-3xl border transition shadow-sm ${
                result 
                  ? (detail?.isCorrect ? 'border-emerald-200 bg-emerald-50/20' : 'border-rose-200 bg-rose-50/20')
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3 mb-4">
                <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                  result
                    ? (detail?.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800')
                    : (hasSelected ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600')
                }`}>
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {q.question}
                  </h3>
                </div>
              </div>

              {/* Options */}
              <div className="grid gap-2.5 pl-10">
                {q.options?.map((opt, oIdx) => {
                  const isChecked = selected === oIdx;
                  const isCorrectOpt = detail?.correctIndices?.includes(oIdx);

                  let optionStyle = 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-800';

                  if (result) {
                    if (isCorrectOpt) {
                      optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold ring-2 ring-emerald-400/20';
                    } else if (isChecked && !detail?.isCorrect) {
                      optionStyle = 'border-rose-400 bg-rose-50 text-rose-900 font-semibold';
                    } else {
                      optionStyle = 'border-slate-200 bg-white opacity-50 text-slate-400';
                    }
                  } else if (isChecked) {
                    optionStyle = 'border-blue-600 bg-blue-50 text-blue-900 font-semibold ring-2 ring-blue-500/20';
                  }

                  return (
                    <label
                      key={oIdx}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border text-sm cursor-pointer transition select-none ${optionStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name={`q_${q.id}`}
                          value={oIdx}
                          checked={isChecked}
                          onChange={() => handleSelect(q.id, oIdx)}
                          disabled={!!result}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span>{opt}</span>
                      </div>

                      {result && isCorrectOpt && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                      {result && isChecked && !detail?.isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                      )}
                    </label>
                  );
                })}
              </div>

              {/* Explanation (if submitted & review requested) */}
              {result && (showReview || !detail?.isCorrect) && (
                <div className="mt-4 ml-10 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    💡 ពន្យល់ចម្លើយ:
                  </div>
                  <p>{detail?.explanation || q.explanation || 'សូមផ្ទៀងផ្ទាត់ជាមួយមេរៀនដែលបានរៀនក្នុងសប្តាហ៍នេះ។'}</p>
                </div>
              )}

            </div>
          );
        })}

        {/* Submit Button Bar */}
        {!result && (
          <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur p-4 rounded-3xl border border-slate-200 shadow-xl flex items-center justify-between gap-4">
            <div className="text-xs text-slate-600">
              {allAnswered ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> បានឆ្លើយគ្រប់ទាំងអស់ {questions.length} សំណួរហើយ!
                </span>
              ) : (
                <span className="text-amber-700">
                  សូមឆ្លើយគ្រប់សំណួរទាំងអស់ ({answeredCount}/{questions.length}) ទើបអាចបញ្ជូនបាន
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={!allAnswered || submitting}
              className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 active:scale-95 text-white font-bold rounded-2xl text-sm shadow-md shadow-orange-500/20 disabled:opacity-40 transition"
            >
              {submitting ? 'កំពុងគណនាពិន្ទុ...' : 'បញ្ជូនចម្លើយតេស្ត (Submit)'}
            </button>
          </div>
        )}

      </form>

    </div>
  );
}

