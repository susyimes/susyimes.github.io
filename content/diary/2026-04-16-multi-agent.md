---
id: "multi-agent"
date: 2026-04-16
title: "Work / Observe / Assist 三类 Agent"
type: architecture
tags:
  - "Multi-Agent"
  - "Observe Agent"
  - "Assist Agent"
  - "Work Agent"
summary: "把 Agent 组织拆成三类：Work Agent 持续执行，Observe Agent 读取状态，Assist Agent 主动介入支持。"
---

## 记录摘要

把 Agent 组织拆成三类：Work Agent 持续执行，Observe Agent 读取状态，Assist Agent 主动介入支持。

## 复盘点

- Work Agent：处理实际任务、代码、业务逻辑和具体动作。
- Observe Agent：通过 CLI 或状态接口读取 Work Agent 的进度、记录和风险。
- Assist Agent：不直接扑向 Work Agent，而是向 Observe Agent 问询后接支持型任务。
- 意义：这是多 Agent 协作从“多开几个窗口”变成组织结构的关键一步。
