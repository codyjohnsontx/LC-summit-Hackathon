import {
  Link,
  Form,
  data,
  redirect,
  useLoaderData,
  useNavigation,
} from 'react-router';
import type { Route } from './+types/dashboard';
import {
  getCoffeeShops,
  getSpeedTestsForShop,
  createCoffeeShop,
} from '../db.server';

export async function loader({ request }: Route.LoaderArgs) {
  const shops = await getCoffeeShops();
  const enriched = await Promise.all(
    shops.map(async (s: Awaited<ReturnType<typeof getCoffeeShops>>[number]) => {
      const tests = await getSpeedTestsForShop(s.id);
      const avgDownload =
        tests.length > 0
          ? tests.reduce(
              (a: number, t: { download: number }) => a + t.download,
              0
            ) / tests.length
          : null;
      const avgUpload =
        tests.length > 0
          ? tests.reduce(
              (a: number, t: { upload: number }) => a + t.upload,
              0
            ) / tests.length
          : null;
      const votes = s.votes ? Object.values(s.votes) : [];
      const thumbsUp = votes.filter((v) => v === 1).length;
      const thumbsDown = votes.filter((v) => v === -1).length;
      return { ...s, avgDownload, avgUpload, thumbsUp, thumbsDown };
    })
  );
  return { shops: enriched };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const name = String(formData.get('name'));
  const location = formData.get('location')?.toString() || undefined;
  const userId = request.headers.get('Cookie')?.match(/userId=([^;]+)/)?.[1];
  if (!userId) {
    return data('Unauthorized', { status: 401 });
  }

  await createCoffeeShop(name, location, userId);
  return redirect('/dashboard');
}

export default function Dashboard() {
  const { shops } = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  return (
    <main className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Coffee Shops</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {shops.map((shop) => (
          <Link
            key={shop.id}
            to={`/coffee/${shop.id}`}
            className="border p-4 rounded hover:bg-gray-50"
          >
            <h2 className="font-semibold">{shop.name}</h2>
            <p className="text-sm text-gray-600">
              {shop.avgDownload != null && (
                <>
                  Avg Down: {shop.avgDownload.toFixed(1)} Mbps | Avg Up:{' '}
                  {shop.avgUpload?.toFixed(1)} Mbps •{' '}
                </>
              )}
              👍 {shop.thumbsUp} | 👎 {shop.thumbsDown}
            </p>
          </Link>
        ))}
      </div>

      <h2 className="text-xl font-semibold mb-2">Add a new Coffee Shop</h2>
      <Form method="post" className="flex flex-col gap-2 max-w-md">
        <input name="name" placeholder="Name" className="border p-2" required />
        <input
          name="location"
          placeholder="Location (optional)"
          className="border p-2"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
          disabled={navigation.state === 'submitting'}
        >
          {navigation.state === 'submitting' ? 'Adding...' : 'Add Coffee Shop'}
        </button>
      </Form>
    </main>
  );
}
