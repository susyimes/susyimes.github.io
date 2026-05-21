---
id: "model-driven-action-loop"
date: 2026-04-29
title: "模型根据无障碍树循环操作直到成功"
type: android
tags:
  - "Accessibility"
  - "Action Loop"
  - "Shizuku"
  - "Mobile Agent"
summary: "脚本不固定死，由模型读取页面无障碍树后决定操作，并循环直到成功。"
---

## 记录摘要

脚本不固定死，由模型读取页面无障碍树后决定操作，并循环直到成功。

## 复盘点

- 策略：不要每次都记路径，只有用户反馈成功后再沉淀为成功路径。
- 能力：结合 Shizuku 与手机修改能力，扩展 Agent 的真实设备控制面。
- 限制：操作次数上限、失败回退和用户确认必须进入 Harness 设计。
