export function clientNoticeTemplate({ greeting, subject, message }) {
  return {
    subject,
    text: `Hello ${greeting},\n\n${message}\n\nRegards,\nYour legal team`,
  };
}
