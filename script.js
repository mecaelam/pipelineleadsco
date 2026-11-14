const toggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() {
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open navigation');
  navigation.classList.remove('is-open');
}
toggle.addEventListener('click', () => {
  const expanded = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!expanded));
  toggle.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  navigation.classList.toggle('is-open', !expanded);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
document.addEventListener('click', event => { if (!event.target.closest('.nav-wrap')) closeMenu(); });
document.querySelector('#year').textContent = new Date().getFullYear();
document.querySelector('#inquiry-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const subject = `Google Ads inquiry — ${data.get('business').trim()}`;
  const body = `Hello Pipeline Leads Co.,\r\n\r\nI’m interested in Google Ads management for my cleaning business.\r\n\r\nBusiness: ${data.get('business').trim()}\r\nName: ${data.get('name').trim()}\r\nEmail: ${data.get('email').trim()}\r\nPhone / WhatsApp: ${data.get('phone').trim()}\r\nService area: ${data.get('area').trim()}\r\n\r\nPlease tell me about getting started with the $100 first month of management, followed by $249/month, with Google ad spend separate.\r\n\r\nThank you!`;
  const mailto = `mailto:mecaelamorante2@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const status = document.querySelector('#form-status');
  status.hidden = false;
  status.replaceChildren();
  const message = document.createElement('p');
  message.textContent = 'Your email draft is ready. Review it in your email app and press Send. Nothing has been sent by this website.';
  const retry = document.createElement('a');
  retry.href = mailto;
  retry.textContent = 'Open the email draft again ↗';
  const fallback = document.createElement('p');
  fallback.textContent = 'No email app? Email mecaelamorante2@gmail.com with your business name, contact details, and service area.';
  status.append(message, retry, fallback);
  window.location.href = mailto;
});
