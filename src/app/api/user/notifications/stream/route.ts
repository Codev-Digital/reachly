import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Notification from '@/models/Notification';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const responseStream = new ReadableStream({
      async start(controller) {
        // Send initial connection success message
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode(`event: connected\ndata: connected\n\n`));

        // Setup MongoDB Change Stream to watch for new inserts
        // We only care about new notifications for this specific user
        const pipeline = [
          {
            $match: {
              operationType: 'insert',
              'fullDocument.userId': user._id
            }
          }
        ];

        let changeStream: any = null;

        try {
          changeStream = Notification.watch(pipeline);

          changeStream.on('change', (change: any) => {
            if (change.operationType === 'insert') {
              const newNotification = change.fullDocument;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(newNotification)}\n\n`));
            }
          });

          changeStream.on('error', (err: any) => {
            console.error('Change stream error:', err);
            controller.error(err);
          });
        } catch (err) {
          console.error('Failed to setup change stream (are you running a replica set?):', err);
          // If change streams fail (e.g. no replica set), we gracefully fallback/close
          controller.close();
        }

        // Keep-alive ping every 30 seconds to prevent connection timeouts
        const keepAliveInterval = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(': ping\n\n'));
          } catch {
            clearInterval(keepAliveInterval);
          }
        }, 30000);

        // Handle client disconnect
        req.signal.addEventListener('abort', () => {
          clearInterval(keepAliveInterval);
          if (changeStream) {
            changeStream.close();
          }
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
    console.error('SSE Notification Stream error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
