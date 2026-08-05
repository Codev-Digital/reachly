export const getRelativeTime = (dateString?: string | Date): string => {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

export function isMeetingPassed(scheduledDateStr: string | Date, scheduledTimeStr: string): boolean {
  if (!scheduledDateStr) return false;
  
  try {
    const baseDate = new Date(scheduledDateStr);
    
    // Parse time string (e.g. "05:00 PM" or "09:30 AM to 10:00 AM")
    const timeClean = (scheduledTimeStr || "").split('to')[0].trim();
    const match = timeClean.match(/(\d+):(\d+)\s*(AM|PM)/i);
    
    if (match) {
      let hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      const ampm = match[3].toUpperCase();
      
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      
      baseDate.setHours(hours, minutes, 0, 0);
    } else {
      // Fallback: End of the scheduled day
      baseDate.setHours(23, 59, 59, 999);
    }
    
    return new Date() > baseDate;
  } catch (err) {
    console.error('Error parsing meeting time:', err);
    return false;
  }
}
