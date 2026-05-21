---
id: "gitnexus-code-graph"
date: 2026-05-05
title: "GitNexus：让编程 Agent 读懂代码图谱"
type: code-intelligence
tags:
  - "Code Graph"
  - "MCP"
  - "Claude Code"
  - "Codex"
  - "Repository"
summary: "通过代码知识图谱记录函数调用、导入和类继承关系，让 Claude Code、Codex 等 Agent 更少破坏依赖。"
---

## 记录摘要

通过代码知识图谱记录函数调用、导入和类继承关系，让 Claude Code、Codex 等 Agent 更少破坏依赖。

## 复盘点

- 问题：编程 Agent 常因不了解函数关系而误改代码。
- 方案：为仓库构建知识图谱，并通过 MCP 让 Agent 查询。
- 价值：这是代码库级别上下文增强，比单纯把文件塞进 prompt 更稳。
