---
id: "android-accessibility-design"
date: 2026-04-28
title: "Agent 如何通过无障碍操作手机"
type: android
tags:
  - "Android"
  - "Accessibility"
  - "ADB"
  - "Mobile Agent"
summary: "围绕“Agent 通过无障碍操作手机怎么实现”形成设计问题，并开始用 ADB 与 Kimi 做交互测试。"
---

## 记录摘要

围绕“Agent 通过无障碍操作手机怎么实现”形成设计问题，并开始用 ADB 与 Kimi 做交互测试。

## 复盘点

- 问题：Agent 如何理解当前页面、决定操作、执行动作并确认结果？
- 实验：通过内部 ADB 与 Kimi 对话，排查卡点和输入失败问题。
- 方向：屏幕快照、a11y 数据、模型决策和动作循环需要合成一个闭环。
