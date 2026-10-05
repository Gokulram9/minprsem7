import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900">
        <div className="rounded-3xl bg-white px-8 py-6 shadow-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-xl">
            <h1 className="text-3xl font-semibold text-slate-900">Access denied</h1>
            <p className="mt-4 text-slate-600">Your account does not have permission to view this page.</p>
            <p className="mt-2 text-sm text-slate-500">If you believe this is an error, please contact support or sign in with a different account.</p>
            <div className="mt-8 flex justify-center">
              <a href="/" className="rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-400">
                Back to home
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
