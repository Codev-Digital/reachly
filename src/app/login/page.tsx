import LoginPage from './LoginPage';

// Reading searchParams on the server lets the whole form render in the first
// HTML, instead of waiting for client JS behind a Suspense fallback.
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  return <LoginPage callbackUrl={callbackUrl || '/welcome'} />;
}
