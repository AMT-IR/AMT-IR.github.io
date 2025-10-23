localStorage.removeItem('siteData');
localStorage.removeItem('siteUsers');

document.addEventListener('DOMContentLoaded', function() {
    // --- CONSTANTS ---
    const ADMIN_USER = 'Admin';
    const ADMIN_PASS = 'Directadmin1400';

    // --- Database Simulation ---
    let siteUsers = JSON.parse(localStorage.getItem('siteUsers')) || {};

    // Default product structure (v2)
    const defaultProducts = {
        instagram: {
            displayName: 'اینستاگرام',
            color: 'red',
            grid: 'md:grid-cols-3',
            items: [
                { id: 'insta-f', name: 'فالوور فیک', price: 201000 },
                { id: 'insta-l', name: 'لایک فیک', price: 50000 },
                { id: 'insta-v', name: 'بازدید ریلز و پست', price: 1000 }
            ]
        },
        telegram: {
            displayName: 'تلگرام',
            color: 'cyan',
            grid: 'md:grid-cols-3',
            items: [
                { id: 'tele-m', name: 'ممبر فیک', price: 80000 },
                { id: 'tele-a', name: 'ادلیست ایرانی', price: 84000 },
                { id: 'tele-f', name: 'اد اجباری عادی', price: 85000 }
            ]
        },
        eitaa: {
            displayName: 'ایتا',
            color: 'orange',
            grid: 'md:grid-cols-3',
            items: [
                { id: 'eitaa-m', name: 'ممبر ایتا', price: 140000 },
                { id: 'eitaa-v1', name: 'بازدید ۱ پست', price: 28000 },
                { id: 'eitaa-v5', name: 'بازدید ۵ پست', price: 40000 }
            ]
        },
        aparat: {
            displayName: 'آپارات',
            color: 'pink',
            grid: 'md:grid-cols-2',
            items: [
                { id: 'aparat-f', name: 'فالوور آپارات', price: 50000 },
                { id: 'aparat-v', name: 'بازدید آپارات', price: 20000 }
            ]
        }
    };

    let siteData = JSON.parse(localStorage.getItem('siteData')) || {
        discountCodes: {},
        balanceCodes: {},
        products: defaultProducts // Add products to DB
    };

    // Migration logic for old product structure
    if (siteData.products && Array.isArray(siteData.products.instagram)) {
        console.warn("Old product structure detected. Migrating...");
        siteData.products = defaultProducts; // Reset to new default
        saveSiteData();
    }

    let currentUser = localStorage.getItem('loggedInUser');
    let currentAppliedDiscount = null; // Store applied discount temporarily
    let confirmCallback = null; // For the custom confirmation modal

    function saveUsers() {
        try {
            localStorage.setItem('siteUsers', JSON.stringify(siteUsers));
        } catch (e) {
            console.error("Error saving users to localStorage:", e);
            showNotification("خطا در ذخیره اطلاعات کاربر", "error");
        }
    }
    function saveSiteData() {
         try {
            localStorage.setItem('siteData', JSON.stringify(siteData));
        } catch (e) {
            console.error("Error saving site data to localStorage:", e);
            showNotification("خطا در ذخیره اطلاعات سایت", "error");
        }
    }

    // --- UI Elements ---
    const accountBtn = document.getElementById('account-btn');
    const accountText = document.getElementById('account-text');
    const loginModal = document.getElementById('login-modal');
    const dashboardModal = document.getElementById('dashboard-modal');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const dashUsername = document.getElementById('dash-username');
    const dashBalance = document.getElementById('dash-balance');
    const dashOrders = document.getElementById('dash-orders');
    const dashTotal = document.getElementById('dash-total');

    // Dynamic Product UI
    const productTabsContainer = document.getElementById('product-tabs');
    const productSectionsWrapper = document.getElementById('product-sections-wrapper');
    const productSectionContainer = document.getElementById('product-section-container');
    const productPlaceholder = document.getElementById('product-placeholder');


    const cartItemsList = document.getElementById('cart-items-list');
    const cartSubtotalEl = document.getElementById('cart-subtotal');
    const cartDiscountRow = document.getElementById('cart-discount-row');
    const cartDiscountAmountEl = document.getElementById('cart-discount-amount');
    const cartTotalEl = document.getElementById('cart-total');
    const cartEmptyMsg = document.getElementById('cart-empty-msg');

    const payBtn = document.getElementById('pay-btn');
    const showCartBtn = document.getElementById('show-cart-btn');
    const backToDashBtn = document.getElementById('back-to-dash-btn');
    const dashboardMainView = document.getElementById('dashboard-main-view');
    const cartView = document.getElementById('cart-view');

    const commentForm = document.getElementById('comment-form');
    const userCommentDisplay = document.getElementById('user-comment-display');
    const userCommentText = document.getElementById('user-comment-text');

    const redeemCodeInput = document.getElementById('redeem-code-input');
    const redeemCodeBtn = document.getElementById('redeem-code-btn');
    const discountCodeInput = document.getElementById('discount-code-input');
    const applyDiscountBtn = document.getElementById('apply-discount-btn');

    // Confirmation Modal
    const confirmationModal = document.getElementById('confirmation-modal');
    const confirmationTitle = document.getElementById('confirmation-title');
    const confirmationMessage = document.getElementById('confirmation-message');
    const confirmYesBtn = document.getElementById('confirm-yes-btn');
    const confirmNoBtn = document.getElementById('confirm-no-btn');

    // Admin Panel Elements
    const adminModal = document.getElementById('admin-modal');
    const adminPanelBtn = document.getElementById('admin-panel-btn');
    const adminModalClose = document.getElementById('admin-modal-close');
    const adminBackToDashBtn = document.getElementById('admin-back-to-dash-btn');
    const adminTabs = document.querySelectorAll('.admin-tab-button');
    const adminTabContents = document.querySelectorAll('.admin-tab-content');

    const adminStatTotalUsers = document.getElementById('admin-stat-total-users');
    const adminStatTotalBalance = document.getElementById('admin-stat-total-balance');
    const adminStatDiscountCodes = document.getElementById('admin-stat-discount-codes');
    const adminStatBalanceCodes = document.getElementById('admin-stat-balance-codes');

    const adminUserSearch = document.getElementById('admin-user-search');
    const adminUserList = document.getElementById('admin-tab-users'); // Changed ID to match HTML
    const adminProductList = document.getElementById('admin-product-list');

    const addProductForm = document.getElementById('add-product-form');
    const addCategoryForm = document.getElementById('add-category-form');
    const adminAddProductCategorySelect = document.getElementById('admin-add-product-category');

    const createDiscountForm = document.getElementById('create-discount-form');
    const adminDiscountList = document.getElementById('admin-discount-list');
    const createBalanceForm = document.getElementById('create-balance-form');
    const adminBalanceList = document.getElementById('admin-balance-list');


    // --- Dark Mode Logic ---
    const docElement = document.documentElement;
    const darkModeToggles = [document.getElementById('dark-mode-toggle-desktop'), document.getElementById('dark-mode-toggle-mobile')];

    // Apply theme on load
    if (localStorage.getItem('color-theme') === 'light' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: light)').matches)) {
        docElement.classList.remove('dark');
        updateThemeIcons(false);
    } else {
        docElement.classList.add('dark');
        updateThemeIcons(true);
    }

    function updateThemeIcons(isDark){
        const lightDesktop = document.getElementById('theme-toggle-light-icon-desktop');
        const darkDesktop = document.getElementById('theme-toggle-dark-icon-desktop');
        const lightMobile = document.getElementById('theme-toggle-light-icon-mobile');
        const darkMobile = document.getElementById('theme-toggle-dark-icon-mobile');
        const mobileText = document.getElementById('dark-mode-text-mobile');

        if(lightDesktop) lightDesktop.classList.toggle('hidden', isDark);
        if(darkDesktop) darkDesktop.classList.toggle('hidden', !isDark);
        if(lightMobile) lightMobile.classList.toggle('hidden', isDark);
        if(darkMobile) darkMobile.classList.toggle('hidden', !isDark);
        if(mobileText) mobileText.textContent = isDark ? 'حالت روشن' : 'حالت تاریک';
    }

    darkModeToggles.forEach(btn => {
        if(btn) btn.addEventListener('click', () => {
            const isDark = docElement.classList.toggle('dark');
            localStorage.setItem('color-theme', isDark ? 'dark' : 'light');
            updateThemeIcons(isDark);
        })
    });

    // --- Hamburger Menu Logic ---
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuOpenIcon = document.getElementById('menu-open-icon');
    const menuCloseIcon = document.getElementById('menu-close-icon');

    if (menuBtn) menuBtn.addEventListener('click', () => {
        if (!mobileMenu || !menuOpenIcon || !menuCloseIcon) return;
        const isOpen = mobileMenu.classList.toggle('hidden');
        mobileMenu.classList.toggle('flex', !isOpen);
        menuOpenIcon.classList.toggle('hidden', !isOpen);
        menuCloseIcon.classList.toggle('hidden', isOpen);
    });

    // --- Animated Counter Logic ---
    function animateValue(objId, end, duration) {
        let start = 0;
        let startTimestamp = null;
        const obj = document.getElementById(objId);
        if (!obj) return;

        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const currentValue = Math.floor(progress * (end - start) + start);
            obj.innerHTML = currentValue.toLocaleString('fa-IR');
            if (progress < 1) window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
    }
    animateValue("stat-operators", 17, 2000);
    animateValue("stat-bots", 3, 1500);
    animateValue("stat-licenses", 10589, 3000);

    // --- Dynamic Counters ---
    const ordersElement = document.getElementById('stat-orders');
    if (ordersElement) { let totalOrders = 59375; animateValue("stat-orders", totalOrders, 3000); setTimeout(() => { setInterval(() => { if (ordersElement) { totalOrders += 3; ordersElement.innerHTML = totalOrders.toLocaleString('fa-IR'); } }, 2000); }, 3000); }
    const usersElement = document.getElementById('stat-users');
    if (usersElement) { let onlineUsers = 708; animateValue("stat-users", onlineUsers, 2500); setTimeout(() => { setInterval(() => { if (usersElement) { onlineUsers += 13; usersElement.innerHTML = onlineUsers.toLocaleString('fa-IR'); } }, 2000); }, 2500); }
    const liveOrdersElement = document.getElementById('live-orders-count');
    if(liveOrdersElement) { let liveOrdersCount = 146; liveOrdersElement.innerHTML = liveOrdersCount.toLocaleString('fa-IR') + '+'; setInterval(() => { if (liveOrdersElement) { liveOrdersCount += 19; liveOrdersElement.innerHTML = liveOrdersCount.toLocaleString('fa-IR') + '+'; } }, 5000); }

    // --- On-Scroll Animation ---
    const animatedElements = document.querySelectorAll('.scroll-animate');
    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
        }, { threshold: 0.1 });
        animatedElements.forEach(element => { observer.observe(element); });
    } else {
        // Fallback for older browsers
        animatedElements.forEach(element => element.classList.add('visible'));
    }

    // --- Notification Banner Logic ---
    const notificationBanner = document.getElementById('notification-banner');
    const statusDot = document.getElementById('notification-dot');
    const statusText = document.getElementById('notification-text');
    let notificationTimeout;

    function showNotification(message, type = 'info') {
         if (!notificationBanner || !statusDot || !statusText) return;
         clearTimeout(notificationTimeout); // Clear previous timeout if any
         const types = {
            info: { dot: 'bg-blue-500', text: 'text-blue-400' },
            success: { dot: 'bg-green-500', text: 'text-green-400' },
            warning: { dot: 'bg-yellow-500', text: 'text-yellow-400' },
            error: { dot: 'bg-red-500', text: 'text-red-400' },
        };
        const style = types[type] || types.info; // Default to info
        statusDot.className = `w-3 h-3 ${style.dot} rounded-full animate-pulse`;
        statusText.className = `font-semibold ${style.text} transition-colors duration-300`;
        statusText.textContent = message;
        notificationBanner.classList.add('show');
        notificationTimeout = setTimeout(() => { notificationBanner.classList.remove('show');}, 4000);
    }
    // Initial notifications removed to avoid issues if elements aren't ready
    // setTimeout(() => showNotification('درحال برقراری ارتباط با سرور', 'warning'), 500);
    // setTimeout(() => showNotification('با موفقيت به سرور متصل شدید', 'success'), 2500);

    // --- Tab Navigation Logic (Products) ---
    if(productTabsContainer) productTabsContainer.addEventListener('click', (e) => {
        const tab = e.target.closest('.tab-button');
        if (!tab) return;

        document.querySelectorAll('#product-tabs .tab-button').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const target = tab.dataset.target;
        if(productPlaceholder) productPlaceholder.classList.add('hidden');
        document.querySelectorAll('#product-sections-wrapper .product-section').forEach(s => {
            if(s.id === target) {
                s.classList.remove('hidden');
            } else {
                s.classList.add('hidden');
            }
        });
    });


    // --- Order Algorithm Logic ---
    const steps = document.querySelectorAll('[id^="step-"]');
    const nextBtns = document.querySelectorAll('.next-btn');
    const restartBtn = document.getElementById('restart-btn');
    const progressBar = document.getElementById('progress-bar');
    let currentStep = 1;

    function updateAlgorithmUI() {
        steps.forEach(step => step.classList.add('hidden'));
        const currentStepEl = document.getElementById(`step-${currentStep}`);
        if (currentStepEl) currentStepEl.classList.remove('hidden');
        if (progressBar) progressBar.style.width = `${((currentStep - 1) / (steps.length -1)) * 100}%`; // Make it dynamic based on steps count
    }
    nextBtns.forEach(btn => btn.addEventListener('click', () => { if (currentStep < steps.length) { currentStep++; updateAlgorithmUI(); } }));
    if(restartBtn) restartBtn.addEventListener('click', () => { currentStep = 1; updateAlgorithmUI(); });


    // --- Dynamic Product/Category Rendering Functions ---

    // 1. Renders the tabs
    function renderProductTabs() {
        if (!productTabsContainer || !siteData.products) return;
        productTabsContainer.innerHTML = ''; // Clear tabs
        const categories = siteData.products;
        Object.keys(categories).forEach((catId, index) => {
            const category = categories[catId];
            if (!category || typeof category !== 'object') return; // Basic validation
            const tab = document.createElement('button');
            tab.className = 'tab-button px-4 py-2 rounded-lg font-semibold transition-colors duration-300';
            // Make first tab active by default
            if (index === 0) tab.classList.add('active');
            tab.dataset.target = `${catId}-section`;
            tab.textContent = category.displayName || catId; // Fallback to id
            productTabsContainer.appendChild(tab);
        });
    }

    // 2. Renders the product cards
    function renderProducts() {
        if (!productSectionsWrapper || !siteData.products) {
             console.error("Product sections wrapper or siteData.products not found");
             if(productPlaceholder) productPlaceholder.classList.remove('hidden'); // Show placeholder if error
             return;
        }
        productSectionsWrapper.innerHTML = ''; // Clear sections
        const categories = siteData.products;
        let productsRendered = false;

        Object.keys(categories).forEach((catId, index) => {
            const category = categories[catId];
            if (!category || typeof category !== 'object' || !Array.isArray(category.items)) {
                 console.warn(`Skipping invalid category data for ID: ${catId}`);
                 return;
             }; // Skip invalid category data

            // Create the section container
            const section = document.createElement('div');
            section.id = `${catId}-section`;
            section.className = 'product-section mb-12 scroll-animate';
            // Show first section with items by default
            if (index === 0 && category.items.length > 0) {
                section.classList.remove('hidden');
                 if(productPlaceholder) productPlaceholder.classList.add('hidden');
                 productsRendered = true;
            } else {
                 section.classList.add('hidden');
            }


            const grid = document.createElement('div');
            grid.className = `grid grid-cols-1 ${category.grid || 'md:grid-cols-3'} gap-6`;

            category.items.forEach(product => {
                if (!product || typeof product !== 'object') return; // Skip invalid items
                productsRendered = true; // Mark that at least one product was found
                const productEl = document.createElement('div');
                // Use a mapping for Tailwind colors
                const colorVariants = {
                    red: 'hover:border-red-500 from-red-500 to-rose-500',
                    cyan: 'hover:border-cyan-500 from-sky-500 to-cyan-400',
                    orange: 'hover:border-orange-500 from-orange-500 to-amber-500',
                    pink: 'hover:border-pink-500 from-pink-500 to-rose-500',
                    purple: 'hover:border-purple-500 from-purple-500 to-violet-500',
                    green: 'hover:border-green-500 from-green-500 to-emerald-500',
                    blue: 'hover:border-blue-500 from-blue-500 to-indigo-500' // Added blue as default
                };
                const colorClass = colorVariants[category.color?.toLowerCase()] || colorVariants['blue']; // Default to blue

                productEl.className = `text-right glass-effect p-6 rounded-2xl shadow-lg border-2 border-transparent ${colorClass.split(' ')[0]} hover:scale-105 transition-all duration-300`;
                productEl.innerHTML = `
                   <h4 class="text-xl font-bold mb-4">${product.name || 'محصول بی نام'}</h4>
                    <div class="flex justify-between items-center">
                        <button class="add-to-cart-btn px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r ${colorClass.split(' ')[1]} ${colorClass.split(' ')[2]} rounded-lg" data-product-name="${product.name || 'محصول'}" data-product-price="${product.price || 0}">سفارش</button>
                        <p class="text-lg">${(product.price || 0).toLocaleString('fa-IR')} ت</p>
                    </div>
                `;
                grid.appendChild(productEl);
            });
            section.appendChild(grid);
            productSectionsWrapper.appendChild(section);
        });
        // Show placeholder only if NO products were rendered at all
        if(!productsRendered && productPlaceholder) {
            productPlaceholder.classList.remove('hidden');
        } else if (productsRendered && productPlaceholder) {
             productPlaceholder.classList.add('hidden');
        }
    }

    // --- Account, Cart, Comment, & Admin Logic ---

    function showConfirmationModal(title, message, onConfirm) {
        if (!confirmationModal || !confirmationTitle || !confirmationMessage) return;
        confirmationTitle.textContent = title;
        confirmationMessage.textContent = message;
        confirmCallback = onConfirm;
        confirmationModal.classList.remove('hidden');
    }

    if(confirmYesBtn) confirmYesBtn.addEventListener('click', () => {
        if (typeof confirmCallback === 'function') {
            try {
                confirmCallback();
            } catch (error) {
                 console.error("Error in confirmation callback:", error);
            }
        }
        if(confirmationModal) confirmationModal.classList.add('hidden');
        confirmCallback = null;
    });

    if(confirmNoBtn) confirmNoBtn.addEventListener('click', () => {
        if(confirmationModal) confirmationModal.classList.add('hidden');
        confirmCallback = null;
    });

    function updateCartUI(preserveDiscount = false) {
        let shoppingCart = (currentUser && siteUsers[currentUser]) ? siteUsers[currentUser].cart || [] : []; // Ensure cart is an array
        if(cartItemsList) cartItemsList.innerHTML = '';

        let subtotal = 0;
        let discount = 0;

        if (shoppingCart.length > 0) {
            if(cartEmptyMsg) cartEmptyMsg.classList.add('hidden');
            if(payBtn) payBtn.disabled = false;
            shoppingCart.forEach(item => {
                if (!item || typeof item.price === 'undefined') return; // Skip invalid items
                const itemEl = document.createElement('div');
                itemEl.className = 'flex justify-between items-center';
                itemEl.innerHTML = `<span>${item.name || 'آیتم'}</span><span>${parseInt(item.price || 0).toLocaleString('fa-IR')} ت</span>`;
                if(cartItemsList) cartItemsList.appendChild(itemEl);
                subtotal += parseInt(item.price || 0);
            });
        } else {
            if(cartEmptyMsg) cartEmptyMsg.classList.remove('hidden');
            if(payBtn) payBtn.disabled = true;
        }

        // Apply discount if one is active
        if (!preserveDiscount) {
            currentAppliedDiscount = null; // Reset discount unless explicitly preserved
        }

        if (currentAppliedDiscount && siteData.discountCodes && siteData.discountCodes[currentAppliedDiscount]) {
            const code = siteData.discountCodes[currentAppliedDiscount];
            if (code.type === 'percent') {
                discount = (subtotal * (code.value || 0)) / 100;
            } else { // fixed
                discount = code.value || 0;
            }
            discount = Math.min(subtotal, discount); // Cannot discount more than total

            if(cartDiscountAmountEl) cartDiscountAmountEl.textContent = `- ${Math.round(discount).toLocaleString('fa-IR')} ت`;
            if(cartDiscountRow) cartDiscountRow.classList.remove('hidden');
            if(discountCodeInput) {
                discountCodeInput.value = currentAppliedDiscount;
                discountCodeInput.disabled = true;
            }
            if(applyDiscountBtn) applyDiscountBtn.disabled = true;
        } else {
            if(cartDiscountRow) cartDiscountRow.classList.add('hidden');
            if(discountCodeInput) {
                discountCodeInput.value = '';
                discountCodeInput.disabled = false;
            }
             if(applyDiscountBtn) applyDiscountBtn.disabled = false;
        }

        const finalTotal = subtotal - discount;

        if(cartSubtotalEl) cartSubtotalEl.textContent = `${Math.round(subtotal).toLocaleString('fa-IR')} ت`;
        if(cartTotalEl) cartTotalEl.textContent = `${Math.round(finalTotal).toLocaleString('fa-IR')} ت`;

        if(dashOrders) dashOrders.textContent = (shoppingCart?.length || 0).toLocaleString('fa-IR');
        if(dashTotal) dashTotal.innerHTML = `${Math.round(subtotal).toLocaleString('fa-IR')} <span class="text-sm">ت</span>`; // Dash shows subtotal
    }


    function checkLogin() {
        currentUser = localStorage.getItem('loggedInUser');

        // Validate user exists in siteUsers, otherwise log out
        if (currentUser && !siteUsers[currentUser]) {
            console.warn(`Logged in user "${currentUser}" not found in database. Logging out.`);
            localStorage.removeItem('loggedInUser');
            currentUser = null;
            // Optionally show a notification
            // showNotification('حساب شما یافت نشد، لطفا دوباره وارد شوید.', 'error');
        }

        if (currentUser && siteUsers[currentUser]) {
            const user = siteUsers[currentUser];
            if(accountText) accountText.textContent = currentUser;
            if(dashBalance) dashBalance.textContent = (user.balance || 0).toLocaleString('fa-IR') + ' ت';
            if(adminPanelBtn) adminPanelBtn.classList.toggle('hidden', !user.isAdmin);

        } else {
            currentUser = null; // Ensure currentUser is null if not logged in
            if(accountText) accountText.textContent = 'حساب کاربری';
            if(dashBalance) dashBalance.textContent = '۰ ت';
            if(adminPanelBtn) adminPanelBtn.classList.add('hidden');
        }
        currentAppliedDiscount = null; // Reset discount on any login change
        updateCartUI(false); // Update cart without preserving discount
    }

    // --- Event Listeners (User) ---

    // Use event delegation for dynamic product buttons
    if(productSectionsWrapper) productSectionsWrapper.addEventListener('click', (e) => {
        const btn = e.target.closest('.add-to-cart-btn');
        if (!btn) return;

        if (!currentUser) {
            showNotification('برای سفارش، لطفا ابتدا وارد شوید', 'warning');
            if(loginModal) loginModal.classList.remove('hidden');
            return;
        }
         // Ensure user data exists before trying to access cart
        if (!siteUsers[currentUser]) {
            console.error("Current user data is missing.");
            showNotification("خطا در دسترسی به اطلاعات کاربر.", "error");
            return;
        }

        const name = btn.dataset.productName;
        const price = btn.dataset.productPrice;

        if (!siteUsers[currentUser].cart) siteUsers[currentUser].cart = []; // Ensure cart array exists
        siteUsers[currentUser].cart.push({ name, price: parseInt(price || 0) }); // Ensure price is number
        saveUsers();
        updateCartUI(true); // Preserve discount when adding item
        showNotification(`${name} به سبد خرید اضافه شد!`, 'success');
    });


    if(accountBtn) accountBtn.addEventListener('click', () => {
        if (currentUser && siteUsers[currentUser]) {
            const user = siteUsers[currentUser];
            if(dashUsername) dashUsername.textContent = currentUser;
            if(dashBalance) dashBalance.textContent = (user.balance || 0).toLocaleString('fa-IR') + ' ت';

            const savedComment = user.comment;
            if (savedComment && userCommentDisplay) {
                if(userCommentText) userCommentText.textContent = savedComment;
                userCommentDisplay.classList.remove('hidden');
            } else if (userCommentDisplay) {
                userCommentDisplay.classList.add('hidden');
            }

            if(dashboardModal) dashboardModal.classList.remove('hidden');
            if(dashboardMainView) dashboardMainView.classList.remove('hidden');
            if(cartView) cartView.classList.add('hidden');
        } else {
            if(loginModal) loginModal.classList.remove('hidden');
        }
    });

    if(loginForm) loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const usernameInput = document.getElementById('login-username');
        const passwordInput = document.getElementById('login-password');
        const username = usernameInput ? usernameInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value : '';

        if (!username || !password) {
            showNotification('نام کاربری و رمز عبور الزامی است', 'warning');
            return;
        }

        // --- Hardcoded Admin Login (Case-Insensitive) ---
        if (username.toLowerCase() === ADMIN_USER.toLowerCase() && password === ADMIN_PASS) {
            if (!siteUsers[ADMIN_USER]) { // Create admin with 'Admin' (uppercase)
                siteUsers[ADMIN_USER] = {
                    password: ADMIN_PASS,
                    cart: [],
                    comment: '',
                    balance: 1000000,
                    isAdmin: true,
                };
            } else {
                 // Ensure password matches even if user exists
                 if (siteUsers[ADMIN_USER].password !== ADMIN_PASS) {
                     showNotification('رمز عبور ادمین اشتباه است', 'error');
                     return;
                 }
                 siteUsers[ADMIN_USER].isAdmin = true; // Make sure isAdmin is set
            }
            saveUsers();
            localStorage.setItem('loggedInUser', ADMIN_USER); // Always log in as 'Admin' (uppercase)

            checkLogin();
            if(loginModal) loginModal.classList.add('hidden');
            showNotification(`خوش آمدید، ادمین ${ADMIN_USER}!`, 'success');
            loginForm.reset();
            return;
        }

        // --- Regular User Login/Register ---
        if (siteUsers[username]) {
            // Login
            if (siteUsers[username].password === password) {
                // Prevent login with admin username but wrong password via this path
                if (username.toLowerCase() === ADMIN_USER.toLowerCase()) {
                     showNotification('نام کاربری یا رمز عبور اشتباه است', 'error'); // Generic error for security
                     return;
                }

                localStorage.setItem('loggedInUser', username);
                checkLogin();
                if(loginModal) loginModal.classList.add('hidden');
                showNotification(`خوش آمدید، ${username}!`, 'success');
                loginForm.reset();
            } else {
                showNotification('نام کاربری یا رمز عبور اشتباه است', 'error'); // Generic error
            }
        } else {
            // Register
            if (username.toLowerCase() === ADMIN_USER.toLowerCase()) {
                showNotification('این نام کاربری برای ادمین رزرو شده است', 'error');
                return;
            }
            siteUsers[username] = {
                password: password,
                cart: [],
                comment: '',
                balance: 0,
                isAdmin: false,
            };
            saveUsers();
            localStorage.setItem('loggedInUser', username);
            checkLogin();
            if(loginModal) loginModal.classList.add('hidden');
            showNotification(`حساب کاربری برای ${username} با موفقیت ساخته شد`, 'success');
            loginForm.reset();
        }
    });

    if(logoutBtn) logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('loggedInUser');
        checkLogin();
        if(dashboardModal) dashboardModal.classList.add('hidden');
         if(adminModal) adminModal.classList.add('hidden'); // Close admin modal on logout too
        showNotification('از حساب کاربری خود خارج شدید', 'info');
    });

    if(showCartBtn) showCartBtn.addEventListener('click', () => {
        if(dashboardMainView) dashboardMainView.classList.add('hidden');
        updateCartUI(true); // Preserve discount when just viewing cart
        if(cartView) cartView.classList.remove('hidden');
    });

    if(backToDashBtn) backToDashBtn.addEventListener('click', () => {
        if(cartView) cartView.classList.add('hidden');
        if(dashboardMainView) dashboardMainView.classList.remove('hidden');
        // Keep applied discount when going back to dash
        // updateCartUI(true); // No need to update cart just for going back
    });

   if(payBtn) payBtn.addEventListener('click', () => {
        if (!currentUser || !siteUsers[currentUser]) return;

        let shoppingCart = siteUsers[currentUser].cart || [];
        let subtotal = 0;
        shoppingCart.forEach(item => subtotal += parseInt(item?.price || 0));

        let discount = 0;
        if (currentAppliedDiscount && siteData.discountCodes && siteData.discountCodes[currentAppliedDiscount]) {
            const code = siteData.discountCodes[currentAppliedDiscount];
            if (code.type === 'percent') discount = (subtotal * (code.value || 0)) / 100;
            else discount = code.value || 0;
            discount = Math.min(subtotal, discount);
        }

        const finalTotal = subtotal - discount;
        const user = siteUsers[currentUser];
         const currentBalance = user.balance || 0; // Default balance to 0 if undefined

        if (currentBalance < finalTotal) {
            showNotification('موجودی شما کافی نیست. لطفا حساب خود را شارژ کنید.', 'error');
            return;
        }

        user.balance = currentBalance - finalTotal;
        user.cart = [];
        saveUsers();
        currentAppliedDiscount = null; // Reset discount after successful payment
        updateCartUI(false); // Update cart, resetting discount
        checkLogin(); // Update dashboard balance display
        showNotification('پرداخت با موفقیت انجام شد. سبد خرید شما خالی شد.', 'success');

        setTimeout(() => {
            if(cartView) cartView.classList.add('hidden');
            if(dashboardMainView) dashboardMainView.classList.remove('hidden');
        }, 1000);
    });

    if(commentForm) commentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!currentUser) {
            showNotification('برای ارسال دیدگاه، لطفا وارد شوید', 'warning');
            if(loginModal) loginModal.classList.remove('hidden');
            return;
        }
         // Ensure user exists before setting comment
        if (!siteUsers[currentUser]) {
             showNotification("خطا: کاربر فعلی یافت نشد.", "error");
             return;
        }

        const commentInput = document.getElementById('comment');
        if (commentInput) {
            siteUsers[currentUser].comment = commentInput.value;
            saveUsers();
            showNotification('دیدگاه شما با موفقیت ثبت شد!', 'success');
            commentInput.value = '';
            // Update dashboard if open
             if (dashboardModal && !dashboardModal.classList.contains('hidden') && userCommentDisplay) {
                 if(userCommentText) userCommentText.textContent = siteUsers[currentUser].comment;
                 userCommentDisplay.classList.remove('hidden');
            }
        }
    });

    if(redeemCodeBtn) redeemCodeBtn.addEventListener('click', () => {
        if (!currentUser) {
            showNotification('لطفا ابتدا وارد شوید', 'warning');
            return;
        }
        if (!siteUsers[currentUser]) {
             showNotification("خطا: کاربر فعلی یافت نشد.", "error");
             return;
        }

        const code = redeemCodeInput ? redeemCodeInput.value.trim().toUpperCase() : '';
        if (!code) return;
        const codeData = siteData.balanceCodes ? siteData.balanceCodes[code] : null;

        if (!codeData) {
            showNotification('کد وارد شده نامعتبر است', 'error');
            return;
        }
        if (codeData.used) {
            showNotification('این کد قبلا استفاده شده است', 'warning');
            return;
        }

        siteUsers[currentUser].balance = (siteUsers[currentUser].balance || 0) + (codeData.value || 0);
        codeData.used = true;
        saveUsers();
        saveSiteData();
        checkLogin(); // Update dashboard display
        showNotification(`مبلغ ${(codeData.value || 0).toLocaleString('fa-IR')} تومان به حساب شما اضافه شد!`, 'success');
        if(redeemCodeInput) redeemCodeInput.value = '';
        // Refresh admin stats if admin is logged in and viewing
        if (currentUser === ADMIN_USER && adminModal && !adminModal.classList.contains('hidden')) {
             loadAdminDashboard();
             loadAdminBalanceCodes(); // Show code as used
        }
    });

    if(applyDiscountBtn) applyDiscountBtn.addEventListener('click', () => {
        const code = discountCodeInput ? discountCodeInput.value.trim().toUpperCase() : '';
        if (!code) return;
        if (!siteData.discountCodes || !siteData.discountCodes[code]) {
            showNotification('کد تخفیف نامعتبر است', 'error');
            return;
        }

        currentAppliedDiscount = code;
        updateCartUI(true); // Update cart and preserve the newly applied discount
        showNotification('کد تخفیف با موفقیت اعمال شد', 'success');
    });

    // Close modals on overlay click
    [loginModal, dashboardModal, adminModal, confirmationModal].forEach(modal => {
       if(modal) modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
                 // Don't reset discount if just clicking outside dashboard/admin
                 // if (modal === dashboardModal || modal === adminModal) {}
                 if(modal === confirmationModal) {
                    confirmCallback = null; // Clear callback if confirmation modal is closed by clicking outside
                 }
            }
        });
    });

    // --- Admin Panel Logic ---

    function loadAdminDashboard() {
        let totalUsers = 0;
        let totalBalance = 0;
        let unusedBalanceCodes = 0;

        Object.keys(siteUsers).forEach(username => {
            if (username !== ADMIN_USER && siteUsers[username]) {
                totalUsers++;
                totalBalance += siteUsers[username].balance || 0;
            }
        });

        if (siteData.balanceCodes) {
            Object.keys(siteData.balanceCodes).forEach(code => {
                if (siteData.balanceCodes[code] && !siteData.balanceCodes[code].used) {
                    unusedBalanceCodes++;
                }
            });
        }

        if(adminStatTotalUsers) adminStatTotalUsers.textContent = totalUsers.toLocaleString('fa-IR');
        if(adminStatTotalBalance) adminStatTotalBalance.textContent = `${Math.round(totalBalance).toLocaleString('fa-IR')} ت`;
        if(adminStatDiscountCodes) adminStatDiscountCodes.textContent = Object.keys(siteData.discountCodes || {}).length.toLocaleString('fa-IR');
        if(adminStatBalanceCodes) adminStatBalanceCodes.textContent = unusedBalanceCodes.toLocaleString('fa-IR');
    }

    function loadAdminUsers() {
        const userListDiv = adminUserList?.querySelector('#admin-user-list'); // Corrected selector
         if (!userListDiv) return; // Exit if the container div isn't found
        userListDiv.innerHTML = ''; // Clear only the list container

        const listContainer = document.createElement('div');
        listContainer.id = 'admin-user-list-items'; // Keep this ID if needed elsewhere, though not strictly necessary now
        listContainer.className = 'space-y-4';

        const searchTerm = adminUserSearch ? adminUserSearch.value.trim().toLowerCase() : '';
        const usernames = Object.keys(siteUsers);

        let userCount = 0;

        usernames.forEach(username => {
            if (username === ADMIN_USER || !siteUsers[username]) return; // Skip admin and invalid users
            if (searchTerm && !username.toLowerCase().includes(searchTerm)) return;

            userCount++;
            const user = siteUsers[username];
            // Ensure cart is an array before mapping
            const cartItems = Array.isArray(user.cart) && user.cart.length > 0
                ? user.cart.map(item => item?.name || '?').join('، ')
                : '<i>خالی</i>';


            const userCard = document.createElement('div');
            userCard.className = 'glass-effect p-4 rounded-lg text-sm space-y-3';
            userCard.innerHTML = `
                <div class="flex flex-wrap gap-2 justify-between items-center">
                    <p class="font-bold text-lg">${username}</p>
                    <button data-username="${username}" class="delete-user-btn px-3 py-1 text-xs font-semibold text-white bg-red-600 rounded-lg">حذف کاربر</button>
                </div>
                <p>موجودی: <span class="font-bold text-green-400">${(user.balance || 0).toLocaleString('fa-IR')} ت</span></p>
                <div class="flex flex-col sm:flex-row gap-2">
                    <input type="number" id="balance-input-${username}" class="form-input w-full p-2 rounded-lg text-slate-800 dark:text-slate-200" placeholder="تنظیم موجودی (تومان)">
                    <button data-username="${username}" class="set-balance-btn px-4 py-2 font-semibold text-white bg-sky-500 rounded-lg whitespace-nowrap">تنظیم</button>
                </div>
                <div class="border-t border-slate-700/50 pt-3 mt-3 space-y-2">
                    <p class="text-slate-400 text-xs">سبد خرید: ${cartItems}</p>
                    ${user.comment ? `
                        <div class="flex justify-between items-center">
                            <p class="text-slate-300 text-xs italic">نظر: ${user.comment}</p>
                            <button data-username="${username}" class="clear-comment-btn px-2 py-1 text-xs text-white bg-slate-600 rounded-lg">حذف نظر</button>
                        </div>
                    ` : ''}
                </div>
            `;
            listContainer.appendChild(userCard);
        });

        if (userCount === 0) {
            listContainer.innerHTML = '<p class="text-center text-slate-400">کاربری یافت نشد.</p>';
        }

        userListDiv.appendChild(listContainer); // Append the new list container

        // Add event listeners using event delegation on the PARENT (adminUserList)
        if(adminUserList) adminUserList.addEventListener('click', (e) => {
             // Find the closest ancestor button with a username dataset
             const btn = e.target.closest('button[data-username]');
             if (!btn) return; // Exit if the click wasn't on a relevant button

             const targetUser = btn.dataset.username;
             if (!targetUser) return;

             if (btn.classList.contains('set-balance-btn')) {
                 const input = document.getElementById(`balance-input-${targetUser}`);
                 const amount = parseInt(input?.value || '');
                 if (isNaN(amount) || amount < 0) {
                      showNotification('لطفا مبلغ معتبری (0 یا بیشتر) وارد کنید', 'warning');
                      return;
                 }
                 if(siteUsers[targetUser]) siteUsers[targetUser].balance = amount;
                 saveUsers();
                 showNotification(`موجودی ${targetUser} به ${amount.toLocaleString('fa-IR')} تومان تنظیم شد.`, 'success');
                 if(input) input.value = '';
                 loadAdminUsers(); // Refresh this tab
                 loadAdminDashboard(); // Refresh stats tab
             } else if (btn.classList.contains('delete-user-btn')) {
                 showConfirmationModal(
                     `حذف کاربر ${targetUser}`,
                     'آیا از حذف این کاربر مطمئن هستید؟ تمام اطلاعات (موجودی، سبد خرید) حذف خواهد شد.',
                     () => {
                         delete siteUsers[targetUser];
                         saveUsers();
                         showNotification(`کاربر ${targetUser} با موفقیت حذف شد.`, 'success');
                         loadAdminUsers(); // Refresh this tab
                         loadAdminDashboard(); // Refresh stats tab
                     }
                 );
             } else if (btn.classList.contains('clear-comment-btn')) {
                  if(siteUsers[targetUser]) siteUsers[targetUser].comment = '';
                  saveUsers();
                  showNotification(`نظر کاربر ${targetUser} پاک شد.`, 'success');
                  loadAdminUsers(); // Refresh this tab
             }
        });
    }

    if(adminUserSearch) adminUserSearch.addEventListener('input', loadAdminUsers);

    function loadAdminProducts() {
        if (!adminProductList) return;
        adminProductList.innerHTML = '';
        const categories = siteData.products;
        if (!categories) return;

        for (const catId in categories) {
            const category = categories[catId];
             if (!category || typeof category !== 'object' || !Array.isArray(category.items)) continue; // Skip invalid

            const catHeader = document.createElement('h4');
            catHeader.className = 'text-lg font-bold mt-4 border-b border-slate-700/50 pb-2';
            catHeader.textContent = category.displayName || catId;
            adminProductList.appendChild(catHeader);

            category.items.forEach(product => {
                if (!product || typeof product !== 'object') return; // Skip invalid
                const productId = product.id || `${catId}-${Math.random().toString(36).substring(2, 6)}`; // Generate ID if missing
                 if (!product.id) product.id = productId; // Assign back if generated

                const el = document.createElement('div');
                el.className = 'glass-effect p-3 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2';
                el.innerHTML = `
                    <p class="font-medium text-sm">${product.name || 'محصول بی نام'}</p>
                    <div class="flex gap-2 w-full sm:w-auto">
                        <input type="number" id="price-input-${productId}" class="form-input w-full p-2 rounded-lg text-slate-800 dark:text-slate-200" value="${product.price || 0}">
                        <button data-id="${productId}" data-category="${catId}" class="save-price-btn px-4 py-2 font-semibold text-white bg-green-500 rounded-lg whitespace-nowrap">ذخیره</button>
                    </div>
                `;
                adminProductList.appendChild(el);
            });
        }

        // Add listeners using event delegation
        adminProductList.addEventListener('click', (e) => {
            const btn = e.target.closest('.save-price-btn');
            if (!btn) return;

            const id = btn.dataset.id;
            const categoryId = btn.dataset.category;
            const input = document.getElementById(`price-input-${id}`);
            const newPrice = parseInt(input?.value || '');

            if (isNaN(newPrice) || newPrice < 0) {
                showNotification('مبلغ نامعتبر است', 'error');
                return;
            }

            // Find product in DB and update price
             const category = siteData.products[categoryId];
             if (category?.items) {
                 const productIndex = category.items.findIndex(p => p && p.id === id); // Find index
                 if (productIndex !== -1) {
                    category.items[productIndex].price = newPrice; // Update by index
                    saveSiteData();
                    renderProducts(); // Refresh main page UI
                    showNotification(`قیمت ${category.items[productIndex].name} به‌روز شد`, 'success');
                 } else {
                    console.error(`Product with id "${id}" not found in category "${categoryId}"`);
                    showNotification('خطا: محصول یافت نشد', 'error');
                 }
             } else {
                 console.error(`Category "${categoryId}" not found`);
                 showNotification('خطا: دسته یافت نشد', 'error');
             }
        });
    }


    function loadAdminAddProductTab() {
        if (!adminAddProductCategorySelect || !siteData.products) return;
        adminAddProductCategorySelect.innerHTML = '';
        const categories = siteData.products;
        for (const catId in categories) {
            if (categories[catId] && typeof categories[catId] === 'object') {
                const option = document.createElement('option');
                option.value = catId;
                option.textContent = categories[catId].displayName || catId;
                option.className = 'text-slate-800'; // Class for dropdown item styling
                adminAddProductCategorySelect.appendChild(option);
            }
        }
    }

    function loadAdminDiscounts() {
        if(!adminDiscountList || !siteData.discountCodes) return;
        adminDiscountList.innerHTML = '';
        const codes = Object.keys(siteData.discountCodes);
        if (codes.length === 0) {
            adminDiscountList.innerHTML = '<p class="text-center text-slate-400">کد تخفیفی یافت نشد.</p>';
            return;
        }
        codes.forEach(codeName => {
            const code = siteData.discountCodes[codeName];
            if (!code) return;
            const typeText = code.type === 'percent' ? 'درصد' : 'تومان';
            const valueText = code.type === 'percent' ? `${code.value || 0}%` : `${(code.value || 0).toLocaleString('fa-IR')} ت`;

            const codeEl = document.createElement('div');
            codeEl.className = 'glass-effect p-3 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm';
            codeEl.innerHTML = `
                <div>
                    <p class="font-bold text-base">${codeName}</p>
                    <p class="text-slate-300">${valueText} (${typeText})</p>
                </div>
                <button data-code="${codeName}" class="delete-discount-btn px-3 py-1 text-xs font-semibold text-white bg-red-600 rounded-lg w-full sm:w-auto">حذف</button>
            `;
            adminDiscountList.appendChild(codeEl);
        });

        // Add delete listeners via delegation
        adminDiscountList.addEventListener('click', (e) => {
             const btn = e.target.closest('.delete-discount-btn');
            if (!btn) return;
            const code = btn.dataset.code;
            if (code && siteData.discountCodes) {
                delete siteData.discountCodes[code];
                saveSiteData();
                showNotification(`کد تخفیف ${code} حذف شد.`, 'success');
                loadAdminDiscounts(); // Refresh this list
                loadAdminDashboard(); // Refresh stats
            }
        });
    }

    function loadAdminBalanceCodes() {
        if (!adminBalanceList || !siteData.balanceCodes) return;
        adminBalanceList.innerHTML = '';
        const codes = Object.keys(siteData.balanceCodes);
         if (codes.length === 0) {
            adminBalanceList.innerHTML = '<p class="text-center text-slate-400">کد موجودی یافت نشد.</p>';
            return;
        }
        codes.forEach(codeName => {
            const code = siteData.balanceCodes[codeName];
            if(!code) return;
            const statusText = code.used ? 'استفاده شده' : 'فعال';
            const statusClass = code.used ? 'text-red-400' : 'text-green-400';

            const codeEl = document.createElement('div');
            codeEl.className = 'glass-effect p-3 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm';
            codeEl.innerHTML = `
                <div>
                    <p class="font-bold text-base">${codeName}</p>
                    <p class="text-slate-300">مبلغ: ${(code.value || 0).toLocaleString('fa-IR')} تومان | وضعیت: <span class="${statusClass} font-bold">${statusText}</span></p>
                </div>
                <button data-code="${codeName}" class="delete-balance-btn px-3 py-1 text-xs font-semibold text-white bg-red-600 rounded-lg w-full sm:w-auto">حذف</button>
            `;
            adminBalanceList.appendChild(codeEl);
        });

        // Add delete listeners via delegation
        adminBalanceList.addEventListener('click', (e) => {
            const btn = e.target.closest('.delete-balance-btn');
            if (!btn) return;
            const code = btn.dataset.code;
             if (code && siteData.balanceCodes) {
                delete siteData.balanceCodes[code];
                saveSiteData();
                showNotification(`کد موجودی ${code} حذف شد.`, 'success');
                loadAdminBalanceCodes(); // Refresh this list
                loadAdminDashboard(); // Refresh stats
             }
        });
    }

    function openAdminPanel() {
        if(dashboardModal) dashboardModal.classList.add('hidden');
        // Load all tabs' content
        loadAdminDashboard();
        loadAdminUsers();
        loadAdminProducts();
        loadAdminAddProductTab();
        loadAdminDiscounts();
        loadAdminBalanceCodes();
        // Set default tab visibility
        adminTabs.forEach(t => t.classList.remove('active'));
        adminTabContents.forEach(c => c.classList.add('hidden'));
        const defaultTabButton = document.querySelector('.admin-tab-button[data-target="admin-tab-dashboard"]');
        const defaultTabContent = document.getElementById('admin-tab-dashboard');
        if(defaultTabButton) defaultTabButton.classList.add('active');
        if(defaultTabContent) defaultTabContent.classList.remove('hidden');

        if(adminModal) adminModal.classList.remove('hidden');
    }

    if(adminPanelBtn) adminPanelBtn.addEventListener('click', openAdminPanel);

    adminTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            adminTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const targetId = tab.dataset.target;
            adminTabContents.forEach(c => {
                 if (c.id === targetId) {
                     c.classList.remove('hidden');
                     // Re-load content for dynamic tabs when they become visible
                     if (targetId === 'admin-tab-users') loadAdminUsers();
                     else if (targetId === 'admin-tab-products') loadAdminProducts();
                     else if (targetId === 'admin-tab-add-product') loadAdminAddProductTab();
                     else if (targetId === 'admin-tab-discounts') loadAdminDiscounts();
                     else if (targetId === 'admin-tab-balance') loadAdminBalanceCodes();
                     else if (targetId === 'admin-tab-dashboard') loadAdminDashboard();
                 } else {
                    c.classList.add('hidden');
                 }
            });
        });
    });


    if(adminModalClose) adminModalClose.addEventListener('click', () => {
       if(adminModal) adminModal.classList.add('hidden');
    });

    if(adminBackToDashBtn) adminBackToDashBtn.addEventListener('click', () => {
        if(adminModal) adminModal.classList.add('hidden');
        checkLogin(); // Refresh user dashboard in case balance was changed etc.
        if(dashboardModal) dashboardModal.classList.remove('hidden'); // Reopen user dashboard
    });

    // --- Admin Form Submissions ---
    if(createDiscountForm) createDiscountForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('discount-code-name');
        const valueInput = document.getElementById('discount-code-value');
        const typeInput = document.getElementById('discount-code-type');

        const name = nameInput ? nameInput.value.trim().toUpperCase() : '';
        const value = parseInt(valueInput?.value || '');
        const type = typeInput ? typeInput.value : 'percent';

        if (!name || isNaN(value) || value <= 0) {
            showNotification('لطفا تمام فیلدها را به درستی پر کنید', 'warning');
            return;
        }
        if (!siteData.discountCodes) siteData.discountCodes = {};
        if (siteData.discountCodes[name]) {
             showNotification('کد تخفیف با این نام از قبل وجود دارد', 'warning');
             return;
        }
        siteData.discountCodes[name] = { value, type };
        saveSiteData();
        showNotification(`کد تخفیف ${name} با موفقیت ایجاد شد`, 'success');
        createDiscountForm.reset();
        loadAdminDiscounts(); // Refresh list
        loadAdminDashboard(); // Refresh stats
    });

    if(createBalanceForm) createBalanceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const valueInput = document.getElementById('balance-code-value');
        const value = parseInt(valueInput?.value || '');
        if (isNaN(value) || value <= 0) {
            showNotification('لطفا مبلغ معتبری وارد کنید', 'warning');
            return;
        }

        // Generate a random code (simple example)
        let newCode;
        do {
            newCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        } while (siteData.balanceCodes && siteData.balanceCodes[newCode]); // Ensure uniqueness

         if (!siteData.balanceCodes) siteData.balanceCodes = {};
        siteData.balanceCodes[newCode] = { value: value, used: false };
        saveSiteData();
        showNotification(`کد ${newCode} به ارزش ${value.toLocaleString('fa-IR')} تومان ایجاد شد`, 'success');
        createBalanceForm.reset();
        loadAdminBalanceCodes(); // Refresh list
        loadAdminDashboard(); // Refresh stats
    });

    if(addProductForm) addProductForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('admin-add-product-name');
        const priceInput = document.getElementById('admin-add-product-price');

        const catId = adminAddProductCategorySelect ? adminAddProductCategorySelect.value : '';
        const name = nameInput ? nameInput.value.trim() : '';
        const price = parseInt(priceInput?.value || '');

        if (!catId || !name || isNaN(price) || price <= 0) {
            showNotification('لطفا تمام فیلدهای محصول را به درستی پر کنید', 'warning');
            return;
        }

        // Ensure category and items array exist
        if (!siteData.products || !siteData.products[catId] || !Array.isArray(siteData.products[catId].items)) {
             showNotification('خطا: دسته انتخاب شده نامعتبر است.', 'error');
             console.error(`Invalid category ID "${catId}" selected for adding product.`);
             return;
        }

        const newId = `${catId}-${Math.random().toString(36).substring(2, 6)}`;
        siteData.products[catId].items.push({ id: newId, name: name, price: price });
        saveSiteData();

        renderProducts(); // Refresh UI for all users
        loadAdminProducts(); // Refresh price edit tab

        showNotification(`محصول "${name}" با موفقیت اضافه شد`, 'success');
        addProductForm.reset();
    });

    if(addCategoryForm) addCategoryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const idInput = document.getElementById('admin-add-category-id');
        const nameInput = document.getElementById('admin-add-category-name');
        const colorInput = document.getElementById('admin-add-category-color');
        const gridInput = document.getElementById('admin-add-category-grid');

        const id = idInput ? idInput.value.trim().toLowerCase() : '';
        const name = nameInput ? nameInput.value.trim() : '';
        const color = colorInput ? colorInput.value.trim().toLowerCase() : 'blue';
        const grid = gridInput ? gridInput.value.trim() : 'md:grid-cols-3';

        if (!id || !name || !color || !grid) {
            showNotification('لطفا تمام فیلدهای دسته‌بندی را پر کنید', 'warning');
            return;
        }
        // Basic validation for ID (no spaces, etc.)
        if (!/^[a-z0-9]+$/.test(id)) {
             showNotification('شناسه دسته‌بندی فقط می‌تواند شامل حروف کوچک انگلیسی و اعداد باشد.', 'warning');
             return;
        }

         if (!siteData.products) siteData.products = {};
        if (siteData.products[id]) {
            showNotification('شناسه دسته‌بندی تکراری است (باید منحصربفرد باشد)', 'error');
            return;
        }

        siteData.products[id] = {
            displayName: name,
            color: color,
            grid: grid,
            items: [] // Initialize with empty items array
        };
        saveSiteData();

        // Refresh product display and admin panels
        renderProductTabs();
        renderProducts();
        loadAdminAddProductTab(); // Refresh category dropdown in add product form
        loadAdminProducts(); // Refresh price management tab

        showNotification(`دسته‌بندی "${name}" با موفقیت ایجاد شد`, 'success');
        addCategoryForm.reset();
    });

    // --- Initial Page Load ---
    try {
        renderProductTabs(); // Render tabs dynamically
        renderProducts(); // Render products from DB on load
        checkLogin(); // Check login status on load
        updateAlgorithmUI(); // Initialize algorithm UI
    } catch (error) {
        console.error("Initialization Error:", error);
        // Avoid showing notification before elements might be ready
        // showNotification("خطا در بارگذاری اولیه صفحه", "error");
    }

}); // End DOMContentLoaded


