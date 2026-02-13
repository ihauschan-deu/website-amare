// Burger menu
const burger = document.getElementById("burger");
const nav = document.querySelector(".nav");

burger.addEventListener("click", () => {
    nav.classList.toggle("active");
});

// Пример загрузки товаров с backend
async function loadProducts() {
    try {
        const response = await fetch("/api/products");
        const products = await response.json();

        const grid = document.getElementById("productGrid");

        products.forEach(product => {
            const card = document.createElement("div");
            card.className = "product-card";
            card.innerHTML = `
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <a href="/product/${product.id}">Подробнее</a>
            `;
            grid.appendChild(card);
        });

    } catch (error) {
        console.log("Backend пока не подключен");
    }
}

loadProducts();
