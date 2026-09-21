export function generateGoogleCalendarUrl(
  title: string,
  details: string,
  location: string,
  startDateIso: string,
  durationHours: number = 4
): string {
  const startDate = new Date(startDateIso);
  const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);

  const formatTime = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, '');

  const startStr = formatTime(startDate);
  const endStr = formatTime(endDate);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${startStr}/${endStr}`,
    details: details,
    location: location
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadIcsFile(
  title: string,
  details: string,
  location: string,
  startDateIso: string,
  durationHours: number = 4
) {
  const startDate = new Date(startDateIso);
  const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);

  const formatTime = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, '');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wedding Invitation//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `SUMMARY:${title}`,
    `DESCRIPTION:${details.replace(/\n/g, '\\n')}`,
    `LOCATION:${location}`,
    `DTSTART:${formatTime(startDate)}`,
    `DTEND:${formatTime(endDate)}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${title.replace(/\s+/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
