import {
  Form,
  redirect,
  data,
  useActionData,
  useNavigation,
} from 'react-router';
import type { Route } from './+types/login';
import { getUserByUsername } from '../db.server';
import { useAuth } from '../auth-context';
import React from 'react';

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const username = String(formData.get('username'));
  const password = String(formData.get('password'));

  const user = await getUserByUsername(username);
  if (!user || user.password !== password) {
    return data({ error: 'Invalid credentials' }, { status: 400 });
  }

  // For simplicity, store the userId in a cookie so loaders can read it server side
  const headers = new Headers();
  headers.append('Set-Cookie', `userId=${user.id}; Path=/; HttpOnly`);

  return redirect('/dashboard', { headers });
}

export default function Login() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const { setUserId } = useAuth();

  // Keep AuthContext in sync with localStorage
  React.useEffect(() => {
    const stored = window.localStorage.getItem('userId');
    if (stored) setUserId(stored);
  }, []);

  return (
    <main className="container mx-auto p-8 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      {actionData && actionData.error && (
        <p className="text-red-600 mb-2">{actionData.error}</p>
      )}
      <Form method="post" className="flex flex-col gap-4">
        <input name="username" placeholder="Username" className="border p-2" />
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="border p-2"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
          disabled={navigation.state === 'submitting'}
        >
          {navigation.state === 'submitting' ? 'Logging in...' : 'Log In'}
        </button>
      </Form>
    </main>
  );
}
