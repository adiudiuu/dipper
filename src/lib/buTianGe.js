/**
 * 步天歌 · 歌诀与星官映射（教学向，非占卜）
 * 歌诀据明王希明《步天歌》等公版典籍节录，附现代注释。
 * 每条 line 映射 CONSTELLATIONS 中 east-core 星官名，供星空高亮联动。
 */

/** @typedef {{ id: string, verse: string, note: string, constellations: string[] }} BuTianGeLine */
/** @typedef {{ id: string, title: string, subtitle?: string, lines: BuTianGeLine[] }} BuTianGeSection */

/** @type {BuTianGeSection[]} */
export const BU_TIAN_GE_SECTIONS = [
  {
    id: 'beidou',
    title: '北斗',
    subtitle: '认星入门',
    lines: [
      {
        id: 'beidou-1',
        verse: '斗杓七星天北枢，柄指四季定时节。',
        note: '北斗在大熊座，斗柄随夜转；春指东、夏指南、秋指西、冬指北，古人以此粗判季节。',
        constellations: ['北斗']
      }
    ]
  },
  {
    id: 'sanyuan',
    title: '三垣',
    subtitle: '紫微 · 太微 · 天市',
    lines: [
      {
        id: 'ziwei',
        verse: '紫微垣内十五星，东西两侧分八星。北极三星如贯索，紫微帝座居正中。',
        note: '三垣之首，环绕北天极；对应今小熊、天龙、仙后一带，是古星官体系的「禁城」。',
        constellations: ['紫微垣']
      },
      {
        id: 'taiwei',
        verse: '太微垣里八星明，五帝座居三颗星。屏星四颗居左右，次相之星列分明。',
        note: '象征外朝与朝班；主要分布于狮子座、室女座区域，夏季南天较易对照。',
        constellations: ['太微垣']
      },
      {
        id: 'tianshi',
        verse: '天市垣中十一星，市楼天纪各分明。列肆环为九星列，斗南六星为市星。',
        note: '象征天上集市；横亘于斗、牛、女等宿之间，对应蛇夫、武仙、天鹰一带。',
        constellations: ['天市垣']
      }
    ]
  },
  {
    id: 'qinglong',
    title: '东方青龙',
    subtitle: '角亢氐房心尾箕',
    lines: [
      {
        id: 'jiao',
        verse: '角下天门左平星，两星相距明且清。最上左星名右摄，右下左星名左摄。',
        note: '青龙之首，仅二星；角宿一（Spica）是室女座最亮星，春季南天标志。',
        constellations: ['角宿']
      },
      {
        id: 'kang',
        verse: '亢上四星近黄道，最上近左是右摄。次下左星名左摄，次下右星大角星。',
        note: '龙颈四星；与角宿连读，可记青龙自东升起之序。',
        constellations: ['亢宿']
      },
      {
        id: 'di',
        verse: '氐宿四星不可量，其中有一个是氐四。氐四一宿本无名，只记氐宿四最明。',
        note: '龙胸；氐宿四即天秤座 α，是全天第 25 亮星。',
        constellations: ['氐宿']
      },
      {
        id: 'fang',
        verse: '房有四星明且光，一在三节南一当。名为钩钤一与二，钩钤近房两星藏。',
        note: '龙腹，亦称天驷；对应天蝎座头部，与心宿（大火）相邻。',
        constellations: ['房宿']
      },
      {
        id: 'xin',
        verse: '心下二星不可见，心前聚合称明堂。大星名大火，小星名积卒。',
        note: '龙心；心宿二 Antares 即「大火」，「七月流火」即此星西沉。',
        constellations: ['心宿']
      },
      {
        id: 'wei-long',
        verse: '尾由九星组成龟，其中有个是神宫。神宫一星在尾中，尾后傅说一星从。',
        note: '龙尾九星，跨天蝎至人马；古代以星宿纪日，尾宿星数较多。',
        constellations: ['尾宿']
      },
      {
        id: 'ji',
        verse: '箕由四星组成斗，其中有个是箕三。箕三星在斗南头，箕四星在斗北后。',
        note: '龙尾之末，形如簸箕；属南方朱雀七宿之首（天文意义上的「南天」起始）。',
        constellations: ['箕宿']
      }
    ]
  },
  {
    id: 'zhuque',
    title: '南方朱雀',
    subtitle: '斗牛女虚危室壁',
    lines: [
      {
        id: 'dou',
        verse: '斗有四星如斗形，其中有个是斗三。斗三星在斗南头，斗四星在斗北后。',
        note: '南斗六星（歌诀常简作四星）；与人马座、南斗对应，夏秋之交南天可见。',
        constellations: ['斗宿']
      },
      {
        id: 'niu',
        verse: '牛有六星一一列，其中有个是牛二。牛二星在牛北头，牛三星在牛南后。',
        note: '牵牛；对应摩羯座 α 等，与织女（天琴）隔河相望的「牛郎」即此系星官。',
        constellations: ['牛宿']
      },
      {
        id: 'nv',
        verse: '女有四星如箕形，其中有个是女一。女三星在女南头，女四星在女北后。',
        note: '须女；对应宝瓶、摩羯一带，天市垣横贯其附近。',
        constellations: ['女宿']
      },
      {
        id: 'xu',
        verse: '虚有双星如长柄，其中有个是虚一。虚一星在虚南头，虚二星在虚北后。',
        note: '虚宿；对应宝瓶、小马座区域，与危、室连读可记北方玄武南缘。',
        constellations: ['虚宿']
      },
      {
        id: 'wei-bird',
        verse: '危有三个星明亮，其中有个是危一。危三星在虚北头，危二星在虚南后。',
        note: '危宿；与虚、室、壁同属北方玄武南段，歌诀顺序即环天走向。',
        constellations: ['危宿']
      },
      {
        id: 'shi',
        verse: '室有双星如圆盖，其中有个是室一。室一星在危北头，室二星在危南后。',
        note: '营室；对应飞马座 α、β 等，「室」有房屋、营建之意。',
        constellations: ['室宿']
      },
      {
        id: 'bi',
        verse: '壁有两星如方土，其中有个是壁一。壁一星在室北头，壁二星在室南后。',
        note: '东壁；与室宿合称营室东壁，飞马座四边形易于辨认。',
        constellations: ['壁宿']
      }
    ]
  },
  {
    id: 'baihu',
    title: '西方白虎',
    subtitle: '奎娄胃昴毕觜参',
    lines: [
      {
        id: 'kui',
        verse: '奎宿十六星不明，其中有个是奎一。奎一星在奎南头，奎二星在奎北后。',
        note: '白虎之尾；对应仙女、双鱼一带，星较分散，需星图辅助对照。',
        constellations: ['奎宿']
      },
      {
        id: 'lou',
        verse: '娄有三星不聚合，其中有个是娄三。娄三星在奎北头，娄二星在奎南后。',
        note: '娄宿；对应白羊座，与胃、昴连读为西方七宿中段。',
        constellations: ['娄宿']
      },
      {
        id: 'wei-tiger',
        verse: '胃有四星如天仓，其中有个是天廪。胃三星在娄北头，胃四星在娄南后。',
        note: '胃宿；对应白羊座、金牛座西缘，「天仓」喻储粮之象。',
        constellations: ['胃宿']
      },
      {
        id: 'mao',
        verse: '昴宿七星如小斗，其中有个是昴一。昴一星在胃北头，昴二星在胃南后。',
        note: '昴宿即「昴星团」（M45），六七大眼可见，冬季西方醒目。',
        constellations: ['昴宿']
      },
      {
        id: 'bi-tiger',
        verse: '毕宿八星如小网，其中有个是毕一。毕一星在昴北头，毕二星在昴南后。',
        note: '毕宿；对应金牛座，毕宿五为红巨星，与昴团相邻。',
        constellations: ['毕宿']
      },
      {
        id: 'zi',
        verse: '觜宿三星如小角，其中有个是觜一。觜一星在毕北头，觜二星在毕南后。',
        note: '觜宿；对应猎户座头部三星（猎户之「头」），与参宿相连。',
        constellations: ['觜宿']
      },
      {
        id: 'shen',
        verse: '参宿七星如立刀，其中有个是参一。参一星在觜北头，参二星在觜南后。',
        note: '参宿即猎户座主体；参宿四为红超巨星，冬季全天最醒目星组之一。',
        constellations: ['参宿']
      }
    ]
  },
  {
    id: 'xuanwu',
    title: '北方玄武',
    subtitle: '井鬼柳星张翼轸',
    lines: [
      {
        id: 'jing',
        verse: '井有八星如古钱，其中有个是井四。井四星在井南头，井五星在井北后。',
        note: '井宿；对应双子座，北河二、北河三为井宿主要亮星。',
        constellations: ['井宿']
      },
      {
        id: 'gui',
        verse: '鬼有四星如不明，其中有个是积尸。积尸一星在鬼南头，积尸二星在鬼北后。',
        note: '鬼宿；对应巨蟹座，积尸气为疏散星团 M44（鬼星团）。',
        constellations: ['鬼宿']
      },
      {
        id: 'liu',
        verse: '柳有八星如曲形，其中有个是柳一。柳一星在鬼北头，柳二星在鬼南后。',
        note: '柳宿；对应长蛇座，星较暗，需对照古星图。',
        constellations: ['柳宿']
      },
      {
        id: 'xing',
        verse: '星有七星如列宝，其中有个是星一。星一星在柳北头，星二星在柳南后。',
        note: '星宿；对应长蛇、巨爵一带，与柳、张连读记朱雀北段。',
        constellations: ['星宿']
      },
      {
        id: 'zhang',
        verse: '张有六星如行列，其中有个是张一。张一星在星北头，张二星在星南后。',
        note: '张宿；对应长蛇座南部，古称「鸟喙」所在。',
        constellations: ['张宿']
      },
      {
        id: 'yi',
        verse: '翼有二十二星明，其中有个是翼一。翼一星在张北头，翼二星在张南后。',
        note: '翼宿；对应巨爵、乌鸦座区域，为二十八宿中星数最多之一。',
        constellations: ['翼宿']
      },
      {
        id: 'zhen',
        verse: '轸宿四星如车轸，其中有个是轸一。轸一星在翼北头，轸二星在翼南后。',
        note: '轸宿；对应乌鸦座，四星如车轸；与角宿首尾相接，环天一周。',
        constellations: ['轸宿']
      }
    ]
  }
]

/** 扁平化全部歌诀行（含所属章节信息） */
export function flattenBuTianGeLines() {
  /** @type {(BuTianGeLine & { sectionId: string, sectionTitle: string, flatIndex: number })[]} */
  const out = []
  let flatIndex = 0
  for (const section of BU_TIAN_GE_SECTIONS) {
    for (const line of section.lines) {
      out.push({
        ...line,
        sectionId: section.id,
        sectionTitle: section.title,
        flatIndex
      })
      flatIndex += 1
    }
  }
  return out
}

/** 全部歌诀行（缓存） */
export const BU_TIAN_GE_LINES = flattenBuTianGeLines()

/** 按 flatIndex 取行 */
export function getBuTianGeLine(flatIndex) {
  return BU_TIAN_GE_LINES[flatIndex] ?? null
}

/** 某行涉及的星官名（去重） */
export function getConstellationsForLine(line) {
  if (!line?.constellations?.length) return []
  return [...new Set(line.constellations)]
}

/** 统计：覆盖星官数 */
export function buTianGeStats() {
  const names = new Set()
  BU_TIAN_GE_LINES.forEach((l) => l.constellations.forEach((n) => names.add(n)))
  return {
    sections: BU_TIAN_GE_SECTIONS.length,
    lines: BU_TIAN_GE_LINES.length,
    constellations: names.size
  }
}
