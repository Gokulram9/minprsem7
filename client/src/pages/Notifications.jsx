const notifications = [
  { title: 'Hearing reminder', message: 'Your hearing is scheduled for tomorrow at 11:00 AM.', time: '2 mins ago' },
  { title: 'Document review', message: 'Court staff has reviewed your submitted affidavit.', time: '1 hour ago' },
  { title: 'Lawyer message', message: 'Your matched lawyer has shared a case update.', time: '3 hours ago' },
  { title: 'New appointment', message: 'A follow-up strategy session is confirmed for Friday.', time: 'Yesterday' },
];

const Notifications = () => (
  <div className="space-y-8 rounded-[2rem] border border-slate-200/70 bg-white dark:bg-[#1B2332] p-8 shadow-sm backdrop-blur-xl dark:border-slate-800">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] font-bold text-[#B69B72]">Notifications</p>
        <h2 className="text-3xl font-semibold text-[#202A3B] dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>Alerts and case updates</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">All your important portal notifications in one place.</p>
      </div>
      <button className="btn-gold rounded-full px-5 py-2 text-xs font-bold text-white transition">Mark all read</button>
    </div>

    <div className="space-y-4">
      {notifications.map((notification) => (
        <div key={notification.title} className="rounded-2xl border border-slate-200/70 bg-[#FAF9F5] p-5 shadow-sm dark:border-slate-800 dark:bg-[#202A3B]/40">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[#202A3B] dark:text-white">{notification.title}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{notification.message}</p>
            </div>
            <span className="text-xs font-semibold text-[#B69B72] dark:text-[#D9C7A5]">{notification.time}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Notifications;
