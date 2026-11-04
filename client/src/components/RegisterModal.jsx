import React, { useState } from 'react';
import { UserPlus, User, Lock, Phone, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RegisterModal({ onRegisterSuccess, onSwitchToLogin }) {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const is11Digits = /^\d{11}$/.test(inviteCode.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !username.trim() || !password || !inviteCode.trim()) {
      setError('សូមបំពេញព័ត៌មានចាំបាច់ទាំងអស់');
      return;
    }

    if (!is11Digits) {
      setError('លេខកូដចុះឈ្មោះត្រូវតែមាន ១១ ខ្ទង់គត់ (លេខទាំងអស់ ឧទាហរណ៍៖ 12345678901) ដែលទទួលបានពី teacherThat');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          username: username.trim(),
          password,
          phone: phone.trim(),
          inviteCode: inviteCode.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'ការចុះឈ្មោះបរាជ័យ');
      }
      onRegisterSuccess(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const useDefaultDemoCode = () => {
    setInviteCode('12345678901');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-tr from-emerald-600 to-teal-600 p-8 text-white text-center">
          <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-inner">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">បង្កើតគណនីចូលរៀន</h2>
          <p className="text-emerald-100 text-xs mt-1">
            បញ្ចូលព័ត៌មានសង្ខេប និងលេខកូដ ១១ ខ្ទង់ពីលោកគ្រូ teacherThat
          </p>
        </div>

        {/* Form Body */}
        <div className="p-8">
          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ឈ្មោះពេញ (Full Name) *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="ឧ. ចាន់ សំណាង (Chan Samnang)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ឈ្មោះគណនី (Username) *
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="samnang12"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  លេខទូរស័ព្ទ (Phone)
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="012345678"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ពាក្យសម្ងាត់ (Password) *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                required
              />
            </div>

            {/* 11-digit Code input with highlight */}
            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                  លេខកូដ ១១ ខ្ទង់ ពី teacherThat *
                </label>
                {is11Digits && (
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> គ្រប់ ១១ ខ្ទង់
                  </span>
                )}
              </div>
              <input
                type="text"
                maxLength={11}
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="បញ្ចូលលេខកូដ ១១ ខ្ទង់ (ឧ. 12345678901)"
                className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition"
                required
              />
              <div className="flex items-center justify-between mt-2 text-[11px] text-amber-700">
                <span>ប្រវែងបច្ចុប្បន្ន: {inviteCode.length}/11 ខ្ទង់</span>
                <button
                  type="button"
                  onClick={useDefaultDemoCode}
                  className="font-semibold text-blue-700 hover:underline"
                >
                  ប្រើលេខកូដគំរូ (12345678901)
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !is11Digits}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-600/20 transition disabled:opacity-50 mt-2"
            >
              {loading ? 'កំពុងបង្កើតគណនី...' : 'ចុះឈ្មោះចូលរៀនភ្លាមៗ'}
            </button>
          </form>

          {/* Switch to Login */}
          <div className="mt-5 text-center">
            <p className="text-xs text-slate-600">
              មានគណនីរួចហើយ?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-emerald-700 font-bold hover:underline"
              >
                ចូលគណនីនៅទីនេះ
              </button>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

