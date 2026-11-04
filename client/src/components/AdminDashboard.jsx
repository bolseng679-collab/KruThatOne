import React, { useState, useEffect } from 'react';
import { Users, KeyRound, Award, BookOpen, RefreshCw, Plus, Check, X, Search, ShieldCheck, ArrowUpRight, BarChart3, RotateCcw } from 'lucide-react';

export default function AdminDashboard({ onViewCertificate }) {
  const [activeTab, setActiveTab] = useState('students'); // 'students', 'codes'
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Code Generation Form State
  const [newCustomCode, setNewCustomCode] = useState('');
  const [newCodeNote, setNewCodeNote] = useState('');
  const [newCodeMaxUses, setNewCodeMaxUses] = useState(100);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [codeMsg, setCodeMsg] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const [statsRes, studentsRes, codesRes] = await Promise.all([
        fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/students', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/codes', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (studentsRes.ok) {
        const data = await studentsRes.json();
        setStudents(data.students || []);
      }
      if (codesRes.ok) {
        const data = await codesRes.json();
        setCodes(data.codes || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleResetStudent = async (studentId, studentName) => {
    if (!window.confirm(`តើអ្នកពិតជាចង់កំណត់វឌ្ឍនភាពរបស់សិស្ស "${studentName}" ឱ្យរៀនពីមេរៀនទី១ ឡើងវិញមែនទេ?`)) return;

    try {
      const res = await fetch(`/api/admin/students/${studentId}/reset`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      alert(data.message || 'បានកំណត់ឡើងវិញ');
      fetchDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleResetTeacherProgress = async () => {
    if (!window.confirm('តើអ្នកចង់កំណត់វឌ្ឍនភាពគណនី teacherThat ឱ្យរៀនពីមេរៀនទី១ ឡើងវិញ ដើម្បីសាកល្បងរៀនដូចសិស្សមែនទេ?')) return;

    try {
      const res = await fetch(`/api/admin/students/admin_1/reset`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      alert(data.message || 'បានកំណត់ឡើងវិញ');
      fetchDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleGenerateCode = async (e) => {
    e.preventDefault();
    setGeneratingCode(true);
    setCodeMsg('');
    try {
      const res = await fetch('/api/admin/codes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          customCode: newCustomCode || undefined,
          note: newCodeNote,
          maxUses: newCodeMaxUses
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'បង្កើតលេខកូដមិនបាន');
      setCodeMsg(data.message);
      setNewCustomCode('');
      setNewCodeNote('');
      fetchDashboardData();
    } catch (err) {
      alert(err.message);
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleToggleCode = async (codeStr) => {
    try {
      const res = await fetch(`/api/admin/codes/${codeStr}/toggle`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      fetchDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredStudents = students.filter(s =>
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.phone && s.phone.includes(searchQuery)) ||
    (s.inviteCodeUsed && s.inviteCodeUsed.includes(searchQuery))
  );

  return (
    <div className="flex-1 bg-slate-100 min-h-[calc(100vh-4rem)] p-4 sm:p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Title Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>ផ្ទាំងគ្រប់គ្រងសម្រាប់លោកគ្រូ teacherThat</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Admin &amp; Student Analytics Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              តាមដានវឌ្ឍនភាពសិស្សរៀន និងគ្រប់គ្រងលេខកូដ ១១ ខ្ទង់
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetTeacherProgress}
              title="កំណត់ teacherThat ឱ្យរៀនពីមេរៀនទី១ ឡើងវិញ ដើម្បីសាកល្បង"
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 rounded-xl text-xs font-bold transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>កំណត់ teacherThat រៀនពីមេរៀនទី១</span>
            </button>

            <button
              onClick={fetchDashboardData}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-xl text-xs font-bold transition border border-white/10"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>ផ្ទុកឡើងវិញ</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">{stats.totalStudents} នាក់</div>
                <div className="text-xs text-slate-500 font-medium">សិស្សចុះឈ្មោះសរុប</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <BarChart3 className="w-7 h-7" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">{stats.avgProgress}%</div>
                <div className="text-xs text-slate-500 font-medium">វឌ្ឍនភាពជាមធ្យម</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">
                  {stats.totalQuizzesPassed} / {stats.totalQuizzesAttempted}
                </div>
                <div className="text-xs text-slate-500 font-medium">តេស្តជាប់ (≥ 80%) / សរុប</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <KeyRound className="w-7 h-7" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">{stats.activeCodesCount} កូដ</div>
                <div className="text-xs text-slate-500 font-medium">លេខកូដ ១១ ខ្ទង់កំពុងប្រើ</div>
              </div>
            </div>

          </div>
        )}

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 gap-2">
          <button
            onClick={() => setActiveTab('students')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'students'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>បញ្ជីសិស្ស &amp; វឌ្ឍនភាព ({students.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('codes')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'codes'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>គ្រប់គ្រងលេខកូដ ១១ ខ្ទង់ ({codes.length})</span>
          </button>
        </div>

        {/* TAB 1: STUDENTS LIST & PROGRESS */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            
            {/* Search & Filter Header */}
            <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="ស្វែងរកតាមឈ្មោះ, Username, ឬលេខទូរស័ព្ទ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="text-xs text-slate-500">
                បង្ហាញ {filteredStudents.length} ក្នុងចំណោម {students.length} សិស្ស
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <th className="py-4 px-6">សិស្ស (Student)</th>
                    <th className="py-4 px-4">លេខកូដ ១១ ខ្ទង់</th>
                    <th className="py-4 px-4">មេរៀនបច្ចុប្បន្ន</th>
                    <th className="py-4 px-4">វឌ្ឍនភាព (% រៀន)</th>
                    <th className="py-4 px-4">តេស្តជាប់ (≥80%)</th>
                    <th className="py-4 px-6 text-right">សកម្មភាព</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        {students.length === 0 ? 'មិនទាន់មានសិស្សចុះឈ្មោះចូលរៀននៅឡើយទេ។' : 'រកមិនឃើញសិស្សតាមការស្វែងរកឡើយ។'}
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                            <span>{s.fullName}</span>
                            {s.school && (
                              <span className="text-[10px] font-normal px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                                {s.school}
                              </span>
                            )}
                          </div>
                          <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                            @{s.username} {s.phone ? `· 📞 ${s.phone}` : ''}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                            <span>ចុះឈ្មោះ: {new Date(s.createdAt).toLocaleDateString('km-KH')}</span>
                            {s.updatedAt && (
                              <span className="text-emerald-600 font-semibold">
                                · បានកែប្រែ: {new Date(s.updatedAt).toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span className="font-mono bg-amber-50 text-amber-800 px-2 py-1 rounded-lg border border-amber-200 font-bold text-[11px]">
                            {s.inviteCodeUsed}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-semibold text-slate-800">
                            មេរៀនទី {s.currentLessonIndex} / 938
                          </div>
                          <div className="text-[11px] text-slate-500 truncate max-w-xs" title={s.currentLessonTitle}>
                            {s.currentLessonTitle}
                          </div>
                        </td>

                        <td className="py-4 px-4 min-w-[160px]">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-bold text-blue-700">{s.progressPct}%</span>
                            <span className="text-slate-400">{s.completedLessonsCount}/938</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-blue-600 h-full rounded-full transition-all duration-300" 
                              style={{ width: `${s.progressPct}%` }}
                            />
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200">
                            <Check className="w-3.5 h-3.5" />
                            {s.testsPassed} តេស្ត
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right flex items-center justify-end gap-2">
                          {s.progressPct === 100 && (
                            <button
                              onClick={() => onViewCertificate && onViewCertificate(s.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-800 hover:bg-amber-100 font-bold transition text-[11px] flex items-center gap-1 shadow-sm"
                              title="មើល និងបោះពុម្ពវិញ្ញាបនបត្រ"
                            >
                              <Award className="w-3.5 h-3.5 text-amber-600" />
                              <span>វិញ្ញាបនបត្រ 🏆</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleResetStudent(s.id, s.fullName)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 font-medium transition text-[11px]"
                          >
                            កំណត់ឡើងវិញ
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 2: 11-DIGIT CODE MANAGEMENT */}
        {activeTab === 'codes' && (
          <div className="space-y-6">
            
            {/* Generate Code Box */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <span>បង្កើតលេខកូដ ១១ ខ្ទង់ថ្មី សម្រាប់សិស្សចុះឈ្មោះ</span>
              </h2>
              <p className="text-xs text-slate-500 mb-5">
                សិស្សអាចប្រើលេខកូដនេះដើម្បីចុះឈ្មោះចូលរៀនវគ្គសិក្សា English for Education Studies I
              </p>

              {codeMsg && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
                  {codeMsg}
                </div>
              )}

              <form onSubmit={handleGenerateCode} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    លេខកូដ ១១ ខ្ទង់ (ទុកទំនេរដើម្បីបង្កើតចៃដន្យ)
                  </label>
                  <input
                    type="text"
                    maxLength={11}
                    value={newCustomCode}
                    onChange={(e) => setNewCustomCode(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder="ឧ. 11223344556"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    កំណត់ចំណាំ / ឈ្មោះថ្នាក់រៀន *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCodeNote}
                    onChange={(e) => setNewCodeNote(e.target.value)}
                    placeholder="ឧ. ថ្នាក់បឋមសិក្សាវគ្គទី១"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ចំនួនសិស្សអតិបរមាដែលអាចប្រើបាន
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newCodeMaxUses}
                    onChange={(e) => setNewCodeMaxUses(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={generatingCode}
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/20 transition disabled:opacity-50"
                  >
                    {generatingCode ? 'កំពុងបង្កើត...' : '+ បង្កើតលេខកូដថ្មី'}
                  </button>
                </div>
              </form>
            </div>

            {/* Codes List Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-200">
                <h3 className="font-bold text-sm text-slate-900">
                  បញ្ជីលេខកូដ ១១ ខ្ទង់ទាំងអស់ក្នុងប្រព័ន្ធ
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <th className="py-4 px-6">លេខកូដ (11 Digits)</th>
                      <th className="py-4 px-4">កំណត់ចំណាំ</th>
                      <th className="py-4 px-4">បានប្រើ / កំណត់</th>
                      <th className="py-4 px-4">ស្ថានភាព</th>
                      <th className="py-4 px-6 text-right">សកម្មភាព</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {codes.map((c) => (
                      <tr key={c.code} className="hover:bg-slate-50/80 transition">
                        <td className="py-4 px-6">
                          <span className="text-base font-black font-mono text-blue-700 tracking-wider">
                            {c.code}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            បង្កើតដោយ: {c.createdBy} &middot; {new Date(c.createdAt).toLocaleDateString('km-KH')}
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-semibold text-slate-800">{c.note}</div>
                        </td>

                        <td className="py-4 px-4">
                          <span className="font-bold text-slate-700">
                            {c.usedCount}
                          </span>
                          <span className="text-slate-400"> / {c.maxUses || '∞'} នាក់</span>
                        </td>

                        <td className="py-4 px-4">
                          {c.active ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                              <Check className="w-3 h-3" /> កំពុងដំណើរការ
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[11px]">
                              <X className="w-3 h-3" /> បានបិទ
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleToggleCode(c.code)}
                            className={`px-3 py-1.5 rounded-lg border font-medium text-[11px] transition ${
                              c.active
                                ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                                : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            {c.active ? 'បិទដំណើរការ' : 'បើកដំណើរការ'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
