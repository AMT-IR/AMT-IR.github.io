// --- CONSTANTS ---
const ADMIN_USER = 'Admin';
const ADMIN_PASS = 'Directadmin1400';

// --- Default Data ---
const defaultProducts = {
    instagram: { displayName: 'اینستاگرام', color: 'red', grid: 'md:grid-cols-3', items: [ { id: 'insta-f', name: 'فالوور فیک', price: 201000 }, { id: 'insta-l', name: 'لایک فیک', price: 50000 }, { id: 'insta-v', name: 'بازدید ریلز و پست', price: 1000 } ] },
    telegram: { displayName: 'تلگرام', color: 'cyan', grid: 'md:grid-cols-3', items: [ { id: 'tele-m', name: 'ممبر فیک', price: 80000 }, { id: 'tele-a', name: 'ادلیست ایرانی', price: 84000 }, { id: 'tele-f', name: 'اد اجباری عادی', price: 85000 } ] },
    eitaa: { displayName: 'ایتا', color: 'orange', grid: 'md:grid-cols-3', items: [ { id: 'eitaa-m', name: 'ممبر ایتا', price: 140000 }, { id: 'eitaa-v1', name: 'بازدید ۱ پست', price: 28000 }, { id: 'eitaa-v5', name: 'بازدید ۵ پست', price: 40000 } ] },
    aparat: { displayName: 'آپارات', color: 'pink', grid: 'md:grid-cols-2', items: [ { id: 'aparat-f', name: 'فالوور آپارات', price: 50000 }, { id: 'aparat-v', name: 'بازدید آپارات', price: 20000 } ] }
};

// --- Database Simulation ---
let siteUsers = {};
let siteData = { discountCodes: {}, balanceCodes: {}, products: { ...defaultProducts } }; // Start with default products
let currentUser = null;
let currentAppliedDiscount = null;
let confirmCallback = null;
let notificationTimeout;

// --- Load Data ---
function loadData() {
    try {
        const storedUsers = localStorage.getItem('siteUsers');
        if (storedUsers) {
            siteUsers = JSON.parse(storedUsers);
            // Basic validation for users object structure (optional)
            if (typeof siteUsers !== 'object' || siteUsers === null) {
                 console.warn("Invalid siteUsers data found in localStorage, resetting.");
                 siteUsers = {};
            }
        } else {
            siteUsers = {};
        }
    } catch (error) {
        console.error("Error loading siteUsers from localStorage:", error);
        siteUsers = {}; // Reset on error
    }

    try {
        const storedSiteData = localStorage.getItem('siteData');
        if (storedSiteData) {
            siteData = JSON.parse(storedSiteData);
            // Basic validation and ensure products exist, fallback to default if needed
            if (typeof siteData !== 'object' || siteData === null) {
                 console.warn("Invalid siteData found in localStorage, resetting.");
                 siteData = { discountCodes: {}, balanceCodes: {}, products: { ...defaultProducts } };
            }
            if (!siteData.products || typeof siteData.products !== 'object' || Object.keys(siteData.products).length === 0) {
                 console.warn("Products missing or invalid in stored siteData, using defaults.");
                 siteData.products = { ...defaultProducts }; // Use default products
                 // Migration logic for old structure (if necessary)
                 if (Array.isArray(siteData.instagram)) { // Check for an old known structure
                     console.log("Migrating old array structure...");
                     siteData.products = { ...defaultProducts };
                 }
            }
            // Ensure discountCodes and balanceCodes exist
            if (!siteData.discountCodes) siteData.discountCodes = {};
            if (!siteData.balanceCodes) siteData.balanceCodes = {};

        } else {
             // Initialize with default if nothing is stored
             siteData = { discountCodes: {}, balanceCodes: {}, products: { ...defaultProducts } };
        }
    } catch (error) {
        console.error("Error loading siteData from localStorage:", error);
        // Fallback to defaults on error
        siteData = { discountCodes: {}, balanceCodes: {}, products: { ...defaultProducts } };
    }

    currentUser = localStorage.getItem('loggedInUser');
    // Validate currentUser exists in loaded siteUsers
    if (currentUser && !siteUsers[currentUser]) {
        console.warn(`User ${currentUser} in localStorage but not in loaded users. Logging out.`);
        localStorage.removeItem('loggedInUser');
        currentUser = null;
    }
}


// --- Save Data ---
function saveUsers() {
    try {
        localStorage.setItem('siteUsers', JSON.stringify(siteUsers));
    } catch (error) {
        console.error("Error saving users to localStorage:", error);
        showNotification("خطا در ذخیره اطلاعات کاربران", "error");
    }
}
function saveSiteData() {
     try {
        localStorage.setItem('siteData', JSON.stringify(siteData));
    } catch (error) {
        console.error("Error saving site data to localStorage:", error);
        showNotification("خطا در ذخیره اطلاعات سایت", "error");
    }
}

// --- UI Elements (Get references after DOM is loaded) ---
let accountBtn, accountText, loginModal, dashboardModal, loginForm, logoutBtn, dashUsername, dashBalance, dashOrders, dashTotal, productTabsContainer, productSectionsWrapper, productSectionContainer, productPlaceholder, cartItemsList, cartSubtotalEl, cartDiscountRow, cartDiscountAmountEl, cartTotalEl, cartEmptyMsg, payBtn, showCartBtn, backToDashBtn, dashboardMainView, cartView, commentForm, userCommentDisplay, userCommentText, redeemCodeInput, redeemCodeBtn, discountCodeInput, applyDiscountBtn, confirmationModal, confirmationTitle, confirmationMessage, confirmYesBtn, confirmNoBtn, adminModal, adminPanelBtn, adminModalClose, adminBackToDashBtn, adminTabs, adminTabContents, adminStatTotalUsers, adminStatTotalBalance, adminStatDiscountCodes, adminStatBalanceCodes, adminUserSearch, adminUserList, adminProductList, addProductForm, addCategoryForm, adminAddProductCategorySelect, createDiscountForm, adminDiscountList, createBalanceForm, adminBalanceList, docElement, darkModeToggles, menuBtn, mobileMenu, menuOpenIcon, menuCloseIcon, steps, nextBtns, restartBtn, progressBar, notificationBanner, statusDot, statusText;

function getElements() {
    accountBtn = document.getElementById('account-btn');
    accountText = document.getElementById('account-text');
    loginModal = document.getElementById('login-modal');
    dashboardModal = document.getElementById('dashboard-modal');
    loginForm = document.getElementById('login-form');
    logoutBtn = document.getElementById('logout-btn');
    dashUsername = document.getElementById('dash-username');
    dashBalance = document.getElementById('dash-balance');
    dashOrders = document.getElementById('dash-orders');
    dashTotal = document.getElementById('dash-total');
    productTabsContainer = document.getElementById('product-tabs');
    productSectionsWrapper = document.getElementById('product-sections-wrapper');
    productSectionContainer = document.getElementById('product-section-container'); // Might not be needed
    productPlaceholder = document.getElementById('product-placeholder');
    cartItemsList = document.getElementById('cart-items-list');
    cartSubtotalEl = document.getElementById('cart-subtotal');
    cartDiscountRow = document.getElementById('cart-discount-row');
    cartDiscountAmountEl = document.getElementById('cart-discount-amount');
    cartTotalEl = document.getElementById('cart-total');
    cartEmptyMsg = document.getElementById('cart-empty-msg');
    payBtn = document.getElementById('pay-btn');
    showCartBtn = document.getElementById('show-cart-btn');
    backToDashBtn = document.getElementById('back-to-dash-btn');
    dashboardMainView = document.getElementById('dashboard-main-view');
    cartView = document.getElementById('cart-view');
    commentForm = document.getElementById('comment-form');
    userCommentDisplay = document.getElementById('user-comment-display');
    userCommentText = document.getElementById('user-comment-text');
    redeemCodeInput = document.getElementById('redeem-code-input');
    redeemCodeBtn = document.getElementById('redeem-code-btn');
    discountCodeInput = document.getElementById('discount-code-input');
    applyDiscountBtn = document.getElementById('apply-discount-btn');
    confirmationModal = document.getElementById('confirmation-modal');
    confirmationTitle = document.getElementById('confirmation-title');
    confirmationMessage = document.getElementById('confirmation-message');
    confirmYesBtn = document.getElementById('confirm-yes-btn');
    confirmNoBtn = document.getElementById('confirm-no-btn');
    adminModal = document.getElementById('admin-modal');
    adminPanelBtn = document.getElementById('admin-panel-btn');
    adminModalClose = document.getElementById('admin-modal-close');
    adminBackToDashBtn = document.getElementById('admin-back-to-dash-btn');
    adminTabs = document.querySelectorAll('.admin-tab-button');
    adminTabContents = document.querySelectorAll('.admin-tab-content');
    adminStatTotalUsers = document.getElementById('admin-stat-total-users');
    adminStatTotalBalance = document.getElementById('admin-stat-total-balance');
    adminStatDiscountCodes = document.getElementById('admin-stat-discount-codes');
    adminStatBalanceCodes = document.getElementById('admin-stat-balance-codes');
    adminUserSearch = document.getElementById('admin-user-search');
    adminUserList = document.getElementById('admin-tab-users'); // Container for list items
    adminProductList = document.getElementById('admin-product-list'); // Container in price edit tab
    addProductForm = document.getElementById('add-product-form');
    addCategoryForm = document.getElementById('add-category-form');
    adminAddProductCategorySelect = document.getElementById('admin-add-product-category');
    createDiscountForm = document.getElementById('create-discount-form');
    adminDiscountList = document.getElementById('admin-discount-list'); // Container in discount tab
    createBalanceForm = document.getElementById('create-balance-form');
    adminBalanceList = document.getElementById('admin-balance-list'); // Container in balance code tab
    docElement = document.documentElement;
    darkModeToggles = [document.getElementById('dark-mode-toggle-desktop'), document.getElementById('dark-mode-toggle-mobile')];
    menuBtn = document.getElementById('menu-btn');
    mobileMenu = document.getElementById('mobile-menu');
    menuOpenIcon = document.getElementById('menu-open-icon');
    menuCloseIcon = document.getElementById('menu-close-icon');
    steps = document.querySelectorAll('[id^="step-"]');
    nextBtns = document.querySelectorAll('.next-btn');
    restartBtn = document.getElementById('restart-btn');
    progressBar = document.getElementById('progress-bar');
    notificationBanner = document.getElementById('notification-banner');
    statusDot = document.getElementById('notification-dot');
    statusText = document.getElementById('notification-text');
}

// --- Notification ---
function showNotification(message, type = 'info') {
    if (!notificationBanner || !statusDot || !statusText) {
        console.warn("Notification elements not found. Message:", message);
        return; // Exit if elements aren't ready
    }
    clearTimeout(notificationTimeout); // Clear previous timeout
    const types = {
        info: { dot: 'bg-blue-500', text: 'text-blue-400' },
        success: { dot: 'bg-green-500', text: 'text-green-400' },
        warning: { dot: 'bg-yellow-500', text: 'text-yellow-400' },
        error: { dot: 'bg-red-500', text: 'text-red-400' },
    };
    const selectedType = types[type] || types.info;
    statusDot.className = `w-3 h-3 ${selectedType.dot} rounded-full animate-pulse`;
    statusText.className = `font-semibold ${selectedType.text} transition-colors duration-300 text-sm`;
    statusText.textContent = message;
    notificationBanner.classList.add('show');
    notificationTimeout = setTimeout(() => { notificationBanner.classList.remove('show'); }, 4000);
}

// --- Dark Mode ---
function updateThemeIcons(isDark) {
    try {
        const lightIconDesktop = document.getElementById('theme-toggle-light-icon-desktop');
        const darkIconDesktop = document.getElementById('theme-toggle-dark-icon-desktop');
        if (lightIconDesktop) lightIconDesktop.classList.toggle('hidden', isDark);
        if (darkIconDesktop) darkIconDesktop.classList.toggle('hidden', !isDark);

        const lightIconMobile = document.getElementById('theme-toggle-light-icon-mobile');
        const darkIconMobile = document.getElementById('theme-toggle-dark-icon-mobile');
        const mobileText = document.getElementById('dark-mode-text-mobile');
        if (lightIconMobile) lightIconMobile.classList.toggle('hidden', isDark);
        if (darkIconMobile) darkIconMobile.classList.toggle('hidden', !isDark);
        if (mobileText) mobileText.textContent = isDark ? 'حالت روشن' : 'حالت تاریک';
    } catch (error) {
        console.error("Error updating theme icons:", error);
    }
}

function setupDarkMode() {
    try {
        if (localStorage.getItem('color-theme') === 'light' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: light)').matches)) {
            if(docElement) docElement.classList.remove('dark');
            updateThemeIcons(false);
        } else {
            if(docElement) docElement.classList.add('dark');
            updateThemeIcons(true);
        }
    } catch (error) {
        console.error("Error setting up dark mode:", error);
    }

    darkModeToggles.forEach(btn => {
        if (btn) btn.addEventListener('click', () => {
            try {
                if(!docElement) return;
                const isDark = docElement.classList.toggle('dark');
                localStorage.setItem('color-theme', isDark ? 'dark' : 'light');
                updateThemeIcons(isDark);
            } catch (error) {
                console.error("Error toggling dark mode:", error);
            }
        });
    });
}

// --- Hamburger Menu ---
function setupHamburgerMenu() {
    if (menuBtn && mobileMenu && menuOpenIcon && menuCloseIcon) {
        menuBtn.addEventListener('click', () => {
            const isClosed = mobileMenu.classList.toggle('hidden');
            mobileMenu.classList.toggle('flex', !isClosed);
            menuOpenIcon.classList.toggle('hidden', !isClosed);
            menuCloseIcon.classList.toggle('hidden', isClosed);
        });
    } else {
        console.warn("Hamburger menu elements not found.");
    }
}

// --- Animated Counters ---
function animateValue(objId, end, duration) {
    //Simplified version - immediate display
    const obj = document.getElementById(objId);
    if(obj) obj.innerHTML = end.toLocaleString('fa-IR');
    else console.warn(`Counter element ${objId} not found.`);
}
function setupCounters() {
    try {
        animateValue("stat-operators", 17, 0); // No animation needed, just set value
        animateValue("stat-bots", 3, 0);
        animateValue("stat-licenses", 10589, 0);

        const ordersElement = document.getElementById('stat-orders');
        if (ordersElement) { let totalOrders = 59375; ordersElement.innerHTML = totalOrders.toLocaleString('fa-IR'); setInterval(() => { totalOrders += 3; ordersElement.innerHTML = totalOrders.toLocaleString('fa-IR'); }, 2000); }
        const usersElement = document.getElementById('stat-users');
        if (usersElement) { let onlineUsers = 708; usersElement.innerHTML = onlineUsers.toLocaleString('fa-IR'); setInterval(() => { onlineUsers += 13; usersElement.innerHTML = onlineUsers.toLocaleString('fa-IR'); }, 2000); }
        const liveOrdersElement = document.getElementById('live-orders-count');
        if(liveOrdersElement) { let liveOrdersCount = 146; liveOrdersElement.innerHTML = liveOrdersCount.toLocaleString('fa-IR') + '+'; setInterval(() => { liveOrdersCount += 19; liveOrdersElement.innerHTML = liveOrdersCount.toLocaleString('fa-IR') + '+'; }, 5000); }
    } catch (error) {
         console.error("Error setting up counters:", error);
    }
}

// --- On-Scroll Animation ---
function setupScrollAnimations() {
    try {
        const animatedElements = document.querySelectorAll('.scroll-animate');
        if (animatedElements.length > 0 && 'IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            animatedElements.forEach(element => observer.observe(element));
        } else {
            animatedElements.forEach(element => element.classList.add('visible')); // Fallback
        }
    } catch (error) {
        console.error("Error setting up scroll animations:", error);
        document.querySelectorAll('.scroll-animate').forEach(element => element.classList.add('visible'));
    }
}

// --- Order Algorithm ---
function setupOrderAlgorithm() {
     if (!steps || steps.length === 0) return; // Need steps to function

    function updateAlgorithmUI() {
        steps.forEach(step => step.classList.add('hidden'));
        const currentStepEl = document.getElementById(`step-${currentStep}`);
        if (currentStepEl) currentStepEl.classList.remove('hidden');
        if (progressBar) progressBar.style.width = `${((currentStep - 1) / (steps.length - 1)) * 100}%`;
    }

    nextBtns.forEach(btn => {
        if (btn) btn.addEventListener('click', () => { if (currentStep < steps.length) { currentStep++; updateAlgorithmUI(); } });
    });
    if (restartBtn) restartBtn.addEventListener('click', () => { currentStep = 1; updateAlgorithmUI(); });

    updateAlgorithmUI(); // Initial setup
}

// --- Dynamic Product Rendering ---
function renderProductTabs() {
    if (!productTabsContainer) {
        console.error("Product tabs container not found.");
        return;
    }
    productTabsContainer.innerHTML = '';
    const categories = siteData.products;
    if (!categories || Object.keys(categories).length === 0) {
        console.warn("No product categories found to render tabs.");
        if (productPlaceholder) productPlaceholder.classList.remove('hidden'); // Show placeholder
        return;
    }

    Object.keys(categories).forEach((catId, index) => {
        const category = categories[catId];
        if (!category) return;
        const tab = document.createElement('button');
        tab.className = 'tab-button px-4 py-2 rounded-lg font-semibold transition-colors duration-300 text-sm sm:text-base';
        if (index === 0) tab.classList.add('active'); // Activate first tab
        tab.dataset.target = `${catId}-section`;
        tab.textContent = category.displayName || catId;
        productTabsContainer.appendChild(tab);
    });
}

function renderProducts() {
    if (!productSectionsWrapper) {
         console.error("Product sections wrapper not found.");
         if (productPlaceholder) productPlaceholder.classList.remove('hidden');
         return;
    }
    productSectionsWrapper.innerHTML = '';
    const categories = siteData.products;

    if (!categories || Object.keys(categories).length === 0) {
        console.warn("No product categories found to render sections.");
        if (productPlaceholder) productPlaceholder.classList.remove('hidden');
        return;
    }

    let firstSectionRendered = false;
    Object.keys(categories).forEach((catId, index) => {
        const category = categories[catId];
        if (!category) return;

        const section = document.createElement('div');
        section.id = `${catId}-section`;
        section.className = 'product-section mb-12 scroll-animate'; // Add scroll animate class

        const grid = document.createElement('div');
        grid.className = `grid grid-cols-1 ${category.grid || 'md:grid-cols-3'} gap-6`;

        if (category.items && Array.isArray(category.items) && category.items.length > 0) {
            category.items.forEach(product => {
                if (!product || !product.id) return;
                const productEl = document.createElement('div');
                const colorVariants = { red: 'hover:border-red-500 from-red-500 to-rose-500', cyan: 'hover:border-cyan-500 from-sky-500 to-cyan-400', orange: 'hover:border-orange-500 from-orange-500 to-amber-500', pink: 'hover:border-pink-500 from-pink-500 to-rose-500', purple: 'hover:border-purple-500 from-purple-500 to-violet-500', green: 'hover:border-green-500 from-green-500 to-emerald-500', blue: 'hover:border-blue-500 from-blue-500 to-indigo-500' };
                const colorClass = colorVariants[category.color?.toLowerCase()] || colorVariants['blue'];

                productEl.className = `text-right glass-effect p-6 rounded-2xl shadow-lg border-2 border-transparent ${colorClass.split(' ')[0]} hover:scale-105 transition-all duration-300`;
                productEl.innerHTML = `
                   <h4 class="text-xl font-bold mb-4">${product.name || 'محصول بی نام'}</h4>
                    <div class="flex justify-between items-center">
                        <button class="add-to-cart-btn px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r ${colorClass.split(' ')[1]} ${colorClass.split(' ')[2]} rounded-lg" data-product-id="${product.id}" data-product-name="${product.name || 'محصول'}" data-product-price="${product.price || 0}">سفارش</button>
                        <p class="text-lg">${(product.price || 0).toLocaleString('fa-IR')} ت</p>
                    </div>
                `;
                grid.appendChild(productEl);
            });
             if (index === 0) { // Show first section only if it has items
                section.classList.remove('hidden');
                if (productPlaceholder) productPlaceholder.classList.add('hidden');
                firstSectionRendered = true;
            } else {
                section.classList.add('hidden');
            }
        } else {
             grid.innerHTML = '<p class="text-slate-400 text-center col-span-full py-4">محصولی در این دسته وجود ندارد.</p>';
             if (index === 0) { // Also show first section if it's empty
                 section.classList.remove('hidden');
                 if (productPlaceholder) productPlaceholder.classList.add('hidden');
                 firstSectionRendered = true;
             } else {
                 section.classList.add('hidden');
             }
        }

        section.appendChild(grid);
        productSectionsWrapper.appendChild(section);
    });

    if (!firstSectionRendered && productPlaceholder) { // Show placeholder if no sections were shown
        productPlaceholder.classList.remove('hidden');
    }

    // Re-setup scroll animations for the newly added sections
    setupScrollAnimations();
}

// --- Confirmation Modal ---
function showConfirmationModal(title, message, onConfirm) {
    if (!confirmationModal || !confirmationTitle || !confirmationMessage) return;
    confirmationTitle.textContent = title;
    confirmationMessage.textContent = message;
    confirmCallback = onConfirm;
    confirmationModal.classList.remove('hidden');
}

function setupConfirmationModal() {
    if (confirmYesBtn) confirmYesBtn.addEventListener('click', () => {
        if (typeof confirmCallback === 'function') {
            try { confirmCallback(); } catch (e) { console.error("Confirm callback error:", e); }
        }
        if (confirmationModal) confirmationModal.classList.add('hidden');
        confirmCallback = null;
    });

    if (confirmNoBtn) confirmNoBtn.addEventListener('click', () => {
        if (confirmationModal) confirmationModal.classList.add('hidden');
        confirmCallback = null;
    });

    // Close on overlay click
    if (confirmationModal) confirmationModal.addEventListener('click', (e) => {
        if (e.target === confirmationModal) {
            confirmationModal.classList.add('hidden');
            confirmCallback = null;
        }
    });
}

// --- Cart UI ---
function updateCartUI(preserveDiscount = false) {
    if (!cartItemsList || !cartEmptyMsg || !payBtn || !cartSubtotalEl || !cartTotalEl || !cartDiscountRow || !cartDiscountAmountEl || !discountCodeInput || !applyDiscountBtn || !dashOrders || !dashTotal) {
        console.error("One or more Cart UI elements are missing.");
        return;
    }

    let shoppingCart = (currentUser && siteUsers[currentUser]) ? siteUsers[currentUser].cart : [];
    cartItemsList.innerHTML = '';

    let subtotal = 0;
    let discount = 0;

    if (shoppingCart && shoppingCart.length > 0) {
        cartEmptyMsg.classList.add('hidden');
        payBtn.disabled = false;
        shoppingCart.forEach(item => {
            if (!item || typeof item.price === 'undefined') return;
            const itemEl = document.createElement('div');
            itemEl.className = 'flex justify-between items-center text-sm';
            itemEl.innerHTML = `<span>${item.name || 'آیتم'}</span><span>${parseInt(item.price || 0).toLocaleString('fa-IR')} ت</span>`;
            cartItemsList.appendChild(itemEl);
            subtotal += parseInt(item.price || 0);
        });
    } else {
        cartEmptyMsg.classList.remove('hidden');
        payBtn.disabled = true;
    }

    if (!preserveDiscount) {
        currentAppliedDiscount = null;
    }

    if (currentAppliedDiscount && siteData.discountCodes && siteData.discountCodes[currentAppliedDiscount]) {
        const code = siteData.discountCodes[currentAppliedDiscount];
        discount = (code.type === 'percent') ? (subtotal * (code.value || 0)) / 100 : (code.value || 0);
        discount = Math.min(subtotal, discount);

        cartDiscountAmountEl.textContent = `- ${Math.round(discount).toLocaleString('fa-IR')} ت`;
        cartDiscountRow.classList.remove('hidden');
        discountCodeInput.value = currentAppliedDiscount;
        discountCodeInput.disabled = true;
        applyDiscountBtn.disabled = true;
    } else {
        currentAppliedDiscount = null;
        cartDiscountRow.classList.add('hidden');
        discountCodeInput.value = '';
        discountCodeInput.disabled = false;
        applyDiscountBtn.disabled = false;
    }

    const finalTotal = subtotal - discount;

    cartSubtotalEl.textContent = `${Math.round(subtotal).toLocaleString('fa-IR')} ت`;
    cartTotalEl.textContent = `${Math.round(finalTotal).toLocaleString('fa-IR')} ت`;

    dashOrders.textContent = (shoppingCart?.length || 0).toLocaleString('fa-IR');
    dashTotal.innerHTML = `${Math.round(subtotal).toLocaleString('fa-IR')} <span class="text-sm">ت</span>`;
}


// --- Login/Account ---
function checkLogin() {
     currentUser = localStorage.getItem('loggedInUser'); // Re-read from storage

    if (currentUser && !siteUsers[currentUser]) {
        console.warn(`User ${currentUser} invalid. Logging out.`);
        localStorage.removeItem('loggedInUser');
        currentUser = null;
        if (!window.pageReloaded) { // Show notification only once per session if user was invalid
            showNotification('نشست شما نامعتبر است، لطفا دوباره وارد شوید.', 'error');
            window.pageReloaded = true; // Flag to prevent multiple notifications on refresh loop
        }
    }

    if (currentUser && siteUsers[currentUser]) {
        const user = siteUsers[currentUser];
        if (accountText) accountText.textContent = currentUser;
        if (dashBalance) dashBalance.textContent = (user.balance || 0).toLocaleString('fa-IR') + ' ت';
        if (adminPanelBtn) adminPanelBtn.classList.toggle('hidden', !user.isAdmin);
    } else {
        currentUser = null; // Ensure null if not logged in
        if (accountText) accountText.textContent = 'حساب کاربری';
        if (dashBalance) dashBalance.textContent = '۰ ت';
        if (adminPanelBtn) adminPanelBtn.classList.add('hidden');
    }
    updateCartUI(false); // Update cart and reset discount
}

function setupLogin() {
    if (accountBtn) accountBtn.addEventListener('click', () => {
        if (currentUser && siteUsers[currentUser]) {
            const user = siteUsers[currentUser];
            if (dashUsername) dashUsername.textContent = currentUser;
            if (dashBalance) dashBalance.textContent = (user.balance || 0).toLocaleString('fa-IR') + ' ت';

            const savedComment = user.comment;
            if (savedComment && userCommentDisplay && userCommentText) {
                userCommentText.textContent = savedComment;
                userCommentDisplay.classList.remove('hidden');
            } else if (userCommentDisplay) {
                userCommentDisplay.classList.add('hidden');
            }

            if (dashboardModal) dashboardModal.classList.remove('hidden');
            if (dashboardMainView) dashboardMainView.classList.remove('hidden');
            if (cartView) cartView.classList.add('hidden');
        } else {
            if (loginModal) loginModal.classList.remove('hidden');
        }
    });

    if (loginForm) loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const usernameInput = document.getElementById('login-username');
        const passwordInput = document.getElementById('login-password');
        const username = usernameInput ? usernameInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value : '';

        if (!username || !password) {
            showNotification('نام کاربری و رمز عبور الزامی است', 'warning');
            return;
        }

        // Admin Login
        if (username.toLowerCase() === ADMIN_USER.toLowerCase() && password === ADMIN_PASS) {
            if (!siteUsers[ADMIN_USER]) {
                siteUsers[ADMIN_USER] = { password: ADMIN_PASS, cart: [], comment: '', balance: 1000000, isAdmin: true };
            } else {
                if (siteUsers[ADMIN_USER].password !== ADMIN_PASS) {
                    showNotification('رمز عبور ادمین اشتباه است', 'error'); return;
                }
                siteUsers[ADMIN_USER].isAdmin = true; // Ensure admin status
            }
            saveUsers();
            localStorage.setItem('loggedInUser', ADMIN_USER);
            checkLogin();
            if (loginModal) loginModal.classList.add('hidden');
            showNotification(`خوش آمدید، ادمین ${ADMIN_USER}!`, 'success');
            loginForm.reset();
            return;
        }

        // Regular User
        if (siteUsers[username]) { // Login
            if (siteUsers[username].password === password) {
                if (username.toLowerCase() === ADMIN_USER.toLowerCase()) {
                    showNotification('اطلاعات ورود ادمین نامعتبر است', 'error'); return; // Prevent normal login as admin
                }
                localStorage.setItem('loggedInUser', username);
                checkLogin();
                if (loginModal) loginModal.classList.add('hidden');
                showNotification(`خوش آمدید، ${username}!`, 'success');
                loginForm.reset();
            } else {
                showNotification('رمز عبور اشتباه است', 'error');
            }
        } else { // Register
            if (username.toLowerCase() === ADMIN_USER.toLowerCase()) {
                showNotification('این نام کاربری برای ادمین رزرو شده است', 'error'); return;
            }
            siteUsers[username] = { password: password, cart: [], comment: '', balance: 0, isAdmin: false };
            saveUsers();
            localStorage.setItem('loggedInUser', username);
            checkLogin();
            if (loginModal) loginModal.classList.add('hidden');
            showNotification(`حساب کاربری برای ${username} با موفقیت ساخته شد`, 'success');
            loginForm.reset();
        }
    });

    if (logoutBtn) logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('loggedInUser');
        currentUser = null;
        checkLogin();
        if (dashboardModal) dashboardModal.classList.add('hidden');
        if (adminModal) adminModal.classList.add('hidden');
        showNotification('از حساب کاربری خود خارج شدید', 'info');
    });

     // Close Login modal on overlay click
    if (loginModal) loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) loginModal.classList.add('hidden');
    });
}

// --- Cart/Dashboard Actions ---
function setupCartActions() {
    if (showCartBtn) showCartBtn.addEventListener('click', () => {
        if (dashboardMainView) dashboardMainView.classList.add('hidden');
        updateCartUI(true); // Preserve discount
        if (cartView) cartView.classList.remove('hidden');
    });

    if (backToDashBtn) backToDashBtn.addEventListener('click', () => {
        if (cartView) cartView.classList.add('hidden');
        if (dashboardMainView) dashboardMainView.classList.remove('hidden');
    });

    if (payBtn) payBtn.addEventListener('click', () => {
        if (!currentUser || !siteUsers[currentUser]) return;

        let shoppingCart = siteUsers[currentUser].cart || [];
        let subtotal = shoppingCart.reduce((sum, item) => sum + parseInt(item?.price || 0), 0);
        let discount = 0;
        if (currentAppliedDiscount && siteData.discountCodes && siteData.discountCodes[currentAppliedDiscount]) {
            const code = siteData.discountCodes[currentAppliedDiscount];
            discount = (code.type === 'percent') ? (subtotal * (code.value || 0)) / 100 : (code.value || 0);
            discount = Math.min(subtotal, discount);
        }
        const finalTotal = subtotal - discount;
        const user = siteUsers[currentUser];

        if ((user.balance || 0) < finalTotal) {
            showNotification('موجودی شما کافی نیست.', 'error'); return;
        }

        user.balance -= finalTotal;
        user.cart = [];
        saveUsers();
        currentAppliedDiscount = null; // Reset discount
        updateCartUI(false);
        checkLogin(); // Refresh balance
        showNotification('پرداخت با موفقیت انجام شد.', 'success');

        setTimeout(() => {
            if (cartView) cartView.classList.add('hidden');
            if (dashboardMainView) dashboardMainView.classList.remove('hidden');
        }, 1000);
    });

     // Close Dashboard modal on overlay click
     if (dashboardModal) dashboardModal.addEventListener('click', (e) => {
        if (e.target === dashboardModal) dashboardModal.classList.add('hidden');
     });
}

// --- Comments ---
function setupComments() {
    if (commentForm) commentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!currentUser) {
            showNotification('برای ارسال دیدگاه، لطفا وارد شوید', 'warning');
            if (loginModal) loginModal.classList.remove('hidden');
            return;
        }
        if (!siteUsers[currentUser]) return; // Should not happen if currentUser is set

        const commentInput = document.getElementById('comment');
        if (commentInput) {
            siteUsers[currentUser].comment = commentInput.value;
            saveUsers();
            showNotification('دیدگاه شما با موفقیت ثبت شد!', 'success');
            commentInput.value = '';
            // Update dashboard display if open
            if (userCommentText && userCommentDisplay && !dashboardModal?.classList.contains('hidden')) {
                userCommentText.textContent = siteUsers[currentUser].comment;
                userCommentDisplay.classList.remove('hidden');
            }
        }
    });
}

// --- Codes (Redeem/Discount) ---
function setupCodes() {
    if (redeemCodeBtn && redeemCodeInput) redeemCodeBtn.addEventListener('click', () => {
        if (!currentUser) { showNotification('لطفا ابتدا وارد شوید', 'warning'); return; }
        if (!siteUsers[currentUser]) return;

        const code = redeemCodeInput.value.trim().toUpperCase();
        if (!code) return;
        const codeData = siteData.balanceCodes ? siteData.balanceCodes[code] : null;

        if (!codeData) { showNotification('کد نامعتبر است', 'error'); return; }
        if (codeData.used) { showNotification('کد قبلا استفاده شده', 'warning'); return; }

        siteUsers[currentUser].balance = (siteUsers[currentUser].balance || 0) + (codeData.value || 0);
        codeData.used = true;
        saveUsers();
        saveSiteData();
        checkLogin(); // Refresh balance
        showNotification(`مبلغ ${(codeData.value || 0).toLocaleString('fa-IR')} ت به حساب شما اضافه شد!`, 'success');
        redeemCodeInput.value = '';
        if (adminModal && !adminModal.classList.contains('hidden')) loadAdminBalanceCodes(); // Refresh admin view
    });

    if (applyDiscountBtn && discountCodeInput) applyDiscountBtn.addEventListener('click', () => {
         if (!currentUser) { showNotification('لطفا ابتدا وارد شوید', 'warning'); return; } // Need to be logged in to apply
         if (!siteUsers[currentUser]) return;
         if (!siteUsers[currentUser].cart || siteUsers[currentUser].cart.length === 0) {
              showNotification('سبد خرید شما خالی است', 'warning'); return; // No need to apply if cart empty
         }

        const code = discountCodeInput.value.trim().toUpperCase();
        if (!code) return;
        if (!siteData.discountCodes || !siteData.discountCodes[code]) {
            showNotification('کد تخفیف نامعتبر است', 'error');
            return;
        }

        currentAppliedDiscount = code;
        updateCartUI(true); // Update cart and show discount
        showNotification('کد تخفیف با موفقیت اعمال شد', 'success');
    });
}

// --- Admin Panel Functions ---
// (Functions like loadAdminDashboard, loadAdminUsers, etc., remain largely the same as before)
// ... Include all the admin panel functions from the previous script.js here ...
// Make sure they use the globally defined UI elements after getElements() is called.
// Example modification for loadAdminDashboard:
function loadAdminDashboard() {
    // Check if elements exist before using them
    if (!adminStatTotalUsers || !adminStatTotalBalance || !adminStatDiscountCodes || !adminStatBalanceCodes) {
        console.error("Admin dashboard stat elements not found.");
        return;
    }

    let totalUsers = 0;
    let totalBalance = 0;
    let activeDiscountCodes = 0;
    let unusedBalanceCodes = 0;

    // Use Object.keys safely
    Object.keys(siteUsers || {}).forEach(username => {
        if (username !== ADMIN_USER && siteUsers[username]) {
            totalUsers++;
            totalBalance += siteUsers[username].balance || 0;
        }
    });

    activeDiscountCodes = Object.keys(siteData.discountCodes || {}).length;

    Object.keys(siteData.balanceCodes || {}).forEach(code => {
        if (siteData.balanceCodes[code] && !siteData.balanceCodes[code].used) {
            unusedBalanceCodes++;
        }
    });

    adminStatTotalUsers.textContent = totalUsers.toLocaleString('fa-IR');
    adminStatTotalBalance.textContent = `${Math.round(totalBalance).toLocaleString('fa-IR')} ت`;
    adminStatDiscountCodes.textContent = activeDiscountCodes.toLocaleString('fa-IR');
    adminStatBalanceCodes.textContent = unusedBalanceCodes.toLocaleString('fa-IR');
}

// --- Simplified loadAdminUsers with checks ---
function loadAdminUsers() {
    if (!adminUserList) { console.error("Admin user list container not found."); return; }

    const userListItemsContainer = adminUserList.querySelector('#admin-user-list-items');
    if(userListItemsContainer) userListItemsContainer.remove(); // Clear previous list

    const listContainer = document.createElement('div');
    listContainer.id = 'admin-user-list-items';
    listContainer.className = 'space-y-4';

    const searchTerm = adminUserSearch ? adminUserSearch.value.trim().toLowerCase() : '';
    const usernames = Object.keys(siteUsers || {}); // Safe access

    let userCount = 0;

    usernames.sort().forEach(username => {
        if (username === ADMIN_USER || !siteUsers[username]) return;
        if (searchTerm && !username.toLowerCase().includes(searchTerm)) return;

        userCount++;
        const user = siteUsers[username];
        const cartItems = user.cart && user.cart.length > 0
            ? user.cart.map(item => item?.name || '?').join('، ')
            : '<i>خالی</i>';

        const userCard = document.createElement('div');
        userCard.className = 'glass-effect p-4 rounded-lg text-sm space-y-3';
        userCard.innerHTML = `
            <div class="flex flex-wrap gap-2 justify-between items-center">
                <p class="font-bold text-lg text-sky-300">${username}</p>
                <button data-username="${username}" class="delete-user-btn px-3 py-1 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">حذف کاربر</button>
            </div>
            <p>موجودی: <span class="font-bold text-green-400">${(user.balance || 0).toLocaleString('fa-IR')} ت</span></p>
            <div class="flex flex-col sm:flex-row gap-2">
                <input type="number" id="balance-input-${username}" class="form-input w-full p-2 rounded-lg text-slate-800 dark:text-slate-200" placeholder="تنظیم موجودی جدید">
                <button data-username="${username}" class="set-balance-btn px-4 py-2 font-semibold text-white bg-sky-500 rounded-lg whitespace-nowrap hover:bg-sky-600 transition-colors">تنظیم</button>
            </div>
            <div class="border-t border-slate-700/50 pt-3 mt-3 space-y-2">
                <p class="text-slate-400 text-xs">سبد خرید: <span class="text-slate-300">${cartItems}</span></p>
                ${user.comment ? `
                    <div class="flex justify-between items-start gap-2">
                        <p class="text-slate-400 text-xs italic flex-1 break-words">نظر: ${user.comment}</p>
                        <button data-username="${username}" class="clear-comment-btn px-2 py-1 text-xs text-white bg-slate-600 rounded-lg hover:bg-slate-700 transition-colors flex-shrink-0">حذف نظر</button>
                    </div>
                ` : '<p class="text-slate-500 text-xs italic">نظری ثبت نشده است.</p>'}
            </div>
        `;
        listContainer.appendChild(userCard);
    });

    if (userCount === 0) {
        listContainer.innerHTML = '<p class="text-center text-slate-400 py-4">کاربری یافت نشد.</p>';
    }

    adminUserList.appendChild(listContainer);

    // Event delegation setup needs to be outside the loop and checked
    // This part is simplified; assumes the event listener setup from previous version is correct and attached once.
    if (!adminUserList.dataset.listenersAdded) {
         adminUserList.addEventListener('click', handleAdminUserActions); // Use a named function
         adminUserList.dataset.listenersAdded = 'true';
    }
}

function handleAdminUserActions(e) {
     const targetUser = e.target.dataset.username;
     if (!targetUser) return;

     if (e.target.classList.contains('set-balance-btn')) {
         const input = document.getElementById(`balance-input-${targetUser}`);
         const amount = parseInt(input?.value || '');
         if (isNaN(amount) || amount < 0) { showNotification('مبلغ نامعتبر (0+)', 'warning'); return; }
         if(siteUsers[targetUser]) siteUsers[targetUser].balance = amount;
         saveUsers();
         showNotification(`موجودی ${targetUser} تنظیم شد.`, 'success');
         if(input) input.value = '';
         loadAdminUsers();
         loadAdminDashboard();
     } else if (e.target.classList.contains('delete-user-btn')) {
         showConfirmationModal(`حذف ${targetUser}`, 'تمام اطلاعات کاربر حذف خواهد شد.', () => {
             delete siteUsers[targetUser];
             saveUsers();
             showNotification(`کاربر ${targetUser} حذف شد.`, 'success');
             loadAdminUsers();
             loadAdminDashboard();
         });
     } else if (e.target.classList.contains('clear-comment-btn')) {
          if(siteUsers[targetUser]) siteUsers[targetUser].comment = '';
          saveUsers();
          showNotification(`نظر ${targetUser} پاک شد.`, 'success');
          loadAdminUsers();
     }
}

// --- Simplified loadAdminProducts with checks ---
function loadAdminProducts() {
    if (!adminProductList) { console.error("Admin product list container not found."); return; }
    adminProductList.innerHTML = '';
    const categories = siteData.products;
    if (!categories || Object.keys(categories).length === 0) {
        adminProductList.innerHTML = '<p class="text-center text-slate-400 py-4">محصولی یافت نشد.</p>';
        return;
    }

    Object.keys(categories).forEach(catId => {
        const category = categories[catId];
        if (!category) return;
        const catHeader = document.createElement('h4');
        catHeader.className = 'text-lg font-bold mt-4 border-b border-slate-700/50 pb-2 text-sky-300';
        catHeader.textContent = category.displayName || catId;
        adminProductList.appendChild(catHeader);

        if (category.items && Array.isArray(category.items) && category.items.length > 0) {
            category.items.forEach(product => {
                if (!product || !product.id) return;
                const el = document.createElement('div');
                el.className = 'glass-effect p-3 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2';
                el.innerHTML = `
                    <p class="font-medium text-sm flex-1">${product.name || '?'}</p>
                    <div class="flex gap-2 w-full sm:w-auto items-center">
                        <input type="number" id="price-input-${product.id}" class="form-input w-full sm:w-32 p-2 rounded-lg text-slate-800 dark:text-slate-200" value="${product.price || 0}">
                        <button data-id="${product.id}" data-category="${catId}" class="save-price-btn px-4 py-2 font-semibold text-white bg-green-500 rounded-lg whitespace-nowrap hover:bg-green-600 transition-colors">ذخیره</button>
                        <button data-id="${product.id}" data-category="${catId}" class="delete-product-btn px-2 py-1 text-xs text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">حذف</button>
                    </div>
                `;
                adminProductList.appendChild(el);
            });
        } else {
             const noProductMsg = document.createElement('p');
             noProductMsg.className = 'text-slate-400 text-sm italic py-2';
             noProductMsg.textContent = 'محصولی در این دسته نیست.';
             adminProductList.appendChild(noProductMsg);
        }
    });

    // Simplified event delegation setup
    if (!adminProductList.dataset.listenersAdded) {
        adminProductList.addEventListener('click', handleAdminProductActions);
        adminProductList.dataset.listenersAdded = 'true';
    }
}

function handleAdminProductActions(e) {
    const targetId = e.target.dataset.id;
    const targetCategory = e.target.dataset.category;
    if (!targetId || !targetCategory) return;
    const category = siteData.products ? siteData.products[targetCategory] : null;
    if (!category?.items) return;
    const productIndex = category.items.findIndex(p => p && p.id === targetId);
    if (productIndex < 0) return; // Product not found

    if (e.target.classList.contains('save-price-btn')) {
        const input = document.getElementById(`price-input-${targetId}`);
        const newPrice = parseInt(input?.value || '');
        if (isNaN(newPrice) || newPrice < 0) { showNotification('مبلغ نامعتبر', 'error'); return; }
        category.items[productIndex].price = newPrice;
        saveSiteData();
        renderProducts();
        showNotification(`قیمت ${category.items[productIndex].name} به‌روز شد`, 'success');
    } else if (e.target.classList.contains('delete-product-btn')) {
        showConfirmationModal('حذف محصول', `حذف "${category.items[productIndex].name}"؟`, () => {
             const productName = category.items[productIndex].name;
             category.items.splice(productIndex, 1);
             saveSiteData();
             renderProducts();
             loadAdminProducts();
             showNotification(`محصول "${productName}" حذف شد.`, 'success');
        });
    }
}

// --- Simplified loadAdminAddProductTab ---
function loadAdminAddProductTab() {
    if (!adminAddProductCategorySelect) { console.error("Admin add product category select not found."); return; }
    adminAddProductCategorySelect.innerHTML = '';
    const categories = siteData.products;
    if (!categories || Object.keys(categories).length === 0) {
        const option = document.createElement('option');
        option.textContent = 'دسته‌ای وجود ندارد';
        option.disabled = true; option.className = 'text-slate-800';
        adminAddProductCategorySelect.appendChild(option);
        return;
    }
    Object.keys(categories).forEach(catId => {
        if (categories[catId]) {
            const option = document.createElement('option');
            option.value = catId;
            option.textContent = categories[catId].displayName || catId;
            option.className = 'text-slate-800';
            adminAddProductCategorySelect.appendChild(option);
        }
    });
}

// --- Simplified loadAdminDiscounts ---
function loadAdminDiscounts() {
    if (!adminDiscountList) { console.error("Admin discount list container not found."); return; }
    adminDiscountList.innerHTML = '';
    const codes = Object.keys(siteData.discountCodes || {}).sort();
    if (codes.length === 0) {
        adminDiscountList.innerHTML = '<p class="text-center text-slate-400 py-4">کد تخفیفی نیست.</p>';
        return;
    }
    codes.forEach(codeName => {
        const code = siteData.discountCodes[codeName];
        if (!code) return;
        const typeText = code.type === 'percent' ? '%' : 'ت';
        const valueText = code.type === 'percent' ? `${code.value || 0}%` : `${(code.value || 0).toLocaleString('fa-IR')} ت`;

        const codeEl = document.createElement('div');
        codeEl.className = 'glass-effect p-3 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm';
        codeEl.innerHTML = `
            <div>
                <p class="font-bold text-base text-violet-300">${codeName}</p>
                <p class="text-slate-300">${valueText}</p>
            </div>
            <button data-code="${codeName}" class="delete-discount-btn px-3 py-1 text-xs font-semibold text-white bg-red-600 rounded-lg w-full sm:w-auto hover:bg-red-700 transition-colors">حذف</button>
        `;
        adminDiscountList.appendChild(codeEl);
    });

    if (!adminDiscountList.dataset.listenersAdded) {
        adminDiscountList.addEventListener('click', handleAdminDiscountActions);
        adminDiscountList.dataset.listenersAdded = 'true';
    }
}

function handleAdminDiscountActions(e) {
    if (!e.target.classList.contains('delete-discount-btn')) return;
    const code = e.target.dataset.code;
    if (code && siteData.discountCodes) {
        showConfirmationModal(`حذف کد ${code}`, 'کاربران دیگر نمی‌توانند از این کد استفاده کنند.', () => {
            delete siteData.discountCodes[code];
            saveSiteData();
            showNotification(`کد تخفیف ${code} حذف شد.`, 'success');
            loadAdminDiscounts();
            loadAdminDashboard();
        });
    }
}

// --- Simplified loadAdminBalanceCodes ---
function loadAdminBalanceCodes() {
    if (!adminBalanceList) { console.error("Admin balance code list container not found."); return; }
    adminBalanceList.innerHTML = '';
    const codes = Object.keys(siteData.balanceCodes || {}).sort((a, b) => (siteData.balanceCodes[a].used ? 1 : -1) - (siteData.balanceCodes[b].used ? 1 : -1) || a.localeCompare(b));

     if (codes.length === 0) {
        adminBalanceList.innerHTML = '<p class="text-center text-slate-400 py-4">کد موجودی نیست.</p>';
        return;
    }
    codes.forEach(codeName => {
        const code = siteData.balanceCodes[codeName];
        if(!code) return;
        const statusText = code.used ? 'استفاده شده' : 'فعال';
        const statusClass = code.used ? 'text-red-400' : 'text-green-400';

        const codeEl = document.createElement('div');
        codeEl.className = `glass-effect p-3 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm ${code.used ? 'opacity-60' : ''}`;
        codeEl.innerHTML = `
            <div>
                <p class="font-bold text-base text-amber-300">${codeName}</p>
                <p class="text-slate-300">مبلغ: ${(code.value || 0).toLocaleString('fa-IR')} ت | وضع: <span class="${statusClass} font-bold">${statusText}</span></p>
            </div>
            <button data-code="${codeName}" class="delete-balance-btn px-3 py-1 text-xs font-semibold text-white bg-red-600 rounded-lg w-full sm:w-auto hover:bg-red-700 transition-colors">حذف</button>
        `;
        adminBalanceList.appendChild(codeEl);
    });

    if (!adminBalanceList.dataset.listenersAdded) {
        adminBalanceList.addEventListener('click', handleAdminBalanceCodeActions);
        adminBalanceList.dataset.listenersAdded = 'true';
    }
}

function handleAdminBalanceCodeActions(e) {
    if (!e.target.classList.contains('delete-balance-btn')) return;
    const code = e.target.dataset.code;
     if (code && siteData.balanceCodes) {
        showConfirmationModal(`حذف کد ${code}`, 'اگر کد استفاده نشده باشد، دیگر قابل استفاده نخواهد بود.', () => {
            delete siteData.balanceCodes[code];
            saveSiteData();
            showNotification(`کد موجودی ${code} حذف شد.`, 'success');
            loadAdminBalanceCodes();
            loadAdminDashboard();
         });
     }
}

// --- Setup Admin Panel ---
function setupAdminPanel() {
    if (adminPanelBtn) adminPanelBtn.addEventListener('click', () => {
        if (!adminModal) return;
         // Load initial data for all tabs
         loadAdminDashboard();
         loadAdminUsers();
         loadAdminProducts();
         loadAdminAddProductTab();
         loadAdminDiscounts();
         loadAdminBalanceCodes();
         // Set default tab
         adminTabs.forEach(t => t.classList.remove('active'));
         adminTabContents.forEach(c => c.classList.add('hidden'));
         const defaultTabButton = document.querySelector('.admin-tab-button[data-target="admin-tab-dashboard"]');
         const defaultTabContent = document.getElementById('admin-tab-dashboard');
         if(defaultTabButton) defaultTabButton.classList.add('active');
         if(defaultTabContent) defaultTabContent.classList.remove('hidden');
         adminModal.classList.remove('hidden');
    });

    adminTabs.forEach(tab => {
       if(tab) tab.addEventListener('click', () => {
            adminTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const target = tab.dataset.target;
            adminTabContents.forEach(c => {
                if(c) c.id === target ? c.classList.remove('hidden') : c.classList.add('hidden');
            });
            // Specific loads only if needed (e.g., refresh user list)
             if (target === 'admin-tab-users') loadAdminUsers();
        });
    });

    if (adminModalClose) adminModalClose.addEventListener('click', () => {
       if (adminModal) adminModal.classList.add('hidden');
    });

    if (adminBackToDashBtn) adminBackToDashBtn.addEventListener('click', () => {
        if (adminModal) adminModal.classList.add('hidden');
        checkLogin(); // Refresh user dash
        if (dashboardModal) dashboardModal.classList.remove('hidden');
    });

     // Close Admin modal on overlay click
     if (adminModal) adminModal.addEventListener('click', (e) => {
        if (e.target === adminModal) adminModal.classList.add('hidden');
     });

    // Admin Form Submissions
    if (createDiscountForm) createDiscountForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('discount-code-name');
        const valueInput = document.getElementById('discount-code-value');
        const typeInput = document.getElementById('discount-code-type');
        const name = nameInput?.value.trim().toUpperCase() || '';
        const value = parseInt(valueInput?.value || '');
        const type = typeInput?.value || 'percent';

        if (!name || isNaN(value) || value <= 0 || !/^[A-Z0-9]+$/.test(name)) {
            showNotification('نام کد معتبر (حروف/اعداد انگلیسی) و مقدار مثبت وارد کنید', 'warning'); return;
        }
        if (siteData.discountCodes[name]) { showNotification(`کد ${name} تکراری است`, 'warning'); return; }

        siteData.discountCodes[name] = { value, type };
        saveSiteData();
        showNotification(`کد تخفیف ${name} ایجاد شد`, 'success');
        createDiscountForm.reset();
        loadAdminDiscounts(); loadAdminDashboard();
    });

    if (createBalanceForm) createBalanceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const valueInput = document.getElementById('balance-code-value');
        const value = parseInt(valueInput?.value || '');
        if (isNaN(value) || value <= 0) { showNotification('مبلغ معتبر و مثبت وارد کنید', 'warning'); return; }

        let newCode;
        if (!siteData.balanceCodes) siteData.balanceCodes = {};
        do { newCode = Math.random().toString(36).substring(2, 10).toUpperCase(); } while (siteData.balanceCodes[newCode]);

        siteData.balanceCodes[newCode] = { value: value, used: false };
        saveSiteData();
        showNotification(`کد ${newCode} (${value.toLocaleString('fa-IR')} ت) ایجاد شد`, 'success');
        createBalanceForm.reset();
        loadAdminBalanceCodes(); loadAdminDashboard();
    });

    if (addProductForm) addProductForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('admin-add-product-name');
        const priceInput = document.getElementById('admin-add-product-price');
        const catId = adminAddProductCategorySelect?.value || '';
        const name = nameInput?.value.trim() || '';
        const price = parseInt(priceInput?.value || '');

        if (!catId || !name || isNaN(price) || price <= 0) { showNotification('فیلدها نامعتبرند', 'warning'); return; }

        const categoryItems = siteData.products[catId]?.items;
        if (!categoryItems) { showNotification('دسته نامعتبر', 'error'); return; }
        let newId;
        do { newId = `${catId}-${Math.random().toString(36).substring(2, 6)}`; } while (categoryItems.some(item => item && item.id === newId));

        categoryItems.push({ id: newId, name: name, price: price });
        saveSiteData();
        renderProducts(); loadAdminProducts();
        showNotification(`محصول "${name}" اضافه شد`, 'success');
        addProductForm.reset();
    });

    if (addCategoryForm) addCategoryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const idInput = document.getElementById('admin-add-category-id');
        const nameInput = document.getElementById('admin-add-category-name');
        const colorInput = document.getElementById('admin-add-category-color');
        const gridInput = document.getElementById('admin-add-category-grid');
        const id = idInput?.value.trim().toLowerCase().replace(/\s+/g, '-') || '';
        const name = nameInput?.value.trim() || '';
        const color = colorInput?.value.trim().toLowerCase() || 'blue';
        const grid = gridInput?.value || 'md:grid-cols-3';

        if (!id || !name || !/^[a-z0-9-]+$/.test(id)) { showNotification('شناسه/نام نامعتبر', 'warning'); return; }
        if (!siteData.products) siteData.products = {};
        if (siteData.products[id]) { showNotification('شناسه تکراری', 'error'); return; }

        siteData.products[id] = { displayName: name, color: color, grid: grid, items: [] };
        saveSiteData();
        renderProductTabs(); renderProducts(); loadAdminAddProductTab(); loadAdminProducts();
        showNotification(`دسته "${name}" ایجاد شد`, 'success');
        addCategoryForm.reset();
    });
}


// --- Main Initialization ---
function initializeApp() {
    console.log("Initializing App...");
    loadData(); // Load data from localStorage first
    getElements(); // Get references to all DOM elements
    setupDarkMode();
    setupHamburgerMenu();
    setupCounters();
    setupScrollAnimations();
    setupOrderAlgorithm();
    setupConfirmationModal();
    setupLogin();
    setupCartActions();
    setupComments();
    setupCodes();
    setupAdminPanel(); // Setup admin listeners etc.

    // Initial renders that depend on loaded data
    try {
        renderProductTabs();
        renderProducts();
    } catch (error) {
        console.error("Error during initial product rendering:", error);
        showNotification("خطا در نمایش محصولات", "error");
        if(productPlaceholder) productPlaceholder.classList.remove('hidden'); // Show placeholder on error
    }

    checkLogin(); // Final check and UI update based on login status

    // Initial notifications
    setTimeout(() => showNotification('درحال برقراری ارتباط با سرور', 'warning'), 500);
    setTimeout(() => showNotification('با موفقيت به سرور متصل شدید', 'success'), 2500);

    console.log("App Initialized.");
}

// --- Run Initialization ---
// The 'defer' attribute in the script tag ensures this runs after DOM parsing.
initializeApp();

}); // End DOMContentLoaded


