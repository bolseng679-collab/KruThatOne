import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

export default function SlideshowPlayer({ lesson, isCompleted, onComplete, onNext }) {
  const nodes = lesson?.contentRef?.nodes || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [completing, setCompleting] = useState(false);

  const currentNode = nodes[currentIndex] || {};
  const isQuizSlide = currentNode.type === 'QUIZ';
  const totalSlides = nodes.length;
  const isLastSlide = currentIndex === totalSlides - 1;

  const currentSelection = selectedAnswers[currentNode.id];
  const isAnswered = currentSelection !== undefined;

  const handleSelectOption = (optIdx) => {
    if (isAnswered) return;
    setSelectedAnswers(prev => ({ ...prev, [currentNode.id]: optIdx }));
  };

  const handleNext = () => {
    if (currentIndex < totalSlides - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleFinish = async () => {
    setCompleting(true);
    await onComplete(lesson.id);
    setCompleting(false);
  };

  const correctIndices = currentNode.correctOptionIndices || [0];
  const isCorrect = isAnswered && correctIndices.includes(currentSelection);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Progress bar across slides */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800">
            ស្លាយទី {currentIndex + 1} / {totalSlides}
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-semibold">
            {currentNode.type || 'SLIDE'}
          </span>
        </div>

        {/* Progress Dots / Bar */}
        <div className="flex-1 max-w-xs bg-slate-100 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-purple-600 h-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalSlides) * 100}%` }}
          />
        </div>

        <button
          onClick={() => { setCurrentIndex(0); setSelectedAnswers({}); }}
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition"
          title="ចាប់ផ្តើមឡើងវិញ"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Slide Card */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-slate-200 min-h-[420px] flex flex-col justify-between">
        
        {/* Slide Content */}
        <div>
          {/* If node has an image */}
          {currentNode.contentUrl && (
            <div className="mb-6 rounded-2xl overflow-hidden border border-slate-100 shadow-sm max-h-72 flex justify-center bg-slate-50">
              <img
                src={currentNode.contentUrl}
                alt="Slide visual"
                className="object-contain max-h-72 w-full"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}

          {/* Normal Slide Text */}
          {!isQuizSlide && (
            <div className="py-4">
              <h2 className="text-xl sm:text-2xl font-bold text-purple-900 mb-4">
                {currentNode.title || currentNode.text || lesson.titleKm}
              </h2>
              {currentNode.content && (
                <div 
                  className="lesson-html-content text-slate-700 text-base"
                  dangerouslySetInnerHTML={{ __html: currentNode.content }}
                />
              )}
            </div>
          )}

          {/* Quiz / Interactive Question Slide */}
          {isQuizSlide && (
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-xl bg-purple-100 text-purple-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  ?
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  {currentNode.question || currentNode.text}
                </h3>
              </div>

              {/* Options */}
              <div className="grid gap-3 pt-2">
                {currentNode.options?.map((opt, oIdx) => {
                  const isThisSelected = currentSelection === oIdx;
                  const isThisCorrect = correctIndices.includes(oIdx);

                  let btnStyle = 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-800';

                  if (isAnswered) {
                    if (isThisCorrect) {
                      btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold ring-2 ring-emerald-400/20';
                    } else if (isThisSelected) {
                      btnStyle = 'border-rose-400 bg-rose-50 text-rose-900 font-semibold';
                    } else {
                      btnStyle = 'border-slate-200 bg-slate-50 opacity-60 text-slate-500';
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(oIdx)}
                      className={`w-full p-4 rounded-2xl border text-left text-sm flex items-center justify-between transition ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {isAnswered && isThisCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                      {isAnswered && isThisSelected && !isThisCorrect && (
                        <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback & Explanation */}
              {isAnswered && (
                <div className={`p-4 rounded-2xl text-xs space-y-1 transition ${isCorrect ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-900 border border-amber-200'}`}>
                  <div className="font-bold flex items-center gap-1.5 text-sm">
                    {isCorrect ? '🎉 ត្រឹមត្រូវល្អណាស់!' : '⚠️ មិនទាន់ត្រឹមត្រូវទេ'}
                  </div>
                  {currentNode.explanation && (
                    <p className="pt-1">{currentNode.explanation}</p>
                  )}
                </div>
              )}

            </div>
          )}

        </div>

        {/* Navigation Controls */}
        <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ថយក្រោយ</span>
          </button>

          {!isLastSlide ? (
            <button
              onClick={handleNext}
              disabled={isQuizSlide && !isAnswered}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-purple-500/20 disabled:opacity-40 transition"
            >
              <span>ស្លាយបន្ទាប់</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div>
              {!isCompleted ? (
                <button
                  onClick={handleFinish}
                  disabled={completing}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{completing ? 'កំពុងកត់ត្រា...' : 'បញ្ចប់ស្លាយមេរៀននេះ'}</span>
                </button>
              ) : (
                <button
                  onClick={onNext}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition"
                >
                  <span>បន្តទៅមេរៀនបន្ទាប់</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

