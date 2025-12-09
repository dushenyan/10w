# 豪华EZEX圣诞树

一个基于React 19、TypeScript和Three.js（R3F）的高保真3D圣诞树Web应用。

## 特性

### 视觉效果
- **特朗普式奢华风格**：深祖母绿和高光金色主色调，搭配电影级辉光效果
- **3D针叶系统**：使用THREE.Points和自定义ShaderMaterial渲染大量粒子
- **多样装饰物**：包含礼物盒、彩球和点缀灯光
- **拍立得照片装饰**：树上分布着拍立得样式的照片

### 核心功能
- **双状态系统**：CHAOS（散落）和FORMED（聚合成树）两种状态
- **双坐标系统**：每个元素都有ChaosPosition（混乱位置）和TargetPosition（目标位置）
- **平滑插值动画**：状态之间的转换使用Lerp实现丝滑过渡

### 交互功能
- **手动控制**：通过按钮切换两种状态
- **手势检测**：支持摄像头手势识别（手掌张开为CHAOS，闭合为FORMED）
- **3D视角控制**：支持鼠标拖动和缩放

## 技术栈

- React 19
- TypeScript
- Three.js
- React Three Fiber
- Drei（React Three Fiber辅助库）
- Postprocessing（后期处理效果）

## 访问方式

打开 [http://localhost:3000/pages/christmas-tree/simple.html](http://localhost:3000/pages/christmas-tree/simple.html) 查看应用

## 开发说明

1. 安装依赖：`pnpm install`
2. 启动开发服务器：`pnpm dev`
3. 访问页面查看效果

## 系统状态说明

### CHAOS（散落）
- 所有元素在球形空间内随机分布
- 装饰物和照片位置分散
- 手势检测：手掌张开

### FORMED（聚合成树）
- 所有元素组成圆锥形圣诞树
- 装饰物和照片在树体表面分布
- 手势检测：手掌闭合

## 文件结构

```
pages/christmas-tree/
├── index.html      # React JSX版本入口
├── index.tsx       # React JSX组件实现
├── main.html       # 优化版HTML入口
├── simple.html      # 原生Three.js版本入口
├── simple.js       # 原生Three.js实现
└── README.md       # 本说明文件
```