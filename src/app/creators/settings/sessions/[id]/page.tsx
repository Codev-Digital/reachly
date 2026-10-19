import SessionForm from '../SessionForm';

export default async function EditSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SessionForm sessionId={id} />;
}
