
export function formatTime(dateString: string): string {
  const date = new Date(dateString.slice(0, 23));
  if (isNaN(date.getTime())) return '';
  return date.toLocaleString('vi-VN');
}
