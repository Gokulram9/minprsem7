import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Bell, CheckCheck, Clock, ShieldAlert, Calendar, MessageSquare, FileText, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/notifications');
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      setMarkingAll(true);
      await axios.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleMarkOneRead = async (id) => {
    try {
      await axios.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => (n._id === id ? { ...n, read: true } : n)));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Hearing':
      case 'HearingScheduled':
      case 'HearingRescheduled':
        return <Calendar size={18} className="text-amber-500" />;
      case 'Message':
        return <MessageSquare size={18} className="text-blue-500" />;
      case 'Document':
      case 'DocumentUploaded':
        return <FileText size={18} className="text-emerald-500" />;
      case 'JudgeAssigned':
      case 'LawyerAssigned':
        return <ShieldAlert size={18} className="text-purple-500" />;
      default:
        return <Bell size={18} className="text-[#B69B72]" />;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'Unread') return !n.read;
    if (filter === 'Read') return n.read;
    if (filter === 'Hearings') return n.category?.toLowerCase().includes('hearing');
    if (filter === 'Messages') return n.category === 'Message';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6 rounded-[2rem] border border-slate-200/70 bg-white dark:bg-[#1B2332] p-8 shadow-sm backdrop-blur-xl dark:border-slate-800">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs uppercase tracking-[0.3em] font-bold text-[#B69B72]">Notifications Center</p>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-500/30">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#202A3B] dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Alerts & Judicial Dockets
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Real-time case proceedings, judge designations, counsel communications, and reminders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#202A3B] text-white text-xs font-bold hover:bg-[#2e3b52] transition border border-[#B69B72]/30"
            >
              <CheckCheck size={14} className="text-[#B69B72]" />
              {markingAll ? 'Updating...' : 'Mark all read'}
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-3 overflow-x-auto text-xs font-bold">
        {['All', 'Unread', 'Hearings', 'Messages', 'Read'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === tab
                ? 'bg-[#202A3B] text-[#D9C7A5] dark:bg-white dark:text-[#202A3B]'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notification Items */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
          <div className="h-8 w-8 rounded-full border-2 border-[#B69B72] border-t-transparent animate-spin" />
          <p className="text-xs">Syncing notifications from MongoDB...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-center text-slate-400">
          <CheckCircle2 size={36} className="text-emerald-500/40" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">You are all caught up!</p>
          <p className="text-xs text-slate-400 max-w-sm">No notifications found matching the selected filter. Real-time docket updates and hearing alerts will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => {
            const timeAgo = notification.createdAt
              ? new Date(notification.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
              : 'Recent';

            return (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => !notification.read && handleMarkOneRead(notification._id)}
                className={`group relative rounded-2xl border p-4 sm:p-5 transition cursor-pointer ${
                  notification.read
                    ? 'border-slate-200/60 bg-[#FAF9F5]/60 dark:border-slate-800/60 dark:bg-[#202A3B]/20'
                    : 'border-[#B69B72]/40 bg-white shadow-xs dark:border-[#B69B72]/30 dark:bg-[#1E293B]'
                }`}
              >
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                      {getCategoryIcon(notification.category)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-[#202A3B] dark:text-white">
                          {notification.title || 'Docket Notification'}
                        </h4>
                        {!notification.read && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                        )}
                        {notification.category && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                            {notification.category}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {notification.message}
                      </p>
                      {notification.application && (
                        <p className="mt-1 text-[11px] font-semibold text-[#B69B72]">
                          Docket: {notification.application.caseTitle || 'Legal Matter'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0 text-right">
                    <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                      <Clock size={12} />
                      {timeAgo}
                    </span>
                    {!notification.read && (
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline">
                        Click to mark read
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
