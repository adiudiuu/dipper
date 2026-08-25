/**
 * 历法演进阶段（羲和主线 · 教学向）
 * 以「历法为什么要一直改」组织人物与成果，非占卜预测。
 */

import { getTimelineEntries } from './astronomerTimeline.js'

/** @typedef {{ id: string, title: string, period: string, calendars: string[], intro: string, whyReform: string, astronomerIds: string[] }} CalendarStage */

/** @type {CalendarStage[]} */
export const CALENDAR_STAGES = [
  {
    id: 'stage-preqin',
    title: '先秦观象 · 星官编目',
    period: '约前 4 世纪',
    calendars: ['甘氏星经', '石氏星经'],
    intro:
      '在统一历法出现之前，观象授时依赖星官坐标与五星行度经验。甘德、石申等以肉眼建立星表，为后世「以天定历」积累坐标基础。',
    whyReform:
      '各国历法各自为政，缺乏统一回归年与朔望月常数；星官体系先行，为汉代大规模改历准备了观测语言。',
    astronomerIds: ['gan-de', 'shi-shen']
  },
  {
    id: 'stage-taichu',
    title: '汉初实测 · 太初改历',
    period: '前 104 年前后',
    calendars: ['太初历', '三统历'],
    intro:
      '汉武帝元封年间，落下闳等奉诏改历，编制《太初历》，是中国历法史上第一次国家规模的天文实测改历。刘歆《三统历》进一步常数化。',
    whyReform:
      '战国至汉初沿用《颛顼历》等旧历，节气与天象逐渐不合；新朝需要统一授时以协调农时、祭祀与国家行政。',
    astronomerIds: ['luo-xiahong', 'sima-qian', 'liu-xin']
  },
  {
    id: 'stage-han-instruments',
    title: '东汉 · 浑天说与月离',
    period: '1—3 世纪',
    calendars: ['乾象历', '《灵宪》常数'],
    intro:
      '张衡以浑天仪模拟天球，刘洪《乾象历》引入月行迟疾改正，交食推步精度大幅提升。贾逵等推动黄道坐标与实测论争。',
    whyReform:
      '旧历交食预报误差积累，月相与节气偏差影响朔日安排；需要仪器观测与数理模型，而非仅调整经验参数。',
    astronomerIds: ['jia-kui', 'zhang-heng', 'liu-hong']
  },
  {
    id: 'stage-wei-jin',
    title: '魏晋南北朝 · 岁差与精密化',
    period: '3—6 世纪',
    calendars: ['大明历', '三纪甲子元历'],
    intro:
      '虞喜发现岁差，祖冲之《大明历》将岁差引入推步；张子信发现日行盈缩，为定气、定朔改革奠定观测基础。',
    whyReform:
      '回归年与恒星年差异导致冬至点缓慢西移；若不修正，节气与星象、农时的长期对应将系统性漂移。',
    astronomerIds: ['yu-xi', 'jiang-ji', 'zhang-zixin', 'zu-chongzhi']
  },
  {
    id: 'stage-sui-tang',
    title: '隋唐 · 定朔定气与插补法',
    period: '6—8 世纪',
    calendars: ['皇极历', '麟德历', '大衍历'],
    intro:
      '刘焯《皇极历》引入二次内插；李淳风《麟德历》推进定朔；僧一行《大衍历》组织全国子午线测量，统一开元授时。',
    whyReform:
      '日月视运动不均匀，平朔平气与真实天象偏差日增；需要数学插补与全国实测来校准常数、消除系统误差。',
    astronomerIds: ['liu-zhuo', 'li-chunfeng', 'yi-xing', 'liang-lingzan']
  },
  {
    id: 'stage-song-yuan',
    title: '宋元 · 仪象台与《授时历》',
    period: '11—14 世纪',
    calendars: ['水运仪象台', '授时历'],
    intro:
      '苏颂水运仪象台整合观测、演示与报时；郭守敬组织全国测影，编制《授时历》，回归年长精度达世界领先，行用近四百年。',
    whyReform:
      '宋代历法反复改订仍难长期吻合天象；元代需要更简明的观测仪器与更精确的回归年常数，以支撑庞大帝国的统一授时。',
    astronomerIds: ['su-song', 'shen-kuo', 'yelu-chucai', 'guo-shoujing']
  },
  {
    id: 'stage-ming-qing',
    title: '明清 · 会通中西',
    period: '16—18 世纪',
    calendars: ['崇祯历书', '时宪历', '历象考成后编'],
    intro:
      '徐光启主持编译《崇祯历书》，引入第谷体系与三角方法；清初《时宪历》承其成果，梅文鼎、明安图等融通中西数学与推步。',
    whyReform:
      '传统经验推步在部分交食与行星位置预报上落后欧洲精密模型；需要通过翻译、会通与实测校验，实现方法更新而非简单替换。',
    astronomerIds: ['xu-guangqi', 'xue-fengzuo', 'wang-xichan', 'mei-wending', 'mingantu']
  }
]

/**
 * @returns {{ stage: CalendarStage, people: import('./astronomerTimeline.js').AstronomerEntry[] }[]}
 */
export function getCalendarStageGroups() {
  const entries = getTimelineEntries()
  const byId = new Map(entries.map((e) => [e.id, e]))
  return CALENDAR_STAGES.map((stage) => ({
    stage,
    people: stage.astronomerIds.map((id) => byId.get(id)).filter(Boolean)
  })).filter((g) => g.people.length > 0)
}

/**
 * @returns {{ count: number, span: string, stageCount: number }}
 */
export function calendarEvolutionStats() {
  const groups = getCalendarStageGroups()
  const people = groups.flatMap((g) => g.people)
  const first = people[0]
  const last = people[people.length - 1]
  const fmtYear = (y) => (y < 0 ? `前${Math.abs(y)}` : String(y))
  const spanEdge = (entry, edge) => {
    if (entry?.dateRange && entry.dateRange[edge] != null) return fmtYear(entry.dateRange[edge])
    const raw = String(entry?.dates || '').replace(/^约/, '')
    const parts = raw.split(/[–—-]/).map((s) => s.trim()).filter(Boolean)
    if (edge === 'start') return parts[0] || raw
    return parts[1] || parts[0] || raw
  }
  return {
    count: people.length,
    span: first && last ? `${spanEdge(first, 'start')} – ${spanEdge(last, 'end')}` : '—',
    stageCount: groups.length
  }
}
