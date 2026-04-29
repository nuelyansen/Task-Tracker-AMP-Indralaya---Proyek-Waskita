import { useState, FormEvent } from 'react';
import { useStore } from '../store';
import { LogIn, UserPlus, Mail, User, Shield, Lock, CheckCircle2, ChevronLeft } from 'lucide-react';

export function Login() {
  const { login, addMember } = useStore();
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'verification'>('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Team Member',
    department: 'Other'
  });

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(loginForm.email, loginForm.password);
    if (!success) {
      setError('Email atau password salah');
    }
  };

  const handleRegister = (e: FormEvent) => {
    e.preventDefault();
    addMember({
      name: registerForm.name,
      email: registerForm.email,
      password: registerForm.password,
      role: registerForm.role,
      department: registerForm.department,
      avatar: `https://i.pravatar.cc/150?u=${registerForm.email}`,
      isOnline: true,
      isAdmin: false,
      isVerified: true // Actually marking as verified for the prototype after "sending" email
    });
    setActiveTab('verification');
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-800 font-sans items-center justify-center relative overflow-hidden p-4">
      {/* Background decorations */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-indigo-100 rounded-full blur-[120px] opacity-40 pointer-events-none"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-blue-100 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>

      <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-md z-10 overflow-hidden shadow-2xl">
        {activeTab !== 'verification' && (
          <div className="flex bg-slate-50/50 border-b border-slate-200">
            <button 
              onClick={() => { setActiveTab('login'); setError(''); }}
              className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'login' ? 'text-indigo-600 bg-white border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LogIn size={16} />
              Masuk
            </button>
            <button 
              onClick={() => { setActiveTab('register'); setError(''); }}
              className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'register' ? 'text-indigo-600 bg-white border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <UserPlus size={16} />
              Daftar
            </button>
          </div>
        )}

        <div className="p-8">
          {activeTab === 'verification' ? (
            <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 border border-emerald-200">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Email Terkirim!</h2>
              <p className="text-slate-600 text-sm mb-8">
                Kami telah mengirimkan link aktivasi ke <strong className="text-indigo-600">{registerForm.email}</strong>.<br/>
                <span className="text-[10px] text-slate-400 mt-2 block">(Simulasi: Klik tombol di bawah untuk aktivasi instan)</span>
              </p>
              <div className="flex flex-col gap-3 w-full">
                <button 
                  onClick={() => {
                    login(registerForm.email, registerForm.password);
                  }}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-200"
                >
                  Konfirmasi Aktivasi Sekarang
                </button>
                <button 
                  onClick={() => setActiveTab('login')}
                  className="flex items-center justify-center gap-2 text-slate-500 font-medium hover:text-indigo-600 transition-colors text-sm"
                >
                  <ChevronLeft size={16} />
                  Kembali ke halaman login
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex flex-col items-center justify-center mb-4 shadow-xl shadow-indigo-100">
                  <span className="text-white font-black text-2xl leading-none">TT</span>
                  <span className="text-white/80 font-bold text-xs uppercase tracking-tighter">PM</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 text-center">
                  {activeTab === 'login' ? 'Selamat Datang' : 'Pendaftaran Akun'}
                </h1>
                <p className="text-sm text-slate-500 text-center mt-2 px-4">
                  {activeTab === 'login' 
                    ? 'Sistem Monitoring Tugas PT Hakaaston' 
                    : 'Daftarkan email Anda untuk akses Task Tracker PT Hakaaston'}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                  {error}
                </div>
              )}

              {activeTab === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Alamat Email</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        required
                        type="email" 
                        placeholder="email@perusahaan.com"
                        value={loginForm.email}
                        onChange={e => setLoginForm({...loginForm, email: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all placeholder-slate-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        required
                        type="password" 
                        placeholder="••••••••"
                        value={loginForm.password}
                        onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all placeholder-slate-400"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-100 mt-4"
                  >
                    Masuk Sekarang
                  </button>
                  
                  <div className="pt-4 text-center">
                    <p className="text-xs text-slate-400">Demo accounts:</p>
                    <p className="text-[10px] text-slate-500 mt-1">budi@example.com / password123 (Admin)</p>
                    <p className="text-[10px] text-slate-500">agus@example.com / password123 (Member)</p>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Nama Lengkap</label>
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        required
                        type="text" 
                        placeholder="Contoh: Andi Wijaya"
                        value={registerForm.name}
                        onChange={e => setRegisterForm({...registerForm, name: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all placeholder-slate-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Alamat Email</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        required
                        type="email" 
                        placeholder="andi@perusahaan.com"
                        value={registerForm.email}
                        onChange={e => setRegisterForm({...registerForm, email: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all placeholder-slate-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        required
                        type="password" 
                        placeholder="Min. 8 karakter"
                        value={registerForm.password}
                        onChange={e => setRegisterForm({...registerForm, password: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all placeholder-slate-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Jabatan / Role</label>
                    <div className="relative">
                      <Shield size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <select 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all appearance-none cursor-pointer"
                        value={registerForm.role}
                        onChange={e => setRegisterForm({...registerForm, role: e.target.value})}
                      >
                        <option value="Team Member">Team Member</option>
                        <option value="Project Manager">Project Manager</option>
                        <option value="Developer">Developer</option>
                        <option value="Designer">Designer</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-100 mt-4"
                  >
                    Daftar Sekarang
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
