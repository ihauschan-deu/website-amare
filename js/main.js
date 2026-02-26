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

/* ---------- Product scroll arrow ---------- */
const scrollBtn  = document.getElementById('scrollRight');
const productGrid = document.getElementById('productGrid');

if (scrollBtn && productGrid) {
    scrollBtn.addEventListener('click', () => {
        const cardWidth  = 380;
        const gap        = 40;
        productGrid.scrollBy({ left: (cardWidth + gap) * 3, behavior: 'smooth' });
    });

    productGrid.addEventListener('scroll', () => {
        const atEnd = productGrid.scrollLeft >= productGrid.scrollWidth - productGrid.clientWidth - 10;
        scrollBtn.style.opacity = atEnd ? '0.3' : '1';
        scrollBtn.style.cursor  = atEnd ? 'default' : 'pointer';
    });
}

/* ---------- Contact form ---------- */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email   = this.email.value.trim();
        const message = this.message.value.trim();

        if (!email)   { alert('Пожалуйста, введите ваш email');    return; }
        if (!message) { alert('Пожалуйста, введите сообщение');    return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert('Пожалуйста, введите корректный email');
            return;
        }

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, message })
            });
            if (res.ok) {
                alert('Сообщение отправлено! Мы свяжемся с вами по email: ' + email);
                this.reset();
            } else {
                throw new Error();
            }
        } catch {
            /* Demo mode — backend not connected */
            alert('Спасибо за сообщение! Мы свяжемся с вами по email: ' + email);
            this.reset();
        }
    });
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
document.addEventListener('DOMContentLoaded', loadProducts);
