/* ============================================================
   main.js — Амаре Групп
   ============================================================ */

/* ---------- Smooth scroll ---------- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

/* ---------- Product scroll arrows ---------- */
function initScrollArrows() {
    const scrollBtn     = document.getElementById('scrollRight');
    const scrollBtnLeft = document.getElementById('scrollLeft');
    const grid          = document.getElementById('productGrid');

    if (!grid) return;

    function updateArrows() {
        const atStart = grid.scrollLeft <= 10;
        const atEnd   = grid.scrollLeft >= grid.scrollWidth - grid.clientWidth - 10;

        if (scrollBtnLeft) {
            scrollBtnLeft.style.opacity = atStart ? '0.3' : '1';
            scrollBtnLeft.style.cursor  = atStart ? 'default' : 'pointer';
        }
        if (scrollBtn) {
            scrollBtn.style.opacity = atEnd ? '0.3' : '1';
            scrollBtn.style.cursor  = atEnd ? 'default' : 'pointer';
        }
    }

    if (scrollBtn) {
        scrollBtn.addEventListener('click', () => {
            grid.scrollBy({ left: (380 + 40) * 3, behavior: 'smooth' });
        });
    }

    if (scrollBtnLeft) {
        scrollBtnLeft.addEventListener('click', () => {
            grid.scrollBy({ left: -((380 + 40) * 3), behavior: 'smooth' });
        });
    }

    grid.addEventListener('scroll', updateArrows);
    updateArrows();
}

/* ---------- Contact form ---------- */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email   = this.email.value.trim();
        const message = this.message.value.trim();

        if (!email)   { showFormStatus('Пожалуйста, введите ваш email', 'error');   return; }
        if (!message) { showFormStatus('Пожалуйста, введите сообщение', 'error');   return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showFormStatus('Пожалуйста, введите корректный email', 'error');
            return;
        }

        const btn = this.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.disabled    = true;
        btn.textContent = 'Отправляем...';

        try {
            const res = await fetch('send_mail.php', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ email, message })
            });

            const data = await res.json().catch(() => ({}));

            if (res.ok && data.ok) {
                showFormStatus('Сообщение отправлено! Мы свяжемся с вами в ближайшее время.', 'success');
                this.reset();
            } else {
                showFormStatus('Ошибка отправки. Пожалуйста, напишите нам напрямую на orders@amaregrupp.ru', 'error');
            }
        } catch {
            showFormStatus('Нет соединения с сервером. Напишите нам на orders@amaregrupp.ru', 'error');
        } finally {
            btn.disabled    = false;
            btn.textContent = originalText;
        }
    });
}

function showFormStatus(msg, type) {
    let el = document.getElementById('formStatus');
    if (!el) {
        el = document.createElement('p');
        el.id = 'formStatus';
        el.style.cssText = 'margin-top:12px; font-size:15px; font-family:Inter,sans-serif; transition:opacity 0.3s;';
        const form = document.getElementById('contactForm');
        if (form) form.appendChild(el);
    }
    el.textContent = msg;
    el.style.color  = type === 'success' ? '#27ae60' : '#c0392b';
    el.style.opacity = '1';
    clearTimeout(el._timer);
    if (type === 'success') {
        el._timer = setTimeout(() => { el.style.opacity = '0'; }, 5000);
    }
}

/* ---------- Load products from products.json ---------- */
async function loadProducts() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    try {
        const res  = await fetch('./products/products.json');
        if (!res.ok) throw new Error('not ok');
        const data = await res.json();

        /* Featured → Новинки блок */
        const featured = data.products.filter(p => p.featured).slice(0, 3);
        featured.forEach((p, i) => {
            const box = document.getElementById('featured-' + i);
            if (box) box.textContent = p.name;
        });

        /* All products → grid */
        grid.innerHTML = '';
        data.products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}"
                         onerror="this.parentElement.style.background='#c8c5d0'">
                </div>
                <h3 class="product-name">${product.name}</h3>
                <span class="product-link">Узнать больше!</span>
            `;
            card.addEventListener('click', () => openProductModal(product));
            grid.appendChild(card);
        });

        /* Re-init arrows after cards loaded */
        initScrollArrows();

        /* Animate on scroll */
        setTimeout(() => {
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity   = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, { threshold: 0.1, rootMargin: '0px 0px -80px 0px' });

            document.querySelectorAll('.product-card').forEach(card => {
                card.style.opacity    = '0';
                card.style.transform  = 'translateY(20px)';
                card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                observer.observe(card);
            });
        }, 50);

    } catch (err) {
        console.warn('products.json не загружен. Запустите сайт через локальный сервер (см. README).');
        grid.innerHTML = `
            <div style="padding:20px 0; color:#4b2e14; font-size:18px; opacity:0.55; font-family:Georgia,serif;">
                ⚠️ Товары не загружены.<br>
                <small>Запустите <b>start.bat</b> (Windows) или <b>start.sh</b> (Mac/Linux) и откройте сайт по появившейся ссылке.</small>
            </div>
        `;
    }
}

/* ---------- Modal ---------- */
function openProductModal(product) {
    const modal = document.getElementById('productModal');
    if (!modal) return;

    document.getElementById('modalImage').src       = product.image;
    document.getElementById('modalImage').alt       = product.name;
    document.getElementById('modalTitle').textContent       = product.name;
    document.getElementById('modalDescription').textContent = product.description || '';

    const featuresList = document.getElementById('modalFeatures');
    featuresList.innerHTML = (product.features || [])
        .map(f => `<li>${f}</li>`)
        .join('');

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function contactUs() {
    closeProductModal();
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* Close modal on backdrop click or Escape */
document.addEventListener('click', e => {
    if (e.target.id === 'productModal') closeProductModal();
});
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeProductModal();
});

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    initScrollArrows();
});
