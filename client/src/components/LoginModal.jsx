import React, { useState } from 'react';
import { LogIn, User, Lock, Sparkles, AlertCircle } from 'lucide-react';

export default function LoginModal({ onLoginSuccess, onSwitchToRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('សូមបញ្ចូលឈ្មោះគណនី និងពាក្យសម្ងាត់');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'ការចូលគណនីបរាជ័យ');
      }
      onLoginSuccess(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillAdmin = () => {
    setUsername('teacherThat');
    setPassword('teacher@123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-8 text-white text-center relative overflow-hidden">
          <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-inner">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">ចូលគណនីរៀន</h2>
          <p className="text-blue-100 text-sm mt-1">
            English for Education Studies I
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ឈ្មោះគណនី (Username)
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ឧ. somnang, teacherThat"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ពាក្យសម្ងាត់ (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/20 transition disabled:opacity-50"
            >
              {loading ? 'កំពុងផ្ទៀងផ្ទាត់...' : 'ចូលរៀន'}
            </button>
          </form>

          {/* Teacher quick login demo */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>គណនីលោកគ្រូ Admin?</span>
            <button
              onClick={fillAdmin}
              type="button"
              className="text-blue-600 font-semibold hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              បំពេញ teacherThat (Demo)
            </button>
          </div>

          {/* Switch to Register */}
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-600">
              មិនទាន់មានគណនីមែនទេ?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-blue-600 font-bold hover:underline"
              >
                ចុះឈ្មោះចូលរៀនទីនេះ
              </button>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

