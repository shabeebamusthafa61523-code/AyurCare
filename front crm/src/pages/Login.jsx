import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ChevronRight, Eye, EyeOff, X, Phone, Check, Key, Sun, Moon, ShieldCheck, Leaf, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';
import { useUser } from '../contexts/UserContext';
import { GoogleLogin } from '@react-oauth/google';
import { resolveUserDashboardPath } from '../utils/userDashboard';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const { showToast } = useToast();
  const { setUser } = useUser();
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    const apiBaseUrl = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

    try {
      const response = await fetch(`${apiBaseUrl}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const result = await response.json();

      if (response.ok && result.token) {
        localStorage.setItem('token', result.token);
        if (result.user?.id || result.user?._id) {
          localStorage.setItem('user_id', String(result.user.id || result.user._id));
        }
        localStorage.setItem('user', JSON.stringify(result.user));
        if (typeof setUser === 'function' && result.user) {
          setUser(result.user);
        }
        showToast('Google Sign-In successful!', 'success');

        const targetDashboard = resolveUserDashboardPath(result.user);
        setTimeout(() => {
          navigate(targetDashboard);
        }, 500);
      } else {
        showToast(result.detail || result.message || 'Google Sign-In failed.', 'error');
      }
    } catch (err) {
      console.error('Google Login Error:', err);
      showToast('Connection error during Google Sign-In.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  React.useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('timeout') === 'true') {
      // Small timeout to allow toast provider to mount fully
      setTimeout(() => {
        showToast('Session expired due to inactivity. Please sign in again.', 'warning');
      }, 300);
      navigate('/login', { replace: true });
    }
  }, [showToast, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: name === 'email' ? value.trim() : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const apiBaseUrl = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

    try {
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      let result = {};
      try {
        result = await response.json();
      } catch (jsonErr) {
        if (!response.ok) {
          showToast(`Server Connection Error (${response.status}: ${response.statusText || 'Bad Gateway'}). Please ensure the backend server is running.`, 'error');
          return;
        }
      }

      if (response.ok && result.token) {
        // 1. Save the token
        localStorage.setItem('token', result.token);

        // 2. Extract and Save User ID
        let userId = result.user?.id;

        if (!userId) {
          try {
            const base64Url = result.token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));
            userId = payload.id || payload.sub;
          } catch (decodeError) {
            console.error("Token decoding failed:", decodeError);
          }
        }

        // --- CRITICAL FIX: Save the specific 'user_id' key for Attendance ---
        if (userId) {
          localStorage.setItem('user_id', String(userId));
        }

        // 3. Save full user object for profile/other uses
        const userObj = result.user || { id: userId };
        localStorage.setItem('user', JSON.stringify(userObj));
        if (typeof setUser === 'function' && userObj) {
          setUser(userObj);
        }
        showToast('Login successful!', 'success');

        const targetDashboard = resolveUserDashboardPath(userObj);
        navigate(targetDashboard);
      } else {
        showToast(result.detail || "Authentication Failed", 'error');
      }
    } catch (error) {
      console.error("Login Error:", error);
      showToast("Something went wrong. Please check your server status.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-emerald-50/70 via-[#f7f9f6] to-teal-50/60 dark:from-[#06110c] dark:via-[#091611] dark:to-[#040d09] relative overflow-hidden transition-colors duration-500 font-sans">
      {/* Subtle Ayurvedic Clinical Dot Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none opacity-[0.06] dark:opacity-[0.12]" />

      {/* Ambient Glowing Ayurvedic Orbs */}
      <div className="absolute -top-32 -left-32 w-96 sm:w-[36rem] h-96 sm:h-[36rem] bg-emerald-500/15 dark:bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 sm:w-[34rem] h-96 sm:h-[34rem] bg-teal-500/15 dark:bg-teal-500/8 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-amber-400/10 dark:bg-amber-400/5 blur-[110px] rounded-full pointer-events-none" />

      {/* Top Bar Floating Badges */}
      <div className="absolute top-5 left-5 z-40 hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 text-xs font-semibold backdrop-blur-md shadow-xs">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="tracking-wide">AyurCare Clinical Hospital Suite</span>
      </div>

      {/* Floating Theme Toggle */}
      <div className="absolute top-5 right-5 z-50">
        <button
          type="button"
          onClick={() => setIsDark(!isDark)}
          className="p-3 rounded-2xl bg-white/80 dark:bg-emerald-950/50 backdrop-blur-md border border-emerald-100 dark:border-emerald-800/60 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
          title="Toggle light / dark mode"
        >
          {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-emerald-700" />}
        </button>
      </div>
      
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md z-10 my-4">

        {/* Top Logo & Branding */}
        <div className="text-center mb-6">
          <div className="flex justify-center items-center">
            <img 
              src="/login-logo.png" 
              alt="AyurCare Logo" 
              className="h-24 sm:h-28 w-auto object-contain drop-shadow-md transition-transform hover:scale-105 duration-300" 
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/70 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-800/70 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold tracking-wide mt-3 shadow-xs">
            <Leaf className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Ayurvedic Polyclinic &amp; EMR Portal</span>
          </div>
        </div>

        {/* Card Form */}
        <div className="rounded-[2.2rem] border border-emerald-100/90 dark:border-emerald-900/40 bg-white/85 dark:bg-[#0c1813]/85 backdrop-blur-2xl shadow-2xl shadow-emerald-950/10 dark:shadow-black/60 p-7 sm:p-9 relative overflow-hidden">
          {/* Top Decorative Herb Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400" />

          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Staff Sign-In</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Enter your credentials to access patient charts, tokens & billing</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                <span>Email or Staff ID</span>
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500"
                  size={17}
                />
                <input
                  required
                  name="email"
                  type="email"
                  placeholder="doctor@ayurcare.com"
                  autoComplete="username"
                  value={loginData.email}
                  onChange={handleChange}
                  className="w-full bg-emerald-50/30 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pl-11 pr-4 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center mr-1">
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest ml-1">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotOpen(true)}
                  className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline cursor-pointer transition-all"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500"
                  size={17}
                />
                <input
                  required
                  name="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={loginData.password}
                  onChange={handleChange}
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-emerald-50/30 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pl-11 pr-11 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer p-0.5"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button 
              whileHover={{ scale: 1.015 }} 
              whileTap={{ scale: 0.985 }} 
              disabled={isLoading} 
              type="submit" 
              className="w-full py-4 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-500 hover:via-emerald-600 hover:to-teal-600 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.25em] flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 disabled:opacity-50 cursor-pointer transition-all mt-2"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In To Clinic</span>
                  <ChevronRight size={17} />
                </>
              )}
            </motion.button>
          </form>

          {/* Google Sign In Button */}
          {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
            <>
              {/* Divider */}
              <div className="relative my-6 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <div className="relative bg-white/90 dark:bg-[#0c1813] px-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  or continue with
                </div>
              </div>

              <div className="flex justify-center w-full min-h-[44px]">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => showToast('Google Sign-In failed or closed.', 'error')}
                  theme={isDark ? 'filled_black' : 'outline'}
                  shape="pill"
                  size="large"
                  width="100%"
                />
              </div>
            </>
          )}

          {/* Security & System Trust Badge */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/70 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>HIPAA &amp; EMR Encrypted</span>
            </span>
            <span className="flex items-center gap-1 font-mono text-[10px]">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>v2.4 Active</span>
            </span>
          </div>

        </div>
      </motion.div>

      <AnimatePresence>
        {isForgotOpen && (
          <ForgotPasswordModal
            isOpen={isForgotOpen}
            onClose={() => setIsForgotOpen(false)}
            defaultEmail={loginData.email}
            showToast={showToast}
            onSuccess={(email, newPassword) => {
              setLoginData({ email, password: newPassword });
              setIsForgotOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// --- FORGOT PASSWORD MODAL ---
const ForgotPasswordModal = ({ isOpen, onClose, defaultEmail, showToast, onSuccess }) => {
  const [step, setStep] = useState(1); // 1 = Check email/phone, 2 = Set new password
  const [formData, setFormData] = useState({ email: defaultEmail || '', phone: '', newPassword: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  React.useEffect(() => {
    if (isOpen) {
      setFormData({ email: defaultEmail || '', phone: '', newPassword: '', confirmPassword: '' });
      setStep(1);
    }
  }, [isOpen, defaultEmail]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const password = formData.newPassword;
  const isLongEnough = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[\W_]/.test(password);
  const matchesConfirm = password && password === formData.confirmPassword;

  const isPasswordValid = isLongEnough && hasUppercase && hasLowercase && hasNumber && hasSymbol && matchesConfirm;

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const apiBaseUrl = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

    try {
      const response = await fetch(`${apiBaseUrl}/auth/forgot-password/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, phone: formData.phone }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showToast("Identity verified. Please set your new password.", "success");
        setStep(2);
      } else {
        showToast(result.detail || "Verification failed. Check your email and phone number.", "error");
      }
    } catch (error) {
      console.error("Verification Error:", error);
      showToast("Something went wrong. Please check your server status.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!isPasswordValid) return;
    setIsLoading(true);
    const apiBaseUrl = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

    try {
      const response = await fetch(`${apiBaseUrl}/auth/forgot-password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, phone: formData.phone, newPassword: formData.newPassword }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showToast("Password updated successfully! Autofilled credentials.", "success");
        if (onSuccess) {
          onSuccess(formData.email, formData.newPassword);
        } else {
          onClose();
        }
      } else {
        showToast(result.detail || "Reset failed. Please try again.", "error");
      }
    } catch (error) {
      console.error("Reset Error:", error);
      showToast("Something went wrong. Please check your server status.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const Rule = ({ met, label }) => (
    <div className="flex items-center gap-2 text-xs">
      <div className={`h-4 w-4 rounded-full flex items-center justify-center border transition-all ${
        met 
          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" 
          : "bg-slate-500/5 border-slate-500/20 text-slate-400 dark:text-slate-500"
      }`}>
        <Check size={10} className={met ? "opacity-100" : "opacity-30"} />
      </div>
      <span className={met ? "text-emerald-500 font-semibold" : "text-slate-500 dark:text-slate-400"}>
        {label}
      </span>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex justify-center items-start overflow-y-auto pt-16 pb-16 p-4"
    >
      <motion.div 
        initial={{ y: -50, scale: 0.95 }} 
        animate={{ y: 0, scale: 1 }} 
        exit={{ y: -50, scale: 0.95 }}
        className="bg-white dark:bg-[#0c1813] border border-emerald-100 dark:border-emerald-900/50 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative mt-12 overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400" />

        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        <header className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Forgot <span className="text-emerald-600 dark:text-emerald-400">Password</span>
          </h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
            {step === 1 ? "Step 1: Verify Identity" : "Step 2: Reset Credentials"}
          </p>
        </header>

        {step === 1 ? (
          <form onSubmit={handleVerify} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" size={16} />
                <input
                  required
                  name="email"
                  type="email"
                  autoComplete="username"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pl-11 pr-4 text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" size={16} />
                <input
                  required
                  name="phone"
                  type="tel"
                  maxLength={10}
                  placeholder="10-digit number"
                  value={formData.phone}
                  onChange={e => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData(prev => ({ ...prev, phone: digits }));
                  }}
                  className={`w-full bg-slate-50 dark:bg-slate-950 border rounded-2xl py-3.5 pl-11 pr-4 text-slate-900 dark:text-slate-100 outline-none transition-all text-sm ${
                    formData.phone && formData.phone.length !== 10
                      ? 'border-red-400 focus:border-red-400'
                      : 'border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'
                  }`}
                />
              </div>
              {formData.phone && formData.phone.length !== 10 && (
                <p className="text-[10px] text-red-500 ml-2">Must be exactly 10 digits.</p>
              )}
            </div>

            <button
              disabled={isLoading}
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 disabled:opacity-50 cursor-pointer transition-all"
            >
              {isLoading ? "Checking..." : "Verify Identity"}
              {!isLoading && <ChevronRight size={16} />}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-5">
            {/* Hidden email input for browser credential manager to associate password change */}
            <input type="hidden" name="email" value={formData.email} autoComplete="username" />

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" size={16} />
                <input
                  required
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pl-11 pr-12 text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" size={16} />
                <input
                  required
                  name="confirmPassword"
                  type={showNewPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pl-11 pr-12 text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div className="bg-emerald-50/50 dark:bg-slate-950/60 border border-emerald-100 dark:border-emerald-950 p-4 rounded-2xl space-y-2">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                Password Requirements
              </span>
              <Rule met={isLongEnough} label="At least 8 characters" />
              <Rule met={hasUppercase} label="Includes uppercase letter (A-Z)" />
              <Rule met={hasLowercase} label="Includes lowercase letter (a-z)" />
              <Rule met={hasNumber} label="Includes number (0-9)" />
              <Rule met={hasSymbol} label="Includes special symbol (e.g. !@#$%^&*)" />
              <Rule met={matchesConfirm} label="Passwords match" />
            </div>

            <button
              disabled={isLoading || !isPasswordValid}
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 disabled:opacity-50 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.98]"
            >
              {isLoading ? "Saving..." : "Reset Password"}
              {!isLoading && <Key size={16} />}
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Login;
