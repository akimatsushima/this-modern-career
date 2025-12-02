// Lightweight script to safely hydrate the footer contact mailto link

document.addEventListener('DOMContentLoaded', () => {
  const link = document.getElementById('contact-link') as HTMLAnchorElement | null;
  if (!link) return;

  const user = 'akimatsushima+careersessay';
  const domain = 'gmail.com';
  const email = `${user}@${domain}`;

  link.href = `mailto:${email}`;
});
