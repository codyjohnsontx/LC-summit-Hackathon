import { Link, useLocation } from 'react-router';
import { useAuth } from './auth-context';

export default function NavBar() {
  const { userId, setUserId } = useAuth();
  const location = useLocation();

  function handleLogout() {
    // Remove localStorage userId and update context
    window.localStorage.removeItem('userId');
    setUserId(null);
    // Optionally redirect to home page
  }

  const linkClass = (path: string) =>
    path === location.pathname
      ? 'text-blue-600 font-semibold'
      : 'text-gray-700 hover:text-blue-600';

  return (
    <header className="bg-white border-b mb-6">
      <nav className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <Link to="/" className={linkClass('/')}>
            Home
          </Link>
          {userId && (
            <Link to="/dashboard" className={linkClass('/dashboard')}>
              Dashboard
            </Link>
          )}
        </div>
        <div className="flex items-center gap-4">
          {userId ? (
            <button
              onClick={handleLogout}
              className="text-gray-700 hover:text-blue-600"
            >
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className={linkClass('/login')}>
                Login
              </Link>
              <Link to="/register" className={linkClass('/register')}>
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
