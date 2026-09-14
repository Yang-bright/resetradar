/**
 * ResetRadar seed data.
 * All timestamps are ISO 8601 UTC. Display conversion happens client-side only.
 * Do not invent tweet URLs or handles — only include verified/public references.
 */

export type ProductId = 'codex' | 'claude' | 'grok'

export type ResetKind =
  | 'usage_reset'
  | 'reset_card'
  | 'token_reset'
  | 'other'

export interface Person {
  name: string
  nameZh?: string
  role: string
  roleZh?: string
  handle?: string
  /** Public profile URL only when known / safe to share */
  profileUrl?: string
  avatarInitials?: string
}

export interface Post {
  /** ISO UTC */
  date: string
  summary: string
  summaryZh: string
  /** Only real public URLs — leave undefined if unknown */
  url?: string
  author: string
  authorZh?: string
  handle?: string
  avatarInitials?: string
}

export interface ResetEvent {
  /** ISO UTC */
  date: string
  kind: ResetKind
  scope: string
  scopeZh: string
  note: string
  noteZh: string
  /** If true, included in median-gap estimate calculation */
  countsForEstimate: boolean
  /** Shown in main history table when date >= HISTORY_CUTOFF */
  inMainHistory: boolean
}

export interface ProductData {
  id: ProductId
  name: string
  nameZh: string
  accent: 'codex' | 'claude' | 'grok'
  description: string
  descriptionZh: string
  people: Person[]
  posts: Post[]
  events: ResetEvent[]
  /** Documented median gap in days (fallback if not enough events) */
  documentedMedianDays: number
  caveat?: string
  caveatZh?: string
}

/** History table shows events on/after this date (UTC calendar day) */
export const HISTORY_CUTOFF = '2026-09-10T00:00:00.000Z'

export const products: ProductData[] = [
  {
    id: 'codex',
    name: 'Codex',
    nameZh: 'Codex',
    accent: 'codex',
    description:
      'OpenAI Codex usage resets (global / all-users and compensation cards). Estimates follow whenreset.dev-style cadence.',
    descriptionZh:
      'OpenAI Codex 用量重置（全局/全用户与补偿卡）。估算参考 whenreset.dev 风格的节奏。',
    people: [
      {
        name: 'Tibo Sottiaux',
        nameZh: 'Tibo Sottiaux',
        role: 'OpenAI Codex lead',
        roleZh: 'OpenAI Codex 负责人',
        handle: '@thsottiaux',
        profileUrl: 'https://x.com/thsottiaux',
        avatarInitials: 'TS',
      },
    ],
    posts: [
      {
        date: '2026-09-12T08:09:00.000Z',
        summary: 'Reset push completed for all users. Good night.',
        summaryZh: '重置已全部推送完成。好梦。',
        author: 'Tibo',
        authorZh: 'Tibo',
        handle: '@thsottiaux',
        avatarInitials: 'TS',
        url: 'https://x.com/thsottiaux',
      },
      {
        date: '2026-09-12T07:55:00.000Z',
        summary:
          'Usage reset for all users tied to Astra quality fix (community / whenreset.dev tracking).',
        summaryZh: '因 Astra 质量修复对全用户进行用量重置（社区 / whenreset.dev 追踪）。',
        author: 'Community tracking',
        authorZh: '社区追踪',
        avatarInitials: 'RR',
      },
      {
        date: '2026-09-10T06:20:00.000Z',
        summary: 'Compensation reset cards rolling out to a subset of affected users.',
        summaryZh: '向部分受影响用户滚动发放补偿重置卡。',
        author: 'Community tracking',
        authorZh: '社区追踪',
        avatarInitials: 'RR',
      },
      {
        date: '2026-09-09T12:00:00.000Z',
        summary:
          'Reset card issued to affected users as compensation (not a full global usage_reset).',
        summaryZh: '向受影响用户发放重置卡作为补偿（非完整全局 usage_reset）。',
        author: 'Community tracking',
        authorZh: '社区追踪',
        avatarInitials: 'RR',
      },
      {
        date: '2026-09-08T10:30:00.000Z',
        summary: 'Usage reset around Astra launch.',
        summaryZh: 'Astra 上线期间的用量重置。',
        author: 'Community tracking / OpenAI Codex',
        authorZh: '社区追踪 / OpenAI Codex',
        avatarInitials: 'RR',
      },
      {
        date: '2026-09-05T04:00:00.000Z',
        summary: 'Targeted reset cards for early Astra testers (compensation).',
        summaryZh: '向早期 Astra 测试用户发放定向重置卡（补偿）。',
        author: 'Community tracking',
        authorZh: '社区追踪',
        avatarInitials: 'RR',
      },
      {
        date: '2026-09-04T05:10:00.000Z',
        summary: 'Reset cards reported for a limited cohort.',
        summaryZh: '据报向有限用户群体发放重置卡。',
        author: 'Community tracking',
        authorZh: '社区追踪',
        avatarInitials: 'RR',
      },
    ],
    events: [
      {
        date: '2026-09-12T08:09:00.000Z',
        kind: 'usage_reset',
        scope: 'all users',
        scopeZh: '全用户',
        note: 'Astra quality fix — usage_reset',
        noteZh: 'Astra 质量修复 — 用量重置',
        countsForEstimate: true,
        inMainHistory: true,
      },
      {
        date: '2026-09-10T06:20:00.000Z',
        kind: 'reset_card',
        scope: 'affected users',
        scopeZh: '受影响用户',
        note: 'Compensation reset_card wave',
        noteZh: '补偿重置卡批次',
        countsForEstimate: false,
        inMainHistory: true,
      },
      {
        date: '2026-09-09T12:00:00.000Z',
        kind: 'reset_card',
        scope: 'affected users',
        scopeZh: '受影响用户',
        note: 'Compensation reset_card',
        noteZh: '补偿重置卡',
        countsForEstimate: false,
        inMainHistory: false,
      },
      {
        date: '2026-09-08T10:30:00.000Z',
        kind: 'usage_reset',
        scope: 'all users',
        scopeZh: '全用户',
        note: 'Astra launch — usage_reset',
        noteZh: 'Astra 上线 — 用量重置',
        countsForEstimate: true,
        inMainHistory: false,
      },
      {
        date: '2026-09-05T04:00:00.000Z',
        kind: 'reset_card',
        scope: 'early testers',
        scopeZh: '早期测试用户',
        note: 'Targeted reset_card',
        noteZh: '定向重置卡',
        countsForEstimate: false,
        inMainHistory: false,
      },
      {
        date: '2026-09-04T05:10:00.000Z',
        kind: 'reset_card',
        scope: 'limited cohort',
        scopeZh: '有限用户群',
        note: 'Limited cohort reset_card',
        noteZh: '有限用户群重置卡',
        countsForEstimate: false,
        inMainHistory: false,
      },
    ],
    documentedMedianDays: 3.3,
  },
  {
    id: 'claude',
    name: 'Claude Code',
    nameZh: 'Claude Code',
    accent: 'claude',
    description:
      'Anthropic Claude Code / Max plan weekly and global usage resets. Cadence is longer and less frequent than Codex.',
    descriptionZh:
      'Anthropic Claude Code / Max 计划的周限额与全局用量重置。节奏长于 Codex，频率更低。',
    people: [
      {
        name: 'Anthropic (official channels)',
        nameZh: 'Anthropic（官方渠道）',
        role: 'Product / status announcements — verify on official docs & status',
        roleZh: '产品 / 状态公告 — 请以官方文档与状态页为准',
        avatarInitials: 'AN',
      },
    ],
    posts: [
      {
        date: '2026-09-04T12:00:00.000Z',
        summary: 'Usage reset reported for Max weekly quota only (not necessarily all users).',
        summaryZh: '据报仅 Max 周限额用量重置（未必覆盖全部用户）。',
        author: 'Community tracking',
        authorZh: '社区追踪',
        avatarInitials: 'RR',
      },
      {
        date: '2026-09-01T12:00:00.000Z',
        summary: 'Usage reset for all users around Fable 5.1.',
        summaryZh: 'Fable 5.1 前后对全用户的用量重置。',
        author: 'Community tracking',
        authorZh: '社区追踪',
        avatarInitials: 'RR',
      },
    ],
    events: [
      {
        date: '2026-09-04T12:00:00.000Z',
        kind: 'usage_reset',
        scope: 'Max weekly only',
        scopeZh: '仅 Max 周限额',
        note: 'Max weekly usage_reset',
        noteZh: 'Max 周限额用量重置',
        countsForEstimate: true,
        inMainHistory: false,
      },
      {
        date: '2026-09-01T12:00:00.000Z',
        kind: 'usage_reset',
        scope: 'all users',
        scopeZh: '全用户',
        note: 'Fable 5.1 — usage_reset',
        noteZh: 'Fable 5.1 — 用量重置',
        countsForEstimate: true,
        inMainHistory: false,
      },
    ],
    documentedMedianDays: 7.1,
    caveat:
      'History since 2026-09-10 may be empty. Personal 5h / weekly limits are not the same as global resets.',
    caveatZh:
      '自 2026-09-10 起的主历史可能为空。个人 5 小时 / 周限额 ≠ 全局重置。',
  },
  {
    id: 'grok',
    name: 'Grok Bot',
    nameZh: 'Grok Bot',
    accent: 'grok',
    description:
      'xAI Grok / Grok Bot free-token and usage resets. Sparse public signals — estimates are low confidence.',
    descriptionZh:
      'xAI Grok / Grok Bot 免费额度与用量重置。公开信号稀疏 — 估算置信度较低。',
    people: [
      {
        name: 'Elon Musk',
        nameZh: '埃隆·马斯克',
        role: 'xAI / Grok',
        roleZh: 'xAI / Grok',
        handle: '@elonmusk',
        profileUrl: 'https://x.com/elonmusk',
        avatarInitials: 'EM',
      },
    ],
    posts: [
      {
        date: '2026-09-01T12:00:00.000Z',
        summary:
          'Public mention / summary around free token reset (~2026-09-01). Exact tweet URL not seeded here to avoid invented links.',
        summaryZh:
          '约 2026-09-01 前后关于免费 token 重置的公开提及摘要。为避免虚构链接，此处不填入具体推文 URL。',
        author: 'Elon Musk',
        authorZh: '埃隆·马斯克',
        handle: '@elonmusk',
        avatarInitials: 'EM',
        url: 'https://x.com/elonmusk',
      },
    ],
    events: [
      {
        date: '2026-09-01T12:00:00.000Z',
        kind: 'token_reset',
        scope: 'free tokens',
        scopeZh: '免费 token',
        note: 'Free token reset (sparse public signal)',
        noteZh: '免费 token 重置（公开信号稀疏）',
        countsForEstimate: true,
        inMainHistory: false,
      },
    ],
    documentedMedianDays: 14,
    caveat:
      'Few data points — treat next-reset estimates and 24h probability as illustrative only. History since 2026-09-10 may be empty.',
    caveatZh:
      '数据点很少 — 下次重置估算与 24 小时概率仅供参考。自 2026-09-10 起的主历史可能为空。',
  },
]
