/**
 * 四象拆解 · 二十八宿的「动物身体部位」命名逻辑（教学向）
 *
 * 每象 7 宿按「体序」（首→尾 / 尾→首）排列，
 * 部位标注与 constellationCulture.js 的口径保持一致，
 * 供 BuTianSkyScene 用连线勾勒兽形 + 部位标签。
 *
 * highlight 名必须与 CONSTELLATIONS 中的东象 core 完全一致。
 */

/**
 * @typedef {{
 *   id: string,
 *   name: string,
 *   color: string,
 *   mansions: Array<{ name: string, part: string }>
 * }} FourAnimal
 */

/** @type {FourAnimal[]} */
export const FOUR_ANIMALS = [
  {
    id: 'qinglong',
    name: '青龙',
    color: '#5e9c78',
    mansions: [
      { name: '角宿', part: '角' },
      { name: '亢宿', part: '颈' },
      { name: '氐宿', part: '胸' },
      { name: '房宿', part: '腹' },
      { name: '心宿', part: '心' },
      { name: '尾宿', part: '尾' },
      { name: '箕宿', part: '尾末' }
    ]
  },
  {
    id: 'xuanwu',
    name: '玄武',
    color: '#5d8fb0',
    mansions: [
      { name: '斗宿', part: '蛇首' },
      { name: '牛宿', part: '蛇身' },
      { name: '女宿', part: '蛇身' },
      { name: '虚宿', part: '龟身' },
      { name: '危宿', part: '龟尾' },
      { name: '室宿', part: '龟甲' },
      { name: '壁宿', part: '龟甲' }
    ]
  },
  {
    id: 'baihu',
    name: '白虎',
    color: '#d8c9a4',
    mansions: [
      { name: '奎宿', part: '尾' },
      { name: '娄宿', part: '身' },
      { name: '胃宿', part: '胃' },
      { name: '昴宿', part: '首' },
      { name: '毕宿', part: '身' },
      { name: '觜宿', part: '口' },
      { name: '参宿', part: '脊' }
    ]
  },
  {
    id: 'zhuque',
    name: '朱雀',
    color: '#d07a5a',
    mansions: [
      { name: '井宿', part: '首' },
      { name: '鬼宿', part: '目' },
      { name: '柳宿', part: '喙' },
      { name: '星宿', part: '颈' },
      { name: '张宿', part: '嗉' },
      { name: '翼宿', part: '翅' },
      { name: '轸宿', part: '尾' }
    ]
  }
]

/** 按 id 取四象条目 */
export function getFourAnimalById(id) {
  return FOUR_ANIMALS.find((a) => a.id === id) || null
}

/** 某象全部宿名（用于星空高亮） */
export function getAnimalMansionNames(animal) {
  if (!animal?.mansions?.length) return []
  return animal.mansions.map((m) => m.name)
}