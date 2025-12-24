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

// Init load
document.addEventListener('DOMContentLoaded', () => {
    // Determine active tab or default to users
    // For simplicity, just load users if it's the active tab (which it is by default in HTML)
    loadUsers();
});

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
    // Add timestamp to prevent caching
    const res = await authFetch(`${API_URL}/users?_t=${Date.now()}`);
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
                            <button class="action-btn btn-view" onclick="toggleDetails(${u.id})">详情</button>
                            ${u.role !== 'admin' ? `<button class="action-btn delete-btn" onclick="deleteUser(${u.id})">删除</button>` : '-'}
                        </td>
                    </tr>
                    <tr id="details-${u.id}" class="details-row" style="display: none;">
                        <td colspan="5">
                            <div class="details-content">
                                <div class="details-item">
                                    <strong>邮箱</strong>
                                    ${u.email || '未绑定'}
                                </div>
                                <div class="details-item">
                                    <strong>手机号</strong>
                                    ${u.phone || '未绑定'}
                                </div>
                                <div class="details-item">
                                    <strong>密码</strong>
                                    <span style="font-family:monospace; word-break:break-all;">${u.password || '******'}</span>
                                </div>
                                <div class="details-item">
                                    <strong>账号状态</strong>
                                    <span style="color: green">正常</span>
                                </div>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    document.getElementById('users-list').innerHTML = html;
}

function toggleDetails(userId) {
    const row = document.getElementById(`details-${userId}`);
    if (row.style.display === 'table-row') {
        row.style.display = 'none';
    } else {
        // Close others (optional)
        document.querySelectorAll('.details-row').forEach(r => r.style.display = 'none');
        row.style.display = 'table-row';
    }
}

// Modal Functions
function openRegisterModal() {
    document.getElementById('register-modal').classList.add('active');
}

function closeRegisterModal() {
    document.getElementById('register-modal').classList.remove('active');
}

async function handleAdminRegister(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Basic validation
    if (!data.username || !data.password || !data.email || !data.phone) {
        alert('所有字段都是必填的');
        return;
    }

    try {
        // Reuse the public register API but since we are admin, we might want a specific one.
        // For simplicity, we use the public one. To support "role" assignment, 
        // normally we need a protected admin create route.
        // Let's assume we want to support role assignment, we should use a different endpoint or modify the register endpoint.
        // BUT, standard requirement usually implies admin creates user.
        // Let's use the public /auth/register first, but that doesn't allow setting ROLE.
        // So we will modify this to use a new admin-only create user route or just client-side register for now.
        // Wait, the user asked "admin can register account".
        // Let's try to call /auth/register. If we need role, we need backend support.
        // For now, let's just register a "user" or "admin" if backend supports it.
        // Actually, let's create a new route in userController or just use /auth/register and manually update role if needed?
        // Better: create a new API endpoint in userController for admin to create user.
        
        // However, I can't easily add a new route without editing routes file.
        // Let's check if I can edit routes. Yes I can.
        // But to save time and complexity, I will use the existing /auth/register
        // AND if the role is 'admin', I might need to do a SQL update manually or add a specific route.
        // Let's add a specific route `POST /users` in userController which is RESTful.
        
        const res = await authFetch(`${API_URL}/users`, {
            method: 'POST',
            body: JSON.stringify(data)
        });

        if (res && res.ok) {
            alert('用户注册成功！');
            closeRegisterModal();
            form.reset();
            loadUsers();
        } else {
            const err = await res.json();
            alert('注册失败: ' + (err.message || '未知错误'));
        }
    } catch (e) {
        console.error(e);
        alert('注册出错');
    }
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