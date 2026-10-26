/**
 * SmartSpend Neo-Fintech - Core Application Logic
 * Powered 100% by live Real-Time Backend API endpoints (/api/v1).
 * All static/mock data arrays removed in favor of live PostgreSQL/Prisma API synchronization.
 */

// --- Real-time API Client ---
class ApiClient {
  constructor() {
    // Uses relative path through server.js reverse-proxy or direct port 4000
    this.baseUrl = window.location.port === '4000' || window.location.port === '3000'
      ? '/api/v1'
      : 'http://localhost:4000/api/v1';

    this.accessToken = localStorage.getItem('smartspend_access_token') || null;
    this.refreshToken = localStorage.getItem('smartspend_refresh_token') || null;
    this.currentUser = null;
  }

  async ensureAuth() {
    if (this.accessToken) {
      try {
        const meRes = await this.request('/auth/me', { method: 'GET' }, false);
        if (meRes.success) {
          this.currentUser = meRes.data.user;
          return this.currentUser;
        }
      } catch (e) {
        console.log('Session expired, refreshing or logging in...');
      }
    }

    // Try refreshing if token exists
    if (this.refreshToken) {
      try {
        const refreshRes = await fetch(`${this.baseUrl}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        });
        const refreshData = await refreshRes.json();
        if (refreshData.success) {
          this.accessToken = refreshData.data.tokens.accessToken;
          this.refreshToken = refreshData.data.tokens.refreshToken;
          localStorage.setItem('smartspend_access_token', this.accessToken);
          localStorage.setItem('smartspend_refresh_token', this.refreshToken);
          this.currentUser = refreshData.data.user;
          return this.currentUser;
        }
      } catch (e) {
        // Fall through to login
      }
    }

    // Attempt default login or registration
    try {
      const loginRes = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'rohan.sharma@fintech.io',
          password: 'Password123',
        }),
      });

      const loginData = await loginRes.json();
      if (loginData.success) {
        this.accessToken = loginData.data.tokens.accessToken;
        this.refreshToken = loginData.data.tokens.refreshToken;
        this.currentUser = loginData.data.user;
        localStorage.setItem('smartspend_access_token', this.accessToken);
        localStorage.setItem('smartspend_refresh_token', this.refreshToken);
        return this.currentUser;
      }
    } catch (e) {
      console.warn('Login attempt failed, registering demo user...');
    }

    // Register user if not exists
    try {
      const regRes = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Rohan Sharma',
          email: 'rohan.sharma@fintech.io',
          password: 'Password123',
        }),
      });
      const regData = await regRes.json();
      if (regData.success) {
        this.accessToken = regData.data.tokens.accessToken;
        this.refreshToken = regData.data.tokens.refreshToken;
        this.currentUser = regData.data.user;
        localStorage.setItem('smartspend_access_token', this.accessToken);
        localStorage.setItem('smartspend_refresh_token', this.refreshToken);
        return this.currentUser;
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
    }

    return null;
  }

  async request(endpoint, options = {}, retryOn401 = true) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401 && retryOn401 && this.refreshToken) {
      // Refresh token and retry
      const refreshed = await this.ensureAuth();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        const retryRes = await fetch(`${this.baseUrl}${endpoint}`, {
          ...options,
          headers,
        });
        return await retryRes.json();
      }
    }

    const data = await response.json();
    return data;
  }

  // --- API Endpoint Wrappers ---
  getCategories() {
    return this.request('/categories');
  }

  getDashboard() {
    return this.request('/budgets/dashboard');
  }

  getTransactions(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/transactions?${query}`);
  }

  createTransaction(txnData) {
    return this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(txnData),
    });
  }

  deleteTransaction(id) {
    return this.request(`/transactions/${id}`, {
      method: 'DELETE',
    });
  }

  getRecurringRules() {
    return this.request('/recurring');
  }

  getAnalyticsOverview(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/analytics/overview?${query}`);
  }

  getAnalyticsDaily(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/analytics/daily?${query}`);
  }

  getAnalyticsCategories(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/analytics/categories?${query}`);
  }

  getNotifications() {
    return this.request('/notifications');
  }

  markAllNotificationsRead() {
    return this.request('/notifications/read-all', { method: 'POST' });
  }

  setBudget(data) {
    return this.request('/budgets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  chatAi(message) {
    return this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }
}

// --- Application State & UI Controller ---
class SmartSpendApp {
  constructor() {
    this.api = new ApiClient();
    this.activeTab = 'home';
    this.previousTab = 'home';
    this.selectedTransaction = null;
    this.soundEnabled = true;
    this.frameMode = 'frame';

    // Live state loaded directly from the database API
    this.liveData = {
      user: null,
      categories: [],
      dashboard: null,
      transactions: [],
      subscriptions: [],
      notifications: [],
      analytics: null,
      activeFilter: 'all',
      searchQuery: '',
    };

    // Keypad and Form State
    this.addForm = {
      type: 'expense',
      amount: '450.00',
      merchant: 'Blue Tokai Coffee Roasters',
      note: 'Afternoon coffee with client',
      categoryId: '',
      categoryName: 'Food & Dining',
      categoryIcon: 'restaurant',
      account: 'UPI (GPay / HDFC)',
    };

    this.audioCtx = null;
    this.init();
  }

  async init() {
    this.setupAudio();
    this.bindEvents();
    this.showToast('Connecting to SmartSpend Real-Time API...');
    await this.syncRealtimeData();
    this.switchTab('home');
  }

  // --- Real-time Data Synchronization ---
  async syncRealtimeData() {
    try {
      // 1. Authenticate session
      const user = await this.api.ensureAuth();
      if (user) {
        this.liveData.user = user;
        this.updateProfileUI(user);
      }

      // 2. Fetch Categories from database
      const catRes = await this.api.getCategories();
      if (catRes.success && Array.isArray(catRes.data)) {
        this.liveData.categories = catRes.data;
        if (!this.addForm.categoryId && this.liveData.categories.length > 0) {
          const defaultCat = this.liveData.categories.find(c => c.name.toLowerCase().includes('food')) || this.liveData.categories[0];
          this.addForm.categoryId = defaultCat.id;
          this.addForm.categoryName = defaultCat.name;
          this.addForm.categoryIcon = defaultCat.icon;
        }
        this.renderCategoryChips();
      }

      // 3. Fetch Unified Dashboard (Monthly budget, today spend, balance, smart tip)
      const dashRes = await this.api.getDashboard();
      if (dashRes.success) {
        this.liveData.dashboard = dashRes.data;
      }

      // 4. Fetch Live Transactions Ledger
      const txnRes = await this.api.getTransactions({ limit: 100 });
      if (txnRes.success && txnRes.data && Array.isArray(txnRes.data.items)) {
        this.liveData.transactions = txnRes.data.items;
      }

      // 5. Fetch Live Recurring Subscriptions
      const recRes = await this.api.getRecurringRules();
      if (recRes.success && Array.isArray(recRes.data)) {
        this.liveData.subscriptions = recRes.data;
      }

      // 6. Fetch Live Notifications
      const notifRes = await this.api.getNotifications();
      if (notifRes.success && Array.isArray(notifRes.data)) {
        this.liveData.notifications = notifRes.data;
        const unreadCount = this.liveData.notifications.filter(n => !n.isRead).length;
        this.updateNotificationBadges(unreadCount);
      }

      // 7. Render all viewports with real-time numbers
      this.renderAll();
      this.showToast('🟢 Live Real-Time Data Synced');
    } catch (err) {
      console.error('Error synchronizing real-time data:', err);
      this.showToast('API connection error. Retrying...');
    }
  }

  // --- Sound Effects using Web Audio API ---
  setupAudio() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    } catch (e) {
      console.log('Web Audio not supported');
    }
  }

  playSound(type = 'click') {
    if (!this.soundEnabled || !this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      const now = this.audioCtx.currentTime;

      if (type === 'click') {
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'preset') {
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.06);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.08);
        osc.frequency.setValueAtTime(783.99, now + 0.16);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'delete') {
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.12);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      }
    } catch (e) {
      // Audio error safe ignore
    }
  }

  // --- Router & Navigation ---
  switchTab(tabId) {
    if (this.activeTab !== tabId) {
      this.previousTab = this.activeTab;
    }
    this.activeTab = tabId;
    this.playSound('click');

    // Hide all views
    document.querySelectorAll('.tab-view').forEach(view => {
      view.classList.remove('active-tab');
    });

    // Show active view
    const target = document.getElementById(`view-${tabId}`);
    if (target) {
      target.classList.add('active-tab');
      window.scrollTo(0, 0);
      const appContainer = document.getElementById('app-scroll-container');
      if (appContainer) appContainer.scrollTop = 0;
    }

    // Header updates
    const headerTitle = document.getElementById('header-page-title');
    if (headerTitle) {
      if (tabId === 'home') headerTitle.textContent = 'Home';
      else if (tabId === 'insights') headerTitle.textContent = 'Insights';
      else if (tabId === 'activity') headerTitle.textContent = 'Activity';
      else if (tabId === 'profile') headerTitle.textContent = 'Profile';
    }

    // Bottom Navigation visibility and active state
    const bottomNav = document.getElementById('bottom-nav');
    if (tabId === 'add-expense') {
      if (bottomNav) bottomNav.style.display = 'none';
    } else {
      if (bottomNav) bottomNav.style.display = 'block';
      this.updateBottomNavUI(tabId);
    }

    // Render tab-specific real-time views
    if (tabId === 'insights') {
      this.renderInsightsView();
    } else if (tabId === 'activity') {
      this.renderActivityView();
    } else if (tabId === 'home') {
      this.renderHomeView();
    }
  }

  updateBottomNavUI(tabId) {
    document.querySelectorAll('#bottom-nav [data-path]').forEach(link => {
      const path = link.getAttribute('data-path');
      if (path === tabId) {
        link.className = 'flex flex-col items-center justify-center w-14 h-12 transition-colors text-primary font-semibold';
        link.setAttribute('aria-current', 'page');
      } else if (path !== 'add-expense') {
        link.className = 'flex flex-col items-center justify-center w-14 h-12 text-on-surface-variant hover:text-on-surface transition-colors';
        link.removeAttribute('aria-current');
      }
    });
  }

  formatINR(rupees) {
    const num = Number(rupees) || 0;
    return '₹' + num.toLocaleString('en-IN', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    });
  }

  // --- Render Home Screen (Live Real-Time Data) ---
  renderHomeView() {
    const d = this.liveData.dashboard;
    if (!d) return;

    // 1. Monthly Spend Limit Card
    const balanceDisplay = document.getElementById('home-safe-balance');
    const percentLeftBadge = document.getElementById('home-percent-left');
    const spentText = document.getElementById('home-spent-text');
    const targetText = document.getElementById('home-target-text');
    const progressBar = document.getElementById('home-progress-bar');

    if (balanceDisplay) balanceDisplay.textContent = d.monthlyBudget.remainingSafeFormatted;
    if (percentLeftBadge) percentLeftBadge.textContent = `${d.monthlyBudget.percentageLeft}% left`;
    if (spentText) spentText.textContent = d.monthlyBudget.totalSpentFormatted;
    if (targetText) targetText.textContent = d.monthlyBudget.amountLimitFormatted;
    if (progressBar) progressBar.style.width = `${Math.min(100, d.monthlyBudget.percentageUsed)}%`;

    // 2. Today's Spending Card
    const todaySpentEl = document.getElementById('home-today-spent');
    const todayLimitEl = document.getElementById('home-today-limit');
    const todayPercentEl = document.getElementById('home-today-percent');
    const todayProgressEl = document.getElementById('home-today-progress');
    const todayBufferText = document.getElementById('home-today-buffer');

    if (todaySpentEl) todaySpentEl.textContent = d.todaySpending.todaySpentFormatted;
    if (todayLimitEl) todayLimitEl.textContent = `Daily Target ${d.todaySpending.dailyTargetFormatted}`;
    if (todayPercentEl) todayPercentEl.textContent = `${d.todaySpending.percentageOfAllowance}% of allowance`;
    if (todayProgressEl) todayProgressEl.style.width = `${Math.min(100, d.todaySpending.percentageOfAllowance)}%`;

    if (todayBufferText) {
      if (d.todaySpending.onTrack) {
        todayBufferText.innerHTML = `You are on track — <strong class="text-on-surface font-semibold">${d.todaySpending.bufferRemainingFormatted} buffer remaining</strong>`;
      } else {
        todayBufferText.innerHTML = `<span class="text-error font-semibold">Exceeded daily target by ${d.todaySpending.bufferRemainingFormatted}</span>`;
      }
    }

    // 3. Dynamic Smart Tip from AI/Analytics
    const tipText = document.getElementById('home-smart-tip-text');
    if (tipText) {
      tipText.innerHTML = d.smartTip;
    }

    // 4. Recent Transactions Ledger (Live from database)
    const listEl = document.getElementById('home-recent-txns-list');
    if (listEl) {
      const recent = (d.recentTransactions && d.recentTransactions.length > 0)
        ? d.recentTransactions.slice(0, 5)
        : this.liveData.transactions.slice(0, 5);

      if (recent.length === 0) {
        listEl.innerHTML = `
          <div class="p-6 text-center text-on-surface-variant font-body-sm flex flex-col items-center gap-1">
            <span class="material-symbols-outlined text-[28px]">receipt_long</span>
            <span>No transactions recorded yet</span>
            <button onclick="app.switchTab('add-expense')" class="mt-2 px-3 py-1 bg-primary text-on-primary rounded-full text-xs font-semibold">Record your first expense</button>
          </div>
        `;
      } else {
        listEl.innerHTML = recent.map((t, index) => {
          const isIncome = t.type === 'income';
          const amtStr = t.amountFormatted || ((isIncome ? '+' : '-') + this.formatINR(t.amountRupees || (t.amount / 100)));
          const amtColor = isIncome ? 'text-[#267548]' : 'text-on-surface';
          const iconBg = isIncome ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant' : 'bg-surface-container text-on-surface';
          const borderDivider = index < recent.length - 1 ? '<div class="h-[1px] bg-surface-container mx-3.5"></div>' : '';

          const icon = t.category?.icon || t.categoryIcon || 'receipt';
          const title = t.merchant || t.title || 'Expense';
          const catName = t.category?.name || t.category || 'General';
          const dateStr = this.formatRelativeDate(t.transactionDate || t.date);

          return `
            <div class="flex items-center justify-between p-3.5 hover:bg-surface-container-low transition-colors cursor-pointer" onclick="app.openTransactionDetail('${t.id}')">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-10 h-10 rounded-full ${iconBg} flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-[20px]">${icon}</span>
                </div>
                <div class="flex flex-col min-w-0">
                  <span class="font-body-md text-body-md text-on-surface font-semibold truncate">${this.escapeHTML(title)}</span>
                  <span class="font-body-sm text-body-sm text-on-surface-variant truncate">${this.escapeHTML(catName)} • ${dateStr}</span>
                </div>
              </div>
              <div class="flex flex-col items-end shrink-0 pl-2">
                <span class="font-label-lg text-label-lg ${amtColor} font-bold">${amtStr}</span>
                <span class="font-label-sm text-label-sm text-on-surface-variant font-medium">${(t.paymentMethod || 'UPI').split(' ')[0]}</span>
              </div>
            </div>
            ${borderDivider}
          `;
        }).join('');
      }
    }
  }

  // --- Render Activity Screen (Live Real-Time Data) ---
  renderActivityView() {
    const txns = this.liveData.transactions;

    let totalSpent = 0;
    let totalIncome = 0;

    txns.forEach(t => {
      const amt = t.amountRupees || (t.amount / 100);
      if (t.type === 'expense') totalSpent += amt;
      else if (t.type === 'income') totalIncome += amt;
    });

    const monthlyLimit = this.liveData.dashboard?.monthlyBudget?.amountLimitRupees || 45000;
    const percentSpent = Math.min(100, Math.round((totalSpent / monthlyLimit) * 100));

    // Snapshot card numbers
    const totalSpentEl = document.getElementById('activity-total-spent');
    const incomeEarnedEl = document.getElementById('activity-income-earned');
    const txnCountEl = document.getElementById('activity-txn-count');
    const burnPercentEl = document.getElementById('activity-burn-percent');
    const burnBarEl = document.getElementById('activity-burn-bar');

    if (totalSpentEl) totalSpentEl.textContent = this.formatINR(totalSpent);
    if (incomeEarnedEl) incomeEarnedEl.textContent = this.formatINR(totalIncome);
    if (txnCountEl) txnCountEl.textContent = `${txns.length} Transactions`;
    if (burnPercentEl) burnPercentEl.textContent = `${percentSpent}%`;
    if (burnBarEl) burnBarEl.style.width = `${percentSpent}%`;

    // Filter and search live list
    let filtered = [...txns];

    if (this.liveData.searchQuery.trim()) {
      const q = this.liveData.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(t => {
        const title = (t.title || t.merchant || '').toLowerCase();
        const cat = (t.category?.name || t.category || '').toLowerCase();
        const note = (t.note || '').toLowerCase();
        const method = (t.paymentMethod || '').toLowerCase();
        return title.includes(q) || cat.includes(q) || note.includes(q) || method.includes(q);
      });
    }

    if (this.liveData.activeFilter === 'food') {
      filtered = filtered.filter(t => (t.category?.name || t.category || '').toLowerCase().includes('food'));
    } else if (this.liveData.activeFilter === 'upi') {
      filtered = filtered.filter(t => (t.paymentMethod || '').toLowerCase().includes('upi'));
    } else if (this.liveData.activeFilter === 'high') {
      filtered = filtered.filter(t => (t.amountRupees || t.amount / 100) > 500);
    } else if (this.liveData.activeFilter === 'income') {
      filtered = filtered.filter(t => t.type === 'income');
    }

    const container = document.getElementById('activity-grouped-list');
    if (!container) return;

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="bg-surface-container-lowest rounded-2xl p-8 text-center shadow-sm flex flex-col items-center justify-center gap-2">
          <span class="material-symbols-outlined text-[44px] text-on-surface-variant">receipt_long</span>
          <p class="font-title-md text-title-md text-on-surface font-semibold">No transactions match your search</p>
          <p class="font-body-sm text-body-sm text-on-surface-variant">Try searching for another keyword or clear active filters.</p>
          <button class="mt-2 px-4 py-1.5 rounded-full bg-primary text-on-primary font-label-md text-label-md" onclick="app.setFilter('all')">Reset Filters</button>
        </div>
      `;
      return;
    }

    // Group live transactions by day
    const groups = {};
    filtered.forEach(t => {
      const dateKey = this.formatDateGroup(t.transactionDate || t.date);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(t);
    });

    const groupKeys = Object.keys(groups);
    container.innerHTML = groupKeys.map(dateKey => {
      const groupTxns = groups[dateKey];
      let groupTotal = 0;
      let groupIncome = 0;

      groupTxns.forEach(t => {
        const amt = t.amountRupees || (t.amount / 100);
        if (t.type === 'expense') groupTotal += amt;
        else groupIncome += amt;
      });

      let badgeHtml = '';
      if (groupIncome > 0 && groupTotal > 0) {
        badgeHtml = `
          <div class="flex items-center gap-1 font-label-sm text-label-sm">
            <span class="bg-error-container text-on-error-container px-1.5 py-0.5 rounded font-medium">-${this.formatINR(groupTotal)}</span>
            <span class="bg-secondary-container text-on-secondary-container px-1.5 py-0.5 rounded font-semibold">+${this.formatINR(groupIncome)}</span>
          </div>
        `;
      } else if (groupIncome > 0) {
        badgeHtml = `<span class="bg-secondary-container text-on-secondary-container px-1.5 py-0.5 rounded font-semibold font-label-sm">+${this.formatINR(groupIncome)}</span>`;
      } else {
        badgeHtml = `<span class="font-label-sm text-label-sm font-semibold bg-surface-container-high px-2 py-0.5 rounded text-on-surface">Total: ${this.formatINR(groupTotal)}</span>`;
      }

      const rowsHtml = groupTxns.map((t, idx) => {
        const isIncome = t.type === 'income';
        const amtStr = t.amountFormatted || ((isIncome ? '+' : '-') + this.formatINR(t.amountRupees || (t.amount / 100)));
        const amtClass = isIncome ? 'text-secondary' : 'text-on-surface';
        const iconBg = isIncome ? 'bg-secondary-container/40 text-secondary' : 'bg-surface-container text-on-surface';
        const divider = idx < groupTxns.length - 1 ? '<div class="h-[1px] bg-surface-container-high mx-3.5"></div>' : '';

        const title = t.merchant || t.title || 'Transaction';
        const catName = t.category?.name || t.category || 'General';
        const icon = t.category?.icon || 'receipt';
        const timeStr = this.formatTime(t.transactionDate || t.time);

        return `
          <div class="flex items-center justify-between p-3.5 hover:bg-surface-container-low transition-colors cursor-pointer active:bg-surface-container" onclick="app.openTransactionDetail('${t.id}')">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-10 h-10 rounded-full ${iconBg} flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-[20px]">${icon}</span>
              </div>
              <div class="flex flex-col min-w-0">
                <div class="flex items-center gap-1.5">
                  <span class="font-body-md text-body-md text-on-surface font-semibold truncate">${this.escapeHTML(title)}</span>
                  ${isIncome ? '<span class="material-symbols-outlined text-[15px] text-secondary">verified</span>' : ''}
                </div>
                <div class="flex items-center gap-1.5 font-body-sm text-body-sm text-on-surface-variant truncate">
                  <span>${this.escapeHTML(catName)}</span>
                  <span>•</span>
                  <span>${timeStr}</span>
                  <span>•</span>
                  <span class="${isIncome ? 'text-secondary font-medium' : ''}">${(t.paymentMethod || 'UPI').split(' ')[0]}</span>
                </div>
              </div>
            </div>
            <div class="flex flex-col items-end shrink-0 pl-2">
              <span class="font-currency-metric text-currency-metric ${amtClass} font-bold tracking-tight">${amtStr}</span>
              <span class="font-label-sm text-label-sm text-on-surface-variant">${t.isRecurring ? 'Recurring' : 'Settled'}</span>
            </div>
          </div>
          ${divider}
        `;
      }).join('');

      return `
        <section class="flex flex-col gap-y-2">
          <div class="flex items-center justify-between px-1">
            <div class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full ${dateKey === 'Today' ? 'bg-secondary' : (dateKey === 'Yesterday' ? 'bg-primary' : 'bg-outline-variant')}"></span>
              <span class="font-title-md text-title-md text-on-surface font-bold">${dateKey}</span>
            </div>
            ${badgeHtml}
          </div>
          <div class="flex flex-col rounded-xl bg-surface-container-lowest shadow-sm divide-y-0 overflow-hidden">
            ${rowsHtml}
          </div>
        </section>
      `;
    }).join('');
  }

  // --- Render Insights Screen (Live Real-Time Data) ---
  async renderInsightsView() {
    const d = this.liveData.dashboard;
    if (!d) return;

    const totalSpentEl = document.getElementById('insights-total-spent');
    const dailyAvgEl = document.getElementById('insights-daily-avg');
    const topCatNameEl = document.getElementById('insights-top-cat-name');
    const topCatSpendEl = document.getElementById('insights-top-cat-spend');
    const safeDailyEl = document.getElementById('insights-safe-daily');
    const safeDaysLeftEl = document.getElementById('insights-safe-days-left');

    const b = d.monthlyBudget;
    if (totalSpentEl) totalSpentEl.textContent = b.totalSpentFormatted;
    if (dailyAvgEl) dailyAvgEl.textContent = d.todaySpending.todaySpentFormatted;

    const topCat = d.topCategories[0];
    if (topCatNameEl) topCatNameEl.textContent = topCat?.name || 'Food & Dining';
    if (topCatSpendEl) {
      topCatSpendEl.innerHTML = `${topCat?.amountFormatted || '₹0'} <span class="font-semibold text-primary">(${topCat?.percentage || 0}%)</span>`;
    }

    if (safeDailyEl) safeDailyEl.innerHTML = `${b.dailyAllowanceFormatted} <span class="font-body-sm text-body-sm text-on-surface-variant font-normal">/ day</span>`;
    if (safeDaysLeftEl) safeDaysLeftEl.textContent = `${b.daysRemaining} days remaining`;

    // Multi-segmented category meter from live data
    const meterEl = document.getElementById('insights-segmented-meter');
    if (meterEl && d.topCategories.length > 0) {
      const colors = ['bg-primary', 'bg-secondary-container', 'bg-surface-tint', 'bg-secondary-fixed-dim', 'bg-outline-variant'];
      meterEl.innerHTML = d.topCategories.map((c, i) => {
        const col = colors[i % colors.length];
        const roundedClass = i === 0 ? 'rounded-l-full' : (i === d.topCategories.length - 1 ? 'rounded-r-full' : '');
        return `<div class="h-full ${col} ${roundedClass} transition-all duration-500" style="width: ${Math.max(6, c.percentage)}%;" title="${c.name}: ${c.percentage}%"></div>`;
      }).join('');
    }

    // Category list rows from live database
    const catListEl = document.getElementById('insights-category-list');
    if (catListEl) {
      catListEl.innerHTML = d.topCategories.map(c => `
        <div class="flex items-center justify-between py-1.5">
          <div class="flex items-center gap-space-sm">
            <div class="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-[18px]">${c.icon || 'receipt'}</span>
            </div>
            <div class="flex flex-col">
              <span class="font-label-lg text-label-lg text-primary font-medium">${this.escapeHTML(c.name)}</span>
              <span class="font-body-sm text-body-sm text-on-surface-variant">${c.percentage}% of overall spend</span>
            </div>
          </div>
          <div class="flex flex-col items-end">
            <span class="font-title-md text-title-md text-primary font-bold">${c.amountFormatted}</span>
            <span class="font-label-sm text-label-sm text-on-surface-variant">${c.count} txns</span>
          </div>
        </div>
      `).join('');
    }

    // Live Upcoming Recurring Subscriptions
    const subsListEl = document.getElementById('insights-subscriptions-list');
    const subsTotalEl = document.getElementById('insights-subscriptions-total');

    if (subsListEl) {
      const subscriptions = this.liveData.subscriptions;
      if (subscriptions.length === 0) {
        subsListEl.innerHTML = `
          <div class="p-4 text-center text-on-surface-variant text-xs">
            No recurring subscriptions active. Add recurring rules in backend or tap to create!
          </div>
        `;
        if (subsTotalEl) subsTotalEl.textContent = '₹0';
      } else {
        let totalSubs = 0;
        subsListEl.innerHTML = subscriptions.map(s => {
          const amt = s.amountRupees || (s.amount / 100);
          totalSubs += amt;
          const dueStr = new Date(s.nextDueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const icon = s.category?.icon || 'subscriptions';

          return `
            <div class="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer" onclick="app.showToast('${s.title}: ${s.amountFormatted} due on ${dueStr}')">
              <div class="flex items-center gap-space-sm">
                <div class="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold text-[15px] shadow-sm">
                  <span class="material-symbols-outlined text-[20px]">${icon}</span>
                </div>
                <div class="flex flex-col">
                  <span class="font-label-lg text-label-lg text-primary font-semibold">${this.escapeHTML(s.title)}</span>
                  <span class="font-body-sm text-body-sm text-on-surface-variant">Autopay (${s.frequency}) • ${dueStr}</span>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-currency-metric text-currency-metric text-primary">${s.amountFormatted}</span>
                <span class="material-symbols-outlined text-outline text-[18px]">chevron_right</span>
              </div>
            </div>
          `;
        }).join('');

        if (subsTotalEl) subsTotalEl.textContent = this.formatINR(totalSubs);
      }
    }

    // Trajectory Chart Bar Heights
    this.updateTrajectoryChart();
  }

  updateTrajectoryChart() {
    const chartBars = document.querySelectorAll('.daily-chart-bar');
    if (!chartBars || chartBars.length === 0) return;

    // Dynamically calculate recent 7 days from live transactions
    const now = new Date();
    const dayTotals = [0, 0, 0, 0, 0, 0, 0]; // Sun to Sat
    this.liveData.transactions.forEach(t => {
      if (t.type === 'expense') {
        const d = new Date(t.transactionDate);
        const dayIdx = d.getDay();
        dayTotals[dayIdx] += (t.amountRupees || t.amount / 100);
      }
    });

    const maxAmt = Math.max(1, ...dayTotals);
    chartBars.forEach((bar, index) => {
      const amt = dayTotals[(index + 1) % 7]; // Map M-S
      const heightPercent = Math.min(100, Math.round((amt / maxAmt) * 100));
      bar.style.height = `${Math.max(18, heightPercent * 1.05)}px`;
    });
  }

  // --- Dynamic Category Chips in Add Expense Screen ---
  renderCategoryChips() {
    const container = document.getElementById('add-category-carousel');
    if (!container) return;

    container.innerHTML = this.liveData.categories.map((cat, idx) => {
      const isSelected = cat.id === this.addForm.categoryId;
      const chipClass = isSelected
        ? "category-chip flex flex-col items-center gap-1.5 shrink-0 p-2.5 rounded-2xl bg-secondary-container text-on-secondary-container transition-all"
        : "category-chip flex flex-col items-center gap-1.5 shrink-0 p-2.5 rounded-2xl bg-surface-container-low text-on-surface-variant hover:bg-surface-container transition-all";

      const iconWrapClass = isSelected
        ? "cat-icon-wrap w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-sm"
        : "cat-icon-wrap w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center";

      const iconSpanClass = isSelected
        ? "material-symbols-outlined text-secondary-fixed text-[24px]"
        : "material-symbols-outlined text-[24px]";

      return `
        <button class="${chipClass}" data-id="${cat.id}" onclick="app.selectCategoryById('${cat.id}', '${this.escapeHTML(cat.name)}', '${cat.icon}')">
          <div class="${iconWrapClass}">
            <span class="${iconSpanClass}">${cat.icon || 'receipt'}</span>
          </div>
          <span class="font-label-sm text-label-sm ${isSelected ? 'font-semibold' : ''}">${this.escapeHTML(cat.name)}</span>
        </button>
      `;
    }).join('');
  }

  selectCategoryById(id, name, icon) {
    this.playSound('click');
    this.addForm.categoryId = id;
    this.addForm.categoryName = name;
    this.addForm.categoryIcon = icon;
    this.renderCategoryChips();
  }

  // --- Keypad & Save Transaction (Live Mutation) ---
  pressKey(key) {
    this.playSound('click');
    let current = this.addForm.amount;

    if (key === 'backspace') {
      if (current.length <= 1) current = '0';
      else current = current.slice(0, -1);
    } else if (key === '.') {
      if (!current.includes('.')) current += '.';
    } else {
      if (current === '0' || current === '450.00' || current === '0.00') {
        current = key;
      } else {
        if (current.includes('.')) {
          const parts = current.split('.');
          if (parts[1].length < 2) current += key;
        } else {
          if (current.length < 7) current += key;
        }
      }
    }

    this.addForm.amount = current;
    this.updateKeypadDisplay();
  }

  addPreset(amount) {
    this.playSound('preset');
    let num = parseFloat(this.addForm.amount) || 0;
    num += amount;
    this.addForm.amount = num.toFixed(2);
    this.updateKeypadDisplay();
  }

  updateKeypadDisplay() {
    const el = document.getElementById('amount-display');
    if (el) el.textContent = this.addForm.amount || '0';
  }

  switchAddType(type) {
    this.playSound('click');
    this.addForm.type = type;

    const expBtn = document.getElementById('type-expense');
    const incBtn = document.getElementById('type-income');

    if (type === 'expense') {
      if (expBtn) expBtn.className = "flex-1 py-2.5 rounded-full font-label-lg text-label-lg transition-all flex items-center justify-center gap-1.5 bg-surface-container-lowest text-on-surface shadow-sm";
      if (incBtn) incBtn.className = "flex-1 py-2.5 rounded-full font-label-lg text-label-lg transition-all flex items-center justify-center gap-1.5 text-on-surface-variant";
    } else {
      if (incBtn) incBtn.className = "flex-1 py-2.5 rounded-full font-label-lg text-label-lg transition-all flex items-center justify-center gap-1.5 bg-surface-container-lowest text-on-surface shadow-sm";
      if (expBtn) expBtn.className = "flex-1 py-2.5 rounded-full font-label-lg text-label-lg transition-all flex items-center justify-center gap-1.5 text-on-surface-variant";
    }
  }

  selectAccount(el, accountName) {
    this.playSound('click');
    this.addForm.account = accountName;

    document.querySelectorAll('.account-chip').forEach(btn => {
      btn.className = "account-chip px-3.5 py-2 rounded-full bg-surface-container text-on-surface font-label-md text-label-md flex items-center gap-1.5";
      const icon = btn.querySelector('.material-symbols-outlined');
      if (icon) icon.className = "material-symbols-outlined text-[16px] text-on-surface-variant";
    });

    el.className = "account-chip px-3.5 py-2 rounded-full bg-primary-container text-on-primary font-label-md text-label-md flex items-center gap-1.5 shadow-sm";
    const activeIcon = el.querySelector('.material-symbols-outlined');
    if (activeIcon) activeIcon.className = "material-symbols-outlined text-[16px] text-secondary-fixed";
  }

  async saveTransaction() {
    const merchantInput = document.getElementById('merchant-input');
    const noteInput = document.getElementById('note-input');

    const merchant = (merchantInput && merchantInput.value.trim()) || 'Direct Payment';
    const note = (noteInput && noteInput.value.trim()) || '';
    const amountVal = parseFloat(this.addForm.amount) || 0;

    if (amountVal <= 0) {
      this.showToast('Please enter an amount greater than zero');
      return;
    }

    if (!this.addForm.categoryId) {
      this.showToast('Please select a category');
      return;
    }

    const btn = document.getElementById('save-btn');
    if (btn) {
      btn.innerHTML = '<span class="material-symbols-outlined text-[22px] animate-spin">refresh</span><span>Saving to Backend Database...</span>';
      btn.disabled = true;
    }

    try {
      // POST directly to real-time backend API
      const res = await this.api.createTransaction({
        type: this.addForm.type,
        amount: amountVal,
        categoryId: this.addForm.categoryId,
        title: merchant,
        merchant: merchant,
        note: note,
        paymentMethod: this.addForm.account,
      });

      if (res.success) {
        this.playSound('success');

        if (btn) {
          btn.innerHTML = '<span class="material-symbols-outlined text-[22px]">check</span><span>Saved to Database!</span>';
          btn.classList.add('bg-secondary', 'text-on-secondary');
        }

        // Re-sync all live data from server
        await this.syncRealtimeData();

        setTimeout(() => {
          if (btn) {
            btn.innerHTML = '<span class="material-symbols-outlined text-[22px]">check_circle</span><span>Save Transaction</span>';
            btn.classList.remove('bg-secondary', 'text-on-secondary');
            btn.disabled = false;
          }
          this.switchTab(this.previousTab || 'home');
          this.showToast(`Logged ${this.formatINR(amountVal)} for ${merchant}`);
        }, 500);
      } else {
        throw new Error(res.error?.message || 'Failed to save transaction');
      }
    } catch (err) {
      console.error('Save transaction error:', err);
      this.showToast(err.message || 'Error saving to database');
      if (btn) {
        btn.innerHTML = '<span class="material-symbols-outlined text-[22px]">check_circle</span><span>Save Transaction</span>';
        btn.disabled = false;
      }
    }
  }

  // --- Transaction Modal & Live Delete Action ---
  openTransactionDetail(txnId) {
    const txn = this.liveData.transactions.find(t => t.id === txnId);
    if (!txn) return;

    this.playSound('click');
    this.selectedTransaction = txn;

    const merchant = txn.merchant || txn.title;
    const catName = txn.category?.name || txn.category || 'General';
    const icon = txn.category?.icon || 'receipt';
    const amtRupees = txn.amountRupees || (txn.amount / 100);

    document.getElementById('modalMerchant').textContent = merchant;
    document.getElementById('modalCategory').textContent = catName;
    document.getElementById('modalIcon').textContent = icon;

    const amtEl = document.getElementById('modalAmount');
    if (txn.type === 'income') {
      amtEl.textContent = '+' + this.formatINR(amtRupees);
      amtEl.className = 'font-currency-display text-currency-display text-secondary font-bold tracking-tight mt-2';
    } else {
      amtEl.textContent = '-' + this.formatINR(amtRupees);
      amtEl.className = 'font-currency-display text-currency-display text-on-surface font-bold tracking-tight mt-2';
    }

    document.getElementById('modalTime').textContent = `${this.formatRelativeDate(txn.transactionDate)}, ${this.formatTime(txn.transactionDate)}`;
    document.getElementById('modalPayment').textContent = txn.paymentMethod || 'UPI';
    document.getElementById('modalNote').textContent = txn.note || 'No notes attached';

    const backdrop = document.getElementById('txnModalBackdrop');
    const sheet = document.getElementById('txnModalSheet');

    if (backdrop && sheet) {
      backdrop.classList.remove('hidden');
      backdrop.classList.add('flex');
      setTimeout(() => {
        sheet.classList.remove('translate-y-full');
        sheet.classList.add('translate-y-0');
      }, 10);
    }
  }

  closeTransactionDetail() {
    this.playSound('click');
    const backdrop = document.getElementById('txnModalBackdrop');
    const sheet = document.getElementById('txnModalSheet');

    if (sheet) {
      sheet.classList.remove('translate-y-0');
      sheet.classList.add('translate-y-full');
    }
    setTimeout(() => {
      if (backdrop) {
        backdrop.classList.remove('flex');
        backdrop.classList.add('hidden');
      }
      this.selectedTransaction = null;
    }, 200);
  }

  triggerDelete() {
    this.playSound('click');
    const dialog = document.getElementById('deleteConfirmDialog');
    if (dialog) {
      dialog.classList.remove('hidden');
      dialog.classList.add('flex');
    }
  }

  cancelDelete() {
    this.playSound('click');
    const dialog = document.getElementById('deleteConfirmDialog');
    if (dialog) {
      dialog.classList.add('hidden');
      dialog.classList.remove('flex');
    }
  }

  async confirmDelete() {
    if (!this.selectedTransaction) return;
    this.playSound('delete');

    const id = this.selectedTransaction.id;
    const name = this.selectedTransaction.merchant || this.selectedTransaction.title;

    try {
      const res = await this.api.deleteTransaction(id);
      if (res.success) {
        this.cancelDelete();
        this.closeTransactionDetail();
        await this.syncRealtimeData();
        this.showToast(`Deleted: ${name}`);
      } else {
        throw new Error(res.error?.message || 'Delete failed');
      }
    } catch (e) {
      this.showToast(e.message || 'Error deleting from database');
    }
  }

  // --- Filtering & Searching in Activity ---
  setFilter(filterType) {
    this.playSound('click');
    this.liveData.activeFilter = filterType;

    document.querySelectorAll('.activity-filter-chip').forEach(btn => {
      const type = btn.getAttribute('data-filter');
      if (type === filterType) {
        btn.className = "activity-filter-chip h-9 px-4 rounded-full bg-primary text-on-primary font-label-md text-label-md shrink-0 shadow-sm flex items-center gap-1.5 active:scale-95 transition-transform";
      } else {
        btn.className = "activity-filter-chip h-9 px-3.5 rounded-full bg-surface-container-lowest text-on-surface font-label-md text-label-md shrink-0 shadow-sm flex items-center gap-1 hover:bg-surface-container transition-colors";
      }
    });

    this.renderActivityView();
  }

  handleSearch(query) {
    this.liveData.searchQuery = query;
    this.renderActivityView();
  }

  exportCSV() {
    this.playSound('click');
    const headers = ['ID', 'Date', 'Type', 'Amount (INR)', 'Category', 'Merchant', 'Payment Method', 'Note'];
    const rows = this.liveData.transactions.map(t => [
      t.id,
      new Date(t.transactionDate).toISOString().split('T')[0],
      t.type,
      t.amountRupees || (t.amount / 100),
      `"${t.category?.name || t.category || ''}"`,
      `"${(t.merchant || t.title || '').replace(/"/g, '""')}"`,
      `"${t.paymentMethod || 'UPI'}"`,
      `"${(t.note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SmartSpend_Live_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.showToast('Downloaded real-time transaction ledger (CSV)');
  }

  // --- SmartSpend AI Assistant (Live Server Grounding) ---
  openAiAssistant() {
    this.playSound('click');
    const modal = document.getElementById('aiAssistantModal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }

  closeAiAssistant() {
    this.playSound('click');
    const modal = document.getElementById('aiAssistantModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  async askAiPrompt(promptText) {
    this.playSound('click');
    const chatContainer = document.getElementById('ai-chat-messages');
    if (!chatContainer) return;

    // Append user message
    const userMsg = document.createElement('div');
    userMsg.className = "flex justify-end";
    userMsg.innerHTML = `
      <div class="bg-primary text-on-primary rounded-2xl rounded-tr-xs p-3 max-w-[85%] font-body-sm shadow-sm">
        ${this.escapeHTML(promptText)}
      </div>
    `;
    chatContainer.appendChild(userMsg);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // AI typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = "flex items-start gap-2";
    typingIndicator.innerHTML = `
      <div class="w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
        <span class="material-symbols-outlined text-[16px] animate-spin">sync</span>
      </div>
      <div class="bg-surface-container-low text-on-surface rounded-2xl rounded-tl-xs p-3 max-w-[85%] font-body-sm">
        Computing live calculations with SmartSpend AI...
      </div>
    `;
    chatContainer.appendChild(typingIndicator);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    try {
      const res = await this.api.chatAi(promptText);
      typingIndicator.remove();

      let reply = 'Here is your real-time ledger status:';
      if (res.success && res.data && res.data.answer) {
        reply = res.data.answer;
      }

      const aiMsg = document.createElement('div');
      aiMsg.className = "flex items-start gap-2";
      aiMsg.innerHTML = `
        <div class="w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-[16px]">auto_awesome</span>
        </div>
        <div class="bg-surface-container text-on-surface rounded-2xl rounded-tl-xs p-3 max-w-[85%] font-body-sm space-y-1">
          <p>${this.formatAiMarkdown(reply)}</p>
        </div>
      `;
      chatContainer.appendChild(aiMsg);
      chatContainer.scrollTop = chatContainer.scrollHeight;
      this.playSound('click');
    } catch (err) {
      typingIndicator.remove();
      this.showToast('AI response error. Try again.');
    }
  }

  formatAiMarkdown(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  }

  // --- Notifications Modal (Live Data) ---
  openNotifications() {
    this.playSound('click');
    const modal = document.getElementById('notificationsModal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }

  closeNotifications() {
    this.playSound('click');
    const modal = document.getElementById('notificationsModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  async markAllNotificationsRead() {
    this.playSound('click');
    try {
      await this.api.markAllNotificationsRead();
      this.liveData.notifications.forEach(n => n.isRead = true);
      this.renderNotifications();
      this.updateNotificationBadges(0);
      this.showToast('All notifications marked as read');
    } catch (e) {
      this.showToast('Error marking notifications as read');
    }
  }

  renderNotifications() {
    const listEl = document.getElementById('notifications-list');
    if (!listEl) return;

    if (this.liveData.notifications.length === 0) {
      listEl.innerHTML = '<div class="p-6 text-center text-on-surface-variant font-body-sm">No new notifications</div>';
      return;
    }

    listEl.innerHTML = this.liveData.notifications.map(n => `
      <div class="flex items-start gap-3 p-3.5 rounded-xl ${!n.isRead ? 'bg-secondary-container/15' : 'bg-surface-container-low'} transition-colors">
        <div class="w-9 h-9 rounded-full ${!n.isRead ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container text-on-surface-variant'} flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-[18px]">${this.getNotificationIcon(n.type)}</span>
        </div>
        <div class="flex flex-col flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <span class="font-title-md text-title-md text-on-surface font-semibold text-[14px] truncate">${this.escapeHTML(n.title)}</span>
            <span class="font-label-sm text-label-sm text-on-surface-variant">${n.timeAgo || 'Recent'}</span>
          </div>
          <p class="font-body-sm text-body-sm text-on-surface-variant mt-0.5 leading-snug">${this.escapeHTML(n.message)}</p>
        </div>
      </div>
    `).join('');
  }

  getNotificationIcon(type) {
    switch (type) {
      case 'BUDGET_WARNING': return 'notifications_active';
      case 'RECURRING_DUE': return 'subscriptions';
      case 'TRANSACTION_LOGGED': return 'receipt';
      case 'INSIGHT_READY': return 'auto_awesome';
      default: return 'notifications';
    }
  }

  updateNotificationBadges(unreadCount) {
    const b1 = document.getElementById('header-unread-badge');
    const b2 = document.getElementById('home-unread-badge');

    if (unreadCount > 0) {
      if (b1) b1.classList.remove('hidden');
      if (b2) b2.classList.remove('hidden');
    } else {
      if (b1) b1.classList.add('hidden');
      if (b2) b2.classList.add('hidden');
    }
  }

  // --- Profile Screen Settings & Actions ---
  async updateMonthlyLimitPrompt() {
    const current = this.liveData.dashboard?.monthlyBudget?.amountLimitRupees || 45000;
    const input = prompt('Enter your new monthly spend target (INR):', current);
    if (input !== null) {
      const val = parseInt(input, 10);
      if (!isNaN(val) && val > 0) {
        try {
          const res = await this.api.setBudget({
            name: 'Monthly Budget',
            amountLimit: val,
            period: 'monthly',
          });
          if (res.success) {
            await this.syncRealtimeData();
            this.showToast(`Updated monthly limit to ${this.formatINR(val)}`);
          }
        } catch (e) {
          this.showToast('Error updating budget');
        }
      } else {
        this.showToast('Please enter a valid number');
      }
    }
  }

  updateDailyLimitPrompt() {
    this.showToast('Daily allowance is calculated dynamically based on remaining days');
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    const soundToggle = document.getElementById('profile-sound-status');
    if (soundToggle) soundToggle.textContent = this.soundEnabled ? 'On' : 'Muted';
    const desktopSound = document.getElementById('desktop-sound-status');
    if (desktopSound) desktopSound.textContent = this.soundEnabled ? 'Sound' : 'Muted';
    this.showToast(`Sound feedback: ${this.soundEnabled ? 'Enabled' : 'Muted'}`);
  }

  toggleDeviceFrame() {
    const container = document.getElementById('app-device-wrapper');
    const toggleBtnText = document.getElementById('frame-toggle-label');
    if (!container) return;

    if (container.classList.contains('device-frame-mode')) {
      container.classList.remove('device-frame-mode');
      container.classList.add('device-fluid-mode');
      this.frameMode = 'fluid';
      if (toggleBtnText) toggleBtnText.textContent = 'Phone Frame';
    } else {
      container.classList.remove('device-fluid-mode');
      container.classList.add('device-frame-mode');
      this.frameMode = 'frame';
      if (toggleBtnText) toggleBtnText.textContent = 'Full Screen';
    }
  }

  updateProfileUI(user) {
    if (!user) return;
    const nameEls = document.querySelectorAll('#view-profile h2, #home-greeting-heading');
    nameEls.forEach(el => {
      if (el.id === 'home-greeting-heading') {
        el.textContent = `Good afternoon, ${user.name.split(' ')[0]} 👋`;
      }
    });

    const monthlyLimitEl = document.getElementById('profile-monthly-limit');
    if (monthlyLimitEl && this.liveData.dashboard?.monthlyBudget) {
      monthlyLimitEl.textContent = this.liveData.dashboard.monthlyBudget.amountLimitFormatted;
    }
    const dailyLimitEl = document.getElementById('profile-daily-limit');
    if (dailyLimitEl && this.liveData.dashboard?.todaySpending) {
      dailyLimitEl.textContent = this.liveData.dashboard.todaySpending.dailyTargetFormatted;
    }
  }

  // --- Toast Feedback ---
  showToast(message) {
    const toast = document.getElementById('appToast');
    const msgEl = document.getElementById('toastMessage');
    if (!toast || !msgEl) return;

    msgEl.textContent = message;
    toast.classList.remove('translate-y-[-100px]', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-[-100px]', 'opacity-0');
    }, 2800);
  }

  formatRelativeDate(dateVal) {
    if (!dateVal) return 'Today';
    const d = new Date(dateVal);
    const now = new Date();

    if (d.toDateString() === now.toDateString()) return 'Today';
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';

    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  formatDateGroup(dateVal) {
    if (!dateVal) return 'Today';
    const d = new Date(dateVal);
    const now = new Date();

    if (d.toDateString() === now.toDateString()) return 'Today';
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';

    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
  }

  formatTime(dateVal) {
    if (!dateVal) return '12:00 PM';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return String(dateVal);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return String(dateVal);
    }
  }

  escapeHTML(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  renderAll() {
    this.renderHomeView();
    this.renderActivityView();
    this.renderInsightsView();
    this.renderNotifications();
  }

  bindEvents() {
    const searchInput = document.getElementById('activitySearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    }

    const aiForm = document.getElementById('ai-input-form');
    const aiInput = document.getElementById('ai-text-input');
    if (aiForm && aiInput) {
      aiForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = aiInput.value.trim();
        if (text) {
          this.askAiPrompt(text);
          aiInput.value = '';
        }
      });
    }

    // Period selector in Insights
    document.querySelectorAll('#period-selector button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#period-selector button').forEach(b => {
          b.className = 'flex-1 py-1.5 px-3 rounded-full text-center font-label-md text-label-md text-on-surface-variant transition-all hover:text-on-surface';
        });
        btn.className = 'flex-1 py-1.5 px-3 rounded-full text-center font-label-md text-label-md bg-primary text-on-primary shadow-sm transition-all';
        this.updateTrajectoryChart();
        this.playSound('click');
      });
    });
  }
}

// Global instance declaration for inline HTML event handlers
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new SmartSpendApp();
  window.app = app;
});
