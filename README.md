# 重置雷达 / ResetRadar

Unofficial bilingual **scan deck** for public / global usage resets of:

1. **Codex** (OpenAI) — primary, seeded from whenreset.dev + codex-reset.com/timeline
2. **Claude Code** (Anthropic)
3. **Grok Bot** (xAI / Grok)

Dark radar identity (cyan / magenta on charcoal) with a **timeline-first** layout. Not affiliated with OpenAI, Anthropic, or xAI.

Footer placeholder: `resetradar.app`

---

## 中文

### 功能

- 扫描台状态：最近命中、示意下次窗口、24h 示意概率、中位间隔（显示 n）
- **时间线主视图**（自 2026-08-01）+ 月份切片；点击节点 / 日期查看 Tibo 帖文摘要
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

请勿虚构推文 ID / URL；未知时使用公开主页链接（如 `https://x.com/thsottiaux`）。

### 概率方法（简）

- 中位间隔：相邻计入估算的用量类重置；长历史取近 10 个间隔；不足则回退文档中位值
- 24h / 近日条形：**示意 / illustrative**，非预报；n 小时有提示

**免责声明**：节奏估算 ≠ 官方承诺；个人限额 ≠ 全局重置。

---

## English

### Features

- Scan status: last hit, illustrative next window, 24h illustrative probability, median gap (with n)
- **Timeline-first** view (from 2026-08-01) + secondary month slice; day click → Tibo post cards
- Product switcher: Codex / Claude Code / Grok Bot
- Default locale **zh**; toggle persists in `localStorage`
- zh: Beijing time; en: US Eastern (ET)

### Stack

Vite + React + TypeScript + Tailwind CSS v4

### License

Unofficial community project. Data may be incomplete or delayed.
