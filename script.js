// Local testing uses localhost; replace the second URL with your deployed backend (e.g. Render).
const IS_LOCAL = ['localhost', '127.0.0.1', ''].includes(location.hostname);
const API_URL = IS_LOCAL ? 'http://localhost:5000/api/contact' : 'https://YOUR-APP.onrender.com/api/contact';
const FALLBACK_EMAIL = 'davidgdavidg22@gmail.com';

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Mobile menu
const menuBtn = document.getElementById('menu-btn');
const navLinks = document.getElementById('nav-links');
menuBtn.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
});
navLinks.querySelectorAll('a').forEach(link =>
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
    })
);

// Contact form
const form = document.getElementById('contact-form');
const statusText = document.getElementById('form-status');

function setStatus(text, type) {
    statusText.textContent = text;
    statusText.className = type;
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    const button = form.querySelector('button');

    button.disabled = true;
    setStatus('Sending your message...', 'busy');

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, message, website: document.getElementById('website').value })
        });
        if (!response.ok) throw new Error('Server responded with ' + response.status);

        setStatus('Message sent. Thank you, I will reply soon.', 'ok');
        form.reset();
    } catch (error) {
        console.error('Contact form error:', error);
        const mailto = `mailto:${FALLBACK_EMAIL}?subject=${encodeURIComponent('Portfolio message from ' + name)}&body=${encodeURIComponent(message + '\n\n' + name + ' (' + email + ')')}`;
        statusText.className = 'err';
        statusText.innerHTML = `Couldn't reach the server. <a href="${mailto}">Send by email instead</a>.`;
    } finally {
        button.disabled = false;
    }
});


// Scroll progress bar
const bar = document.getElementById('progress');
function updateProgress() {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
}
addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

// Highlight the nav link of the section in view
const links = [...navLinks.querySelectorAll('a')];
const spy = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
        }
    });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('main section[id]').forEach(sec => spy.observe(sec));

// Reveal elements as they scroll into view
if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    const targets = document.querySelectorAll('h2, .portrait, .about-text, .skill-card, .project-card, .contact-info, form');
    const reveal = new IntersectionObserver((entries, obs) => {
        entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
        });
    }, { threshold: 0.15 });
    targets.forEach((el, i) => {
        el.classList.add('reveal');
        if (el.classList.contains('skill-card')) el.style.transitionDelay = (i % 4) * 90 + 'ms';
        reveal.observe(el);
    });

    // Subtle 3D tilt on cards
    document.querySelectorAll('.skill-card, .project-card').forEach(card => {
        card.addEventListener('pointermove', (ev) => {
            const r = card.getBoundingClientRect();
            const x = (ev.clientX - r.left) / r.width - 0.5;
            const y = (ev.clientY - r.top) / r.height - 0.5;
            card.style.transform = `perspective(700px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
        });
        card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
}