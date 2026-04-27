# 部署指南

## 方式一: GitHub Pages (推荐)

### 步骤1: 创建GitHub仓库

1. 访问 https://github.com/new
2. 输入仓库名称,例如 `daily-task-tracker`
3. 选择 Public (公开)
4. 点击 "Create repository"

### 步骤2: 上传文件

#### 方法A: 使用Git命令

```bash
# 进入项目目录
cd daily-task-tracker

# 初始化Git仓库
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"

# 关联远程仓库(替换为你的仓库地址)
git remote add origin https://github.com/你的用户名/daily-task-tracker.git

# 推送到GitHub
git branch -M main
git push -u origin main
```

#### 方法B: 手动上传

1. 在GitHub仓库页面点击 "uploading an existing file"
2. 拖拽所有文件到上传区域
3. 点击 "Commit changes"

### 步骤3: 启用GitHub Pages

1. 进入仓库的 Settings 页面
2. 左侧菜单找到 Pages
3. 在 "Source" 下选择:
   - Branch: main
   - Folder: / (root)
4. 点击 Save

### 步骤4: 访问在线应用

等待1-2分钟,刷新页面后会显示访问链接,格式为:
```
https://你的用户名.github.io/daily-task-tracker/
```

将这个链接分享给朋友即可!

---

## 方式二: 本地使用

直接双击 `index.html` 文件,在浏览器中打开即可使用。

---

## 方式三: 其他静态托管服务

### Netlify

1. 访问 https://www.netlify.com/
2. 拖拽项目文件夹到部署区域
3. 获得在线链接

### Vercel

1. 访问 https://vercel.com/
2. 导入GitHub仓库或上传文件
3. 自动部署并获得链接

### Gitee Pages (国内)

1. 在Gitee创建仓库并上传代码
2. 进入仓库 → Service → Gitee Pages
3. 选择分支和目录,点击启动

---

## 注意事项

1. **数据隐私**: 所有数据存储在用户浏览器本地,不同设备之间不共享
2. **备份提醒**: 提醒用户定期导出数据备份
3. **浏览器兼容**: 建议使用Chrome、Edge、Firefox等现代浏览器
4. **HTTPS**: GitHub Pages自动提供HTTPS,保证安全访问

---

## 自定义域名 (可选)

如果想使用自己的域名:

1. 在仓库 Settings → Pages 中设置 Custom domain
2. 按照提示配置DNS记录
3. 等待DNS生效

---

## 故障排除

**问题**: GitHub Pages部署后访问404

**解决**:
- 确认文件已正确上传到仓库
- 检查Pages设置是否正确
- 等待几分钟让部署生效

**问题**: 样式或脚本加载失败

**解决**:
- 检查文件路径是否正确
- 确认所有文件都已上传
- 清除浏览器缓存后重试
