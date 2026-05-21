---
id: "guardian-agent"
date: 2026-04-25
title: "Guardian Agent：AI 写完，AI 先审"
type: review
tags:
  - "Guardian Agent"
  - "Review"
  - "Testing"
  - "Governance"
summary: "在 AI 写完代码后，由另一个 AI 先审一遍，再交给人类运行和验收。"
---

## 记录摘要

在 AI 写完代码后，由另一个 AI 先审一遍，再交给人类运行和验收。

## 复盘点

- 问题：执行 Agent 容易相信自己的改动，缺少外部审查。
- 方案：引入 Guardian Agent 做风险识别、测试建议和行为回归检查。
- 价值：这是多 Agent 对抗协作在工程落地中的典型模式。
