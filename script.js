const products = [
    {
        id: 1,
        title: "Диван 'Сканди Елегант'",
        category: "sofas",
        price: 18500,
        rating: 4.9,
        image: "images/sofa_scandi.jpg",
        description: "Зручний трьохмісний диван у скандинавському стилі з якісною водовідштовхувальною тканиною."
    },
    {
        id: 2,
        title: "Крісло 'М'який Релакс'",
        category: "chairs",
        price: 6800,
        rating: 4.8,
        image: "images/chair_relax.jpg",
        description: "Ергономічне крісло з дерев'яними ніжками. Ідеально підходить для читання та відпочинку."
    },
    {
        id: 3,
        title: "Обідній Стіл 'Лофт Лофт'",
        category: "tables",
        price: 12400,
        rating: 4.7,
        image: "images/table_loft.jpg",
        description: "Стіл з масиву дуба та металевим каркасом. Вміщує до 6 осіб."
    },
    {
        id: 4,
        title: "Ліжко 'Затишний Сон'",
        category: "beds",
        price: 22000,
        rating: 5.0,
        image: "images/bed_sleep.jpg",
        description: "Двоспальне ліжко з м'яким узголів'ям та підйомним механізмом для білизни."
    },
    {
        id: 5,
        title: "Шафа-Купе 'Мінімалізм'",
        category: "cabinets",
        price: 19800,
        rating: 4.6,
        image: "images/cabinet_minimalism.jpg",
        description: "Містка шафа з дзеркальними дверима та функціональним внутрішнім наповненням."
    },
    {
        id: 6,
        title: "Журнальний Столик 'Модерн'",
        category: "tables",
        price: 3500,
        rating: 4.5,
        image: "images/table_modern.jpg",
        description: "Компактний та стильний столик у вітальню."
    }
];

// App State with LocalStorage persistence
let cart = JSON.parse(localStorage.getItem('furni_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('furni_wishlist')) || [];
let currentCategory = 'all';

// DOM Elements - Navigation & Core
const productGrid = document.getElementById('productGrid');
const categoryFilters = document.getElementById('categoryFilters');
const sortSelect = document.getElementById('sortSelect');
const searchInput = document.getElementById('searchInput');

// DOM Elements - Cart Drawer
const cartBtn = document.getElementById('cartBtn');
const cartDrawer = document.getElementById('cartDrawer');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartOverlay = document.getElementById('cartOverlay');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartBadge = document.getElementById('cartBadge');

// DOM Elements - Wishlist Drawer
const wishlistBtn = document.getElementById('wishlistBtn');
const wishlistDrawer = document.getElementById('wishlistDrawer');
const closeWishlistBtn = document.getElementById('closeWishlistBtn');
const wishlistOverlay = document.getElementById('wishlistOverlay');
const wishlistItems = document.getElementById('wishlistItems');
const wishlistBadge = document.getElementById('wishlistBadge');
const closeWishlistFooterBtn = document.getElementById('closeWishlistFooterBtn');

// DOM Elements - Modals & Forms
const quickViewModal = document.getElementById('quickViewModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalOverlay = document.getElementById('modalOverlay');
const modalBody = document.getElementById('modalBody');
const toast = document.getElementById('toast');
const checkoutTotalSum = document.getElementById('checkoutTotalSum');
const checkoutForm = document.getElementById('checkoutForm');

// Helper: Debounce function for smooth search
function debounce(func, delay = 250) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
}

// Helper: Category Translation
function getCategoryName(cat) {
    const names = {
        sofas: 'Дивани',
        chairs: 'Крісла',
        tables: 'Столи',
        beds: 'Ліжка',
        cabinets: 'Шафи'
    };
    return names[cat] || 'Меблі';
}

// Render Products Grid
function renderProducts(items) {
    productGrid.innerHTML = '';
    
    if (items.length === 0) {
        productGrid.innerHTML = '<p class="no-products">За вашим запитом меблів не знайдено.</p>';
        return;
    }

    const fragment = document.createDocumentFragment();

    items.forEach((product, index) => {
        const isWishlisted = wishlist.includes(product.id);
        const card = document.createElement('div');
        card.className = 'product-card';
        const loadingAttr = index < 3 ? 'eager' : 'lazy';

        card.innerHTML = `
            <div class="product-img">
                <img src="${product.image}" alt="${product.title}" loading="${loadingAttr}" width="300" height="240">
                <div class="card-actions">
                    <button class="action-btn ${isWishlisted ? 'active' : ''}" data-action="wishlist" data-id="${product.id}" aria-label="Додати в обране">
                        <i class="${isWishlisted ? 'fa-solid' : 'fa-regular'} fa-heart" aria-hidden="true"></i>
                    </button>
                    <button class="action-btn" data-action="quickview" data-id="${product.id}" aria-label="Швидкий перегляд">
                        <i class="fa-regular fa-eye" aria-hidden="true"></i>
                    </button>
                </div>
            </div>
            <div class="product-info">
                <span class="product-category">${getCategoryName(product.category)}</span>
                <h3 class="product-title">${product.title}</h3>
                <div class="product-rating">
                    <i class="fa-solid fa-star" aria-hidden="true"></i> ${product.rating}
                </div>
                <div class="product-bottom">
                    <span class="price">${product.price.toLocaleString('uk-UA')} грн</span>
                    <button class="btn btn-primary" data-action="add-cart" data-id="${product.id}" aria-label="Додати в кошик">
                        <i class="fa-solid fa-cart-plus" aria-hidden="true"></i>
                    </button>
                </div>
            </div>
        `;
        fragment.appendChild(card);
    });

    productGrid.appendChild(fragment);
}

// Filter and Sort Handler
function filterAndSortProducts() {
    let result = [...products];

    if (currentCategory !== 'all') {
        result = result.filter(p => p.category === currentCategory);
    }

    const query = searchInput.value.toLowerCase().trim();
    if (query) {
        result = result.filter(p => p.title.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
    }

    const sortValue = sortSelect.value;
    if (sortValue === 'price-asc') {
        result.sort((a, b) => a.price - b.price);
    } else if (sortValue === 'price-desc') {
        result.sort((a, b) => b.price - a.price);
    } else if (sortValue === 'rating') {
        result.sort((a, b) => b.rating - a.rating);
    }

    renderProducts(result);
}

// Setup Event Listeners
function setupEventListeners() {
    // Product grid click delegation
    productGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;

        const action = btn.dataset.action;
        const id = parseInt(btn.dataset.id, 10);

        if (action === 'wishlist') toggleWishlist(id);
        else if (action === 'quickview') openQuickView(id);
        else if (action === 'add-cart') addToCart(id);
    });

    // Category filter buttons
    categoryFilters.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            });
            e.target.classList.add('active');
            e.target.setAttribute('aria-selected', 'true');
            currentCategory = e.target.dataset.category;
            filterAndSortProducts();
        }
    });

    // Cart items actions delegation
    cartItems.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-cart-action]');
        if (!btn) return;

        const action = btn.dataset.cartAction;
        const id = parseInt(btn.dataset.id, 10);

        if (action === 'increase') changeQty(id, 1);
        else if (action === 'decrease') changeQty(id, -1);
        else if (action === 'remove') removeFromCart(id);
    });

    // Wishlist drawer remove action delegation
    wishlistItems.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-wishlist-action]');
        if (!btn) return;

        const id = parseInt(btn.dataset.id, 10);
        if (btn.dataset.wishlistAction === 'remove') {
            toggleWishlist(id);
        }
    });

    // Search and Sort controls
    sortSelect.addEventListener('change', filterAndSortProducts);
    searchInput.addEventListener('input', debounce(filterAndSortProducts, 200));

    // Cart Drawer Controls
    cartBtn.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    // Wishlist Drawer Controls
    wishlistBtn.addEventListener('click', openWishlist);
    closeWishlistBtn.addEventListener('click', closeWishlist);
    wishlistOverlay.addEventListener('click', closeWishlist);
    if (closeWishlistFooterBtn) {
        closeWishlistFooterBtn.addEventListener('click', closeWishlist);
    }

    // Modal Controls
    closeModalBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    // Global Key Events
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCart();
            closeWishlist();
            closeModal();
        }
    });

    // Newsletter Form
    document.getElementById('newsletterForm').addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('Дякуємо за підписку!');
        e.target.reset();
    });

    // Checkout Flow Trigger
    document.getElementById('checkoutBtn').addEventListener('click', () => {
        if (cart.length === 0) {
            showToast('Ваш кошик порожній');
            return;
        }

        const totalSum = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
        checkoutTotalSum.textContent = `${totalSum.toLocaleString('uk-UA')} грн`;

        closeCart();

        const checkoutBsModal = new bootstrap.Modal(document.getElementById('checkoutModal'));
        checkoutBsModal.show();
    });

    // Checkout Form Submission
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!checkoutForm.checkValidity()) {
            e.stopPropagation();
            checkoutForm.classList.add('was-validated');
            return;
        }

        const modalEl = document.getElementById('checkoutModal');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) {
            modalInstance.hide();
        }

        cart = [];
        updateCart();
        checkoutForm.reset();
        checkoutForm.classList.remove('was-validated');
        showToast('Дякуємо! Ваше замовлення успішно прийнято в обробку!');
    });
}

// Cart Logic
function addToCart(productId) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.qty += 1;
    } else {
        const product = products.find(p => p.id === productId);
        cart.push({ ...product, qty: 1 });
    }
    updateCart();
    showToast('Товар додано в кошик');
}

function updateCart() {
    localStorage.setItem('furni_cart', JSON.stringify(cart));
    cartBadge.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
    renderCartItems();
}

function renderCartItems() {
    cartItems.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align:center; padding: 20px; color: var(--text-muted);">Кошик порожній</p>';
        cartTotal.textContent = '0 грн';
        return;
    }

    const fragment = document.createDocumentFragment();

    cart.forEach(item => {
        total += item.price * item.qty;
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <img src="${item.image}" alt="${item.title}" width="70" height="70">
            <div class="cart-item-details">
                <div class="cart-item-title">${item.title}</div>
                <div class="cart-item-price">${item.price.toLocaleString('uk-UA')} грн</div>
                <div class="qty-controls">
                    <button class="qty-btn" data-cart-action="decrease" data-id="${item.id}" aria-label="Зменшити кількість">-</button>
                    <span>${item.qty}</span>
                    <button class="qty-btn" data-cart-action="increase" data-id="${item.id}" aria-label="Збільшити кількість">+</button>
                </div>
            </div>
            <button class="action-btn" data-cart-action="remove" data-id="${item.id}" aria-label="Видалити товар"><i class="fa-solid fa-trash" aria-hidden="true"></i></button>
        `;
        fragment.appendChild(div);
    });

    cartItems.appendChild(fragment);
    cartTotal.textContent = `${total.toLocaleString('uk-UA')} грн`;
}

function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) {
            cart = cart.filter(i => i.id !== id);
        }
    }
    updateCart();
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    updateCart();
}

function openCart() {
    closeWishlist();
    cartDrawer.classList.add('open');
}

function closeCart() {
    cartDrawer.classList.remove('open');
}

// Wishlist Logic
function toggleWishlist(productId) {
    const index = wishlist.indexOf(productId);
    if (index > -1) {
        wishlist.splice(index, 1);
        showToast('Видалено з обраного');
    } else {
        wishlist.push(productId);
        showToast('Додано в обране');
    }
    localStorage.setItem('furni_wishlist', JSON.stringify(wishlist));
    wishlistBadge.textContent = wishlist.length;
    
    // Update both products grid & drawer list if open
    filterAndSortProducts();
    renderWishlistItems();
}

function openWishlist() {
    closeCart();
    renderWishlistItems();
    wishlistDrawer.classList.add('open');
}

function closeWishlist() {
    wishlistDrawer.classList.remove('open');
}

function renderWishlistItems() {
    if (!wishlistItems) return;
    wishlistItems.innerHTML = '';

    if (wishlist.length === 0) {
        wishlistItems.innerHTML = '<p style="text-align:center; padding: 20px; color: var(--text-muted);">Список обраного порожній</p>';
        return;
    }

    const fragment = document.createDocumentFragment();

    wishlist.forEach(id => {
        const product = products.find(p => p.id === id);
        if (!product) return;

        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <img src="${product.image}" alt="${product.title}" width="70" height="70">
            <div class="cart-item-details">
                <div class="cart-item-title">${product.title}</div>
                <div class="cart-item-price">${product.price.toLocaleString('uk-UA')} грн</div>
            </div>
            <button class="action-btn" data-wishlist-action="remove" data-id="${product.id}" aria-label="Видалити з обраного">
                <i class="fa-solid fa-trash" aria-hidden="true"></i>
            </button>
        `;
        fragment.appendChild(div);
    });

    wishlistItems.appendChild(fragment);
}

// Quick View Modal Logic
function openQuickView(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    modalBody.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; align-items: center;">
            <img src="${product.image}" alt="${product.title}" style="width: 100%; border-radius: 12px; height: 280px; object-fit: cover;">
            <div>
                <h2>${product.title}</h2>
                <p style="color: var(--primary-color); font-size: 1.5rem; font-weight: bold; margin: 10px 0;">${product.price.toLocaleString('uk-UA')} грн</p>
                <p style="margin-bottom: 20px; color: var(--text-muted);">${product.description}</p>
                <button class="btn btn-primary btn-block" id="modalAddToCart">Додати в кошик</button>
            </div>
        </div>
    `;

    document.getElementById('modalAddToCart').addEventListener('click', () => {
        addToCart(product.id);
        closeModal();
    });

    quickViewModal.classList.add('open');
}

function closeModal() {
    quickViewModal.classList.remove('open');
}

// Toast Notifications
let toastTimeout;
function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    updateCart();
    wishlistBadge.textContent = wishlist.length;
    renderProducts(products);
    setupEventListeners();
});