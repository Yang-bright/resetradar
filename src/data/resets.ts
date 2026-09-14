/**
 * ResetRadar seed data.
 * All timestamps are ISO 8601 UTC. Display conversion happens client-side only.
 * Do not invent tweet URLs or handles — only include verified/public references.
 * Codex primary sources: whenreset.dev + codex-reset.com/timeline (UTC).
 */

export type ProductId = 'codex' | 'claude' | 'grok'

export type ResetKind =
  | 'usage_reset'
  | 'reset_card'
  | 'token_reset'
  | 'special'
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
  id: string
  /** ISO UTC */
  date: string
  summary: string
  summaryZh: string
  /** Only real public URLs — leave undefined if unknown; prefer profile URL over invented tweet IDs */
  url?: string
  author: string
  authorZh?: string
  handle?: string
  avatarInitials?: string
  /** Optional local/CDN avatar path (prefer over initials) */
  avatarUrl?: string
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
  /** Shown in main history / timeline when date >= HISTORY_CUTOFF */
  inMainHistory: boolean
  /** Optional links to Post.id so day selection can surface Tibo cards */
  postIds?: string[]
  /** Short calendar annotation under the day (special / pricing) */
  markerLabel?: string
  markerLabelZh?: string
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

/** Timeline / history shows events on/after this date (UTC calendar day) */
export const HISTORY_CUTOFF = '2026-08-01T00:00:00.000Z'

const TIBO_PROFILE = 'https://x.com/thsottiaux'

export const products: ProductData[] = [
  {
    id: 'codex',
    name: 'Codex',
    nameZh: 'Codex',
    accent: 'codex',
    description:
      'OpenAI Codex usage resets (global / all-users) and banked reset cards. Cadence tracked from public @thsottiaux posts (whenreset.dev / codex-reset.com).',
    descriptionZh:
      'OpenAI Codex 用量重置（全局/全用户）与 banked 重置卡。节奏依据公开 @thsottiaux 帖文（whenreset.dev / codex-reset.com）。',
    people: [
      {
        name: 'Tibo Sottiaux',
        nameZh: 'Tibo Sottiaux',
        role: 'OpenAI Codex lead',
        roleZh: 'OpenAI Codex 负责人',
        handle: '@thsottiaux',
        profileUrl: TIBO_PROFILE,
        avatarInitials: 'TS',
      },
    ],
    posts: [
      // ——— September 2026 ———
      {
        id: 'codex-2026-09-12-land',
        date: '2026-09-12T08:09:00.000Z',
        summary: 'Reset all propagated. Sweet dreams.',
        summaryZh: '重置已全部推送完成。好梦。',
        author: 'Tibo',
        authorZh: 'Tibo',
        handle: '@thsottiaux',
        avatarInitials: 'TS',
        url: TIBO_PROFILE,
      },
      {
        id: 'codex-2026-09-12-heads',
        date: '2026-09-12T03:20:00.000Z',
        summary:
          'Hi Astra users. A reset and a quick update on quality issues that have been posted around. Working with some of you, we have found and fixed several issues — reset landing shortly.',
        summaryZh:
          '致 Astra 用户：即将重置，并就近期质量问题做简短说明。与部分用户一起排查后已修复若干问题 — 重置即将落地。',
        author: 'Tibo',
        authorZh: 'Tibo',
        handle: '@thsottiaux',
        avatarInitials: 'TS',
        url: TIBO_PROFILE,
      },
      {
        id: 'codex-2026-09-09-banked',
        date: '2026-09-09T18:23:00.000Z',
        summary:
          'There was a bit of a kerfuffle this morning with some banked resets not fully applying when used in ChatGPT Work and Codex. Everyone who used one in the affected time window is getting a compensation banked reset.',
        summaryZh:
          '今早部分 banked 重置在 ChatGPT Work / Codex 中未能完全生效。受影响时间窗内使用过的用户将获得补偿 banked 重置卡。',
        author: 'Tibo',
        authorZh: 'Tibo',
        handle: '@thsottiaux',
        avatarInitials: 'TS',
        url: TIBO_PROFILE,
      },
      {
        id: 'codex-2026-09-10-pro-pause',
        // 08:00 UTC = Sep 10 16:00 Beijing (not midnight Sep 11); still Sep 10 ET morning
        date: '2026-09-10T08:00:00.000Z',
        summary:
          'To make sure our current users have an incredible experience and continued access to Astra, we are going to pause subscriptions to our $200 Pro plan. These put the most strain on our systems and we wanted to take the smallest step that allows us to continue giving the broadest access possible. All other plans and the api remain available. There is no impact to existing accounts and we are working on adding more capacity as fast as we can. Thanks!',
        summaryZh:
          '为确保现有用户有出色体验并持续使用 Astra，我们将暂停 $200 Pro 计划的新订阅。这类订阅对系统压力最大，我们希望采取最小必要措施，以继续覆盖尽可能广泛的用户。其他计划与 API 仍可用；现有账户不受影响，我们正尽快扩容。谢谢！',
        author: 'Tibo',
        authorZh: 'Tibo',
        handle: '@thsottiaux',
        avatarInitials: 'TS',
        url: TIBO_PROFILE,
      },
      {
        id: 'codex-2026-09-08-land',
        date: '2026-09-08T04:05:00.000Z',
        summary: 'All reset for everyone. Enjoy the week with Astra.',
        summaryZh: '全员用量已重置。好好享受和 Astra 一起的一周。',
        author: 'Tibo',
        authorZh: 'Tibo',
        handle: '@thsottiaux',
        avatarInitials: 'TS',
        url: TIBO_PROFILE,
      },
      {
        id: 'codex-2026-09-08-heads',
        date: '2026-09-08T01:34:00.000Z',
        summary:
          'Never gonna give you up… Thanks for the patience — reset incoming for Astra week.',
        summaryZh:
          'Never gonna give you up… 感谢耐心 — Astra 周重置即将到来。',
        author: 'Tibo',
        authorZh: 'Tibo',
        handle: '@thsottiaux',
        avatarInitials: 'TS',
        url: TIBO_PROFILE,
      },
      {
        id: 'codex-2026-09-05-reset',
        date: '2026-09-05T04:58:00.000Z',
        summary: 'Wow, huge, wonder why!',
        summaryZh: 'Wow, huge, wonder why!（全局用量重置落地）',
        author: 'Tibo',
        authorZh: 'Tibo',
        handle: '@thsottiaux',
        avatarInitials: 'TS',
        url: TIBO_PROFILE,
      },
      {
        id: 'codex-2026-09-05-banked',
        date: '2026-09-05T00:39:00.000Z',
        summary:
          'Because we are beyond happy to have Astra rolled out today ahead of schedule… we will do the full banked reset to everyone who waited.',
        summaryZh:
          'Astra 提前上线，我们很开心… 将对耐心等待的用户发放完整 banked 重置。',
        author: 'Tibo',
        authorZh: 'Tibo',
        handle: '@thsottiaux',
        avatarInitials: 'TS',
        url: TIBO_PROFILE,
      },
      {
        id: 'codex-2026-09-04-banked',
        date: '2026-09-04T20:57:00.000Z',
        summary:
          "Some Plus and Business users won't yet get access to Astra today — we've got you covered with a banked reset. Lands by end of day.",
        summaryZh:
          '部分 Plus / Business 用户今日尚无法使用 Astra — 将发放 banked 重置卡，预计日末到账。',
        author: 'Tibo',
        authorZh: 'Tibo',
        handle: '@thsottiaux',
        avatarInitials: 'TS',
        url: TIBO_PROFILE,
      },
      {
        id: 'codex-2026-09-03-banked',
        date: '2026-09-03T23:12:00.000Z',
        summary:
          'Astra access compensation: one banked reset for every day without Astra on a paid ChatGPT plan, starting that day — first drop promised about three hours later.',
        summaryZh:
          'Astra 访问补偿：付费 ChatGPT 计划上每缺少一天 Astra 访问发放一张 banked 重置卡 — 首批约三小时后到账。',
        author: 'Tibo',
        authorZh: 'Tibo',
        handle: '@thsottiaux',
        avatarInitials: 'TS',
        url: TIBO_PROFILE,
      },
      // ——— August 2026 ———
      {
        id: 'codex-2026-08-31-reset',
        date: '2026-08-31T02:34:00.000Z',
        summary:
          '25M active users: to celebrate, usage reset for every paid ChatGPT Work and Codex subscription — the reset promised for 6pm PT the previous day.',
        summaryZh:
          '25M 活跃用户：庆祝全员用量重置（付费 ChatGPT Work / Codex）— 兑现前一日 6pm PT 预告。',
        author: 'Tibo',
        authorZh: 'Tibo',
        handle: '@thsottiaux',
        avatarInitials: 'TS',
        url: TIBO_PROFILE,
      },
      {
        id: 'codex-2026-08-30-heads',
        date: '2026-08-30T18:00:00.000Z',
        summary:
          'Heads-up: celebratory usage reset planned around 6pm PST for the 25M milestone (landed Aug 31 02:34 UTC).',
        summaryZh:
          '预告：25M 里程碑庆祝重置计划约 6pm PST（实际落地 Aug 31 02:34 UTC）。',
        author: 'Tibo',
        authorZh: 'Tibo',
        handle: '@thsottiaux',
        avatarInitials: 'TS',
        url: TIBO_PROFILE,
      },
      {
        id: 'codex-2026-08-25-reset',
        date: '2026-08-25T14:15:00.000Z',
        summary:
          'Quiet reset for all paid plans — weekly usage back to 100% from ~14:00 UTC. Tibo confirmed in replies ("Ah yeah, forgot to say").',
        summaryZh:
          '静默重置：付费计划周用量约 14:00 UTC 回到 100%。Tibo 在回复中确认（"Ah yeah, forgot to say"）。',
        author: 'Tibo',
        authorZh: 'Tibo',
        handle: '@thsottiaux',
        avatarInitials: 'TS',
        url: TIBO_PROFILE,
      },
      {
        id: 'codex-2026-08-24-reset',
        date: '2026-08-24T00:46:00.000Z',
        summary:
          'Good Sunday reset propagated to accounts, alongside usage fixes for the issues found the day before — "you should feel a positive difference."',
        summaryZh:
          '周日重置已推送，并修复前一日发现的用量问题 — 「你会感到正向差异」。',
        author: 'Tibo',
        authorZh: 'Tibo',
        handle: '@thsottiaux',
        avatarInitials: 'TS',
        url: TIBO_PROFILE,
      },
      {
        id: 'codex-2026-08-22-banked',
        date: '2026-08-22T00:50:00.000Z',
        summary:
          'The 20M-milestone banked reset landed in accounts for all paid Codex and ChatGPT Work users, redeemable on demand.',
        summaryZh:
          '20M 里程碑 banked 重置已到账（付费 Codex / ChatGPT Work），可按需兑换。',
        author: 'Tibo',
        authorZh: 'Tibo',
        handle: '@thsottiaux',
        avatarInitials: 'TS',
        url: TIBO_PROFILE,
      },
      {
        id: 'codex-2026-08-21-banked-arrive',
        date: '2026-08-21T23:40:00.000Z',
        summary:
          'Banked reset delivery window: arriving by 8pm PST for all paid ChatGPT Work and Codex users.',
        summaryZh:
          'Banked 重置到账窗口：付费 ChatGPT Work / Codex 用户预计 8pm PST 前到账。',
        author: 'Tibo',
        authorZh: 'Tibo',
        handle: '@thsottiaux',
        avatarInitials: 'TS',
        url: TIBO_PROFILE,
      },
      {
        id: 'codex-2026-08-21-banked-ann',
        date: '2026-08-21T11:43:00.000Z',
        summary:
          '20M active users milestone: announced one banked reset for every Codex and ChatGPT Work user, credited during the day for on-demand use.',
        summaryZh:
          '20M 活跃用户里程碑：宣布为每位 Codex / ChatGPT Work 用户发放一张 banked 重置，当日入账、按需使用。',
        author: 'Tibo',
        authorZh: 'Tibo',
        handle: '@thsottiaux',
        avatarInitials: 'TS',
        url: TIBO_PROFILE,
      },
      {
        id: 'codex-2026-08-13-preview',
        date: '2026-08-13T01:01:00.000Z',
        summary:
          'Crossed 15M active users: a celebratory reset for everyone, landing within the hour — announced late as old news from a bunch of days ago.',
        summaryZh:
          '突破 15M 活跃用户：全员庆祝重置，一小时内落地 — 事后宣布（几天前的旧闻）。',
        author: 'Tibo',
        authorZh: 'Tibo',
        handle: '@thsottiaux',
        avatarInitials: 'TS',
        url: TIBO_PROFILE,
      },
      {
        id: 'codex-2026-08-11-reset',
        date: '2026-08-11T00:27:00.000Z',
        summary:
          'Hi. It is done. This completed the reset promised for Monday; the reference weekly-usage card returned to 100% remaining.',
        summaryZh:
          'Hi. It is done. 兑现周一预告的重置；周用量参考卡回到 100% 剩余。',
        author: 'Tibo',
        authorZh: 'Tibo',
        handle: '@thsottiaux',
        avatarInitials: 'TS',
        url: TIBO_PROFILE,
      },
      {
        id: 'codex-2026-08-08-reset',
        date: '2026-08-08T20:29:00.000Z',
        summary:
          'Usage limits reset for all paid users of ChatGPT Work and Codex to celebrate GPT-5.6 Sol availability.',
        summaryZh:
          '为庆祝 GPT-5.6 Sol 可用，ChatGPT Work 与 Codex 全体付费用户用量已重置。',
        author: 'Tibo',
        authorZh: 'Tibo',
        handle: '@thsottiaux',
        avatarInitials: 'TS',
        url: TIBO_PROFILE,
      },
      {
        id: 'codex-2026-08-01-reset',
        date: '2026-08-01T03:32:00.000Z',
        summary:
          'Usage limits reset for Codex and ChatGPT Work to celebrate a week of efficiency and GPT-5.6 Luna throughput.',
        summaryZh:
          '为庆祝高效的一周与 GPT-5.6 Luna 吞吐，Codex 与 ChatGPT Work 用量已重置。',
        author: 'Tibo',
        authorZh: 'Tibo',
        handle: '@thsottiaux',
        avatarInitials: 'TS',
        url: TIBO_PROFILE,
      },
    ],
    events: [
      // ——— September (3 global usage resets through ~Sep 14) ———
      {
        date: '2026-09-12T08:09:00.000Z',
        kind: 'usage_reset',
        scope: 'all users',
        scopeZh: '全用户',
        note: 'Astra quality fix — usage reset landed',
        noteZh: 'Astra 质量修复 — 用量重置落地',
        countsForEstimate: true,
        inMainHistory: true,
        postIds: ['codex-2026-09-12-land', 'codex-2026-09-12-heads'],
      },
      {
        date: '2026-09-12T03:20:00.000Z',
        kind: 'other',
        scope: 'all users',
        scopeZh: '全用户',
        note: 'Heads-up before Sep 12 land (03:20 UTC)',
        noteZh: '9/12 落地前预告（03:20 UTC）',
        countsForEstimate: false,
        inMainHistory: true,
        postIds: ['codex-2026-09-12-heads'],
      },
      {
        date: '2026-09-09T18:23:00.000Z',
        kind: 'reset_card',
        scope: 'affected users (failed banked cards)',
        scopeZh: '受影响用户（banked 卡失效）',
        note: 'Banked update compensation — not a full all-user reset',
        noteZh: 'Banked 补偿更新 — 非全员用量重置',
        countsForEstimate: false,
        inMainHistory: true,
        postIds: ['codex-2026-09-09-banked'],
      },
      {
        // Noon Beijing (UTC+8) on Sep 10 so zh calendar day = 9/10; also Sep 10 ET
        date: '2026-09-10T04:00:00.000Z',
        kind: 'special',
        scope: 'ChatGPT Pro ($200 / Pro 20X)',
        scopeZh: 'ChatGPT Pro（$200 / Pro 20X）',
        note: 'New Pro $200 (Pro 20X) sign-ups/upgrades paused due to Astra demand; existing subscriptions unaffected. Public: OpenAI help as of September 10, 2026 (also Tibo / The Verge).',
        noteZh: '$200 Pro（Pro 20X）新购/升级暂停（Astra 需求）；现有订阅不受影响。公开来源：OpenAI 帮助中心 as of 2026-09-10（亦见 Tibo / The Verge）。',
        countsForEstimate: false,
        inMainHistory: true,
        postIds: ['codex-2026-09-10-pro-pause'],
        markerLabel: '$200 Pro pause',
        markerLabelZh: '$200 Pro 新购暂停',
      },
      {
        date: '2026-09-08T04:05:00.000Z',
        kind: 'usage_reset',
        scope: 'all users',
        scopeZh: '全用户',
        note: 'Astra launch — usage reset',
        noteZh: 'Astra 上线 — 用量重置',
        countsForEstimate: true,
        inMainHistory: true,
        postIds: ['codex-2026-09-08-land', 'codex-2026-09-08-heads'],
      },
      {
        date: '2026-09-08T01:34:00.000Z',
        kind: 'other',
        scope: 'all users',
        scopeZh: '全用户',
        note: 'Heads-up before Sep 8 land',
        noteZh: '9/8 落地前预告',
        countsForEstimate: false,
        inMainHistory: true,
        postIds: ['codex-2026-09-08-heads'],
      },
      {
        date: '2026-09-05T04:58:00.000Z',
        kind: 'usage_reset',
        scope: 'all users',
        scopeZh: '全用户',
        note: 'Global usage reset (Sep 5)',
        noteZh: '全局用量重置（9/5）',
        countsForEstimate: true,
        inMainHistory: true,
        postIds: ['codex-2026-09-05-reset'],
      },
      {
        date: '2026-09-05T00:39:00.000Z',
        kind: 'reset_card',
        scope: 'paid / waiting users',
        scopeZh: '付费 / 等待用户',
        note: 'Banked arriving with Astra rollout — not a full reset',
        noteZh: 'Astra 上线伴随 banked 到账 — 非全员重置',
        countsForEstimate: false,
        inMainHistory: true,
        postIds: ['codex-2026-09-05-banked'],
      },
      {
        date: '2026-09-04T20:57:00.000Z',
        kind: 'reset_card',
        scope: 'Plus / Business without Astra yet',
        scopeZh: '尚未获得 Astra 的 Plus / Business',
        note: 'Banked arriving (end of day)',
        noteZh: 'Banked 到账中（日末）',
        countsForEstimate: false,
        inMainHistory: true,
        postIds: ['codex-2026-09-04-banked'],
      },
      {
        date: '2026-09-03T23:12:00.000Z',
        kind: 'reset_card',
        scope: 'paid ChatGPT plans without Astra',
        scopeZh: '尚无 Astra 的付费 ChatGPT 计划',
        note: 'Banked announced — Astra access compensation',
        noteZh: 'Banked 宣布 — Astra 访问补偿',
        countsForEstimate: false,
        inMainHistory: true,
        postIds: ['codex-2026-09-03-banked'],
      },
      // ——— August ———
      {
        date: '2026-08-31T02:34:00.000Z',
        kind: 'usage_reset',
        scope: 'all paid ChatGPT Work + Codex',
        scopeZh: '全体付费 ChatGPT Work + Codex',
        note: '25M milestone — usage reset landed',
        noteZh: '25M 里程碑 — 用量重置落地',
        countsForEstimate: true,
        inMainHistory: true,
        postIds: ['codex-2026-08-31-reset', 'codex-2026-08-30-heads'],
      },
      {
        date: '2026-08-30T18:00:00.000Z',
        kind: 'other',
        scope: 'all paid',
        scopeZh: '全体付费',
        note: 'Heads-up for 6pm PST / 25M reset',
        noteZh: '6pm PST / 25M 重置预告',
        countsForEstimate: false,
        inMainHistory: true,
        postIds: ['codex-2026-08-30-heads'],
      },
      {
        date: '2026-08-25T14:15:00.000Z',
        kind: 'usage_reset',
        scope: 'all paid plans',
        scopeZh: '全体付费计划',
        note: 'Quiet reset ~14:00 UTC',
        noteZh: '静默重置 ~14:00 UTC',
        countsForEstimate: true,
        inMainHistory: true,
        postIds: ['codex-2026-08-25-reset'],
      },
      {
        date: '2026-08-24T00:46:00.000Z',
        kind: 'usage_reset',
        scope: 'all users',
        scopeZh: '全用户',
        note: 'Sunday reset + usage fixes',
        noteZh: '周日重置 + 用量修复',
        countsForEstimate: true,
        inMainHistory: true,
        postIds: ['codex-2026-08-24-reset'],
      },
      {
        date: '2026-08-22T00:50:00.000Z',
        kind: 'reset_card',
        scope: 'all paid Codex + ChatGPT Work',
        scopeZh: '全体付费 Codex + ChatGPT Work',
        note: '20M banked available (redeem on demand)',
        noteZh: '20M banked 已可用（按需兑换）',
        countsForEstimate: false,
        inMainHistory: true,
        postIds: ['codex-2026-08-22-banked'],
      },
      {
        date: '2026-08-21T23:40:00.000Z',
        kind: 'reset_card',
        scope: 'all paid',
        scopeZh: '全体付费',
        note: 'Banked arriving by 8pm PST',
        noteZh: 'Banked 预计 8pm PST 前到账',
        countsForEstimate: false,
        inMainHistory: true,
        postIds: ['codex-2026-08-21-banked-arrive'],
      },
      {
        date: '2026-08-21T11:43:00.000Z',
        kind: 'reset_card',
        scope: 'all Codex + ChatGPT Work',
        scopeZh: '全体 Codex + ChatGPT Work',
        note: '20M milestone — banked announced',
        noteZh: '20M 里程碑 — banked 宣布',
        countsForEstimate: false,
        inMainHistory: true,
        postIds: ['codex-2026-08-21-banked-ann'],
      },
      {
        date: '2026-08-13T01:01:00.000Z',
        kind: 'usage_reset',
        scope: 'all users',
        scopeZh: '全用户',
        note: '15M celebratory reset (announced as preview / late)',
        noteZh: '15M 庆祝重置（预告/事后宣布）',
        countsForEstimate: true,
        inMainHistory: true,
        postIds: ['codex-2026-08-13-preview'],
      },
      {
        date: '2026-08-11T00:27:00.000Z',
        kind: 'usage_reset',
        scope: 'all users',
        scopeZh: '全用户',
        note: 'Hi. It is done. — Monday reset complete',
        noteZh: 'Hi. It is done. — 周一重置完成',
        countsForEstimate: true,
        inMainHistory: true,
        postIds: ['codex-2026-08-11-reset'],
      },
      {
        date: '2026-08-08T20:29:00.000Z',
        kind: 'usage_reset',
        scope: 'all paid ChatGPT Work + Codex',
        scopeZh: '全体付费 ChatGPT Work + Codex',
        note: 'GPT-5.6 Sol celebration — usage reset',
        noteZh: 'GPT-5.6 Sol 庆祝 — 用量重置',
        countsForEstimate: true,
        inMainHistory: true,
        postIds: ['codex-2026-08-08-reset'],
      },
      {
        date: '2026-08-01T03:32:00.000Z',
        kind: 'usage_reset',
        scope: 'Codex + ChatGPT Work',
        scopeZh: 'Codex + ChatGPT Work',
        note: 'Luna throughput celebration — usage reset',
        noteZh: 'Luna 吞吐庆祝 — 用量重置',
        countsForEstimate: true,
        inMainHistory: true,
        postIds: ['codex-2026-08-01-reset'],
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
        name: 'Anthropic',
        nameZh: 'Anthropic',
        role: 'Official company account',
        roleZh: '公司官方账号',
        handle: '@AnthropicAI',
        profileUrl: 'https://x.com/AnthropicAI',
        avatarInitials: 'AN',
      },
      {
        name: 'Boris Cherny',
        nameZh: 'Boris Cherny',
        role: 'Head of Claude Code',
        roleZh: 'Claude Code 负责人',
        handle: '@bcherny',
        profileUrl: 'https://x.com/bcherny',
        avatarInitials: 'BC',
      },
    ],
    posts: [
      {
        id: 'claude-2026-09-04',
        date: '2026-09-04T20:08:00.000Z',
        summary:
          'Max weekly usage reset around the Astra launch / long-weekend window — tracked from public announcements (whenreset.dev). No dedicated Anthropic tweet ID seeded here.',
        summaryZh:
          '约 Astra 上线 / 长周末窗口的 Max 周限额用量重置 — 依据公开公告汇总（whenreset.dev）。此处未填具体推文 ID。',
        author: 'Anthropic',
        authorZh: 'Anthropic',
        handle: '@AnthropicAI',
        avatarInitials: 'AN',
        avatarUrl: '/anthropic-avatar.jpg',
        url: 'https://x.com/AnthropicAI',
      },
      {
        id: 'claude-2026-09-01',
        date: '2026-09-01T18:35:00.000Z',
        summary:
          'Usage reset for all users around Fable 5.1 — tracked from public announcements (whenreset.dev). Attributed to Claude Code lead context; no invented tweet URL.',
        summaryZh:
          'Fable 5.1 前后对全用户的用量重置 — 依据公开公告汇总（whenreset.dev）。归入 Claude Code 负责人语境；未虚构推文链接。',
        author: 'Boris Cherny',
        authorZh: 'Boris Cherny',
        handle: '@bcherny',
        avatarInitials: 'BC',
        avatarUrl: '/bcherny-avatar.jpg',
        url: 'https://x.com/bcherny',
      },
    ],
    events: [
      {
        date: '2026-09-04T20:08:00.000Z',
        kind: 'usage_reset',
        scope: 'Max weekly only',
        scopeZh: '仅 Max 周限额',
        note: 'Max weekly usage_reset',
        noteZh: 'Max 周限额用量重置',
        countsForEstimate: true,
        inMainHistory: true,
        postIds: ['claude-2026-09-04'],
      },
      {
        date: '2026-09-01T18:35:00.000Z',
        kind: 'usage_reset',
        scope: 'all users',
        scopeZh: '全用户',
        note: 'Fable 5.1 — usage_reset',
        noteZh: 'Fable 5.1 — 用量重置',
        countsForEstimate: true,
        inMainHistory: true,
        postIds: ['claude-2026-09-01'],
      },
    ],
    documentedMedianDays: 7.1,
    caveat:
      'Personal 5h / weekly limits are not the same as global resets. Seed history is sparse.',
    caveatZh:
      '个人 5 小时 / 周限额 ≠ 全局重置。种子历史数据较稀疏。',
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
        id: 'grok-2026-09-01',
        date: '2026-09-01T12:00:00.000Z',
        summary:
          "We're giving all @Grok @Bot users another free reset on token usage",
        summaryZh:
          '我们给所有 @Grok @Bot 用户再发放一次免费 token 用量重置',
        author: 'Elon Musk',
        authorZh: '埃隆·马斯克',
        handle: '@elonmusk',
        avatarInitials: 'EM',
        avatarUrl: '/elon-avatar.jpg',
        url: 'https://x.com/elonmusk/status/2094813795742847123',
      },
    ],
    events: [
      {
        date: '2026-09-01T12:00:00.000Z',
        kind: 'token_reset',
        scope: 'free tokens',
        scopeZh: '免费 token',
        note: 'Free token reset (Elon public post ~Sep 1)',
        noteZh: '免费 token 重置（Elon 公开帖 ~9/1）',
        countsForEstimate: true,
        inMainHistory: true,
        postIds: ['grok-2026-09-01'],
      },
    ],
    documentedMedianDays: 14,
    caveat:
      'Few data points — treat next-reset estimates and window probabilities as illustrative only.',
    caveatZh:
      '数据点很少 — 下次重置估算与窗口示意概率仅供参考。',
  },
]
