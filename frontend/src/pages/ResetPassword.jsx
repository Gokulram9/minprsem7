import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/ui/button';
import Input from '../components/ui/input';
import { motion } from 'framer-motion';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const token = searchParams.get('token') || '';

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      setStatus(data.message || 'Your password has been reset successfully');
    } catch (error) {
      setStatus('Unable to reset password');
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
              <Lock size={18} />
              Reset password
            </div>
            <h1 className="text-3xl font-semibold text-slate-950 dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>Create a secure new password</h1>
            <p className="text-slate-600 dark:text-slate-300 text-xs">Complete the reset process using the token from your email.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">New password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter a new password" required />
            </div>
            {status && <div className="rounded-[1.5rem] border border-slate-200 bg-slate-100 p-4 text-xs text-slate-700 dark:border-slate-705 dark:bg-slate-900 dark:text-slate-300">{status}</div>}
            <Button type="submit" className="w-full">Reset password</Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Back to{' '}
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

export default ResetPassword;
