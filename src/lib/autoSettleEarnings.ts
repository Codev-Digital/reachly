import Booking from '@/models/Booking';

/**
 * Auto-settles pending earnings by marking bookings as 'paid'/'completed'
 * when their scheduled session date+time has passed.
 *
 * Called at the start of wallet/payments API routes so the data
 * is always up-to-date without needing a separate cron job.
 */
export async function autoSettleEarnings(creatorId?: string): Promise<number> {
  try {
    const now = new Date();

    // Build query: pending bookings (optionally scoped to one creator)
    // No date pre-filter here — we do exact time comparison in-memory below
    // to correctly handle PKT timezone (scheduledDate stored as midnight PKT)
    const query: any = {
      paymentStatus: 'pending',
      status: { $nin: ['cancelled', 'refunded'] },
    };
    if (creatorId) query.creatorId = creatorId;

    const pendingBookings = await Booking.find(query)
      .select('_id scheduledDate scheduledTime')
      .lean();

    const idsToSettle: string[] = [];

    for (const b of pendingBookings as any[]) {
      try {
        const storedDate = new Date(b.scheduledDate);
        
        // Convert to Pakistan Time string parts to extract correct calendar date
        const pktDateString = storedDate.toLocaleDateString('en-US', {
          timeZone: 'Asia/Karachi',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }); // MM/DD/YYYY
        
        const [mm, dd, yyyy] = pktDateString.split('/');
        
        const timeStr = (b.scheduledTime || '').split(' to ')[0].trim();
        const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);

        let hours = 23;
        let minutes = 59;

        if (match) {
          hours = parseInt(match[1]);
          minutes = parseInt(match[2]);
          const ampm = match[3].toUpperCase();
          if (ampm === 'PM' && hours < 12) hours += 12;
          if (ampm === 'AM' && hours === 12) hours = 0;
        }

        // Construct ISO string in Pakistan Time (PKT is UTC+5, so +05:00 offset)
        // Format: YYYY-MM-DDTHH:mm:00+05:00
        const isoString = `${yyyy}-${mm}-${dd}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00+05:00`;
        const sessionMs = new Date(isoString).getTime();

        if (now.getTime() > sessionMs) {
          idsToSettle.push(b._id.toString());
        }
      } catch {
        // Skip malformed records
      }
    }

    if (idsToSettle.length === 0) return 0;

    const result = await Booking.updateMany(
      { _id: { $in: idsToSettle } },
      {
        $set: {
          paymentStatus: 'paid',
          status: 'completed',
        },
      }
    );

    return result.modifiedCount;
  } catch (err) {
    console.error('[autoSettleEarnings] Error:', err);
    return 0;
  }
}
