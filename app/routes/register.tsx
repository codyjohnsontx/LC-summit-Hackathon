import {
  Form,
  redirect,
  data,
  useActionData,
  useNavigation,
} from 'react-router';
import type { Route } from './+types/register';
import { createUser, getUserByUsername } from '../db.server';

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const username = String(formData.get('username'));
  const password = String(formData.get('password'));

  const existing = await getUserByUsername(username);
  if (existing) {
    return data({ error: 'Username already taken' }, { status: 400 });
  }

  await createUser(username, password);
  return redirect('/login');
}

export default function Register() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  return (
    <main className="container mx-auto p-8 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
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
          className="bg-green-600 text-white py-2 px-4 rounded disabled:opacity-50"
          disabled={navigation.state === 'submitting'}
        >
          {navigation.state === 'submitting' ? 'Registering...' : 'Register'}
        </button>
      </Form>
    </main>
  );
}
