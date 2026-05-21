---
id: "agent-trace"
date: 2026-05-11
title: "Agent 决策链路的可追溯性实验"
type: engineering
tags:
  - "Trace"
  - "Observability"
  - "Governance"
  - "Harness"
summary: "通过 TendrilFlow 记录 Agent 的思维链与工具调用序列，确保交接后的每一个动作都有据可查。"
---

## 记录摘要

通过 TendrilFlow 记录 Agent 的思维链与工具调用序列，确保交接后的每一个动作都有据可查。

## 复盘点

- 问题：Agent 的自主行动往往是黑盒，人类难以追责。
- 方案：在 Harness 层拦截所有 LLM 响应，记录原始 Prompt、输出与中间状态。
- 结果：在本地 Dashboard 展示完整任务执行链路，方便复盘幻觉风险和工具风险。
