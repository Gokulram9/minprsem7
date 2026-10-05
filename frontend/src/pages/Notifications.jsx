const notifications = [
  { title: 'Hearing reminder', message: 'Your hearing is scheduled for tomorrow at 11:00 AM.', time: '2 mins ago' },
  { title: 'Document review', message: 'Court staff has reviewed your submitted affidavit.', time: '1 hour ago' },
  { title: 'Lawyer message', message: 'Your matched lawyer has shared a case update.', time: '3 hours ago' },
  { title: 'New appointment', message: 'A follow-up strategy session is confirmed for Friday.', time: 'Yesterday' },
];

const Notifications = () => (
  <div className="space-y-8 rounded-[2rem] border border-slate-200/70 bg-white/95 p-8 shadow-[0_24px_72px_-36px_rgba(15,23,42,0.25)] backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/95">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-sky-500">Notifications</p>
        <h2 className="text-3xl font-semibold text-slate-950 dark:text-white">Alerts and case updates</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">All your important portal notifications in one place.</p>
      </div>
      <button className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">Mark all read</button>
    </div>

    <div className="space-y-4">
      {notifications.map((notification) => (
        <div key={notification.title} className="rounded-[1.75rem] border border-slate-200/70 bg-slate-50 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{notification.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{notification.message}</p>
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">{notification.time}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Notifications;
