# Agent Handoff Portfolio Σ

一个面向 AI Agent 应用工程岗位的个人作品集/理念站。

## 核心叙事
**“记录人类接力棒传递全过程”**

这不是聊天截图相册，而是一份正在发生的人机交接观察：当人类把经验写成上下文，把流程交给工具，把重复行动交给 Agent，我们如何重新定义自己在 AI 时代的位置。

## 项目结构
- `index.html`: 总览。用一个集中的控制台 UI 展示理念框架、代表性证据、核心项目线索和边界原则。
- `diary.html`: 日记存档。用于承载几十张脱敏截图，按日期记录真实的交接证据。
- `data/diary.json`: 日记数据管理中心。
- `scripts/diary.js`: 日记流动态渲染逻辑。
- `styles.css`: 采用 "Engineer Archive" 设计风格的全局样式。
- `assets/screenshots/`: 存放脱敏后的截图证据。

## 如何添加新记录
1. **脱敏截图**: 将截图证据放入 `assets/screenshots/`，确保隐藏所有敏感信息。
2. **编辑数据**: 在 `data/diary.json` 中添加一个新对象：
   ```json
   {
     "id": "unique-id",
     "date": "YYYY-MM-DD",
     "title": "记录标题",
     "type": "类型(engineering/reflection/etc)",
     "tags": ["标签1", "标签2"],
     "summary": "简短摘要",
     "notes": ["关键点1", "关键点2"],
     "screenshots": [
       { "src": "./assets/screenshots/your-image.png", "caption": "截图描述" }
     ]
   }
   ```
3. **预览**: 使用本地 HTTP 服务预览，例如 `python -m http.server 8080`。

## 设计原则
- **专业克制**: 避免花哨装饰，保持工程师档案的清晰与可信。
- **叙事优先**: 每一张截图都必须体现“交接”的过程或复盘。
- **脱敏第一**: 严禁上传包含密钥、个人隐私或公司机密代码的原始截图。

---
susyimes · AI Agent 应用工程 / Android 架构
