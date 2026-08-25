/**
 * 西象 IAU 88 座短说明（教学向，非占卜）
 * 供列宿页列表与主页 CultureCard 使用。
 * @typedef {{ origin: string, modernRef: string, myth?: string }} WestTip
 */

/** @type {Record<string, WestTip>} */
export const WEST_CONSTELLATION_TIPS = {
  大熊: {
    origin: '中文名「大熊」，拉丁名 Ursa Major，IAU 缩写 UMa。',
    modernRef: '勺形北斗是其亮部；斗口两星延长约五倍，可指北极星方向。'
  },
  小熊: {
    origin: '中文名「小熊」，拉丁名 Ursa Minor，IAU 缩写 UMi。',
    modernRef: '尾端勾陈一即北极星；整座如小勺，北天极附近几乎终年可见。'
  },
  猎户: {
    origin: '中文名「猎户」，拉丁名 Orion，IAU 缩写 Ori。',
    modernRef: '腰带三星人人可指；参宿四偏红、参宿七偏蓝，冬夜认星第一站。'
  },
  仙后: {
    origin: '中文名「仙后」，拉丁名 Cassiopeia，IAU 缩写 Cas。',
    modernRef: 'W/M 形五星醒目；与北斗隔北极相对，秋冬北天极易确认。'
  },
  天鹅: {
    origin: '中文名「天鹅」，拉丁名 Cygnus，IAU 缩写 Cyg。',
    modernRef: '十字形横跨银河；天津四为夏季大三角之一，秋夜仍高悬。'
  },
  天琴: {
    origin: '中文名「天琴」，拉丁名 Lyra，IAU 缩写 Lyr。',
    modernRef: '织女一（Vega）极亮；夏夜近天顶，是北半球暑期公众观星首选。'
  },
  天鹰: {
    origin: '中文名「天鹰」，拉丁名 Aquila，IAU 缩写 Aql。',
    modernRef: '河鼓二（Altair）为牛郎星；与织女隔银河对望，夏秋认星经典。'
  },
  南十字: {
    origin: '中文名「南十字」，拉丁名 Crux，IAU 缩写 Cru。',
    modernRef: '南天最醒目的小十字；中国中低纬偶见，南半球航海定向标志。'
  },
  飞马: {
    origin: '中文名「飞马」，拉丁名 Pegasus，IAU 缩写 Peg。',
    modernRef: '大正方形是秋夜跳板；由此可接仙女、室壁宿与北落师门。'
  },
  白羊: {
    origin: '中文名「白羊」，拉丁名 Aries，IAU 缩写 Ari。',
    modernRef: '三星略成折线；春分点曾在此附近，是黄道十二宫起点之一。'
  },
  金牛: {
    origin: '中文名「金牛」，拉丁名 Taurus，IAU 缩写 Tau。',
    modernRef: '毕宿五红亮如眼；旁有昴星团（M45），冬夜西方至天顶易见。'
  },
  双子: {
    origin: '中文名「双子」，拉丁名 Gemini，IAU 缩写 Gem。',
    modernRef: '北河二、北河三成对；冬春之交高悬，可与猎户、天狼连成认星链。'
  },
  巨蟹: {
    origin: '中文名「巨蟹」，拉丁名 Cancer，IAU 缩写 Cnc。',
    modernRef: '中央鬼星团 M44 如雾斑；春夜黄道上，双筒镜极佳目标。'
  },
  狮子: {
    origin: '中文名「狮子」，拉丁名 Leo，IAU 缩写 Leo。',
    modernRef: '镰刀形如反问号；轩辕十四（Regulus）在柄端，春夏南天标志。'
  },
  处女: {
    origin: '中文名「处女」，拉丁名 Virgo，IAU 缩写 Vir。',
    modernRef: '角宿一（Spica）青白闪亮；春夜南天，黄道上星系密集区。'
  },
  天秤: {
    origin: '中文名「天秤」，拉丁名 Libra，IAU 缩写 Lib。',
    modernRef: '氐宿四等构成天平意象；夏秋南天，介于室女与天蝎之间。'
  },
  天蝎: {
    origin: '中文名「天蝎」，拉丁名 Scorpius，IAU 缩写 Sco。',
    modernRef: '心宿二（Antares）橙红；弯钩尾部夏夜低垂南方，极好辨认。'
  },
  射手: {
    origin: '中文名「射手」，拉丁名 Sagittarius，IAU 缩写 Sgr。',
    modernRef: '茶壶/弓形近银心；夏秋银河最浓处，南斗亦在此天区。'
  },
  摩羯: {
    origin: '中文名「摩羯」，拉丁名 Capricornus，IAU 缩写 Cap。',
    modernRef: '如倒三角的黄道座；秋夜南天，与牛宿天区大致相对。'
  },
  水瓶: {
    origin: '中文名「水瓶」，拉丁名 Aquarius，IAU 缩写 Aqr。',
    modernRef: '星散而暗；秋夜黄道上，虚危女宿等多落此一带。'
  },
  双鱼: {
    origin: '中文名「双鱼」，拉丁名 Pisces，IAU 缩写 Psc。',
    modernRef: '两鱼以丝带相连；春分点今在此，秋冬夜空较需星图。'
  },
  仙女: {
    origin: '中文名「仙女」，拉丁名 Andromeda，IAU 缩写 And。',
    modernRef: '自飞马方形东北伸出；M31 仙女星系目视如雾斑，秋夜经典。'
  },
  御夫: {
    origin: '中文名「御夫」，拉丁名 Auriga，IAU 缩写 Aur。',
    modernRef: '五边形含五车二；冬夜高悬，可与猎户、金牛同框。'
  },
  牧夫: {
    origin: '中文名「牧夫」，拉丁名 Boötes，IAU 缩写 Boo。',
    modernRef: '大角（Arcturus）橙黄极亮；春夜由北斗柄弧线「拉」到即可。'
  },
  大犬: {
    origin: '中文名「大犬」，拉丁名 Canis Major，IAU 缩写 CMa。',
    modernRef: '天狼星为全天最亮恒星；冬夜东南，参宿腰带指向其方向。'
  },
  小犬: {
    origin: '中文名「小犬」，拉丁名 Canis Minor，IAU 缩写 CMi。',
    modernRef: '南河三与南河增一成对；与天狼、参宿构成冬季大三角。'
  },
  船底: {
    origin: '中文名「船底」，拉丁名 Carina，IAU 缩写 Car。',
    modernRef: '老人星（Canopus）为全天第二亮；中低纬冬夜南方低空偶见。'
  },
  半人马: {
    origin: '中文名「半人马」，拉丁名 Centaurus，IAU 缩写 Cen。',
    modernRef: '含半人马座 α（南门二）；南天亮星云集，北半球低纬可见一部分。'
  },
  仙王: {
    origin: '中文名「仙王」，拉丁名 Cepheus，IAU 缩写 Cep。',
    modernRef: '如尖屋顶形；近北极与仙后相邻，秋冬北天常可见。'
  },
  鲸鱼: {
    origin: '中文名「鲸鱼」，拉丁名 Cetus，IAU 缩写 Cet。',
    modernRef: '秋夜南方大片天区；Mira（蒭藁增二）为著名长周期变星。'
  },
  北冕: {
    origin: '中文名「北冕」，拉丁名 Corona Borealis，IAU 缩写 CrB。',
    modernRef: '半圆形如冠冕；夏夜在牧夫与武仙之间，一目了然。'
  },
  乌鸦: {
    origin: '中文名「乌鸦」，拉丁名 Corvus，IAU 缩写 Crv。',
    modernRef: '小四边形醒目；春夜室女之南，可对照古象翼、轸。'
  },
  海豚: {
    origin: '中文名「海豚」，拉丁名 Delphinus，IAU 缩写 Del。',
    modernRef: '菱形小巧如跳海豚；夏秋银河东侧，近瓠瓜、败瓜天区。'
  },
  天龙: {
    origin: '中文名「天龙」，拉丁名 Draco，IAU 缩写 Dra。',
    modernRef: '长蛇形绕北极；紫微垣外缘常与之重叠对照。'
  },
  波江: {
    origin: '中文名「波江」，拉丁名 Eridanus，IAU 缩写 Eri。',
    modernRef: '自猎户向南蜿蜒；星点多，适合沿河循迹的进阶练习。'
  },
  武仙: {
    origin: '中文名「武仙」，拉丁名 Hercules，IAU 缩写 Her。',
    modernRef: '夏夜高悬；球状星团 M13 是北天最著名深空目标之一。'
  },
  长蛇: {
    origin: '中文名「长蛇」，拉丁名 Hydra，IAU 缩写 Hya。',
    modernRef: '全天面积最大星座；朱雀柳星张诸宿多沿其展开。'
  },
  天兔: {
    origin: '中文名「天兔」，拉丁名 Lepus，IAU 缩写 Lep。',
    modernRef: '蹲在猎户脚下；冬夜随猎户升起，认星路径自然延伸。'
  },
  蛇夫: {
    origin: '中文名「蛇夫」，拉丁名 Ophiuchus，IAU 缩写 Oph。',
    modernRef: '夏夜横跨黄道；与巨蛇相连，天市垣部分落于此。'
  },
  英仙: {
    origin: '中文名「英仙」，拉丁名 Perseus，IAU 缩写 Per。',
    modernRef: '秋冬北天；英仙座流星雨辐射点所在，双星团著名。'
  },
  南鱼: {
    origin: '中文名「南鱼」，拉丁名 Piscis Austrinus，IAU 缩写 PsA。',
    modernRef: '北落师门一星独亮；秋夜南方低空，玄武南缘路标。'
  },
  三角: {
    origin: '中文名「三角」，拉丁名 Triangulum，IAU 缩写 Tri。',
    modernRef: '小而清晰的直角三角；秋夜在仙女与白羊之间。'
  },
  后发: {
    origin: '中文名「后发」，拉丁名 Coma Berenices，IAU 缩写 Com。',
    modernRef: '如散开金发；春夜北天银河外，星系团丰富。'
  },
  猎犬: {
    origin: '中文名「猎犬」，拉丁名 Canes Venatici，IAU 缩写 CVn。',
    modernRef: '牧夫之旁两犬；含旋涡星系 M51，适合望远镜。'
  },
  天鸽: {
    origin: '中文名「天鸽」，拉丁名 Columba，IAU 缩写 Col。',
    modernRef: '猎户西南的南天座；冬夜低空，中原需晴朗南地平。'
  },
  天箭: {
    origin: '中文名「天箭」，拉丁名 Sagitta，IAU 缩写 Sge。',
    modernRef: '银河中的小箭形；夏秋在天鹰与天鹅之间。'
  },
  麒麟: {
    origin: '中文名「麒麟」，拉丁名 Monoceros，IAU 缩写 Mon。',
    modernRef: '猎户与大犬之间的暗区；冬夜银河边缘，宜借亮星定位。'
  },
  船尾: {
    origin: '中文名「船尾」，拉丁名 Puppis，IAU 缩写 Pup。',
    modernRef: '古船座拆分之一；天狼东南，富含星团。'
  },
  船帆: {
    origin: '中文名「船帆」，拉丁名 Vela，IAU 缩写 Vel。',
    modernRef: '南天船帆；含船帆座超新星遗迹，低纬可见。'
  },
  天鹤: {
    origin: '中文名「天鹤」，拉丁名 Grus，IAU 缩写 Gru。',
    modernRef: '南天秋夜鹤形；中国南方较易见其亮星。'
  },
  孔雀: {
    origin: '中文名「孔雀」，拉丁名 Pavo，IAU 缩写 Pav。',
    modernRef: '南天亮星孔雀十一；北半球多数地区不可见。'
  },
  凤凰: {
    origin: '中文名「凤凰」，拉丁名 Phoenix，IAU 缩写 Phe。',
    modernRef: '南天秋冬星座；低纬南方地平线上可寻。'
  },
  剑鱼: {
    origin: '中文名「剑鱼」，拉丁名 Dorado，IAU 缩写 Dor。',
    modernRef: '大麦哲伦云所在天区；南半球深空观星热门。'
  },
  豺狼: {
    origin: '中文名「豺狼」，拉丁名 Lupus，IAU 缩写 Lup。',
    modernRef: '半人马之旁；夏夜南天，古象库楼一带与之重叠。'
  },
  巨蛇: {
    origin: '中文名「巨蛇」，拉丁名 Serpens，IAU 缩写 Ser。',
    modernRef: '被蛇夫分为头尾两段；夏夜与天市垣对照有趣。'
  },
  盾牌: {
    origin: '中文名「盾牌」，拉丁名 Scutum，IAU 缩写 Sct。',
    modernRef: '银河浓处的小盾；夏夜人马之北，暗星云丰富。'
  },
  狐狸: {
    origin: '中文名「狐狸」，拉丁名 Vulpecula，IAU 缩写 Vul。',
    modernRef: '天鹅与天箭之间；夏秋银河，哑铃星云 M27 在此。'
  },
  唧筒: {
    origin: '中文名「唧筒」，拉丁名 Antlia，IAU 缩写 Ant。',
    modernRef: '南天暗弱小座；十八世纪仪器命名星座之一。'
  },
  天燕: {
    origin: '中文名「天燕」，拉丁名 Apus，IAU 缩写 Aps。',
    modernRef: '近南极的小鸟座；仅南半球可见。'
  },
  天坛: {
    origin: '中文名「天坛」，拉丁名 Ara，IAU 缩写 Ara。',
    modernRef: '南天蝎尾附近；低纬夏夜南方可寻。'
  },
  雕具: {
    origin: '中文名「雕具」，拉丁名 Caelum，IAU 缩写 Cae。',
    modernRef: '波江以南的暗弱座；认星价值较低，作全表补全。'
  },
  鹿豹: {
    origin: '中文名「鹿豹」，拉丁名 Camelopardalis，IAU 缩写 Cam。',
    modernRef: '北极附近暗弱；无亮星，需星图确认。'
  },
  蝘蜓: {
    origin: '中文名「蝘蜓」，拉丁名 Chamaeleon，IAU 缩写 Cha。',
    modernRef: '近南极；南半球深空区，北半球不可见。'
  },
  圆规: {
    origin: '中文名「圆规」，拉丁名 Circinus，IAU 缩写 Cir。',
    modernRef: '半人马旁小座；南天，仪器命名。'
  },
  南冕: {
    origin: '中文名「南冕」，拉丁名 Corona Australis，IAU 缩写 CrA。',
    modernRef: '人马之南的弧冠；夏夜低纬可见。'
  },
  巨爵: {
    origin: '中文名「巨爵」，拉丁名 Crater，IAU 缩写 Crt。',
    modernRef: '长蛇背上的杯形；春夜，近古象张宿一带。'
  },
  小马: {
    origin: '中文名「小马」，拉丁名 Equuleus，IAU 缩写 Equ。',
    modernRef: '飞马之旁最小黄道邻座之一；秋夜，星弱。'
  },
  天炉: {
    origin: '中文名「天炉」，拉丁名 Fornax，IAU 缩写 For。',
    modernRef: '波江西侧；南天星系团著名，低纬可见。'
  },
  时钟: {
    origin: '中文名「时钟」，拉丁名 Horologium，IAU 缩写 Hor。',
    modernRef: '南天仪器座；星暗，作 IAU 全表认知即可。'
  },
  水蛇: {
    origin: '中文名「水蛇」，拉丁名 Hydrus，IAU 缩写 Hyi。',
    modernRef: '南极附近；勿与长蛇（Hydra）混淆。'
  },
  印第安: {
    origin: '中文名「印第安」，拉丁名 Indus，IAU 缩写 Ind。',
    modernRef: '南天秋夜；以「印第安人」命名的南半球座。'
  },
  蝎虎: {
    origin: '中文名「蝎虎」，拉丁名 Lacerta，IAU 缩写 Lac。',
    modernRef: '仙后与天鹅之间；秋夜北天，形如小蜥蜴。'
  },
  小狮: {
    origin: '中文名「小狮」，拉丁名 Leo Minor，IAU 缩写 LMi。',
    modernRef: '狮子之北的暗弱座；春夜，需借狮子定位。'
  },
  天猫: {
    origin: '中文名「天猫」，拉丁名 Lynx，IAU 缩写 Lyn。',
    modernRef: '御夫与大熊之间；冬春北天，星散而暗。'
  },
  山案: {
    origin: '中文名「山案」，拉丁名 Mensa，IAU 缩写 Men。',
    modernRef: '近南极；大半麦哲伦云边缘，仅南半球可见。'
  },
  显微镜: {
    origin: '中文名「显微镜」，拉丁名 Microscopium，IAU 缩写 Mic。',
    modernRef: '摩羯之南；秋夜南天暗弱仪器座。'
  },
  苍蝇: {
    origin: '中文名「苍蝇」，拉丁名 Musca，IAU 缩写 Mus。',
    modernRef: '南十字旁；南天，北半球多数地区不可见。'
  },
  矩尺: {
    origin: '中文名「矩尺」，拉丁名 Norma，IAU 缩写 Nor。',
    modernRef: '银河中的直角尺；南天夏夜，低纬可见。'
  },
  南极: {
    origin: '中文名「南极」，拉丁名 Octans，IAU 缩写 Oct。',
    modernRef: '南天极所在星座；无亮「南极星」，与北极小熊对照。'
  },
  绘架: {
    origin: '中文名「绘架」，拉丁名 Pictor，IAU 缩写 Pic。',
    modernRef: '船底之侧；南天，含著名绘架座 β 星盘。'
  },
  罗盘: {
    origin: '中文名「罗盘」，拉丁名 Pyxis，IAU 缩写 Pyx。',
    modernRef: '船尾旁小罗盘；冬夜南天，古船座拆分遗存。'
  },
  网罟: {
    origin: '中文名「网罟」，拉丁名 Reticulum，IAU 缩写 Ret。',
    modernRef: '南天菱形小网；近大麦哲伦云。'
  },
  玉夫: {
    origin: '中文名「玉夫」，拉丁名 Sculptor，IAU 缩写 Scl。',
    modernRef: '秋夜南天；玉夫座星系团所在，低纬可试。'
  },
  六分仪: {
    origin: '中文名「六分仪」，拉丁名 Sextans，IAU 缩写 Sex。',
    modernRef: '狮子与长蛇之间；春夜暗弱，仪器命名。'
  },
  望远镜: {
    origin: '中文名「望远镜」，拉丁名 Telescopium，IAU 缩写 Tel。',
    modernRef: '南冕之南；南天仪器座，星弱。'
  },
  南三角: {
    origin: '中文名「南三角」，拉丁名 Triangulum Australe，IAU 缩写 TrA。',
    modernRef: '南天明亮小三角；与北天三角对照记忆。'
  },
  杜鹃: {
    origin: '中文名「杜鹃」，拉丁名 Tucana，IAU 缩写 Tuc。',
    modernRef: '小麦哲伦云所在；南半球深空观星热门。'
  },
  飞鱼: {
    origin: '中文名「飞鱼」，拉丁名 Volans，IAU 缩写 Vol。',
    modernRef: '船底旁南天座；仅南半球可见。'
  },
}
