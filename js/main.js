// Load products from JSON file
async function loadProducts() {
    const productGrid = document.getElementById('productGrid');
    const featuredContainer = document.querySelector('.hero-features');
    
    if (!productGrid) return;
    
    try {
        const response = await fetch('products/products.json');
        const data = await response.json();
        
        // Store products globally for modal access
        window.productsData = data.products;
        
        // Clear existing products
        productGrid.innerHTML = '';
        
        // Load featured products for "Новинки" section
        const featuredProducts = data.products.filter(p => p.featured).slice(0, 3);
        if (featuredContainer && featuredProducts.length > 0) {
            const existingBoxes = featuredContainer.querySelectorAll('.feature-box');
            existingBoxes.forEach((box, index) => {
                if (featuredProducts[index]) {
                    box.textContent = featuredProducts[index].name;
                    box.href = featuredProducts[index].link || '#products';
                }
            });
        }
        
        // Add all products to catalog
        data.products.forEach((product, index) => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.setAttribute('data-product-index', index);
            card.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='https://www.figma.com/api/mcp/asset/ccc5bb50-fb58-4ef9-9641-f1d3ab9ff910'">
                </div>
                <h3 class="product-name">${product.name}</h3>
                <a href="#" class="product-link" onclick="event.stopPropagation();">Узнать больше!</a>
            `;
            
            // Add click event to open modal
            card.addEventListener('click', function(e) {
                e.preventDefault();
                openProductModal(index);
            });
            
            productGrid.appendChild(card);
        });
        
        console.log(`Загружено ${data.products.length} продуктов`);
        
    } catch (error) {
        console.log('Ошибка загрузки продуктов:', error);
        console.log('Используются статические продукты из HTML');
    }
}

// Open product modal
function openProductModal(productIndex) {
    const product = window.productsData[productIndex];
    if (!product) return;
    
    const modal = document.getElementById('productModal');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const modalFeatures = document.getElementById('modalFeatures');
    
    // Fill modal with product data
    modalImage.src = product.image;
    modalImage.onerror = function() {
        this.src = 'https://www.figma.com/api/mcp/asset/ccc5bb50-fb58-4ef9-9641-f1d3ab9ff910';
    };
    
    modalTitle.textContent = product.name;
    modalDescription.textContent = product.fullDescription || product.description;
    
    // Fill features list
    if (product.features && product.features.length > 0) {
        modalFeatures.innerHTML = product.features.map(feature => 
            `<li>${feature}</li>`
        ).join('');
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
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Contact us button in modal
function contactUs() {
    closeProductModal();
    document.getElementById('contact').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

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
        const message = formData.get('message');
        
        if (!message || message.trim() === '') {
            alert('Пожалуйста, введите сообщение');
            return;
        }
        
        try {
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
            alert('Спасибо за сообщение! (Demo mode - backend не подключен)');
            this.reset();
        }
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    
    // Close modal when clicking outside
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeProductModal();
            }
        });
    }
    
    // Close with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeProductModal();
        }
    });
    
    // Add animation on scroll
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

// ========== PRODUCT MODAL ==========
const modal = document.getElementById('productModal');
const closeModalBtn = document.querySelector('.modal-close');

// Open product modal
function openProductModal(productData) {
    const modal = document.getElementById('productModal');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const modalFeatures = document.getElementById('modalFeatures');
    
    // Set product data
    modalImage.src = productData.image;
    modalImage.alt = productData.name;
    modalTitle.textContent = productData.name;
    modalDescription.textContent = productData.description || 'Высококачественный продукт для профессионального использования.';
    
    // Set features (can be customized in products.json)
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
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

// Close product modal
function closeProductModal() {
    const modal = document.getElementById('productModal');
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Re-enable scrolling
}

// Contact us button
function contactUs() {
    closeProductModal();
    // Scroll to contact section
    const contactSection = document.getElementById('contact');
    if (contactSection) {
        contactSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Close modal when clicking outside
document.getElementById('productModal')?.addEventListener('click', function(e) {
    if (e.target === this) {
        closeProductModal();
    }
});

// Close with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeProductModal();
    }
});

// Add click event to all product cards
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for products to load
    setTimeout(function() {
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            card.addEventListener('click', function() {
                const productName = this.querySelector('.product-name').textContent;
                const productImage = this.querySelector('.product-image img').src;
                
                openProductModal({
                    name: productName,
                    image: productImage,
                    description: 'Высококачественная глазурь для кондитерских изделий. Идеально подходит для профессионального использования.'
                });
            });
        });
    }, 500);
});
