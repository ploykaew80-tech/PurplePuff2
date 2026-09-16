/**
 * Checks if current time is within opening hours, supporting overnight schedules
 * (e.g. 10:00 AM to 02:00 AM the next day)
 */
export function isStoreOpen(openingTimeStr = '10:00', closingTimeStr = '02:00'): {
  isOpen: boolean;
  statusText: string;
  badgeText: string;
} {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [openH, openM] = openingTimeStr.split(':').map(Number);
  const [closeH, closeM] = closingTimeStr.split(':').map(Number);

  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  let isOpen = false;

  if (closeMinutes < openMinutes) {
    // Overnight schedule (e.g. 10:00 -> 02:00 next day)
    // Open if current >= 10:00 OR current < 02:00
    if (currentMinutes >= openMinutes || currentMinutes < closeMinutes) {
      isOpen = true;
    }
  } else {
    // Same day schedule
    if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
      isOpen = true;
    }
  }

  if (isOpen) {
    return {
      isOpen: true,
      statusText: `${openingTimeStr} — ${closingTimeStr}`,
      badgeText: 'OPEN'
    };
  } else {
    return {
      isOpen: false,
      statusText: `Opens at ${openingTimeStr}`,
      badgeText: 'CLOSED'
    };
  }
}
