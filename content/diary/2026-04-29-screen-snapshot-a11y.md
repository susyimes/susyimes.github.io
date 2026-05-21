---
id: "screen-snapshot-a11y"
date: 2026-04-29
title: "Screen 快照整合图像文本与 a11y"
type: android
tags:
  - "Screen Snapshot"
  - "Accessibility"
  - "Vision"
  - "Tool Use"
summary: "Screen 快照不仅要有图像，还要携带 OCR 文本和无障碍结构，供 Agent 做更可靠的动作判断。"
---

## 记录摘要

Screen 快照不仅要有图像，还要携带 OCR 文本和无障碍结构，供 Agent 做更可靠的动作判断。

## 复盘点

- 问题：只有截图会丢结构，只有 a11y 树会丢视觉上下文。
- 方案：把图像、文字、节点、坐标和可执行动作合并为统一快照。
- 意义：这是移动端 Agent 从看见到能做的关键中间层。
