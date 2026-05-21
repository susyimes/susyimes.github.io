---
id: "subagent-refactor"
date: 2026-03-15
title: "区域化代码重构与 Debug Agent"
type: workflow
tags:
  - "Subagent"
  - "Refactor"
  - "Review"
  - "Testing"
summary: "把重构风险交给 Agent 判断：subagent 做区域化修改，debug agent 检查逻辑一致性和测试结果。"
---

## 记录摘要

把重构风险交给 Agent 判断：subagent 做区域化修改，debug agent 检查逻辑一致性和测试结果。

## 复盘点

- 问题：代码一周一重构时，单个 Agent 容易误判影响面。
- 设计：实现 Agent 负责局部修改，Debug Agent 负责逻辑吻合与测试通过。
- 治理：人类验收不只看代码能跑，还看重构是否破坏原始意图。
