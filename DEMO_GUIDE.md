# 🎓 迷你电商后端演示指南 (Demo Guide)

如果面试官或老师要求查看“后端完成情况”，请按照以下步骤进行展示。这能体现你对全栈流程的理解。

## 第一步：展示 API 与鉴权 (Network 面板)
**目的**：证明前后端分离，API 是 RESTful 的，且使用了 JWT。

1. 打开浏览器按 `F12` 打开开发者工具，切换到 **Network (网络)** 标签页。
2. 刷新页面，在过滤器中点击 **Fetch/XHR**。
3. **展示点 1：JWT 流程**
   - 进行一次“登录”操作。
   - 点击 `login` 请求，查看 **Response**：
     - 指出 `accessToken` 和 `refreshToken` 字段。
     - 解释：“这是后端生成的 JWT 令牌，包含用户信息。”
4. **展示点 2：请求头鉴权**
   - 登录后，刷新页面，点击 `products` 请求。
   - 查看 **Headers** -> **Request Headers**。
   - 指出 `Authorization: Bearer ...`。
   - 解释：“前端在请求头中携带了 Token，后端中间件会验证这个 Token 确认身份。”

## 第二步：展示 Nginx 反向代理与缓存
**目的**：证明 Nginx 在工作，不仅仅是 Node.js。

1. **展示点 1：反向代理**
   - 依然在 Network 面板，点击 `products` 请求。
   - 查看 **Headers** -> **Response Headers**。
   - 指出 `Server: nginx` (或者看 Remote Address 端口是 80 而不是 3000)。
   - 解释：“浏览器访问的是 Nginx 的 80 端口，Nginx 帮我们把请求转发到了 Node.js 的 3000 端口。”
2. **展示点 2：静态资源缓存**
   - 切换过滤器到 **Img (图片)**。
   - 刷新页面两次。
   - 指出图片状态码为 `304 Not Modified` 或 `(disk cache)`。
   - 解释：“这是我在 Nginx 配置的静态缓存，第二次访问不需要消耗后端流量，直接从浏览器读取。”

## 第三步：展示 MySQL 数据持久化
**目的**：证明数据是真的存进去了，不是写死的。

1. 在终端运行演示脚本：
   ```bash
   node scripts/show-db-status.js
   ```
2. **展示点 1：实时数据**
   - 给你注册的用户点几个收藏。
   - 再次运行脚本，收藏列表会增加。
   - 解释：“这是直接查询 MySQL 数据库的结果，证明我们的 CRUD 操作是真实生效的。”

## 第四步：代码结构 (可选)
如果对方想看代码，重点展示这三个文件：

1. **`routes/productRoutes.js`**：展示 RESTful 路由定义 (`router.get('/', ...)`).
2. **`middleware/authMiddleware.js`**：展示 JWT 验证逻辑 (`jwt.verify`).
3. **`nginx.conf`**：展示 `location /api/` 的 `proxy_pass` 配置。
