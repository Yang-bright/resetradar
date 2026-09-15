# 重置雷达 / ResetRadar

Unofficial bilingual **scan deck** for public / global usage resets of:

1. **Codex** (OpenAI) — primary, seeded from whenreset.dev + codex-reset.com/timeline
2. **Claude Code** (Anthropic)
3. **Grok Bot** (xAI / Grok)

Dark radar identity (cyan / magenta on charcoal) with a **calendar-first** layout. Not affiliated with OpenAI, Anthropic, or xAI.

Production domain: `https://resetradar.wiki`

---

## 中文

### 功能

- 首屏：一句话说明 + 产品 Tab
- 主信息：最近重置（大号时间）+ 关联 Tibo 帖文
- **重置日历**（自 2026-08-01）：点日期查看当天事件与 Tibo 内容
- 可选一行「下次窗口示意」（中位间隔）；无每日虚假概率条
- 产品切换：Codex / Claude Code / Grok Bot
- 默认中文；语言切换写入 `localStorage`
- 中文时间：**北京时间**；英文时间：**ET**
- 原始数据一律 **UTC ISO**

### 本地运行

```bash
npm install
npm run dev
```

```bash
npm run build && npm run preview
```

### 编辑数据

```
src/data/resets.ts
```

估算工具仍在 `src/utils/estimates.ts`，可按需复用，但不再主导 UI。

---

## English

### Features

- First screen: one-line tagline + product tabs
- Primary: last reset (huge) + linked Tibo post
- **Reset calendar** (from 2026-08-01): click a day for events + Tibo cards
- Optional one-line next-window hint (median gap); no daily fake probability bars
- Product tabs: Codex / Claude Code / Grok Bot
- Default locale Chinese; toggle persists in `localStorage`
- zh times: **Beijing**; en times: **US Eastern**
- Source timestamps: **UTC ISO**

### Run locally

```bash
npm install
npm run dev
```

```bash
npm run build && npm run preview
```
