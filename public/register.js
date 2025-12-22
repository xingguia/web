const API_URL = '/api';

async function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const msg = document.getElementById('auth-message');
    const submitBtn = event.target.querySelector('button[type="submit"]');

    // Basic client-side validation
    if (!username || !phone || !email || !password) {
        msg.textContent = '请填写所有字段';
        msg.className = 'message error';
        return;
    }

    try {
        submitBtn.disabled = true;
        submitBtn.textContent = '注册中...';

        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, email, phone })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            msg.textContent = '注册成功！正在跳转登录页...';
            msg.className = 'message success';
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            msg.textContent = data.message;
            msg.className = 'message error';
            submitBtn.disabled = false;
            submitBtn.textContent = '立即注册';
        }
    } catch (err) {
        msg.textContent = '注册请求失败，请稍后重试';
        msg.className = 'message error';
        console.error(err);
        submitBtn.disabled = false;
        submitBtn.textContent = '立即注册';
    }
}
