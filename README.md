# 重置雷达 / ResetRadar

Unofficial bilingual tracker for **official / global usage resets** of:

1. **Codex** (OpenAI)
2. **Claude Code** (Anthropic)
3. **Grok Bot** (xAI / Grok)

Inspired by whenreset.dev-style cadence tracking. Not affiliated with OpenAI, Anthropic, or xAI.

站点页脚占位域名：`resetradar.app`

---

## 中文

### 功能

- 总览三卡：最近重置、预计下次、24 小时内重置概率
- 按产品分区：关键人物、相关动态、估算+倒计时、概率、历史表（≥ 2026-09-10）
- 默认中文；语言切换写入 `localStorage`
- 中文时间：**北京时间**（Asia/Shanghai）；英文时间：**ET**（America/New_York）
- 原始数据一律存 **UTC ISO**，仅在展示时转换

### 本地运行

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build
npm run preview
```

### 编辑数据

种子数据在：

```
src/data/resets.ts
```

修改事件、人物或文案后重新 `npm run build` 即可。请勿虚构推文 URL 或账号 handle。

### 估算说明（简）

- 下次重置 ≈ 最近一次计入估算的重置 + 相邻 `usage_reset`（或同类）事件的**中位间隔**
- 数据点不足时回退到文档/种子中位值（Codex ~3.3 天，Claude ~7.1 天，Grok 更稀疏）
- 24h 概率为启发式，接近/超过中位间隔时升高；样本过少时下调

**免责声明**：节奏估算 ≠ 官方承诺；个人 5 小时 / 周限额 ≠ 全局重置。

---

## English

### Features

- Hero + three overview cards (last reset, estimated next, 24h probability)
- Per-product sections: people, posts, estimate + countdown, probability, history (≥ 2026-09-10)
- Default locale: **zh**; toggle persists in `localStorage`
- zh times: **Beijing time** (Asia/Shanghai); en times: **ET** (America/New_York)
- Store ISO UTC in data; convert for display only

### Run locally

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
npm run preview
```

### Edit data

```
src/data/resets.ts
```

Do not invent tweet URLs or handles. Times in that file are UTC.

### Methodology (short)

- Next ≈ last estimate-eligible reset + **median gap** between consecutive `usage_reset`-like events
- Falls back to documented medians when samples are sparse
- 24h probability is a heuristic (rises toward/overdue median; dampened for sparse data)

**Disclaimer:** Cadence estimates are not official. Personal 5h/weekly limits ≠ global resets.

### Stack

Vite + React + TypeScript + Tailwind CSS v4

### License

Unofficial community project. Data may be incomplete or delayed.
