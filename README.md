# 10w项目

10w项目是一个多页面展示项目，包含了如爱心粒子动画、Canvas动画板、文字雨动画等页面, 提供点击跳转以及二维码扫描访问。

![alt text](public/image.png)

## 安装与运行

### 环境要求

- Node.js >= 22.0.0
- pnpm >= 7.0.0

### 安装依赖

```bash
pnpm install
```

### 开发运行

```bash
pnpm dev
```

默认会打开首页: http://localhost:5173/pages/home/index.html

### 构建项目

```bash
pnpm build
```

构建后的文件将位于 `dist/` 目录中。

### 预览构建结果

```bash
pnpm preview
```

## 页面详情

### 首页 (/pages/home/)
项目入口页面，展示所有特效页面的卡片，支持二维码生成和页面跳转。

### 爱心点缀 (/pages/love/)
使用Canvas实现的浪漫爱心粒子动画效果，支持通过URL参数传递名称显示。

### 圣诞树动画 (/pages/chris/)
使用GSAP动画库实现的精美圣诞树绘制动画。

### 喜庆灯笼 (/pages/festive-lanterns/)
传统节日灯笼的绘制动画效果。

### Canvas动画板 (/pages/drwa-borad/)
交互式Canvas绘图板，支持：
- 多种线条粗细选择
- 多种颜色选择
- 清空画板
- 保存图像

### 文字雨动画 (/pages/word-rain/)
经典的黑客帝国风格文字雨动画效果。

## 开发说明

项目采用多页面应用(MPA)架构，通过Vite配置自动扫描`pages`目录下的所有`index.html`文件作为入口点。

### 添加新页面

1. 在`pages`目录下创建新文件夹
2. 在文件夹内创建`index.html`文件
3. Vite会自动将其识别为一个新的入口点

### 项目配置

- **Vite配置**: `vite.config.ts`中配置了多页面入口自动扫描功能
- **TypeScript配置**: `tsconfig.json`中配置了编译选项
- **样式重置**: `styles/reset.css`提供了基础样式重置

## 依赖说明

主要依赖：
- `qrcode`: 用于生成二维码
- `vite`: 构建工具
- `typescript`: 类型检查

开发依赖：
- `rolldown-vite`: Vite的Rollup替代版本

## 浏览器兼容性

项目使用了现代Web技术，推荐在以下浏览器中使用：
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 许可证

本项目为开源项目，可用于学习和参考。

## 贡献

欢迎提交Issue和Pull Request来改进项目。
</file>
