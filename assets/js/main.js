const toggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('.nav-menu');
const dateTarget = document.getElementById('current-date');

if (dateTarget) {
  const now = new Date();
  dateTarget.textContent = now.toLocaleDateString('es-NI', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

if (toggle && menu) {
  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
}
