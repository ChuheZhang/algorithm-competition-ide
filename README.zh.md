# Algorithm Competition IDE

## 项目概述
这是一个为算法竞赛设计的集成开发环境（IDE），旨在提供一个方便的在线平台，让用户可以编写、运行和测试代码，布局类似于 Codeforces 或 LeetCode 等竞赛平台。该项目前端使用 Vue.js 构建，后端使用 Node.js 处理代码执行。

## 功能特性

- **代码编辑器**：支持 C++、JavaScript 和 Python 的语法高亮和格式化。
- **一键代码执行**：通过后端运行代码，显示即时结果，支持自定义输入。
- **分屏布局**：提供可调节的布局，包括问题描述、代码编辑器、输入和输出区域。
- **实时问题加载**：动态加载题目描述并显示在问题描述区域。
- **输出验证**：自动检查代码输出是否与目标输出匹配，匹配时显示绿色，否则显示红色。

## 安装

### 先决条件
- **Node.js**（18 版本或更高）
- **npm**

### 安装步骤
1. **克隆仓库**：
   ```bash
   git clone https://github.com/ChuheZhang/algorithm-competition-ide.git
   cd algorithm-competition-ide
   ```

2. **安装依赖**：
   分别进入 frontend 和 backend 目录安装所需依赖。
   ```bash
   cd frontend
   npm install
   ```
   后端：
   ```bash
   cd ../backend
   npm install
   ```

3. **运行项目**：
   - 启动后端服务器：
     ```bash
     node server.js
     ```
   - 启动前端开发服务器：
     ```bash
     npm run dev
     ```

4. **访问应用**：
   在浏览器中打开 `http://localhost:5173`。

## 使用方法

1. **选择语言**：在下拉菜单中选择 C++、JavaScript 或 Python。
2. **编写代码**：在编辑器中输入代码，编辑器提供语法高亮和格式化支持。
3. **输入和运行**：输入自定义输入数据，然后点击“运行代码”按钮。
4. **查看输出**：将输出与目标输出对比，匹配时输出区域变绿，否则变红。

## 项目结构

```
algorithm-competition-ide/
|
|-- backend/               # 后端服务器逻辑
|   |-- server.js          # 主后端服务器文件
|
|-- frontend/              # 基于 Vue 的前端界面
|   |-- src/
|       |-- App.vue        # IDE 布局的主组件
|   |-- vite.config.js     # Vite 配置
|
|-- README.md              # 项目文档
```

## 许可证

本项目基于 MIT 许可证开源。

此 README 提供英文和中文版本：
- **[English Version](README.md)**
- **[中文版本](README.zh.md)**

**神始终与你同在！**

--- 
