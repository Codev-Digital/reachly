import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

/** Resolve the signed-in creator's User `_id`, or null when there is no session. */
export async function currentCreatorId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  await connectDB();
  const user = (await User.findOne({ email: session.user.email }).select('_id').lean()) as {
    _id: { toString(): string };
  } | null;
  return user ? String(user._id) : null;
}
