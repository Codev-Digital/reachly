const getRelativeTime = (dateString) => {
  if (!dateString) return 'Just now';
  
  if (typeof dateString === 'string' && /^[a-fA-F0-9]{24}$/.test(dateString)) {
    const timestamp = parseInt(dateString.substring(0, 8), 16) * 1000;
    dateString = new Date(timestamp);
  }

  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.abs(Math.floor((now.getTime() - date.getTime()) / 1000));
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

console.log('Valid date string:', getRelativeTime('2026-08-06T21:27:50.752Z'));
console.log('Object ID:', getRelativeTime('6a74fa69cef12ca6164e91ca'));
console.log('Future date:', getRelativeTime('2026-08-08T21:27:50.752Z'));
