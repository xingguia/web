const API_URL = 'http://localhost:3000'; // 如果使用 Nginx 代理，这里可以改成 '/api'

// State
let accessToken = localStorage.getItem('accessToken');
let refreshToken = localStorage.getItem('refreshToken');
let currentUser = localStorage.getItem('username');

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
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('product-section').style.display = 'none';
    document.getElementById('user-info').style.display = 'none';
}

function showProductSection() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('product-section').style.display = 'block';
    document.getElementById('user-info').style.display = 'block';
    document.getElementById('username-display').textContent = `你好, ${currentUser}`;
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
async function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const msg = document.getElementById('auth-message');

    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        
        if (res.ok) {
            msg.textContent = '注册成功，请登录';
            msg.className = 'message success';
        } else {
            msg.textContent = data.message;
            msg.className = 'message error';
        }
    } catch (err) {
        msg.textContent = '请求失败';
        msg.className = 'message error';
    }
}

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
            currentUser = username;
            
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('username', username);
            
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
            ? `<button class="btn-fav" style="background-color: #e63946;" onclick="removeFromFavorites(${p.id})">❌ Remove</button>`
            : `<button class="btn-fav" onclick="addToFavorites(${p.id})">❤ Favorite</button>`;

        card.innerHTML = `
            <img src="${p.image_url || '/images/default.svg'}" alt="${p.name}" class="product-image" onerror="this.src='/images/default.svg'">
            <div class="product-info">
                <h3>${p.name}</h3>
                <p>${p.description}</p>
                <div class="product-meta">
                    <span class="price">$${p.price}</span>
                    <span class="category">${p.category}</span>
                </div>
                <div class="product-actions">
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
