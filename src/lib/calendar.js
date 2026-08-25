const DEG = Math.PI / 180;
const DAY_MS = 86400000;
const BJ_MS = 8 * 3600 * 1000;
const SYNODIC = 29.530588861;

const GAN = "甲乙丙丁戊己庚辛壬癸";
const ZHI = "子丑寅卯辰巳午未申酉戌亥";
const SHENGXIAO = "鼠牛虎兔龙蛇马羊猴鸡狗猪";
const WEEKDAY = "日一二三四五六";
const MONTH_CN = ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];
const DAY_CN = [
  "", "初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
  "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
  "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十"
];

/** 道历元年：公元前 2697（甲子）。道历年数 = 公历年 + 2697 */
const DAO_YEAR_OFFSET = 2697;

const JIEQI = [
  { name: "小寒", lon: 285, zhong: false },
  { name: "大寒", lon: 300, zhong: true },
  { name: "立春", lon: 315, zhong: false },
  { name: "雨水", lon: 330, zhong: true },
  { name: "惊蛰", lon: 345, zhong: false },
  { name: "春分", lon: 0, zhong: true },
  { name: "清明", lon: 15, zhong: false },
  { name: "谷雨", lon: 30, zhong: true },
  { name: "立夏", lon: 45, zhong: false },
  { name: "小满", lon: 60, zhong: true },
  { name: "芒种", lon: 75, zhong: false },
  { name: "夏至", lon: 90, zhong: true },
  { name: "小暑", lon: 105, zhong: false },
  { name: "大暑", lon: 120, zhong: true },
  { name: "立秋", lon: 135, zhong: false },
  { name: "处暑", lon: 150, zhong: true },
  { name: "白露", lon: 165, zhong: false },
  { name: "秋分", lon: 180, zhong: true },
  { name: "寒露", lon: 195, zhong: false },
  { name: "霜降", lon: 210, zhong: true },
  { name: "立冬", lon: 225, zhong: false },
  { name: "小雪", lon: 240, zhong: true },
  { name: "大雪", lon: 255, zhong: false },
  { name: "冬至", lon: 270, zhong: true }
];
const ZHONG_LONS = JIEQI.filter((j) => j.zhong).map((j) => j.lon);

/**
 * 当地恒星时 Local Sidereal Time（度）
 * 给定儒略日 JD 与东经 longitudeDeg，返回当地子午线上的春分点时角（度）。
 * 用于地景视角下天球围绕 Y 轴旋转，使星空与观测者当地时间对齐。
 * @param {number} jd - 儒略日
 * @param {number} longitudeDeg - 东经（度），北京 = 116.4
 * @returns {number} 当地恒星时（度，0-360）
 */
export function localSiderealDeg(jd, longitudeDeg) {
  const T = (jd - 2451545.0) / 36525.0
  let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + T * T * (0.000387933 - T / 38710000.0)
  gmst = ((gmst % 360) + 360) % 360
  return ((gmst + longitudeDeg) % 360 + 360) % 360
}

function norm360(x) {
  x %= 360;
  return x < 0 ? x + 360 : x;
}

function lonDiff(a, b) {
  return norm360(a - b);
}

function jdToDate(jd) {
  return new Date((jd - 2440587.5) * DAY_MS);
}

function beijingNoonJD(y, m, d) {
  return Date.UTC(y, m - 1, d, 4, 0, 0) / DAY_MS + 2440587.5;
}

/** 毫秒时间戳 → 儒略日（与 jdToDate 互逆） */
function msToJD(ms) {
  return ms / DAY_MS + 2440587.5;
}

function beijingYMD(date) {
  const t = new Date(date.getTime() + BJ_MS);
  return {
    y: t.getUTCFullYear(),
    m: t.getUTCMonth() + 1,
    d: t.getUTCDate(),
    w: t.getUTCDay(),
    h: t.getUTCHours(),
    min: t.getUTCMinutes()
  };
}

/** 北京时辰序：子=0 … 亥=11（23:00–01:00 为子时） */
function shichenIndexFromHour(h) {
  return Math.floor((((h % 24) + 24 + 1) % 24) / 2);
}

function beijingDayStartMs(y, m, d) {
  return Date.UTC(y, m - 1, d) - BJ_MS;
}

/** 北京日历日序号（按公历年月日标签序列，便于日差） */
function beijingDayIndex(y, m, d) {
  return Math.floor(Date.UTC(y, m - 1, d) / DAY_MS);
}

/** 日序号 → 公历年月日标签 */
function ymdFromDayIndex(dayIdx) {
  const dt = new Date(dayIdx * DAY_MS);
  return {
    y: dt.getUTCFullYear(),
    m: dt.getUTCMonth() + 1,
    d: dt.getUTCDate()
  };
}

function ymdFromJD(jd) {
  return beijingYMD(jdToDate(jd));
}

function sunApparentLongitude(jd) {
  const T = (jd - 2451545.0) / 36525;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const Mr = M * DEG;
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mr) +
    0.000289 * Math.sin(3 * Mr);
  const Omega = 125.04 - 1934.136 * T;
  return norm360(L0 + C - 0.00569 - 0.00478 * Math.sin(Omega * DEG));
}

function findSunLongitudeJD(targetLon, guessJD) {
  targetLon = norm360(targetLon);
  // 窗口需覆盖相邻节气间距（≈15d），取 ±22d 并校验收敛
  let lo = guessJD - 22;
  let hi = guessJD + 22;
  for (let i = 0; i < 56; i++) {
    const mid = (lo + hi) / 2;
    let diff = sunApparentLongitude(mid) - targetLon;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    if (diff < 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

function dongzhiJD(year) {
  return findSunLongitudeJD(270, beijingNoonJD(year, 12, 21));
}

/** Meeus ch.49 朔 */
function trueNewMoonJD(k) {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const T4 = T3 * T;
  const JDE =
    2451550.09766 +
    29.530588861 * k +
    0.00015437 * T2 -
    0.00000015 * T3 +
    0.00000000073 * T4;
  const E = 1 - 0.002516 * T - 0.0000074 * T2;
  const M = norm360(2.5534 + 29.1053567 * k - 0.0000014 * T2 - 0.00000011 * T3) * DEG;
  const Mp =
    norm360(201.5643 + 385.81693528 * k + 0.0107582 * T2 + 0.00001238 * T3 - 0.000000058 * T4) * DEG;
  const F =
    norm360(160.7108 + 390.67050284 * k - 0.0016118 * T2 - 0.00000227 * T3 + 0.000000011 * T4) * DEG;
  const Om = norm360(124.7746 - 1.56375588 * k + 0.0020672 * T2 + 0.00000215 * T3) * DEG;
  const A = [
    299.77 + 0.107408 * k - 0.009173 * T2,
    251.88 + 0.016321 * k,
    251.83 + 26.651886 * k,
    349.42 + 36.412478 * k,
    84.66 + 18.206239 * k,
    141.74 + 53.303771 * k,
    207.14 + 2.453732 * k,
    154.84 + 7.30686 * k,
    34.52 + 27.261239 * k,
    207.19 + 0.121824 * k,
    291.34 + 1.844379 * k,
    161.72 + 24.198154 * k,
    239.56 + 25.513099 * k,
    331.55 + 3.592518 * k
  ].map((x) => x * DEG);

  const corr =
    -0.4072 * Math.sin(Mp) +
    0.17241 * E * Math.sin(M) +
    0.01608 * Math.sin(2 * Mp) +
    0.01039 * Math.sin(2 * F) +
    0.00739 * E * Math.sin(Mp - M) -
    0.00514 * E * Math.sin(Mp + M) +
    0.00208 * E * E * Math.sin(2 * M) -
    0.00111 * Math.sin(Mp - 2 * F) -
    0.00057 * Math.sin(Mp + 2 * F) +
    0.00056 * E * Math.sin(2 * Mp + M) -
    0.00042 * Math.sin(3 * Mp) +
    0.00042 * E * Math.sin(M + 2 * F) +
    0.00038 * E * Math.sin(M - 2 * F) -
    0.00024 * E * Math.sin(2 * Mp - M) -
    0.00017 * Math.sin(Om) -
    0.00007 * Math.sin(Mp + 2 * M) +
    0.00004 * Math.sin(2 * Mp - 2 * F) +
    0.00004 * Math.sin(3 * M) +
    0.00003 * Math.sin(Mp + M - 2 * F) +
    0.00003 * Math.sin(2 * Mp + 2 * F) -
    0.00003 * Math.sin(Mp + M + 2 * F) +
    0.00003 * Math.sin(Mp - M + 2 * F) -
    0.00002 * Math.sin(Mp - M - 2 * F) -
    0.00002 * Math.sin(3 * Mp + M) +
    0.00002 * Math.sin(4 * Mp);

  const planetary =
    0.000325 * Math.sin(A[0]) +
    0.000165 * Math.sin(A[1]) +
    0.000164 * Math.sin(A[2]) +
    0.000126 * Math.sin(A[3]) +
    0.00011 * Math.sin(A[4]) +
    0.000062 * Math.sin(A[5]) +
    0.00006 * Math.sin(A[6]) +
    0.000056 * Math.sin(A[7]) +
    0.000047 * Math.sin(A[8]) +
    0.000042 * Math.sin(A[9]) +
    0.00004 * Math.sin(A[10]) +
    0.000037 * Math.sin(A[11]) +
    0.000035 * Math.sin(A[12]) +
    0.000023 * Math.sin(A[13]);

  return JDE + corr + planetary;
}

function kNearJD(jd) {
  return Math.round((jd - 2451550.09766) / SYNODIC);
}

function previousNewMoon(jd) {
  let k = kNearJD(jd);
  let t = trueNewMoonJD(k);
  while (t > jd) {
    k -= 1;
    t = trueNewMoonJD(k);
  }
  while (trueNewMoonJD(k + 1) <= jd) {
    k += 1;
    t = trueNewMoonJD(k);
  }
  return t;
}

function listNewMoons(jdStart, jdEnd) {
  const moons = [];
  let t = previousNewMoon(jdStart);
  let k = kNearJD(t);
  for (let dk = -2; dk <= 2; dk++) {
    if (Math.abs(trueNewMoonJD(k + dk) - t) < 0.4) {
      k += dk;
      break;
    }
  }
  t = trueNewMoonJD(k);
  while (t <= jdEnd + 40) {
    moons.push(t);
    k += 1;
    t = trueNewMoonJD(k);
  }
  return moons;
}

/** 黄经求解结果校验：防止猜值窗口内无目标时的假收敛 */
function verifiedSunLonJD(targetLon, guessJD) {
  const t = findSunLongitudeJD(targetLon, guessJD);
  const err = Math.abs(lonDiff(sunApparentLongitude(t), norm360(targetLon)));
  const err2 = Math.min(err, 360 - err);
  if (err2 > 0.15) return null;
  return t;
}

/**
 * 月内是否含中气：按北京日历日归属。
 * 中气落在 [朔日, 下朔日) 的北京日期内即属该月
 * （与「朔时刻所在日为初一」同一日界规则，避免同日先中气后朔的歧义）。
 */
function hasZhongqiInMonth(shuoDay, nextDay, shuoJD, nextShuoJD) {
  const guesses = [];
  for (let f = 0.05; f <= 0.95; f += 0.15) {
    guesses.push(shuoJD + (nextShuoJD - shuoJD) * f);
  }
  for (const lon of ZHONG_LONS) {
    for (const g of guesses) {
      const t = verifiedSunLonJD(lon, g);
      if (t == null) continue;
      const ymd = ymdFromJD(t);
      const di = beijingDayIndex(ymd.y, ymd.m, ymd.d);
      if (di >= shuoDay && di < nextDay) return true;
    }
  }
  return false;
}

const LUNAR_CACHE_MAX = 10
const lunarCache = new Map()
const lunarCacheOrder = []

function cacheLunarYear(key, value) {
  if (lunarCache.has(key)) {
    // Move to end (most recently used)
    const idx = lunarCacheOrder.indexOf(key)
    if (idx !== -1) lunarCacheOrder.splice(idx, 1)
  } else if (lunarCacheOrder.length >= LUNAR_CACHE_MAX) {
    const oldest = lunarCacheOrder.shift()
    lunarCache.delete(oldest)
  }
  lunarCache.set(key, value)
  lunarCacheOrder.push(key)
  return value
};

/**
 * 以「公历年 Y 的冬至 → Y+1 冬至」建农历月列。
 * 冬至所在月 = 十一月；无中气置闰。
 */
function buildLunarYear(dongzhiYear) {
  const key = "L" + dongzhiYear;
  if (lunarCache.has(key)) return lunarCache.get(key);

  const dz0 = dongzhiJD(dongzhiYear);
  const dz1 = dongzhiJD(dongzhiYear + 1);
  const moons = listNewMoons(dz0 - 40, dz1 + 10);

  let i0 = -1;
  let i1 = -1;
  for (let i = 0; i < moons.length - 1; i++) {
    if (moons[i] <= dz0 && dz0 < moons[i + 1]) i0 = i;
    if (moons[i] <= dz1 && dz1 < moons[i + 1]) i1 = i;
  }
  if (i0 < 0 || i1 < 0) throw new Error("冬至月定位失败 " + dongzhiYear);

  const count = i1 - i0;
  const needLeap = count === 13;

  // 先收集各月朔的北京日界
  const raw = [];
  for (let i = 0; i < count; i++) {
    const shuoJD = moons[i0 + i];
    const nextShuoJD = moons[i0 + i + 1];
    const shuoYmd = ymdFromJD(shuoJD);
    const nextYmd = ymdFromJD(nextShuoJD);
    const shuoDay = beijingDayIndex(shuoYmd.y, shuoYmd.m, shuoYmd.d);
    const nextDay = beijingDayIndex(nextYmd.y, nextYmd.m, nextYmd.d);
    raw.push({
      shuoJD,
      nextShuoJD,
      shuoDay,
      nextDay,
      hasZhongqi: hasZhongqiInMonth(shuoDay, nextDay, shuoJD, nextShuoJD)
    });
  }

  let leapIdx = -1;
  if (needLeap) {
    for (let i = 1; i < count; i++) {
      if (!raw[i].hasZhongqi) {
        leapIdx = i;
        break;
      }
    }
  }

  const months = [];
  let monthNum = 10;
  for (let i = 0; i < count; i++) {
    let isLeap = false;
    let month;
    if (i === leapIdx) {
      isLeap = true;
      month = monthNum;
    } else {
      monthNum = monthNum >= 12 ? 1 : monthNum + 1;
      month = monthNum;
    }
    months.push({
      month,
      isLeap,
      hasZhongqi: raw[i].hasZhongqi,
      shuoJD: raw[i].shuoJD,
      nextShuoJD: raw[i].nextShuoJD,
      shuoDay: raw[i].shuoDay,
      nextDay: raw[i].nextDay
    });
  }

  const info = { dongzhiYear, dz0, dz1, months };
  return cacheLunarYear(key, info)
}

function civilOfMs(ms) {
  return beijingYMD(new Date(ms));
}

function findLunarForCivil(y, m, d) {
  const dayIdx = beijingDayIndex(y, m, d);
  const jd = beijingNoonJD(y, m, d);
  for (const yy of [y - 1, y, y + 1]) {
    const info = buildLunarYear(yy);
    for (const month of info.months) {
      if (dayIdx >= month.shuoDay && dayIdx < month.nextDay) {
        return {
          info,
          month,
          day: dayIdx - month.shuoDay + 1,
          jd
        };
      }
    }
  }
  throw new Error("农历定位失败 " + y + "-" + m + "-" + d);
}

function pillarText(ganIdx, zhiIdx) {
  const gan = GAN[((ganIdx % 10) + 10) % 10];
  const zhi = ZHI[((zhiIdx % 12) + 12) % 12];
  return { gan, zhi, text: gan + zhi };
}

/**
 * 年柱：农历正月朔换年（与生肖一致）。
 * 月柱：节气建月（立春起寅），五虎遁取月干；年干取同日年柱。
 *       太阳黄经取传入北京时刻（与时柱一致），非固定正午。
 * 日柱：北京日界 + 儒略日正午序 (JDN+49) mod 60。
 * 时柱：五鼠遁；无时刻时默认北京正午 → 午时（须在 UI 标明）。
 */
function resolveGanzhi(y, m, d, hourBj = 12, minuteBj = 0) {
  const dayIdx = beijingDayIndex(y, m, d);
  let best = null;
  for (const dzY of [y - 2, y - 1, y, y + 1]) {
    const info = buildLunarYear(dzY);
    const zheng = info.months.find((mo) => mo.month === 1 && !mo.isLeap);
    if (!zheng) continue;
    if (zheng.shuoDay <= dayIdx) {
      if (!best || zheng.shuoDay > best.shuoDay) best = zheng;
    }
  }
  const Y = ymdFromJD(best.shuoJD).y;
  // 注意：不能写 (Y-4+10000)%12 —— 10000≡4 (mod 12)，会把地支错移 4 位
  const yearGanIdx = ((Y - 4) % 10 + 10) % 10;
  const yearZhiIdx = ((Y - 4) % 12 + 12) % 12;
  const gan = GAN[yearGanIdx];
  const zhi = ZHI[yearZhiIdx];
  const sx = SHENGXIAO[yearZhiIdx];
  const yearPillar = { gan, zhi, text: gan + zhi };

  const h = hourBj == null || Number.isNaN(Number(hourBj)) ? 12 : Number(hourBj);
  const min =
    minuteBj == null || Number.isNaN(Number(minuteBj)) ? 0 : Number(minuteBj);
  const jdNoon = beijingNoonJD(y, m, d);
  // 月柱：用实际时刻太阳黄经建月（与时柱同一读数时刻）
  const jdAtHour = jdNoon + (h - 12) / 24 + min / 1440;
  const lon = sunApparentLongitude(jdAtHour);
  // 立春起算，每 30° 一建月：寅卯辰…丑
  const fromLichun = lonDiff(lon, 315);
  const monthZhiIdx = (2 + Math.floor(fromLichun / 30)) % 12;
  // 五虎遁：甲己丙寅、乙庚戊寅、丙辛庚寅、丁壬壬寅、戊癸甲寅
  const yinGanIdx = [2, 4, 6, 8, 0][yearGanIdx % 5];
  const monthOffset = (monthZhiIdx - 2 + 12) % 12;
  const monthPillar = pillarText(yinGanIdx + monthOffset, monthZhiIdx);

  const jdn = Math.floor(jdNoon + 0.5);
  const dayIdx60 = ((jdn + 49) % 60 + 60) % 60;
  const dayPillar = pillarText(dayIdx60, dayIdx60);

  const hourZhiIdx = shichenIndexFromHour(h);
  // 五鼠遁：甲己甲子、乙庚丙子、丙辛戊子、丁壬庚子、戊癸壬子
  const ziGanIdx = [0, 2, 4, 6, 8][dayIdx60 % 5];
  const hourPillar = pillarText(ziGanIdx + hourZhiIdx, hourZhiIdx);
  const shichen = ZHI[hourZhiIdx];
  const hourNote =
    shichen === "午"
      ? "时柱按午时（北京正午）"
      : "时柱按" + shichen + "时";

  return {
    gan,
    zhi,
    sx,
    year: Y,
    pillars: {
      year: yearPillar,
      month: monthPillar,
      day: dayPillar,
      hour: {
        ...hourPillar,
        shichen,
        shichenName: shichen + "时",
        note: hourNote
      }
    }
  };
}

/** 道历年数：随公历年换算（与农历新年无关） */
function daoYearFromXiYuan(xiYuanYear) {
  return xiYuanYear + DAO_YEAR_OFFSET;
}

function lunarMonthName(month) {
  const leap = month.isLeap ? "闰" : "";
  if (month.month === 1) return leap + "正月";
  // 十二月习称腊月（腊八、小年等）
  if (month.month === 12) return leap + "腊月";
  return leap + MONTH_CN[month.month - 1] + "月";
}

function formatLunar(y, m, d, hourBj = 12, minuteBj = 0) {
  const { month, day } = findLunarForCivil(y, m, d);
  const gz = resolveGanzhi(y, m, d, hourBj, minuteBj);
  const monthName = lunarMonthName(month);
  /** 月日短文：如「正月初一」「腊月廿九」「闰六月十五」 */
  const mdText = monthName + (DAY_CN[day] || String(day));
  return {
    text: gz.gan + gz.zhi + "年 " + mdText,
    mdText,
    isLeapMonth: month.isLeap,
    ganzhi: gz,
    daoYear: daoYearFromXiYuan(y),
    month,
    day
  };
}

function formatSolar(y, m, d) {
  const w = beijingYMD(new Date(beijingDayStartMs(y, m, d))).w;
  return y + "年" + m + "月" + d + "日 星期" + WEEKDAY[w];
}

function getJieqiContext(jd) {
  const lonNow = norm360(sunApparentLongitude(jd));
  const curLon = Math.floor(lonNow / 15) * 15;
  const nextLon = norm360(curLon + 15);
  const curJ = JIEQI.find((j) => j.lon === curLon);
  const nextJ = JIEQI.find((j) => j.lon === nextLon);

  let curMoment = findSunLongitudeJD(curLon, jd);
  if (curMoment > jd) curMoment = findSunLongitudeJD(curLon, jd - 16);
  let nextMoment = findSunLongitudeJD(nextLon, jd);
  if (nextMoment < jd) nextMoment = findSunLongitudeJD(nextLon, jd + 16);

  return {
    current: curJ,
    next: nextJ,
    daysInto: jd - curMoment,
    daysLeft: nextMoment - jd,
    progress: Math.min(1, Math.max(0, lonDiff(lonNow, curLon) / 15)),
    longitude: lonNow
  };
}

function moonApparentLongitude(jd) {
  const T = (jd - 2451545.0) / 36525;
  const L =
    218.3164477 +
    481267.88123421 * T -
    0.0015786 * T * T +
    (T * T * T) / 538841 -
    (T * T * T * T) / 65194000;
  const D =
    297.8501921 +
    445267.1114034 * T -
    0.0018819 * T * T +
    (T * T * T) / 545868 -
    (T * T * T * T) / 113065000;
  const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + (T * T * T) / 24490000;
  const Mp =
    134.9633964 +
    477198.8675055 * T +
    0.0087414 * T * T +
    (T * T * T) / 69699 -
    (T * T * T * T) / 14712000;
  const F =
    93.272095 +
    483202.0175233 * T -
    0.0036539 * T * T -
    (T * T * T) / 3526000 +
    (T * T * T * T) / 863310000;
  const E = 1 - 0.002516 * T - 0.0000074 * T * T;
  const terms = [
    [6.288774, 0, 1, 0, 0],
    [1.274027, 2, -1, 0, 0],
    [0.658314, 2, 0, 0, 0],
    [0.213618, 0, 2, 0, 0],
    [-0.185116, 0, 0, 1, 0],
    [-0.114332, 0, 0, 0, 2],
    [0.058793, 2, -2, 0, 0],
    [0.057066, 2, -1, -1, 0],
    [0.053322, 2, 1, 0, 0],
    [0.045758, 2, 0, -1, 0]
  ];
  let sum = 0;
  for (const [coef, d, mpr, m, f] of terms) {
    let c = coef;
    if (m !== 0) c *= Math.abs(m) === 2 ? E * E : E;
    sum += c * Math.sin((d * D + mpr * Mp + m * M + f * F) * DEG);
  }
  return norm360(L + sum);
}

function moonPhaseFraction(jd) {
  const elong = lonDiff(moonApparentLongitude(jd), sunApparentLongitude(jd));
  return (1 - Math.cos(elong * DEG)) / 2;
}

function moonAgeDays(jd) {
  return jd - previousNewMoon(jd);
}

function phaseName(fraction, age) {
  const t = age / SYNODIC;
  if (fraction < 0.03 || t < 0.02 || t > 0.98) return "新月";
  if (fraction > 0.97) return "满月";
  if (Math.abs(fraction - 0.5) < 0.04 && t < 0.5) return "上弦月";
  if (Math.abs(fraction - 0.5) < 0.04 && t >= 0.5) return "下弦月";
  if (t < 0.25) return "蛾眉月";
  if (t < 0.5) return "盈凸月";
  if (t < 0.75) return "亏凸月";
  return "残月";
}




export {
  DEG, DAY_MS, BJ_MS, SYNODIC, JIEQI, SHENGXIAO, ZHI, GAN,
  DAO_YEAR_OFFSET,
  beijingNoonJD, msToJD, beijingDayStartMs, beijingDayIndex, beijingYMD, civilOfMs, ymdFromDayIndex,
  shichenIndexFromHour,
  findLunarForCivil, resolveGanzhi, daoYearFromXiYuan,
  formatLunar, formatSolar, getJieqiContext,
  moonPhaseFraction, moonAgeDays, phaseName
};
