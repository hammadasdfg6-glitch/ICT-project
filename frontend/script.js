const API_BASE_URL = (window.__ENV__ && window.__ENV__.BACKEND_URL)
    ? window.__ENV__.BACKEND_URL.replace(/\/$/, '')
    : (window.BACKEND_API_URL
        ? window.BACKEND_API_URL.replace(/\/$/, '')
        : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? (window.location.port === '9000' ? '' : 'http://localhost:9000')
            : ''));

// --- HM SPORTS CUSTOM THEME TOAST NOTIFICATION SYSTEM ---
function showToast(message, type = 'info', title = '') {
    let container = document.getElementById('hm-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'hm-toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `hm-toast hm-toast-${type}`;

    let icon = 'ℹ️';
    let defaultTitle = 'Notification';
    if (type === 'success') {
        icon = '🏆';
        defaultTitle = 'Success';
    } else if (type === 'error') {
        icon = '⚠️';
        defaultTitle = 'Notice';
    } else if (type === 'warning') {
        icon = '🔒';
        defaultTitle = 'Action Required';
    }

    const duration = 3800; // ms

    toast.innerHTML = `
        <div class="hm-toast-icon">${icon}</div>
        <div class="hm-toast-content">
            <div class="hm-toast-title">${title || defaultTitle}</div>
            <p class="hm-toast-message">${message}</p>
        </div>
        <button class="hm-toast-close" aria-label="Close">&times;</button>
        <div class="hm-toast-progress">
            <div class="hm-toast-progress-bar" style="animation-duration: ${duration}ms;"></div>
        </div>
    `;

    container.appendChild(toast);

    let isClosed = false;
    function closeToast() {
        if (isClosed) return;
        isClosed = true;
        toast.classList.add('hm-toast-closing');
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
    }

    const closeBtn = toast.querySelector('.hm-toast-close');
    if (closeBtn) closeBtn.addEventListener('click', closeToast);

    const timer = setTimeout(closeToast, duration);
    toast.addEventListener('mouseenter', () => {
        const bar = toast.querySelector('.hm-toast-progress-bar');
        if (bar) bar.style.animationPlayState = 'paused';
        clearTimeout(timer);
    });
    toast.addEventListener('mouseleave', () => {
        const bar = toast.querySelector('.hm-toast-progress-bar');
        if (bar) bar.style.animationPlayState = 'running';
        setTimeout(closeToast, 1200);
    });
}

// Global exposure & smart alert replacement
window.showToast = showToast;
window.alert = function (message) {
    if (typeof message === 'string' && (message.includes('success') || message.includes('Success') || message.includes('created') || message.includes('Updated') || message.includes('Thank you') || message.includes('🎉') || message.includes('✔'))) {
        showToast(message, 'success');
    } else if (typeof message === 'string' && (message.includes('error') || message.includes('Failed') || message.includes('Error') || message.includes('Invalid') || message.includes('⚠️'))) {
        showToast(message, 'error');
    } else {
        showToast(message, 'warning');
    }
};

// --- AUTHENTICATION STATE MANAGEMENT ---
function getCurrentUser() {
    try {
        const user = localStorage.getItem('hm_user');
        return user ? JSON.parse(user) : null;
    } catch {
        return null;
    }
}

function setCurrentUser(user) {
    if (user) {
        localStorage.setItem('hm_user', JSON.stringify(user));
    } else {
        localStorage.removeItem('hm_user');
    }
    updateNavbarAuthState();
}

// --- SYNC AUTH SESSION FROM COOKIE ---
async function checkAuthSession() {
    try {
        const res = await fetch(`${API_BASE_URL}/user/me`, { credentials: 'include' });
        const data = await res.json();
        if (res.ok && data.user) {
            localStorage.setItem('hm_user', JSON.stringify(data.user));
            updateNavbarAuthState();
            return data.user;
        }
    } catch {}
    return null;
}

// --- ENSURE CHECKOUT MODAL IS ALWAYS IN DOM ---
function ensureCheckoutModalExists() {
    if (document.getElementById('checkoutModal')) return;

    const modalHtml = `
    <div class="modal fade" id="checkoutModal" tabindex="-1" aria-labelledby="checkoutModalLabel" aria-hidden="true" style="z-index: 1065;">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow">
                <div class="modal-header bg-dark text-white">
                    <h5 class="modal-title fw-bold" id="checkoutModalLabel">🚚 Shipping & Delivery Details</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4">
                    <div class="alert alert-info py-2 small mb-3">
                        🔒 You are checking out as <strong id="checkout-user-display"></strong>. Your receipt will be linked to this account.
                    </div>
                    <form id="shipping-details-form">
                        <div class="mb-3">
                            <label class="form-label fw-bold small text-muted">ACCOUNT EMAIL (Locked)</label>
                            <input type="email" class="form-control bg-light" id="ship-email" readonly disabled>
                        </div>
                        <div class="row g-2 mb-3">
                            <div class="col-6">
                                <label class="form-label fw-bold small">Recipient Name *</label>
                                <input type="text" class="form-control" id="ship-name" required placeholder="Full Name">
                            </div>
                            <div class="col-6">
                                <label class="form-label fw-bold small">Phone Number *</label>
                                <input type="tel" class="form-control" id="ship-phone" required placeholder="03001234567">
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label fw-bold small">Delivery Address *</label>
                            <textarea class="form-control" id="ship-address" rows="2" required placeholder="House / Flat #, Street, Sector / Area"></textarea>
                        </div>
                        <div class="row g-2 mb-4">
                            <div class="col-7">
                                <label class="form-label fw-bold small">City *</label>
                                <input type="text" class="form-control" id="ship-city" required placeholder="e.g. Islamabad, Lahore">
                            </div>
                            <div class="col-5">
                                <label class="form-label fw-bold small">Postal Code</label>
                                <input type="text" class="form-control" id="ship-postal" placeholder="e.g. 44000">
                            </div>
                        </div>
                        <button type="submit" class="btn btn-hm-primary w-100 py-2 fs-6 fw-bold shadow-sm" id="proceed-stripe-btn">
                            💳 Proceed to Stripe Payment
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    attachShippingFormListener();
}

function openCheckoutModal(user) {
    ensureCheckoutModalExists();

    const shipEmail = document.getElementById('ship-email');
    const shipName = document.getElementById('ship-name');
    const shipPhone = document.getElementById('ship-phone');
    const userDisplay = document.getElementById('checkout-user-display');

    if (shipEmail) shipEmail.value = user.email || '';
    if (userDisplay) userDisplay.innerText = user.email || 'Customer';
    if (shipName && !shipName.value) shipName.value = user.name || '';
    if (shipPhone && !shipPhone.value) shipPhone.value = user.phone || '';

    const offcanvasEl = document.getElementById('cartOffcanvas');
    const checkoutModalEl = document.getElementById('checkoutModal');

    if (offcanvasEl && offcanvasEl.classList.contains('show')) {
        const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvasEl) || new bootstrap.Offcanvas(offcanvasEl);
        offcanvasEl.addEventListener('hidden.bs.offcanvas', () => {
            const checkoutModal = bootstrap.Modal.getInstance(checkoutModalEl) || new bootstrap.Modal(checkoutModalEl);
            checkoutModal.show();
        }, { once: true });
        offcanvasInstance.hide();
    } else {
        const checkoutModal = bootstrap.Modal.getInstance(checkoutModalEl) || new bootstrap.Modal(checkoutModalEl);
        checkoutModal.show();
    }
}

function attachShippingFormListener() {
    const shippingForm = document.getElementById('shipping-details-form');
    if (shippingForm && !shippingForm.dataset.listenerAttached) {
        shippingForm.dataset.listenerAttached = 'true';
        shippingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('proceed-stripe-btn');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = 'Creating Secure Stripe Session...';
            submitBtn.disabled = true;

            const name = document.getElementById('ship-name')?.value.trim();
            const phone = document.getElementById('ship-phone')?.value.trim();
            const address = document.getElementById('ship-address')?.value.trim();
            const city = document.getElementById('ship-city')?.value.trim();
            const postalCode = document.getElementById('ship-postal')?.value.trim();

            try {
                const res = await fetch(`${API_BASE_URL}/buy/checkout`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, phone, address, city, postalCode }),
                    credentials: 'include'
                });
                const data = await res.json();

                if (res.ok && data.url) {
                    window.location.href = data.url;
                } else {
                    showToast(data.message || 'Unable to start checkout session.', 'error', 'Checkout Error');
                    submitBtn.innerText = originalText;
                    submitBtn.disabled = false;
                }
            } catch (err) {
                console.error('Checkout error:', err);
                showToast('Network error: Could not reach the checkout server.', 'error', 'Connection Error');
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}

// --- UPDATE NAVBAR AUTH & CART STATE ---
function updateNavbarAuthState() {
    const user = getCurrentUser();
    const authContainer = document.getElementById('auth-nav-container');

    if (authContainer) {
        if (user) {
            authContainer.innerHTML = `
                <div class="dropdown d-inline-block">
                    <button class="btn btn-sm btn-outline-dark dropdown-toggle fw-bold" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        👤 ${user.name || 'Account'}
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                        <li><span class="dropdown-item-text text-muted small">${user.email}</span></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="orders.html">📦 My Orders</a></li>
                        ${user.role === 'admin' ? `<li><a class="dropdown-item text-primary fw-bold" href="admin.html">⚙️ Admin Dashboard</a></li><li><a class="dropdown-item text-success" href="${API_BASE_URL || ''}/api-docs" target="_blank">📖 Swagger API Docs</a></li>` : ''}
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item text-danger" href="#" id="nav-logout-btn">🚪 Logout</a></li>
                    </ul>
                </div>
            `;

            const logoutBtn = document.getElementById('nav-logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    await handleLogout();
                });
            }
        } else {
            authContainer.innerHTML = `
                <button class="btn btn-sm btn-dark nav-action-btn" data-bs-toggle="modal" data-bs-target="#authModal">
                    🔐 Login / Sign Up
                </button>
            `;
        }
    }
}

// --- HANDLE LOGOUT ---
async function handleLogout() {
    try {
        await fetch(`${API_BASE_URL}/user/logout`, {
            method: 'POST',
            credentials: 'include'
        });
    } catch (e) {
        console.error('Logout error:', e);
    }
    setCurrentUser(null);
    window.location.reload();
}

// --- SHOPPING CART OFFCANVAS MANAGEMENT ---
async function fetchCart() {
    const cartContainer = document.getElementById('cart-items-container');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartBadges = document.querySelectorAll('.cart-badge');
    const checkoutBtn = document.getElementById('cart-checkout-btn');

    function updateBadgeDisplay(count, animate = false) {
        cartBadges.forEach(b => {
            b.innerText = count;
            if (animate) {
                b.classList.remove('bump');
                void b.offsetWidth; // Trigger reflow
                b.classList.add('bump');
                setTimeout(() => b.classList.remove('bump'), 300);
            }
        });
    }

    try {
        const res = await fetch(`${API_BASE_URL}/buy/cart`, { credentials: 'include' });
        const data = await res.json();

        if (res.ok && data.cart && data.cart.length > 0) {
            const totalQty = data.cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
            updateBadgeDisplay(totalQty, true);

            if (!cartContainer) return;

            // Fetch product details for fresh prices and images
            let subtotal = 0;
            const itemsHtml = await Promise.all(data.cart.map(async (item) => {
                let imgUrl = 'images/hmlogo.png';
                let price = 0;
                try {
                    const pRes = await fetch(`${API_BASE_URL}/product/${item._id}`, { credentials: 'include' });
                    const pData = await pRes.json();
                    if (pRes.ok && pData.product) {
                        imgUrl = pData.product.img_url || imgUrl;
                        price = Number(pData.product.price) || 0;
                    }
                } catch {
                    price = Number(item.price) || 0;
                }

                subtotal += price * (item.quantity || 1);

                return `
                    <div class="cart-item">
                        <img src="${imgUrl}" alt="${item.name}" onerror="this.src='images/hmlogo.png'">
                        <div class="flex-grow-1">
                            <h6 class="cart-item-title">${item.name}</h6>
                            <p class="cart-item-price">Qty: ${item.quantity || 1} × Rs. ${price.toLocaleString()}</p>
                        </div>
                        <button class="cart-remove-btn" data-id="${item._id}" title="Remove item">🗑️</button>
                    </div>
                `;
            }));

            cartContainer.innerHTML = itemsHtml.join('');
            if (cartSubtotal) cartSubtotal.innerText = `Rs. ${subtotal.toLocaleString()}`;
            if (checkoutBtn) checkoutBtn.disabled = false;
        } else {
            updateBadgeDisplay(0);
            if (cartContainer) {
                cartContainer.innerHTML = `
                    <div class="text-center py-5 text-muted">
                        <p class="fs-4 mb-1">🛒</p>
                        <p class="mb-3">Your cart is empty.</p>
                        <a href="products.html" class="btn btn-sm btn-hm-primary">Explore Products</a>
                    </div>
                `;
            }
            if (cartSubtotal) cartSubtotal.innerText = 'Rs. 0';
            if (checkoutBtn) checkoutBtn.disabled = true;
        }
    } catch (err) {
        console.error('Error loading cart:', err);
        updateBadgeDisplay(0);
        if (cartContainer) {
            cartContainer.innerHTML = `
                <div class="text-center py-4 text-muted small">
                    <p>Log in to view your saved cart items.</p>
                    <button class="btn btn-sm btn-dark" data-bs-toggle="modal" data-bs-target="#authModal">Login</button>
                </div>
            `;
        }
        if (cartSubtotal) cartSubtotal.innerText = 'Rs. 0';
        if (checkoutBtn) checkoutBtn.disabled = true;
    }
}

// --- DOM READY INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. Initialize Navbar Auth, Checkout Modal & Load Cart
    ensureCheckoutModalExists();
    updateNavbarAuthState();
    await checkAuthSession();
    fetchCart();

    // 2. SEARCH BAR
    const searchForm = document.querySelector('.search-bar'); 
    if (searchForm) {
        const input = searchForm.querySelector('input');

        searchForm.addEventListener('submit', (e) => {
            e.preventDefault(); 
            const query = input.value.trim();

            if (query) {
                if (window.location.pathname.endsWith('products.html')) {
                    fetchProducts({ name: query });
                    history.pushState(null, '', `products.html?name=${encodeURIComponent(query)}`);
                } else {
                    window.location.href = `products.html?name=${encodeURIComponent(query)}`;
                }
            } else {
                if (window.location.pathname.endsWith('products.html')) {
                    fetchProducts({});
                    history.pushState(null, '', 'products.html');
                }
            }
        });

        const searchBtn = searchForm.querySelector('button');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                searchForm.dispatchEvent(new Event('submit'));
            });
        }
    }

    // 3. DYNAMIC FOOTER YEAR
    const footerParagraph = document.querySelector('footer p');
    if (footerParagraph) {
        const currentYear = new Date().getFullYear();
        footerParagraph.innerHTML = `&copy; ${currentYear} HM Sports. All rights reserved.`;
    }
    
    // 4. CATEGORY CARDS (HOME PAGE)
    const categoryCards = document.querySelectorAll('.category-card');
    if (categoryCards.length > 0) {
        categoryCards.forEach(card => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => {
                const category = card.getAttribute('data-category') || card.innerText.replace(/[^a-zA-Z]/g, '').trim();
                window.location.href = `products.html?category=${encodeURIComponent(category)}`;
            });
        });
    }

    // 5. PRODUCTS CATALOG (PRODUCTS PAGE)
    const productsContainer = document.getElementById('products-container');
    const categoryFilters = document.getElementById('category-filters');
    const pageTitle = document.getElementById('page-title');

    if (productsContainer) {
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');
        const nameParam = urlParams.get('name');

        if (categoryParam) {
            setActiveCategoryButton(categoryParam);
            fetchProducts({ category: categoryParam });
        } else if (nameParam) {
            if (searchForm && searchForm.querySelector('input')) {
                searchForm.querySelector('input').value = nameParam;
            }
            fetchProducts({ name: nameParam });
        } else {
            fetchProducts({});
        }

        if (categoryFilters) {
            categoryFilters.addEventListener('click', (e) => {
                const btn = e.target.closest('.category-filter-btn');
                if (!btn) return;

                const category = btn.getAttribute('data-category');
                setActiveCategoryButton(category);

                if (category === 'all') {
                    history.pushState(null, '', 'products.html');
                    fetchProducts({});
                } else {
                    history.pushState(null, '', `products.html?category=${encodeURIComponent(category)}`);
                    fetchProducts({ category });
                }
            });
        }
    }

    function setActiveCategoryButton(category) {
        if (!categoryFilters) return;
        const buttons = categoryFilters.querySelectorAll('.category-filter-btn');
        buttons.forEach(btn => {
            const btnCat = btn.getAttribute('data-category');
            if (btnCat.toLowerCase() === category.toLowerCase()) {
                btn.classList.remove('btn-outline-dark');
                btn.classList.add('btn-dark', 'active');
            } else {
                btn.classList.remove('btn-dark', 'active');
                btn.classList.add('btn-outline-dark');
            }
        });

        if (pageTitle) {
            pageTitle.innerText = category === 'all' ? 'All Products' : `${category} Gear`;
        }
    }

    async function fetchProducts(filters = {}) {
        if (!productsContainer) return;

        productsContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-success" role="status">
                    <span class="visually-hidden">Loading products...</span>
                </div>
            </div>
        `;

        try {
            const params = new URLSearchParams();
            if (filters.category && filters.category !== 'all') {
                params.append('category', filters.category);
            }
            if (filters.name) {
                params.append('name', filters.name);
            }

            const url = `${API_BASE_URL}/product${params.toString() ? '?' + params.toString() : ''}`;
            const res = await fetch(url, { credentials: 'include' });
            const data = await res.json();

            if (res.ok && data.products && data.products.length > 0) {
                renderProductCards(data.products);
            } else {
                productsContainer.innerHTML = `
                    <div class="col-12 text-center py-5">
                        <p class="fs-5 text-muted">No products found.</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            productsContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <p class="fs-5 text-danger">⚠️ Unable to load products from server. Make sure the backend is running on port 9000.</p>
                </div>
            `;
        }
    }

    function renderProductCards(products) {
        productsContainer.innerHTML = products.map(product => {
            const isOutOfStock = product.status === 'Out of Stock';
            return `
                <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                    <div class="product-card h-100">
                        <img src="${product.img_url}" alt="${product.name}" class="img-fluid" onerror="this.src='images/hmlogo.png'">
                        <span class="stock-badge ${isOutOfStock ? 'stock-out' : 'stock-available'}">
                            ${isOutOfStock ? 'Out of Stock' : 'In Stock'}
                        </span>
                        <h3>${product.name}</h3>
                        <p class="price">Rs. ${Number(product.price).toLocaleString()}</p>
                        <p class="description">${product.description || ''}</p>
                        <button class="btn buy-button w-100 mt-auto" 
                            data-id="${product._id}" 
                            data-name="${product.name}"
                            ${isOutOfStock ? 'disabled' : ''}>
                            ${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 6. GLOBAL EVENT DELEGATION: ADD TO CART, REMOVE FROM CART, STRIPE CHECKOUT
    document.addEventListener('click', async (e) => {
        
        // --- ADD TO CART ---
        const buyBtn = e.target.closest('.buy-button');
        if (buyBtn && !buyBtn.disabled) {
            e.preventDefault();
            const productId = buyBtn.getAttribute('data-id');
            const productName = buyBtn.getAttribute('data-name');

            const originalHtml = buyBtn.innerHTML;
            buyBtn.disabled = true;
            buyBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Saving...`;

            try {
                const res = await fetch(`${API_BASE_URL}/buy`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ _id: productId, name: productName, quantity: 1 }),
                    credentials: 'include'
                });

                const data = await res.json();

                if (res.ok && data.status) {
                    // Update cart badge immediately with bounce animation
                    await fetchCart();

                    // Update button to green added state
                    buyBtn.classList.remove('btn-dark', 'btn-hm-primary');
                    buyBtn.classList.add('btn-success', 'shadow-sm');
                    buyBtn.innerHTML = `✓ Added to Cart`;

                    setTimeout(() => {
                        buyBtn.classList.remove('btn-success', 'shadow-sm');
                        buyBtn.innerHTML = originalHtml;
                        buyBtn.disabled = false;
                    }, 1800);
                } else if (res.status === 401) {
                    const authModalEl = document.getElementById('authModal');
                    if (authModalEl) {
                        const modal = bootstrap.Modal.getInstance(authModalEl) || new bootstrap.Modal(authModalEl);
                        modal.show();
                    } else {
                        alert('🔒 Please log in first to add items to your cart!');
                    }
                    buyBtn.innerHTML = originalHtml;
                    buyBtn.disabled = false;
                } else {
                    alert(`⚠️ ${data.message || 'Could not add product to cart.'}`);
                    buyBtn.innerHTML = originalHtml;
                    buyBtn.disabled = false;
                }
            } catch (error) {
                console.error('Error adding to cart:', error);
                alert('⚠️ Network error: Could not reach the server.');
                buyBtn.innerHTML = originalHtml;
                buyBtn.disabled = false;
            }
            return;
        }

        // --- REMOVE FROM CART ---
        const removeBtn = e.target.closest('.cart-remove-btn');
        if (removeBtn) {
            e.preventDefault();
            const id = removeBtn.getAttribute('data-id');
            try {
                const res = await fetch(`${API_BASE_URL}/buy/${id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                if (res.ok) {
                    fetchCart();
                }
            } catch (err) {
                console.error('Error removing item:', err);
            }
            return;
        }

        // --- PROCEED TO STRIPE CHECKOUT (OPENS SHIPPING DETAILS MODAL) ---
        const checkoutBtn = e.target.closest('#cart-checkout-btn');
        if (checkoutBtn && !checkoutBtn.disabled) {
            e.preventDefault();
            let user = getCurrentUser();
            if (!user) {
                user = await checkAuthSession();
            }
            if (!user) {
                const offcanvasEl = document.getElementById('cartOffcanvas');
                if (offcanvasEl && offcanvasEl.classList.contains('show')) {
                    const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvasEl) || new bootstrap.Offcanvas(offcanvasEl);
                    offcanvasEl.addEventListener('hidden.bs.offcanvas', () => {
                        const authModalEl = document.getElementById('authModal');
                        if (authModalEl) {
                            const authModal = bootstrap.Modal.getInstance(authModalEl) || new bootstrap.Modal(authModalEl);
                            authModal.show();
                        }
                    }, { once: true });
                    offcanvasInstance.hide();
                } else {
                    const authModalEl = document.getElementById('authModal');
                    if (authModalEl) {
                        const authModal = bootstrap.Modal.getInstance(authModalEl) || new bootstrap.Modal(authModalEl);
                        authModal.show();
                    }
                }
                showToast('Please log in or sign up before checking out.', 'warning', 'Login Required');
                return;
            }

            openCheckoutModal(user);
            return;
        }
    });

    // Attach shipping form listener on load
    attachShippingFormListener();

    // 7. AUTH MODAL FORM SUBMISSIONS (LOGIN & REGISTER)
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value.trim();
            const errorMsg = document.getElementById('login-error-msg');
            const submitBtn = loginForm.querySelector('button[type="submit"]');

            if (errorMsg) errorMsg.classList.add('d-none');
            submitBtn.disabled = true;
            submitBtn.innerText = 'Logging in...';

            try {
                const res = await fetch(`${API_BASE_URL}/user/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                    credentials: 'include'
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    setCurrentUser(data.user);
                    const modalEl = document.getElementById('authModal');
                    if (modalEl) {
                        const modal = bootstrap.Modal.getInstance(modalEl);
                        if (modal) modal.hide();
                    }
                    showToast(`Welcome back, ${data.user.name || 'Champion'}!`, 'success', 'Logged In');
                    fetchCart();
                    setTimeout(() => window.location.reload(), 800);
                } else {
                    if (errorMsg) {
                        errorMsg.innerText = data.message || 'Invalid credentials.';
                        errorMsg.classList.remove('d-none');
                    }
                    showToast(data.message || 'Invalid credentials.', 'error', 'Login Failed');
                }
            } catch (err) {
                console.error('Login error:', err);
                if (errorMsg) {
                    errorMsg.innerText = 'Network error connecting to server.';
                    errorMsg.classList.remove('d-none');
                }
                showToast('Network error connecting to server.', 'error', 'Connection Error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = 'Login';
            }
        });
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('reg-name').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const password = document.getElementById('reg-password').value.trim();
            const phone = document.getElementById('reg-phone').value.trim();
            const errorMsg = document.getElementById('register-error-msg');
            const submitBtn = registerForm.querySelector('button[type="submit"]');

            if (errorMsg) errorMsg.classList.add('d-none');
            submitBtn.disabled = true;
            submitBtn.innerText = 'Creating Account...';

            try {
                const res = await fetch(`${API_BASE_URL}/user/register-customer`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password, phone }),
                    credentials: 'include'
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    showToast('Account created successfully! Please log in with your credentials.', 'success', 'Registration Complete');
                    // Switch to login tab
                    const loginTab = document.getElementById('login-tab');
                    if (loginTab) loginTab.click();
                    registerForm.reset();
                } else {
                    if (errorMsg) {
                        errorMsg.innerText = data.message || 'Registration failed.';
                        errorMsg.classList.remove('d-none');
                    }
                    showToast(data.message || 'Registration failed.', 'error', 'Registration Error');
                }
            } catch (err) {
                console.error('Register error:', err);
                if (errorMsg) {
                    errorMsg.innerText = 'Network error connecting to server.';
                    errorMsg.classList.remove('d-none');
                }
                showToast('Network error connecting to server.', 'error', 'Connection Error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = 'Sign Up';
            }
        });
    }

    // 8. CONTACT FORM
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); 
            const name = document.getElementById('name')?.value || 'Valued Customer';
            const email = document.getElementById('email')?.value || '';

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerText;
            
            submitBtn.innerText = "Sending...";
            submitBtn.disabled = true;

            setTimeout(() => {
                showToast(`Thank you, ${name}! We have received your message and will respond within 24 hours.`, 'success', 'Message Received');
                contactForm.reset(); 
                submitBtn.innerText = "Message Sent!";
                submitBtn.classList.add('btn-success'); 
                
                setTimeout(() => {
                    submitBtn.innerText = originalBtnText;
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('btn-success');
                }, 3000);
            }, 1000);
        });
    }

});