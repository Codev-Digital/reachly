'use client';

import { use } from 'react';
import { EventEditor } from '../../create/page';

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <EventEditor eventId={id} />;
}
