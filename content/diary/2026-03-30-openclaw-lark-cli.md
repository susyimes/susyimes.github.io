---
id: "openclaw-lark-cli"
date: 2026-03-30
title: "用 OpenClaw 自动化飞书 CLI"
type: automation
tags:
  - "OpenClaw"
  - "CLI"
  - "Workflow"
  - "Automation"
summary: "在飞书开源 CLI 的基础上，用 OpenClaw 把办公流程转成 Agent 可执行的自动化任务。"
---

## 记录摘要

在飞书开源 CLI 的基础上，用 OpenClaw 把办公流程转成 Agent 可执行的自动化任务。

## 复盘点

- 问题：办公软件里的动作常常重复，但分散在不同入口。
- 方案：优先使用 CLI 暴露稳定动作，再由 Agent 做任务拆解和调用。
- 意义：比直接模拟 UI 更稳定，也更适合作为企业 Agent 应用底座。
