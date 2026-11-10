import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import FloatingHologram from '../components/3d/FloatingHologram';
import Card3DTilt from '../components/3d/Card3DTilt';

export const Register = () => {
  const { register: registerUser, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    const res = await registerUser(data.name, data.email, data.password);
    setIsLoading(false);
    if (res.success) {
      navigate('/dashboard');
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    const res = await loginWithGoogle();
    setIsGoogleLoading(false);
    if (res.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Branding & 3D Hologram Column */}
        <div className="hidden lg:flex lg:col-span-6 flex-col items-center justify-center p-6">
          <FloatingHologram
            title="Next-Gen Warranty Security"
            subtitle="Store unlimited invoices, extract expiry milestones automatically with neural OCR, and receive intelligent reminders."
          />
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <Card3DTilt maxTilt={4} className="glass-card rounded-3xl p-6 sm:p-8 border border-gold-500/30 shadow-3d-card">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-400 to-brown-900 p-[1px] mx-auto mb-3 shadow-gold-sm">
                <div className="w-full h-full bg-brown-950 rounded-[15px] flex items-center justify-center">
                  <Shield className="w-6 h-6 text-gold-400" />
                </div>
              </div>
              <h1 className="text-2xl font-extrabold text-brown-50 tracking-tight">
                Join <span className="gold-gradient-text">DocAlert</span>
              </h1>
              <p className="text-xs text-brown-300 mt-1">
                Start protecting your high-value assets and warranties in seconds
              </p>
            </div>

            {/* Google Authentication Button */}
            <button
              type="button"
              id="google-signup-btn"
              onClick={handleGoogleSignUp}
              disabled={isGoogleLoading || isLoading}
              className="w-full mb-5 py-3 px-4 rounded-2xl bg-brown-900/90 hover:bg-brown-850 border border-gold-500/30 hover:border-gold-400/60 text-xs sm:text-sm font-bold text-brown-100 transition-all flex items-center justify-center gap-3 shadow-gold-sm cursor-pointer group"
            >
              {isGoogleLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-gold-400/40 border-t-gold-400 rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1c0 2.8.7 5.4 1.9 7.8l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                  />
                </svg>
              )}
              <span>Sign up with Google</span>
            </button>

            <div className="relative flex py-2 items-center mb-5">
              <div className="flex-grow border-t border-brown-800" />
              <span className="flex-shrink mx-3 text-[10px] uppercase font-mono text-brown-400">or sign up with email</span>
              <div className="flex-grow border-t border-brown-800" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-brown-200 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-brown-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    id="register-name-input"
                    {...register('name', { required: 'Name is required' })}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl glass-input text-sm"
                    placeholder="Alexander Vance"
                  />
                </div>
                {errors.name && (
                  <span className="text-[11px] text-red-400 mt-1 block">{errors.name.message}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-brown-200 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-brown-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    id="register-email-input"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: 'Enter a valid email address',
                      },
                    })}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl glass-input text-sm"
                    placeholder="alex@company.com"
                  />
                </div>
                {errors.email && (
                  <span className="text-[11px] text-red-400 mt-1 block">{errors.email.message}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-brown-200 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-brown-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    id="register-password-input"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl glass-input text-sm"
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && (
                  <span className="text-[11px] text-red-400 mt-1 block">{errors.password.message}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-brown-200 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-brown-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    id="register-confirm-password-input"
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (val) => val === password || 'Passwords do not match',
                    })}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl glass-input text-sm"
                    placeholder="••••••••"
                  />
                </div>
                {errors.confirmPassword && (
                  <span className="text-[11px] text-red-400 mt-1 block">
                    {errors.confirmPassword.message}
                  </span>
                )}
              </div>

              <button
                type="submit"
                id="register-submit-button"
                disabled={isLoading || isGoogleLoading}
                className="w-full py-3 rounded-xl text-xs font-bold btn-gold-glow flex items-center justify-center gap-2 mt-4"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-brown-950/40 border-t-brown-950 rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create DocAlert Account</span>
                    <ArrowRight className="w-4 h-4 text-brown-950" />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="text-center mt-6 pt-4 border-t border-brown-800/80">
              <p className="text-xs text-brown-300">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-gold-400 hover:text-gold-300 underline underline-offset-4">
                  Sign in
                </Link>
              </p>
            </div>
          </Card3DTilt>
        </div>
      </div>
    </div>
  );
};

export default Register;
