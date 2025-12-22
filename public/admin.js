const API_URL = '/api'; // Relative path for Nginx proxy

// Check auth
const token = localStorage.getItem('accessToken');
const role = localStorage.getItem('role');
const username = localStorage.getItem('username');

// Allow if role is admin OR username is admin (fallback)
if (!token || (role !== 'admin' && username !== 'admin')) {
    alert('Access denied. Admins only.');
    window.location.href = 'index.html';
}

function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    window.location.href = 'index.html';
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById(`${tabName}-tab`).classList.add('active');
    // Find button (simple logic)
    const btns = document.querySelectorAll('.tab-btn');
    if(tabName === 'users') btns[0].classList.add('active');
    if(tabName === 'products') btns[1].classList.add('active');

    if(tabName === 'users') loadUsers();
    if(tabName === 'products') loadProducts();
}

// Fetch Helper
async function authFetch(url, options = {}) {
    options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
    
    const res = await fetch(url, options);
    if (res.status === 401 || res.status === 403) {
        alert('Session expired or unauthorized');
        logout();
        return null;
    }
    return res;
}

// Users
async function loadUsers() {
    const res = await authFetch(`${API_URL}/users`);
    if(!res) return;
    const users = await res.json();
    
    const html = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>用户名</th>
                    <th>角色</th>
                    <th>注册时间</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(u => `
                    <tr>
                        <td>${u.id}</td>
                        <td>${u.username}</td>
                        <td><span class="badge ${u.role === 'admin' ? 'badge-admin' : 'badge-user'}">${u.role === 'admin' ? '管理员' : '用户'}</span></td>
                        <td>${new Date(u.created_at).toLocaleString('zh-CN')}</td>
                        <td>
                            ${u.role !== 'admin' ? `<button class="action-btn delete-btn" onclick="deleteUser(${u.id})">删除</button>` : '-'}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    document.getElementById('users-list').innerHTML = html;
}

async function deleteUser(id) {
    if(!confirm('确定要删除该用户吗？此操作无法撤销。')) return;
    
    const res = await authFetch(`${API_URL}/users/${id}`, { method: 'DELETE' });
    if(res && res.ok) {
        loadUsers();
    } else {
        alert('删除用户失败');
    }
}

// Products
async function loadProducts() {
    const res = await authFetch(`${API_URL}/products`);
    if(!res) return;
    const products = await res.json();

    const html = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>商品名称</th>
                    <th>价格</th>
                    <th>分类</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                ${products.map(p => `
                    <tr>
                        <td>${p.id}</td>
                        <td class="product-name-cell">${p.name}</td>
                        <td class="price-cell">¥${p.price}</td>
                        <td><span class="badge badge-category">${p.category || '未分类'}</span></td>
                        <td>
                            <button class="action-btn delete-btn" onclick="deleteProduct(${p.id})">下架</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    document.getElementById('products-list').innerHTML = html;
}

async function deleteProduct(id) {
    if(!confirm('确定要下架该商品吗？')) return;

    const res = await authFetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
    if(res && res.ok) {
        loadProducts();
    } else {
        alert('删除商品失败');
    }
}

// Add Product
document.getElementById('add-product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('prod-name').value;
    const price = document.getElementById('prod-price').value;
    const category = document.getElementById('prod-category').value;
    const description = document.getElementById('prod-desc').value;

    const res = await authFetch(`${API_URL}/products`, {
        method: 'POST',
        body: JSON.stringify({ name, price, category, description })
    });

    if(res && res.ok) {
        alert('商品添加成功！');
        document.getElementById('add-product-form').reset();
        loadProducts();
    } else {
        alert('添加商品失败');
    }
});

// Init
loadUsers();