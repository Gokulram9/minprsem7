import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/ui/button';
import Input from '../components/ui/input';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      setStatus(data.message || 'Check your email for instructions');
    } catch (error) {
      setStatus('Unable to send reset email');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100 flex flex-col justify-between">
      <Navbar />
      <div className="mx-auto max-w-xl px-4 py-20 sm:px-6 lg:px-8 w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-[24px] glass-card p-8 shadow-2xl text-left border border-slate-200/50 dark:border-white/10"
        >
          <div className="mb-8 space-y-3">
            <div className="inline-flex items-center gap-3 rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700 dark:bg-sky-900/80 dark:text-sky-200">
              <Mail size={18} />
              Password recovery
            </div>
            <h1 className="text-3xl font-semibold text-slate-950 dark:text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Forgot your password?</h1>
            <p className="text-slate-600 dark:text-slate-300 text-xs">Enter your email and we’ll send a secure link to reset your password.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Email address</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" required />
            </div>
            {status && <div className="rounded-[1.5rem] border border-slate-200 bg-slate-100 p-4 text-xs text-slate-700 dark:border-slate-705 dark:bg-slate-900 dark:text-slate-300">{status}</div>}
            <Button type="submit" className="w-full">Send reset link</Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Remembered your password?{' '}
            <Link to="/login" className="font-semibold text-slate-950 hover:text-sky-500 dark:text-white dark:hover:text-sky-300">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
