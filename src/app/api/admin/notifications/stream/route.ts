import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/User';
import CreatorProfile from '@/models/CreatorProfile';

export const dynamic = 'force-dynamic';

function isAdmin(email?: string | null) {
  if (!email) return false;
  const adminEmails = ['abdullahgotaccess@gmail.com', 'admin@reachly.com'];
  return adminEmails.includes(email.toLowerCase());
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await connectDB();

    const fetchAdminNotifications = async () => {
      const notifications: any[] = [];
      
      const pendingUsers = await User.find({ approvalStatus: 'pending' }).lean();
      const userIds = pendingUsers.map(u => u._id);
      const creatorProfiles = await CreatorProfile.find({ userId: { $in: userIds } }).lean();
      const creatorUserIds = new Set(creatorProfiles.map((cp: any) => cp.userId.toString()));

      for (const user of pendingUsers) {
        const isCreator = creatorUserIds.has(user._id.toString());
        notifications.push({
          id: `usr-${user._id}`,
          type: isCreator ? 'creator_approval' : 'user_approval',
          title: isCreator ? 'New Creator Approval' : 'New User Approval',
          message: `${user.name || user.email} is waiting for account approval.`,
          date: user.createdAt || new Date(),
          link: isCreator ? '/admin/creators' : '/admin/users'
        });
      }

      const recentBookings = await Booking.find({})
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

      for (const booking of recentBookings) {
        if (booking.status === 'completed' || booking.status === 'confirmed' || booking.status === 'pending') {
          notifications.push({
            id: `bkg-${booking._id}`,
            type: 'payment_received',
            title: 'Payment Received',
            message: `A new payment of PKR ${booking.finalPrice} was received.`,
            date: booking.createdAt || new Date(),
            link: '/admin/payments'
          });
        }
      }


      // Creators asking for a chat unlock so a package session can be rescheduled
      const rescheduleReqs = await Booking.find({ 'rescheduleRequest.status': 'pending' }).lean() as any[];
      for (const r of rescheduleReqs) {
        notifications.push({
          id: `rsr-${r._id}`,
          type: 'reschedule_request',
          title: 'Reschedule Request',
          message: `A creator asked to unlock the chat for session ${r.bookingRef} so it can be rescheduled.`,
          date: r.rescheduleRequest?.requestedAt || r.updatedAt || new Date(),
          link: '/admin/reschedule-requests',
        });
      }

      notifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return notifications;
    };

    const responseStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode(`event: connected\ndata: connected\n\n`));

        let lastDataStr = '';

        const checkAndSend = async () => {
          try {
            const data = await fetchAdminNotifications();
            const dataStr = JSON.stringify(data);
            if (dataStr !== lastDataStr) {
              lastDataStr = dataStr;
              controller.enqueue(encoder.encode(`data: ${dataStr}\n\n`));
            }
          } catch (err) {
            console.error('Admin stream fetch error:', err);
          }
        };

        // Send initial data
        await checkAndSend();

        // Server-side poll every 15s instead of client-side HTTP polling
        const interval = setInterval(checkAndSend, 15000);

        // Keep-alive ping
        const keepAliveInterval = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(': ping\n\n'));
          } catch {
            clearInterval(keepAliveInterval);
          }
        }, 30000);

        req.signal.addEventListener('abort', () => {
          clearInterval(interval);
          clearInterval(keepAliveInterval);
        });
      },
    });

    return new NextResponse(responseStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Admin SSE Notification Stream error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
