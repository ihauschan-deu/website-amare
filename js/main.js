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

// Dynamic product loading (example)
async function loadProducts() {
    const productGrid = document.querySelector('.product-grid');
    
    if (!productGrid) return;
    
    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        
        // Clear existing products
        productGrid.innerHTML = '';
        
        // Add products from backend
        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-image">
                    <img src="${product.image || 'https://www.figma.com/api/mcp/asset/ccc5bb50-fb58-4ef9-9641-f1d3ab9ff910'}" alt="${product.name}">
                </div>
                <h3 class="product-name">${product.name}</h3>
                <a href="#" class="product-link">Узнать больше!</a>
            `;
            productGrid.appendChild(card);
        });
        
    } catch (error) {
        console.log('Using static products - backend не подключен');
        // Static products are already in HTML, so no need to do anything
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
