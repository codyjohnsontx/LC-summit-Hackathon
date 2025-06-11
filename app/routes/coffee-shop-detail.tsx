import {
  Form,
  data,
  redirect,
  useLoaderData,
  useNavigation,
} from 'react-router';
import type { Route } from './+types/coffee-shop-detail';
import {
  getCoffeeShop,
  getSpeedTestsForShop,
  addSpeedTest,
  voteCoffeeShop,
  countVotes,
} from '../db.server';

export async function loader({ params }: Route.LoaderArgs) {
  const { id } = params;
  const shop = await getCoffeeShop(id);
  if (!shop) {
    throw data('Not Found', { status: 404 });
  }
  const tests = await getSpeedTestsForShop(id);
  const { up, down } = countVotes(shop);
  return { shop, tests, votes: { up, down } };
}

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();
  const download = Number(formData.get('download'));
  const upload = Number(formData.get('upload'));
  const intent = formData.get('intent');
  const userId =
    request.headers.get('Cookie')?.match(/userId=([^;]+)/)?.[1] ?? 'anonymous';

  if (intent === 'vote') {
    const voteType = String(formData.get('vote')); // "up" | "down"
    await voteCoffeeShop(params.id, userId, voteType as 'up' | 'down');
    return redirect(`/coffee/${params.id}`);
  }

  await addSpeedTest(params.id, download, upload, userId);
  return redirect(`/coffee/${params.id}`);
}

export default function CoffeeShopDetail() {
  const { shop, tests, votes } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  return (
    <main className="container mx-auto p-8 max-w-lg">
      <h1 className="text-2xl font-bold mb-2">{shop.name}</h1>
      <p className="mb-4 text-gray-600">
        👍 {votes.up} | 👎 {votes.down}
      </p>

      <h2 className="text-xl font-semibold mb-2">Submit Speed Test</h2>
      <Form method="post" className="flex flex-col gap-2 mb-8">
        <input
          name="download"
          type="number"
          step="0.1"
          placeholder="Download Mbps"
          className="border p-2"
          required
        />
        <input
          name="upload"
          type="number"
          step="0.1"
          placeholder="Upload Mbps"
          className="border p-2"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
          disabled={navigation.state === 'submitting'}
        >
          {navigation.state === 'submitting' ? 'Submitting...' : 'Submit'}
        </button>
      </Form>

      <h2 className="text-xl font-semibold mb-2">Rate this Coffee Shop</h2>
      <div className="flex gap-4 mb-8">
        <Form method="post">
          <input type="hidden" name="intent" value="vote" />
          <input type="hidden" name="vote" value="up" />
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            👍 Thumbs Up
          </button>
        </Form>
        <Form method="post">
          <input type="hidden" name="intent" value="vote" />
          <input type="hidden" name="vote" value="down" />
          <button
            type="submit"
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            👎 Thumbs Down
          </button>
        </Form>
      </div>

      <h2 className="text-xl font-semibold mb-2">Speed Tests</h2>
      {tests.length === 0 && <p>No tests yet.</p>}
      <ul className="space-y-2">
        {tests.map((t: any) => (
          <li key={t.id} className="border p-2 rounded">
            <span className="font-mono">
              {new Date(t.createdAt).toLocaleString()}
            </span>
            <div className="text-sm text-gray-700">
              Down: {t.download} Mbps | Up: {t.upload} Mbps
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
