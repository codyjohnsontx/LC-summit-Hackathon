import type { Route } from './+types/home';
import { Link } from 'react-router';
import { useAuth } from '../auth-context';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Latency & Lattes' },
    { name: 'description', content: 'Welcome to React Router!' },
  ];
}

export default function Home() {
  const { userId } = useAuth();
  return (
    <main className="container mx-auto p-8 text-center max-w-xl">
      <h1 className="text-3xl font-bold mb-4">☕️ Latency & Lattes</h1>
      <p className="mb-6 text-gray-700">
        Discover coffee shops with great internet speeds. Register to add new
        spots and share your own speed tests with the community.
      </p>

      {userId ? (
        <Link
          to="/dashboard"
          className="inline-block bg-blue-600 text-white py-2 px-4 rounded"
        >
          Go to Dashboard
        </Link>
      ) : (
        <div className="flex justify-center gap-4">
          <Link
            to="/login"
            className="bg-blue-600 text-white py-2 px-4 rounded"
          >
            Log In
          </Link>
          <Link to="/register" className="bg-gray-200 py-2 px-4 rounded">
            Register
          </Link>
        </div>
      )}
    </main>
  );
}
