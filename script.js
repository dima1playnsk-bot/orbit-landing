const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Шапка становится плотнее при скролле
const header = document.getElementById('header');
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 20);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Мобильное меню
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
burger.addEventListener('click', () => {
  const open = burger.getAttribute('aria-expanded') === 'true';
  burger.setAttribute('aria-expanded', String(!open));
  nav.classList.toggle('is-open', !open);
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  burger.setAttribute('aria-expanded', 'false');
  nav.classList.remove('is-open');
}));

// Появление блоков при скролле
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => {
  const siblings = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
  el.style.setProperty('--d', `${siblings.indexOf(el) * 0.08}s`);
  revealObserver.observe(el);
});

// Линия времени прорисовывается, когда блок в зоне видимости
const steps = document.getElementById('steps');
new IntersectionObserver(([entry], obs) => {
  if (entry.isIntersecting) { steps.classList.add('is-drawn'); obs.disconnect(); }
}, { threshold: 0.4 }).observe(steps);

// ===== Макет приложения =====
// Кольцо прогресса считает отмеченные задачи
const tasks = document.querySelectorAll('#tasks input');
const ring = document.querySelector('.ring');
const ringValue = document.getElementById('ringValue');
const updateRing = () => {
  const checked = [...tasks].filter(t => t.checked).length;
  const p = Math.round(checked / tasks.length * 100);
  ring.style.setProperty('--p', p);
  ringValue.textContent = `${p}%`;
};
tasks.forEach(t => t.addEventListener('change', updateRing));
updateRing();

// Подсказка ИИ печатается, когда макет появляется на экране
const aiText = document.getElementById('aiText');
if (!reduceMotion) {
  const full = aiText.textContent;
  aiText.textContent = '';
  aiText.setAttribute('aria-label', full);
  new IntersectionObserver(([entry], obs) => {
    if (!entry.isIntersecting) return;
    obs.disconnect();
    aiText.classList.add('is-typing');
    let i = 0;
    const type = () => {
      aiText.textContent = full.slice(0, ++i);
      if (i < full.length) setTimeout(type, 22 + Math.random() * 40);
      else setTimeout(() => aiText.classList.remove('is-typing'), 1500);
    };
    setTimeout(type, 700);
  }, { threshold: 0.6 }).observe(aiText);
}

// ===== Тарифы: месяц / год =====
const switchBtns = document.querySelectorAll('.switch__btn');
const prices = document.querySelectorAll('[data-month]');
switchBtns.forEach(btn => btn.addEventListener('click', () => {
  switchBtns.forEach(b => b.classList.toggle('is-active', b === btn));
  const period = btn.dataset.period;
  prices.forEach(el => {
    el.classList.add('is-changing');
    setTimeout(() => {
      el.textContent = el.dataset[period];
      el.classList.remove('is-changing');
    }, 180);
  });
}));

// ===== Форма (только проверка в браузере, никуда не отправляется) =====
const form = document.getElementById('form');
const email = document.getElementById('email');
const msg = document.getElementById('formMsg');
form.addEventListener('submit', e => {
  e.preventDefault();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
  email.classList.remove('is-invalid');
  void email.offsetWidth; // перезапуск анимации тряски
  email.classList.toggle('is-invalid', !valid);
  email.setAttribute('aria-invalid', String(!valid));
  msg.textContent = valid ? 'Готово! Напишем, когда откроем доступ.' : 'Похоже, в почте опечатка. Проверь адрес.';
  if (valid) form.reset();
});
