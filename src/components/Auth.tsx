import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Recycle, Mail, Lock, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

interface AuthProps {
  mode: 'login' | 'register';
}

export const Auth: React.FC<AuthProps> = ({ mode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (mode === 'login') {
        localStorage.setItem('eco_token', data.token);
        localStorage.setItem('eco_user', JSON.stringify(data.user));
        navigate('/app');
      } else {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[40px] p-10 shadow-2xl border border-stone-200"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-eco-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-eco-200 mb-6">
            <Recycle size={32} />
          </div>
          <h2 className="text-3xl font-display font-black text-stone-900 uppercase tracking-tight">
            {mode === 'login' ? 'Welcome Back' : 'Join EcoGuide'}
          </h2>
          <p className="text-stone-500 font-medium mt-2">
            {mode === 'login' ? 'Sign in to track your impact' : 'Start your zero-waste journey'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 text-sm font-bold">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-eco-50 border border-eco-100 rounded-2xl flex items-center gap-3 text-eco-700 text-sm font-bold">
            <CheckCircle2 size={18} />
            Registration successful! Redirecting to login...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-stone-400 ml-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
              <input 
                type="email" 
                required
                className="w-full pl-12 pr-4 py-4 bg-stone-50 border-2 border-stone-100 rounded-2xl focus:outline-none focus:border-eco-500 transition-all font-medium"
                placeholder="eco@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-stone-400 ml-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
              <input 
                type="password" 
                required
                className="w-full pl-12 pr-4 py-4 bg-stone-50 border-2 border-stone-100 rounded-2xl focus:outline-none focus:border-eco-500 transition-all font-medium"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-stone-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-eco-600 transition-all shadow-xl flex items-center justify-center gap-3 group disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : (
              <>
                {mode === 'login' ? 'Sign In' : 'Create Account'}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-stone-500 font-medium">
            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
            <Link 
              to={mode === 'login' ? '/register' : '/login'}
              className="ml-2 text-eco-600 font-black hover:underline"
            >
              {mode === 'login' ? 'Register Now' : 'Sign In'}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
