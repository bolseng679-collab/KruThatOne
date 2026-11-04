import React, { useRef } from 'react';
import { Award, Printer, X, CheckCircle2, ShieldCheck, Calendar, BookmarkCheck } from 'lucide-react';

export default function CertificateModal({ certificate, onClose }) {
  const certRef = useRef();

  if (!certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(certificate.issueDate || Date.now()).toLocaleDateString('km-KH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedDateEn = new Date(certificate.issueDate || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
      
      {/* Modal Card */}
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full overflow-hidden flex flex-col my-auto">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="print:hidden bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm">វិញ្ញាបនបត្របញ្ជាក់ការសិក្សា (Certificate of Completion)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>បោះពុម្ព / ទាញយកជា PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE CERTIFICATE VIEW */}
        <div className="p-4 sm:p-8 bg-slate-100 flex justify-center">
          <div 
            ref={certRef}
            className="certificate-container bg-white w-full max-w-[840px] aspect-[1.414/1] p-8 sm:p-12 relative border-[12px] border-double border-amber-700/80 shadow-2xl rounded-2xl flex flex-col justify-between overflow-hidden"
            style={{
              backgroundImage: 'radial-gradient(circle at center, #ffffff 60%, #fffdf5 100%)'
            }}
          >
            {/* Watermark Background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
              <Award className="w-[500px] h-[500px] text-amber-900" />
            </div>

            {/* Corner Decorative Ornaments */}
            <div className="absolute top-2 left-2 w-10 h-10 border-t-2 border-l-2 border-amber-600 pointer-events-none" />
            <div className="absolute top-2 right-2 w-10 h-10 border-t-2 border-r-2 border-amber-600 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-10 h-10 border-b-2 border-l-2 border-amber-600 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-10 h-10 border-b-2 border-r-2 border-amber-600 pointer-events-none" />

            {/* Certificate Header */}
            <div className="text-center space-y-1 relative z-10">
              <div className="text-[11px] font-bold tracking-[0.2em] text-slate-500 uppercase">
                {certificate.organization}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-900 tracking-tight font-serif pt-1">
                វិញ្ញាបនបត្របញ្ជាក់ការសិក្សា
              </h1>
              <div className="text-xs font-serif italic text-amber-700 tracking-widest uppercase">
                Certificate of Completion
              </div>
              <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto mt-2" />
            </div>

            {/* Certificate Body */}
            <div className="text-center space-y-4 my-auto relative z-10 py-4">
              <p className="text-xs text-slate-600">
                វិញ្ញាបនបត្រនេះត្រូវបានផ្តល់ជូនជាកិត្តិយសចំពោះ <br />
                <span className="italic text-slate-400 text-[11px]">This is proudly presented to</span>
              </p>

              {/* Student Name */}
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-4xl font-extrabold text-blue-950 font-serif border-b-2 border-slate-300 pb-2 inline-block px-8 min-w-[280px]">
                  {certificate.studentName}
                </h2>
                {certificate.school && (
                  <p className="text-xs text-slate-500 font-medium">
                    {certificate.school}
                  </p>
                )}
              </div>

              <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
                ដែលបានខិតខំប្រឹងប្រែងរៀនសូត្រ និងបញ្ចប់ដោយជោគជ័យនូវវគ្គសិក្សាពេញលេញ <br />
                <span className="italic text-slate-400 text-[11px]">For successfully completing all modules and rigorous assessments of</span>
              </p>

              {/* Course Title */}
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl py-2 px-6 inline-block shadow-sm">
                <h3 className="text-lg sm:text-xl font-bold text-amber-950">
                  {certificate.courseTitle}
                </h3>
                <p className="text-[11px] text-amber-800">
                  កម្មវិធីសិក្សា ៩៣៨ មេរៀន (៧ ម៉ូឌុលធំៗ &middot; ៣១ សប្តាហ៍ &middot; ៥៨ តេស្តវាយតម្លៃ)
                </p>
              </div>
            </div>

            {/* Certificate Footer / Signatures & Seal */}
            <div className="pt-4 border-t border-slate-200 grid grid-cols-3 items-end text-center relative z-10 gap-2">
              
              {/* Left: Issue Date & Verification */}
              <div className="text-left space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  កាលបរិច្ឆេទ / Date
                </div>
                <div className="text-xs font-bold text-slate-800">
                  {formattedDate}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {formattedDateEn}
                </div>
                <div className="text-[9px] font-mono text-slate-400 pt-1">
                  លេខកូដសម្គាល់: <strong className="text-slate-600">{certificate.serialNumber}</strong>
                </div>
              </div>

              {/* Center: Golden Seal Badge */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-amber-600 bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 shadow-lg flex flex-col items-center justify-center text-white relative">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-dashed border-amber-700/60 flex flex-col items-center justify-center text-center p-1">
                    <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-amber-950" />
                    <span className="text-[8px] font-extrabold text-amber-950 tracking-tighter uppercase leading-none mt-0.5">
                      VERIFIED
                    </span>
                  </div>
                </div>
                <span className="text-[9px] font-bold text-amber-900 mt-1 uppercase tracking-wider">
                  Official Seal
                </span>
              </div>

              {/* Right: Instructor Signature */}
              <div className="text-right space-y-1">
                <div className="h-9 flex items-end justify-end">
                  <span className="font-serif italic text-lg sm:text-xl font-bold text-blue-900 border-b border-slate-400 px-3 pb-0.5">
                    {certificate.instructor.replace(' (លោកគ្រូ teacherThat)', '')}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900">
                  {certificate.instructor}
                </div>
                <div className="text-[10px] text-slate-500">
                  {certificate.instructorTitle}
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* Print Stylesheet */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .certificate-container, .certificate-container * {
            visibility: visible;
          }
          .certificate-container {
            position: fixed;
            left: 0;
            top: 0;
            width: 100vw !important;
            height: 100vh !important;
            max-width: 100vw !important;
            border-width: 8px !important;
            box-shadow: none !important;
            padding: 2.5rem !important;
            page-break-inside: avoid;
          }
        }
      `}</style>

    </div>
  );
}
