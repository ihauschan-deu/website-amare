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
        const scrollAmount = 420; // card width + gap
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
        const message = formData.get('message');
        
        if (!message || message.trim() === '') {
            alert('Пожалуйста, введите сообщение');
            return;
        }
        
        try {
            // Example: Send to backend
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message
                })
            });
            
            if (response.ok) {
                alert('Сообщение отправлено!');
                this.reset();
            } else {
                throw new Error('Ошибка отправки');
            }
        } catch (error) {
            console.log('Backend не подключен:', error);
            // For demo purposes - show success anyway
            alert('Спасибо за сообщение! (Demo mode - backend не подключен)');
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
            productGrid.appendChild(card);
        });
        
        console.log(`Загружено ${data.products.length} продуктов`);
        
    } catch (error) {
        console.log('Ошибка загрузки продуктов:', error);
        console.log('Используются статические продукты из HTML');
        // Static products from HTML will be displayed
    }
}

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
    
    // Observe product cards
    document.querySelectorAll('.product-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});
