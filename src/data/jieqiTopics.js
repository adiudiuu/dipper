import { JIEQI } from '../lib/calendar.js'

/**
 * 节气科普短文（教学向授时/历法，非占卜）
 * @typedef {{ slug: string, term: string, title: string, ready: boolean, summary: string, sections: { heading?: string, body: string }[] }} JieqiTopic
 */

/** @type {Record<string, string>} 节气名 → URL slug */
export const JIEQI_SLUG_BY_TERM = {
  小寒: 'xiaohan',
  大寒: 'dahan',
  立春: 'lichun',
  雨水: 'yushui',
  惊蛰: 'jingzhe',
  春分: 'chunfen',
  清明: 'qingming',
  谷雨: 'guyu',
  立夏: 'lixia',
  小满: 'xiaoman',
  芒种: 'mangzhong',
  夏至: 'xiazhi',
  小暑: 'xiaoshu',
  大暑: 'dashu',
  立秋: 'liqiu',
  处暑: 'chushu',
  白露: 'bailu',
  秋分: 'qiufen',
  寒露: 'hanlu',
  霜降: 'shuangjiang',
  立冬: 'lidong',
  小雪: 'xiaoxue',
  大雪: 'daxue',
  冬至: 'dongzhi'
}

/** @type {Record<string, JieqiTopic>} */
const TOPICS = {
  xiaohan: {
    slug: 'xiaohan',
    term: '小寒',
    title: '小寒：一年中最冷时段的开端',
    ready: false,
    summary: '小寒太阳黄经 285°，标志「三九」前后严寒，是理解节气与气温滞后关系的入门节点。',
    sections: [
      {
        body:
          '小寒在公历 1 月上旬前后，太阳到达黄经 285°。名称虽带「小」，民间常言「小寒大寒，冷成冰团」，因地面热量散失滞后于太阳高度，故节气名与体感未必同步。'
      },
      {
        heading: '授时意义',
        body:
          '古代以观测太阳位置定节气，小寒与「候雁北、鹊始巢」等物候并列，帮助安排越冬农事与历法推步校验。本篇详细科普待补充。'
      }
    ]
  },
  dahan: {
    slug: 'dahan',
    term: '大寒',
    title: '大寒：节气环的深冬节点',
    ready: false,
    summary: '大寒黄经 300°，距立春仅约半个月，是理解「气已转暖、天尚余寒」的关键。',
    sections: [
      {
        body:
          '大寒为二十四节气中最后一个「节」（非中气），太阳黄经 300°。其后便是立春，岁序将转。教学上可对照轨道页太阳位置，观察黄道推进。'
      },
      { body: '本篇科普短文筹备中，敬请期待。' }
    ]
  },
  lichun: {
    slug: 'lichun',
    term: '立春',
    title: '立春与岁首：节气如何定「年」',
    ready: true,
    summary: '立春太阳黄经 315°，传统上标志春季与岁首观念，是理解「以气定候」的起点。',
    sections: [
      {
        body:
          '立春时太阳到达黄经 315°，在现行农历中常作为岁首划分参考（与春节并用，各有历史渊源）。「立」有开始之义：从天文上看，白昼开始变长，太阳直射点北移，北半球接收辐射渐增。'
      },
      {
        heading: '历法为何关注立春',
        body:
          '中国古代历算既要安排朔望月（月相），也要对齐回归年（节气）。立春作为春季第一个节气，是检验回归年长是否准确的重要锚点——若节气时刻系统性漂移，就需要改历调整常数。'
      },
      {
        heading: '教学提示',
        body:
          '在七政轨道页将日期拨至立春前后，可对照太阳黄经圈与侧栏「已过 N 天」，体会「气先至、候后应」：节气按太阳位置精确划分，物候与气温则因地域而异。'
      }
    ]
  },
  yushui: {
    slug: 'yushui',
    term: '雨水',
    title: '雨水：中气与降水节律',
    ready: false,
    summary: '雨水黄经 330°，属「中气」，体现节气奇偶与中气/节的配对结构。',
    sections: [
      {
        body:
          '雨水是正月的中气（偶数位节气），太阳黄经 330°。名称反映华南等地降水增多的气候统计，并非预报某日必雨。理解中气有助于读懂「节—气—候」三层结构。'
      },
      { body: '本篇科普短文筹备中，敬请期待。' }
    ]
  },
  jingzhe: {
    slug: 'jingzhe',
    term: '惊蛰',
    title: '惊蛰：春雷与黄经 345°',
    ready: false,
    summary: '惊蛰标志太阳接近春分，昼夜渐近等长，是春季认星与观象的常用节点。',
    sections: [
      {
        body:
          '惊蛰太阳黄经 345°，约公历 3 月 5–6 日。古人以雷响、蛰虫苏醒概括此时物候；现代授时仍依太阳视位置定节气，与地域雷暴早晚无严格对应。'
      },
      { body: '本篇科普短文筹备中，敬请期待。' }
    ]
  },
  chunfen: {
    slug: 'chunfen',
    term: '春分',
    title: '春分与昼夜平分',
    ready: true,
    summary: '春分太阳黄经 0°，全球昼夜大致等长，是理解回归年与坐标起点的核心节气。',
    sections: [
      {
        body:
          '春分时太阳直射赤道，理论上全球昼夜等长（极昼极夜地区除外）。在中国传统历法中，春分点黄经定义为 0°，是黄道坐标系的起点，也是二十四节气序列的中枢。'
      },
      {
        heading: '为什么是「分」',
        body:
          '「分」即平分：春分、秋分把昼夜、寒暑各分为近似相等两段。从地球公转看，此时地轴倾斜方向与公转方向组合，使得南北半球受光时间接近。'
      },
      {
        heading: '与历法推步',
        body:
          '测定春分时刻是确定回归年长度的重要手段。郭守敬等人在元初组织全国测影，正是为了校准回归年长，使授时历与太阳视运动长期吻合。'
      },
      {
        heading: '在七政中体验',
        body:
          '将轨道页日期设为春分日，观察太阳位于黄道 0° 附近、侧栏显示「春分 · 已过 0 天」，并对照月相与农历日期，理解「太阳位置—节气—农历月日」三条时间线的关系。'
      }
    ]
  },
  qingming: {
    slug: 'qingming',
    term: '清明',
    title: '清明：气清景明与节气定名',
    ready: true,
    summary: '清明黄经 15°，名称来自仲春清爽天象，后与传统节日融合，但天文定义仍依太阳位置。',
    sections: [
      {
        body:
          '清明太阳黄经 15°，在春分之后约半个月。名称「气清景明」概括此时北方多风、天空澄澈的常见天气统计，并非对某一天的预报。'
      },
      {
        heading: '节气与节日',
        body:
          '历史上清明由节气发展为扫墓踏青节日，但天文历算中的清明仍严格按太阳黄经 15° 计算。教学上应区分「文化节日日期」与「天文节气时刻」，避免混为一谈。'
      },
      {
        heading: '授时关联',
        body:
          '清明前后正是认星好时节：夜间渐短、春季标志星（如角宿一）南天醒目。可结合列宿页与轨道页，对照青龙七宿与太阳黄经推进。'
      }
    ]
  },
  guyu: {
    slug: 'guyu',
    term: '谷雨',
    title: '谷雨：春末的中气与农时',
    ready: false,
    summary: '谷雨黄经 30°，标志春季最后一个中气，连接立夏与农事安排。',
    sections: [
      {
        body:
          '谷雨太阳黄经 30°，意为「雨生百谷」，反映华南至华北春播关键期对降水的依赖。历法上它是春季收官的中气，下一节气立夏将进入夏季序列。'
      },
      { body: '本篇科普短文筹备中，敬请期待。' }
    ]
  },
  lixia: {
    slug: 'lixia',
    term: '立夏',
    title: '立夏：夏季的开始',
    ready: false,
    summary: '立夏黄经 45°，标志太阳高度继续北移，是理解「四立」与季节划分的节点。',
    sections: [
      {
        body:
          '立夏太阳黄经 45°，传统上视为夏季开端。与立春、立秋、立冬合称「四立」，在轨道页节气圈上通常以铭文强调，便于快速定位季节象限。'
      },
      { body: '本篇科普短文筹备中，敬请期待。' }
    ]
  },
  xiaoman: {
    slug: 'xiaoman',
    term: '小满',
    title: '小满：麦类将熟的中气',
    ready: false,
    summary: '小满黄经 60°，体现「物至于此小得盈满」的农时概括。',
    sections: [
      { body: '小满太阳黄经 60°，属夏初中气。天文定义不依赖具体作物状态，而是太阳视位置的精确推步结果。' },
      { body: '本篇科普短文筹备中，敬请期待。' }
    ]
  },
  mangzhong: {
    slug: 'mangzhong',
    term: '芒种',
    title: '芒种：夏收夏种的节气',
    ready: false,
    summary: '芒种黄经 75°，标志仲夏农忙，是理解节气服务农时的典型例。',
    sections: [
      { body: '芒种太阳黄经 75°，名称概括有芒作物收种。历法提供统一的时间坐标，各地农事则依气候微调。' },
      { body: '本篇科普短文筹备中，敬请期待。' }
    ]
  },
  xiazhi: {
    slug: 'xiazhi',
    term: '夏至',
    title: '夏至与最长白昼',
    ready: true,
    summary: '夏至太阳黄经 90°，北半球白昼最长，是理解回归年与黄赤交角的关键节气。',
    sections: [
      {
        body:
          '夏至时太阳直射北回归线（约北纬 23.5°），北半球白昼达到全年最长。太阳黄经 90°，在七政黄道圈上位于「夏」象限中部，与冬至（270°）相对。'
      },
      {
        heading: '测影与历法',
        body:
          '古代通过正午日影长度测定夏至、冬至，反推回归年长。夏至影短、冬至影长，这一对比是《周髀》等传统测天方法的核心，也是后来《授时历》等精密历法的观测基础。'
      },
      {
        heading: '昼夜不等长的原因',
        body:
          '即使夏至「白昼最长」，高纬度地区仍可能出现极昼；低纬度地区昼夜差异相对较小。差异根源是地轴倾角（约 23.4°）与公转轨道的几何关系，而非太阳大小或距离变化（距离影响仅约 3%，远小于倾角效应）。'
      }
    ]
  },
  xiaoshu: {
    slug: 'xiaoshu',
    term: '小暑',
    title: '小暑：暑气初盛',
    ready: false,
    summary: '小暑黄经 105°，标志入伏前后，气温通常尚未达全年峰值。',
    sections: [
      { body: '小暑太阳黄经 105°。「暑」指炎热，但气象统计上大暑往往更热——节气名反映一般规律，非绝对极值。' },
      { body: '本篇科普短文筹备中，敬请期待。' }
    ]
  },
  dashu: {
    slug: 'dashu',
    term: '大暑',
    title: '大暑：夏季的最后一个中气',
    ready: false,
    summary: '大暑黄经 120°，之后便是立秋，可对照轨道页理解黄道推进。',
    sections: [
      { body: '大暑太阳黄经 120°，为夏季最后一个中气。立秋紧随其后，标志季节序列进入秋季。' },
      { body: '本篇科普短文筹备中，敬请期待。' }
    ]
  },
  liqiu: {
    slug: 'liqiu',
    term: '立秋',
    title: '立秋：秋季的开始',
    ready: false,
    summary: '立秋黄经 135°，「四立」之一，标志太阳南移趋势加强。',
    sections: [
      { body: '立秋太阳黄经 135°。天文上进入秋季序列，但许多地区仍处高温，体现「气已立秋、天尚余暑」。' },
      { body: '本篇科普短文筹备中，敬请期待。' }
    ]
  },
  chushu: {
    slug: 'chushu',
    term: '处暑',
    title: '处暑：暑气将止的中气',
    ready: false,
    summary: '处暑黄经 150°，「处」有止息之意，标志炎热时段趋近结束。',
    sections: [
      { body: '处暑太阳黄经 150°，属秋季中气。理解「处暑」需结合太阳高度降低与昼夜变短，而非单日气温。' },
      { body: '本篇科普短文筹备中，敬请期待。' }
    ]
  },
  bailu: {
    slug: 'bailu',
    term: '白露',
    title: '白露：昼夜温差与凝露',
    ready: false,
    summary: '白露黄经 165°，标志夜间辐射降温增强，是秋季认星与观月的好时节。',
    sections: [
      { body: '白露太阳黄经 165°。名称来自清晨凝露的常见现象，与太阳高度降低、夜间变长相关。' },
      { body: '本篇科普短文筹备中，敬请期待。' }
    ]
  },
  qiufen: {
    slug: 'qiufen',
    term: '秋分',
    title: '秋分：再次昼夜平分',
    ready: false,
    summary: '秋分黄经 180°，与春分相对，标志太阳直射点南移穿越赤道。',
    sections: [
      {
        body:
          '秋分太阳黄经 180°，全球昼夜再次大致等长。此后北半球昼短夜长，与春分形成对称。历法推步中，秋分与春分同为检验回归年对称性的重要节点。'
      },
      { body: '本篇科普短文筹备中，敬请期待。' }
    ]
  },
  hanlu: {
    slug: 'hanlu',
    term: '寒露',
    title: '寒露：深秋的中气',
    ready: false,
    summary: '寒露黄经 195°，标志气温下降、露水带寒，是理解节气与物候统计的例。',
    sections: [
      { body: '寒露太阳黄经 195°。天文时刻由太阳视位置决定，与某年是否「提前冷」无必然联系。' },
      { body: '本篇科普短文筹备中，敬请期待。' }
    ]
  },
  shuangjiang: {
    slug: 'shuangjiang',
    term: '霜降',
    title: '霜降：秋季最后一个节气',
    ready: false,
    summary: '霜降黄经 210°，之后便是立冬，标志冬季序列即将开始。',
    sections: [
      { body: '霜降太阳黄经 210°。名称概括初霜常见时段，纬度越高越早。' },
      { body: '本篇科普短文筹备中，敬请期待。' }
    ]
  },
  lidong: {
    slug: 'lidong',
    term: '立冬',
    title: '立冬：冬季的开始',
    ready: false,
    summary: '立冬黄经 225°，「四立」之一，标志太阳继续南移、昼短夜长。',
    sections: [
      { body: '立冬太阳黄经 225°。传统上视为冬季开端，可与轨道页对照太阳在黄道「冬」象限的位置。' },
      { body: '本篇科普短文筹备中，敬请期待。' }
    ]
  },
  xiaoxue: {
    slug: 'xiaoxue',
    term: '小雪',
    title: '小雪：初雪时节的中气',
    ready: false,
    summary: '小雪黄经 240°，标志降水相态转变的统计时段。',
    sections: [
      { body: '小雪太阳黄经 240°。名称反映北方初雪概率上升，非预报某日必雪。' },
      { body: '本篇科普短文筹备中，敬请期待。' }
    ]
  },
  daxue: {
    slug: 'daxue',
    term: '大雪',
    title: '大雪：仲冬的中气',
    ready: false,
    summary: '大雪黄经 255°，距冬至约半个月，是理解节气均匀划分（15° 一节）的节点。',
    sections: [
      { body: '大雪太阳黄经 255°。相邻节气太阳黄经相差 15°，约对应公历半个月。' },
      { body: '本篇科普短文筹备中，敬请期待。' }
    ]
  },
  dongzhi: {
    slug: 'dongzhi',
    term: '冬至',
    title: '冬至测影与回归年',
    ready: true,
    summary: '冬至太阳黄经 270°，北半球白昼最短，是古代测定回归年的核心观测。',
    sections: [
      {
        body:
          '冬至太阳直射南回归线，北半球白昼最短、正午太阳高度最低。黄经 270°，与夏至（90°）相距 180°，在七政黄道圈上位于「冬」象限核心。'
      },
      {
        heading: '为什么用定气不用平气',
        body:
          '历史上曾用「平气」：把回归年等分为 24 份，节气时刻按公式均匀排布。但地球公转轨道是椭圆，太阳视运动有快有慢（日行盈缩），均匀平气与真实天象会逐渐偏离。'
      },
      {
        heading: '定气的含义',
        body:
          '「定气」按太阳实际黄经划分：太阳到达 270° 的时刻即为冬至。这样节气与季节、昼夜长度始终对齐。现行农历与公历节气均采用定气思路，由天文计算给出精确时刻。'
      },
      {
        heading: '测影传统',
        body:
          '郭守敬在元初组织多地测影，以冬至、夏至影长反推回归年长 365.2425 日，精度领先世界。冬至因此不仅是文化节日，更是科学授时的基准点。'
      }
    ]
  }
}

/**
 * @param {string} slug
 * @returns {JieqiTopic | undefined}
 */
export function getJieqiTopicBySlug(slug) {
  return TOPICS[slug]
}

/**
 * @param {string} termName
 * @returns {JieqiTopic | undefined}
 */
export function getJieqiTopicByTerm(termName) {
  const slug = JIEQI_SLUG_BY_TERM[termName]
  return slug ? TOPICS[slug] : undefined
}

/**
 * @returns {JieqiTopic[]}
 */
export function getAllJieqiTopics() {
  return JIEQI.map((jq) => {
    const slug = JIEQI_SLUG_BY_TERM[jq.name]
    return TOPICS[slug]
  }).filter(Boolean)
}

/**
 * @param {string} termName
 * @returns {string | undefined}
 */
export function getJieqiTopicSlug(termName) {
  return JIEQI_SLUG_BY_TERM[termName]
}
