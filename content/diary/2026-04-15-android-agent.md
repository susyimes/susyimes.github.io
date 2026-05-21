---
id: "android-agent"
date: 2026-04-15
title: "Android 设备侧 Agent 感知闭环"
type: android
tags:
  - "Android"
  - "Accessibility"
  - "UsageEvents"
  - "Agent"
summary: "用 Android 收集器、定时提醒器、设备状态和使用统计，支撑 Agent 在手机侧做主动判断。"
---

## 记录摘要

用 Android 收集器、定时提醒器、设备状态和使用统计，支撑 Agent 在手机侧做主动判断。

## 复盘点

- 场景：Agent 需要理解设备使用状态，而不是只依赖用户输入。
- Agent 行为：读取结构化状态，判断是否需要提醒、记录或触发下一步。
- 人的判断：限制权限范围，确认哪些数据适合长期保存。
