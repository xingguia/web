const API_URL = '/api'; // Use relative path so it works with Nginx proxy on any domain

// State
let accessToken = localStorage.getItem('accessToken');
let refreshToken = localStorage.getItem('refreshToken');
let currentUser = localStorage.getItem('username');
let currentRole = localStorage.getItem('role');

// Init
document.addEventListener('DOMContentLoaded', () => {
    if (accessToken) {
        showProductSection();
    } else {
        showAuthSection();
    }
});

async function fetchWithAuth(url, options = {}) {
    if (!options.headers) options.headers = {};
    options.headers['Authorization'] = `Bearer ${accessToken}`;

    let res = await fetch(url, options);

    if (res.status === 401 || res.status === 403) {
        // Token expired, try refresh
        const refreshed = await tryRefreshToken();
        if (refreshed) {
            // Retry original request with new token
            options.headers['Authorization'] = `Bearer ${accessToken}`;
            res = await fetch(url, options);
        } else {
            logout();
            throw new Error('Session expired');
        }
    }
    
    return res;
}

async function tryRefreshToken() {
    try {
        const res = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: refreshToken })
        });
        
        if (res.ok) {
            const data = await res.json();
            accessToken = data.accessToken;
            localStorage.setItem('accessToken', accessToken);
            return true;
        }
    } catch (err) {
        console.error('Refresh token failed', err);
    }
    return false;
}

function showAuthSection() {
    // Reset display to allow CSS flexbox to take effect
    document.getElementById('auth-section').style.display = '';
    document.getElementById('product-section').style.display = 'none';
    document.getElementById('user-info').style.display = 'none';
}

function showProductSection() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('product-section').style.display = 'block';
    document.getElementById('user-info').style.display = 'block';
    document.getElementById('username-display').textContent = `你好, ${currentUser}`;

    // Show admin link if user is admin
    const adminLink = document.getElementById('admin-link');
    if (adminLink) {
        // Strict check: Only trust the role returned by the server
        if (currentRole === 'admin') {
            adminLink.style.display = 'inline-block';
        } else {
            adminLink.style.display = 'none';
        }
    }

    loadProducts();
}

async function showFavorites() {
    const container = document.getElementById('product-list');
    container.innerHTML = '<p>加载中...</p>';
    
    try {
        const res = await fetchWithAuth(`${API_URL}/favorites`);
        if (res.ok) {
            const products = await res.json();
            renderProducts(products, true);
        }
    } catch (err) {
        console.error(err);
    }
}

// Auth Functions
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const msg = document.getElementById('auth-message');

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();

        if (res.ok) {
            accessToken = data.accessToken;
            refreshToken = data.refreshToken;
            currentUser = data.username || username; // Use returned username or input
            currentRole = data.role; // Store role
            
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('username', currentUser);
            localStorage.setItem('role', currentRole);
            
            msg.textContent = '';
            showProductSection();
        } else {
            msg.textContent = data.message;
            msg.className = 'message error';
        }
    } catch (err) {
        msg.textContent = '登录失败';
        msg.className = 'message error';
    }
}

function logout() {
    accessToken = null;
    refreshToken = null;
    currentUser = null;
    localStorage.clear();
    showAuthSection();
}

// Product Functions
async function loadProducts() {
    const search = document.getElementById('search-input').value;
    const category = document.getElementById('category-select').value;
    
    let url = `${API_URL}/products?`;
    if (search) url += `search=${encodeURIComponent(search)}&`;
    if (category) url += `category=${encodeURIComponent(category)}`;

    try {
        const res = await fetchWithAuth(url);
        if (res.ok) {
            const products = await res.json();
            renderProducts(products);
        }
    } catch (err) {
        console.error('Failed to load products', err);
    }
}

function renderProducts(products, isFavorites = false) {
    const container = document.getElementById('product-list');
    container.innerHTML = '';

    if (products.length === 0) {
        container.innerHTML = '<p>没有找到商品</p>';
        return;
    }

    products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        const actionBtn = isFavorites 
            ? `<button class="btn-fav btn-remove" onclick="removeFromFavorites(${p.id})">❌ 移除</button>`
            : `<button class="btn-fav" onclick="addToFavorites(${p.id})">❤ 收藏</button>`;

        card.innerHTML = `
            <img src="${p.image_url || '/images/default.svg'}" alt="${p.name}" class="product-image" onerror="this.src='/images/default.svg'">
            <div class="product-info">
                <h3>${p.name}</h3>
                <p>${p.description || '暂无描述'}</p>
                <div class="product-footer">
                    <span class="price">¥${parseFloat(p.price).toFixed(2)}</span>
                    ${actionBtn}
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

async function addToFavorites(productId) {
    try {
        const res = await fetchWithAuth(`${API_URL}/favorites/${productId}`, {
            method: 'POST'
        });
        if (res.ok) {
            alert('已加入收藏');
        } else {
            alert('添加失败或已在收藏夹中');
        }
    } catch (err) {
        console.error(err);
    }
}

async function removeFromFavorites(productId) {
    try {
        const res = await fetchWithAuth(`${API_URL}/favorites/${productId}`, {
            method: 'DELETE'
        });
        if (res.ok) {
            showFavorites(); // Refresh list
        }
    } catch (err) {
        console.error(err);
    }
}
