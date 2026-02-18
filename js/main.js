// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Horizontal scroll for products
const scrollButton = document.getElementById('scrollRight');
const productGrid = document.getElementById('productGrid');

if (scrollButton && productGrid) {
    scrollButton.addEventListener('click', function() {
        const cardWidth = 380;
        const gap = 40;
        const scrollAmount = (cardWidth * 3) + (gap * 2);
        
        productGrid.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    });
    
    // Hide button when at end
    productGrid.addEventListener('scroll', function() {
        const maxScroll = productGrid.scrollWidth - productGrid.clientWidth;
        if (productGrid.scrollLeft >= maxScroll - 10) {
            scrollButton.style.opacity = '0.3';
            scrollButton.style.cursor = 'default';
        } else {
            scrollButton.style.opacity = '1';
            scrollButton.style.cursor = 'pointer';
        }
    });
}

// Contact form handling
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const email = formData.get('email');
        const message = formData.get('message');
        
        // Validation
        if (!email || email.trim() === '') {
            alert('Пожалуйста, введите ваш email');
            return;
        }
        
        if (!message || message.trim() === '') {
            alert('Пожалуйста, введите сообщение');
            return;
        }
        
        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Пожалуйста, введите корректный email');
            return;
        }
        
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    message: message
                })
            });
            
            if (response.ok) {
                alert('Сообщение отправлено! Мы свяжемся с вами по email: ' + email);
                this.reset();
            } else {
                throw new Error('Ошибка отправки');
            }
        } catch (error) {
            console.log('Backend не подключен:', error);
            alert('Спасибо за сообщение! Мы свяжемся с вами по email: ' + email + '\n(Demo mode - backend не подключен)');
            this.reset();
        }
    });
}

// Load products from JSON file
async function loadProducts() {
    const productGrid = document.getElementById('productGrid');
    const featuredContainer = document.querySelector('.hero-features');
    
    if (!productGrid) return;
    
    try {
        const response = await fetch('products/products.json');
        const data = await response.json();
        
        // Clear existing products
        productGrid.innerHTML = '';
        
        // Load featured products for "Новинки" section
        const featuredProducts = data.products.filter(p => p.featured).slice(0, 3);
        if (featuredContainer && featuredProducts.length > 0) {
            // Clear existing feature boxes
            const existingBoxes = featuredContainer.querySelectorAll('.feature-box');
            existingBoxes.forEach((box, index) => {
                if (featuredProducts[index]) {
                    box.textContent = featuredProducts[index].name;
                    box.href = featuredProducts[index].link || '#products';
                }
            });
        }
        
        // Add all products to catalog
        data.products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='https://www.figma.com/api/mcp/asset/ccc5bb50-fb58-4ef9-9641-f1d3ab9ff910'">
                </div>
                <h3 class="product-name">${product.name}</h3>
                <a href="${product.link || '#'}" class="product-link">Узнать больше!</a>
            `;
            
            // Add click event to open modal
            card.addEventListener('click', function(e) {
                e.preventDefault();
                openProductModal(product);
            });
            
            productGrid.appendChild(card);
        });
        
        console.log(`Загружено ${data.products.length} продуктов`);
        
    } catch (error) {
        console.log('Ошибка загрузки продуктов:', error);
        console.log('Используются статические продукты из HTML');
    }
}

// ========== PRODUCT MODAL ==========

// Open product modal
function openProductModal(productData) {
    const modal = document.getElementById('productModal');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const modalFeatures = document.getElementById('modalFeatures');
    
    if (!modal) return;
    
    // Set product data
    modalImage.src = productData.image;
    modalImage.alt = productData.name;
    modalTitle.textContent = productData.name;
    modalDescription.textContent = productData.description || 'Высококачественный продукт для профессионального использования.';
    
    // Set features
    if (productData.features && productData.features.length > 0) {
        modalFeatures.innerHTML = productData.features.map(f => `<li>${f}</li>`).join('');
    } else {
        modalFeatures.innerHTML = `
            <li>Высокое качество</li>
            <li>Натуральные ингредиенты</li>
            <li>Для профессионального использования</li>
        `;
    }
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close product modal
function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (!modal) return;
    
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Contact us button in modal
function contactUs() {
    closeProductModal();
    const contactSection = document.getElementById('contact');
    if (contactSection) {
        contactSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('productModal');
    if (modal && e.target === modal) {
        closeProductModal();
    }
});

// Close with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeProductModal();
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    
    // Add animation on scroll (optional)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe product cards after they load
    setTimeout(() => {
        document.querySelectorAll('.product-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });
    }, 100);
});
