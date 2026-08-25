/**
 * 步天歌 · 歌诀与星官映射（教学向，非占卜）
 * 歌诀据明王希明《步天歌》等公版典籍节录、改写，并补三垣二十八宿常见附座认星句。
 * 每条 line 映射东象星官名（core 或 extra），供星空高亮联动。
 */

/** @typedef {{ id: string, verse: string, note: string, constellations: string[] }} BuTianGeLine */
/** @typedef {{ id: string, title: string, subtitle?: string, lines: BuTianGeLine[] }} BuTianGeSection */

/** @type {BuTianGeSection[]} */
export const BU_TIAN_GE_SECTIONS = [
  {
    id: 'beidou',
    title: '北斗',
    subtitle: '帝车 · 认星入门',
    lines: [
      {
        id: 'beidou-1',
        verse: '斗杓七星天北枢，柄指四季定时节。',
        note: '全天最易入门的星组。斗口两星连线延长约五倍，可指北极附近；春东夏南、秋西冬北，粗判季节。',
        constellations: ['北斗']
      },
      {
        id: 'beidou-kui',
        verse: '魁枕参首衡殷南，杓携龙角司帝车。',
        note: '《史记·天官书》以北斗为帝车：魁（天枢至天权）象车头，衡（玉衡）居中，杓（开阳、摇光）为柄。可先认勺形，再记七星之名。',
        constellations: ['北斗']
      },
      {
        id: 'beidou-fu',
        verse: '开阳之东辅星从，目力可辨近相依。',
        note: '开阳旁有「辅」一星，古代常作目力测试；今用小望远镜更易分清。认辅可确认斗柄位置。',
        constellations: ['北斗', '辅(附官)']
      },
      {
        id: 'beidou-wen',
        verse: '文昌六星在魁上，如半月形守斗旁。',
        note: '文昌近北斗魁上，象文运与文书之官（教学记名即可）。春夜斗柄东指时，文昌亦较易对照。',
        constellations: ['北斗', '文昌']
      },
      {
        id: 'beidou-qiang',
        verse: '天枪三星杓东指，天棓五星龙尾傍。',
        note: '天枪、天棓分列紫微外侧，作「守望」之象。夏秋之交斗柄西指时，可顺杓东寻天枪。',
        constellations: ['天枪', '天棓', '北斗']
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
        verse: '紫微垣墙十五星，东西两藩夹禁庭。',
        note: '三垣之首，环北天极如禁城。先找北极附近「不动」处，再认左右垣墙，勿与西象小熊轮廓硬套。',
        constellations: ['紫微垣']
      },
      {
        id: 'ziwei-beiji',
        verse: '北极五星贯索似，勾陈曲绕帝座旁。',
        note: '北极星官近天极；勾陈曲行其侧，勾陈一即今之北极星（岁差使「极星」历代更替）。认星先定极，再展开垣内。',
        constellations: ['紫微垣', '北极', '勾陈']
      },
      {
        id: 'ziwei-sifu',
        verse: '四辅环极如护卫，大理女御列两厢。',
        note: '四辅贴近北极，象近侍。垣内星官多名「太子、庶子」等，本页只记方位与相对位置，不作吉凶推演。',
        constellations: ['紫微垣', '四辅']
      },
      {
        id: 'taiwei',
        verse: '太微垣倚翼轸北，五帝座明居垣中。',
        note: '象外朝朝班，在紫微之南。夏季南天狮子、室女一带对照；五帝座为垣内枢纽。',
        constellations: ['太微垣', '五帝座']
      },
      {
        id: 'taiwei-ping',
        verse: '左右执法夹端门，内屏四星蔽帝廷。',
        note: '端门为太微「南门」之象；内屏在五帝座前。认星时可先找轩辕十四附近，再北寻垣墙。',
        constellations: ['太微垣', '内屏']
      },
      {
        id: 'taiwei-lang',
        verse: '郎位常陈居垣东，少微长垣列西厢。',
        note: '郎位、常陈在太微东；少微、长垣在西。名称多取朝官意象，便于记忆布局，无关占验。',
        constellations: ['太微垣', '郎位', '常陈', '少微']
      },
      {
        id: 'taiwei-xuanyuan',
        verse: '轩辕龙体十七星，御女一星附其侧。',
        note: '轩辕跨狮子座，轩辕十四为亮星，是夏夜认太微、朱雀北缘的路标。御女为附座，宜对照古图。',
        constellations: ['轩辕', '御女', '太微垣']
      },
      {
        id: 'tianshi',
        verse: '天市垣墙二十二，市楼天纪夹其庭。',
        note: '象天上集市，横亘斗、牛、女一带。夏秋银河侧可见；先认左右垣墙，再找垣内市官。',
        constellations: ['天市垣', '市楼', '天纪']
      },
      {
        id: 'tianshi-dizuo',
        verse: '帝座一星正垣中，候星东立宦者从。',
        note: '帝座为天市中心亮星（武仙座 α 一带）；候、宦者分列其侧。认星：先定帝座，再读市官之名。',
        constellations: ['天市垣', '帝座', '候', '宦者']
      },
      {
        id: 'tianshi-shi',
        verse: '列肆车肆夹市楼，屠肆帛度计量平。',
        note: '市楼、列肆、车肆、屠肆、帛度构成「市」的空间叙事。星多暗弱，宜用歌诀+星图，勿强求肉眼全见。',
        constellations: ['天市垣', '列肆', '车肆', '市楼', '屠肆', '帛度']
      },
      {
        id: 'tianshi-guansuo',
        verse: '贯索九星如连环，七公天纪女床连。',
        note: '贯索在天市西（北冕一带）形如锁链；七公、天纪、女床沿垣北侧展开。秋季银河东侧较易对照。',
        constellations: ['贯索', '七公', '天纪', '女床', '天市垣']
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
        verse: '角宿两星南北列，苍龙之角先破昏。',
        note: '青龙之首。角宿一（室女座 α）青白闪亮，春夜南天标志；两星南北相距清晰，宜作二十八宿起点。',
        constellations: ['角宿']
      },
      {
        id: 'jiao-dajiao',
        verse: '大角一星亢下明，牧夫之首指龙颈。',
        note: '大角（牧夫座 α）橙黄极亮，在角、亢之北。春夜先认大角，再南下连角宿，可稳入青龙。',
        constellations: ['大角', '角宿', '亢宿']
      },
      {
        id: 'jiao-pingdao',
        verse: '平道二星角下横，进贤一星角西庭。',
        note: '平道、进贤为角宿附座，星暗。教学上记「角下有道、西有进贤」即可，重点仍在角宿二星。',
        constellations: ['角宿', '平道', '进贤']
      },
      {
        id: 'kang',
        verse: '亢宿四星承龙角，颈项细星次第明。',
        note: '龙颈。自角宿向东略偏北接亢；与氐连读可记「角亢氐」一气，春夏之交南天可见。',
        constellations: ['亢宿']
      },
      {
        id: 'kang-zhewei',
        verse: '大角左右梗河绕，招摇一星指斗柄。',
        note: '梗河近大角，招摇在其北，古人以之与斗柄遥相呼应。认星：大角为锚，再寻梗河三星。',
        constellations: ['大角', '梗河', '招摇', '亢宿']
      },
      {
        id: 'di',
        verse: '氐宿四星如木臼，天秤之侧龙胸开。',
        note: '龙胸。氐宿四（天秤座 α）较亮；四星略方，可与房心连成龙身中段。',
        constellations: ['氐宿']
      },
      {
        id: 'di-kulou',
        verse: '库楼十星氐南聚，南门两星守楼门。',
        note: '库楼在氐、房之南（豺狼座一带），象武库；南门为库楼南界亮星。低纬度更易见。',
        constellations: ['库楼', '南门', '氐宿']
      },
      {
        id: 'fang',
        verse: '房宿四星名天驷，钩钤两星附其旁。',
        note: '龙腹，亦称天驷。对应天蝎头部；钩钤为附官，紧贴房宿，可用「驷旁有钤」记忆。',
        constellations: ['房宿', '钩钤(附官)']
      },
      {
        id: 'fang-jianbi',
        verse: '键闭一星房中守，罚星东咸列两厢。',
        note: '键闭、罚、东咸、西咸环房而设，象锁钥与禁卫。星多不甚亮，宜在认清房宿后再对照附座。',
        constellations: ['房宿', '键闭', '罚', '东咸', '西咸']
      },
      {
        id: 'xin',
        verse: '心宿三星中最赤，大火西流七月诗。',
        note: '龙心。心宿二（天蝎座 α）红亮，古称大火；《诗经》「七月流火」即指其季候西沉，属授时，非占卜。',
        constellations: ['心宿']
      },
      {
        id: 'xin-jizu',
        verse: '积卒十二心下屯，从官两星房心间。',
        note: '积卒在心宿之南，象军阵；从官近房心之间。夏夜天蝎低垂时，可顺心宿南望积卒。',
        constellations: ['心宿', '积卒', '从官(房宿)']
      },
      {
        id: 'wei-long',
        verse: '尾宿九星如钩曲，神宫傅说附尾端。',
        note: '龙尾，跨天蝎至人马。九星弯钩醒目；傅说一星在尾内，古代神话附会甚多，本页只作认星坐标。',
        constellations: ['尾宿', '傅说']
      },
      {
        id: 'wei-tianjiang',
        verse: '天江四星尾北横，鱼星一枚江畔明。',
        note: '天江在尾宿之北，象天河津渡；鱼为附座。银河浓处附近，需借星图分辨暗星。',
        constellations: ['尾宿', '天江', '鱼']
      },
      {
        id: 'ji',
        verse: '箕宿四星形如簸箕，簸扬之象在龙尾。',
        note: '青龙之末。四星似簸箕，属人马座北缘；与尾宿连读收束东方七宿，再转入北方玄武（斗宿）。',
        constellations: ['箕宿']
      },
      {
        id: 'ji-chu',
        verse: '杵星三枚箕下立，糠一星旁农丈人。',
        note: '杵、糠、农丈人为箕宿附座，象杵臼与农事。星暗，认清箕宿轮廓即可，附座作「加深」用。',
        constellations: ['箕宿', '杵(箕宿)', '糠', '农丈人']
      }
    ]
  },
  {
    id: 'xuanwu',
    title: '北方玄武',
    subtitle: '斗牛女虚危室壁',
    lines: [
      {
        id: 'dou',
        verse: '南斗六星如斗勺，天庙之象傍银河。',
        note: '北方玄武之首（相对青龙之后）。南斗在人马座，夏秋南天可见；形似小北斗，勿与真北斗混淆。',
        constellations: ['斗宿']
      },
      {
        id: 'dou-gou',
        verse: '狗国四星斗东守，天鸡两星司晨鸣。',
        note: '狗、狗国、天鸡为斗宿附近附座。秋夜银河拱桥附近，可先定南斗再寻周围小星官。',
        constellations: ['斗宿', '狗', '狗国', '天鸡']
      },
      {
        id: 'niu',
        verse: '牵牛六星河西岸，隔河织女遥相望。',
        note: '牛宿对应摩羯一带。七夕传说中的「牛郎」多指河鼓，牛宿为二十八宿本位，二者宜分开记。',
        constellations: ['牛宿']
      },
      {
        id: 'niu-hegu',
        verse: '河鼓三星平且亮，中星最明号大将军。',
        note: '河鼓在天鹰座，河鼓二即牛郎星（Altair）。夏秋银河东岸，与织女隔河对望，是认星课最佳教材。',
        constellations: ['河鼓', '牛宿']
      },
      {
        id: 'niu-zhinv',
        verse: '织女三星鼎足立，一星独亮河西庭。',
        note: '织女在天琴座，织女一为北天亮星。认星口诀：先找织女与河鼓，再下连天津，即夏夜「银河三角」骨架。',
        constellations: ['织女', '河鼓']
      },
      {
        id: 'niu-tianjin',
        verse: '天津九星横河上，奚仲四星车驾旁。',
        note: '天津跨天鹅座，象渡河之津；奚仲近侧。秋夜银河中段，天津折线清晰，可作深空观测路标。',
        constellations: ['天津', '奚仲', '牛宿']
      },
      {
        id: 'nv',
        verse: '须女四星如箕小，罗堰三星其北护。',
        note: '女宿在宝瓶、摩羯之间，星不甚亮。罗堰、十二国等附座更暗，重点记宿度位置即可。',
        constellations: ['女宿', '罗堰']
      },
      {
        id: 'nv-gua',
        verse: '瓠瓜五星如瓜裂，败瓜五星相依生。',
        note: '瓠瓜、败瓜在女宿之北（海豚座附近），形如瓜瓣。秋夜先认河鼓、织女，再向南下寻瓜官。',
        constellations: ['瓠瓜', '败瓜', '女宿']
      },
      {
        id: 'xu',
        verse: '虚宿两星如连珠，司命司禄列其旁。',
        note: '虚、危常连读。虚宿在宝瓶、小马一带；司命、司禄、司危、司非为附座，名称取自职官，只作文史对照。',
        constellations: ['虚宿', '司命', '司禄']
      },
      {
        id: 'wei-xuan',
        verse: '危宿三星高居上，坟墓哭泣相依傍。',
        note: '危宿三星较易成「窄三角」；坟墓、哭、泣等附座在其侧。秋冬之交南天，可与室壁连成玄武南缘。',
        constellations: ['危宿', '哭', '泣']
      },
      {
        id: 'shi',
        verse: '营室两星南北正，离宫六星环其庭。',
        note: '室宿（飞马座 α、β 等）与壁宿构成「飞马大正方形」东侧，秋夜几乎人人可认。',
        constellations: ['室宿']
      },
      {
        id: 'shi-leibi',
        verse: '垒壁阵十二星横，羽林军密集南营。',
        note: '垒壁阵、羽林军在室壁之南，象壁垒与禁军。星数多而暗，适合「先认大正方形，再南望军阵」的进阶练习。',
        constellations: ['室宿', '垒壁阵', '羽林军']
      },
      {
        id: 'bi',
        verse: '东壁两星室东立，飞马方框由此成。',
        note: '壁宿与室宿合称营室东壁。认星：大正方形西两角近室，东两角近壁，再向东北接仙女。',
        constellations: ['壁宿', '室宿']
      },
      {
        id: 'bi-beiluo',
        verse: '北落师门一星炯，羽林之南独守营。',
        note: '北落师门（南鱼座 α）在羽林军之南，秋夜南方低空亮星，可作「玄武南极」示意路标。',
        constellations: ['北落师门', '羽林军', '壁宿']
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
        verse: '奎宿十六散如靴，白虎之尾先破昏。',
        note: '白虎之尾，星散于仙女、双鱼一带。秋冬之交，自飞马方形东北角（壁）续入奎，需星图辅助。',
        constellations: ['奎宿']
      },
      {
        id: 'kui-wai',
        verse: '外屏七星奎下横，天溷四星秽其侧。',
        note: '外屏在奎南，象屏障。附座多暗，认星以奎宿整体走向为主，外屏作「加深」即可。',
        constellations: ['奎宿', '外屏']
      },
      {
        id: 'lou',
        verse: '娄宿三星聚如品，白羊之野虎身起。',
        note: '娄宿三星较聚，对应白羊座。与胃、昴连读，进入西方七宿中段。',
        constellations: ['娄宿']
      },
      {
        id: 'lou-tiancang',
        verse: '天仓六星娄下积，天庾三星仓以南。',
        note: '天仓、天庾象粮仓储积，在娄、胃之南。冬夜南方可见，宜先定娄宿再南寻。',
        constellations: ['娄宿', '天仓', '天庾']
      },
      {
        id: 'wei-tiger',
        verse: '胃宿三星如鼎足，天囷十三圆如囷。',
        note: '胃宿象停胃；天囷在其南，轮廓近圆形，象圆囷储粮。教学上记「胃南有囷」。',
        constellations: ['胃宿', '天囷']
      },
      {
        id: 'mao',
        verse: '昴宿团栾如小斗，肉眼可数六七星。',
        note: '昴星团（M45），冬夜西方至天顶附近极醒目。是全天最易向公众演示的「宿」。',
        constellations: ['昴宿']
      },
      {
        id: 'mao-tianshi',
        verse: '天船九星昴北渡，卷舌六星谗旁列。',
        note: '天船在昴、毕之北；卷舌、天谗在其侧。认清昴团后，向北可练习这些附座。',
        constellations: ['昴宿', '天船', '卷舌']
      },
      {
        id: 'bi-tiger',
        verse: '毕宿如网八星张，附耳一星网柄旁。',
        note: '毕象手网。毕宿五（金牛座 α）红亮，与昴团相邻，是冬夜金牛座的锚点。',
        constellations: ['毕宿']
      },
      {
        id: 'bi-tianjie',
        verse: '天节八星毕下守，九州殊口毕东开。',
        note: '天节、九州殊口为毕宿附座，星暗。进阶认星用：先毕宿网形，再下寻天节。',
        constellations: ['毕宿', '天节', '九州殊口']
      },
      {
        id: 'zi',
        verse: '觜宿三星聚猎首，参宿之前一小喙。',
        note: '觜为虎首之喙，对应猎户头部小三星。与参宿几乎同视场，冬夜极易连认。',
        constellations: ['觜宿', '参宿']
      },
      {
        id: 'shen',
        verse: '参宿七星立如人，中三连珠伐相依。',
        note: '白虎主体，即猎户座。参宿四红超巨星、参宿七蓝白亮星，腰带三星（伐）人人可指。',
        constellations: ['参宿']
      },
      {
        id: 'shen-qi',
        verse: '参旗九星参西展，玉井四星参足下。',
        note: '参旗在参西，象弓矢之旗；玉井在参足下。认完猎户主体后，向西、向下即可扩展。',
        constellations: ['参宿', '参旗', '玉井']
      },
      {
        id: 'shen-lang',
        verse: '参伐之下天狼炯，弧矢九星弯弓张。',
        note: '天狼（大犬座 α）为全天最亮恒星；弧矢在其南，象弯弓。冬夜东南：「先参后狼，狼下张弧」。',
        constellations: ['天狼', '弧矢', '参宿']
      },
      {
        id: 'shen-laoren',
        verse: '老人一星弧矢南，南极寿星低可见。',
        note: '老人星（船底座 α）在弧矢之南，中原低纬冬夜南方地平线附近偶可见。教学记「狼南有老人」。',
        constellations: ['老人', '弧矢', '天狼']
      },
      {
        id: 'shen-ping',
        verse: '屏星两枚井东立，天厕四星参下隐。',
        note: '屏、天厕、屎（天矢）等附座在参、井之间，多取生活器用之名。星暗，作文史对照即可。',
        constellations: ['参宿', '屏', '天厕']
      }
    ]
  },
  {
    id: 'zhuque',
    title: '南方朱雀',
    subtitle: '井鬼柳星张翼轸',
    lines: [
      {
        id: 'jing',
        verse: '井宿八星如字画，北河南河夹其庭。',
        note: '朱雀之首。对应双子座，北河二、北河三为亮星；冬春之交，参宿西沉后井宿高悬。',
        constellations: ['井宿', '北河', '南河']
      },
      {
        id: 'jing-shui',
        verse: '水位四星井东注，积薪一星灶旁明。',
        note: '水位、积水、积薪为井宿附近附座，取水火薪灶之象。认清北河、南河后，再寻这些暗官。',
        constellations: ['井宿', '水位', '积薪', '积水(井宿)']
      },
      {
        id: 'jing-yue',
        verse: '钺星附井司斩伐，阙丘两星井南戍。',
        note: '钺为井宿附官；阙丘在井南。名称取自仪仗与丘戍，教学上只记相对方位。',
        constellations: ['井宿', '钺(附官)', '阙丘']
      },
      {
        id: 'gui',
        verse: '鬼宿四星中积尸，如云气团望远镜。',
        note: '鬼宿对应巨蟹；中央积尸气即 M44（鬼星团），目视如雾斑，双筒望远镜极佳目标。',
        constellations: ['鬼宿', '积尸(鬼宿)']
      },
      {
        id: 'gui-guan',
        verse: '爟星四枚鬼外守，天狗七星其南奔。',
        note: '爟象烽火，天狗在鬼南。春夜巨蟹过子午后，可练习这些附座。',
        constellations: ['鬼宿', '爟', '天狗']
      },
      {
        id: 'liu',
        verse: '柳宿八星曲如柳，鸟喙之喙向朱雀。',
        note: '柳为朱雀之喙，对应长蛇座头端。星偏暗，需借助鬼、星、张的相对位置连读。',
        constellations: ['柳宿']
      },
      {
        id: 'liu-waichu',
        verse: '外厨六星柳下设，天记一星厨房侧。',
        note: '外厨、天记为柳宿附座。朱雀诸宿多沿长蛇展开，宜「自鬼而柳、而星、而张」顺读。',
        constellations: ['柳宿', '外厨', '天记']
      },
      {
        id: 'xing',
        verse: '星宿七星如连珠，天相三星其北护。',
        note: '星宿为朱雀之目。天相在其北；酒旗在轩辕附近，可与太微、朱雀北缘交叉对照。',
        constellations: ['星宿', '天相']
      },
      {
        id: 'xing-jiuqi',
        verse: '酒旗三星轩辕侧，太尊一星旗北明。',
        note: '酒旗近轩辕，象宴饮之旗。夏夜狮子座东南，可与太微、星宿一并认读。',
        constellations: ['酒旗', '太尊', '轩辕', '星宿']
      },
      {
        id: 'zhang',
        verse: '张宿六星如展翼，鸟嗉开处朱雀胸。',
        note: '张为朱雀之嗉。六星列张，春末夏初南方可见；与翼、轸连读收束朱雀后半。',
        constellations: ['张宿']
      },
      {
        id: 'zhang-tiantemple',
        verse: '天庙十四张下隐，东瓯五星庙南开。',
        note: '天庙、东瓯在张、翼之南，低纬较易。星暗而多，作「朱雀南缘」加深即可。',
        constellations: ['张宿', '天庙', '东瓯']
      },
      {
        id: 'yi',
        verse: '翼宿二十二星广，朱雀之翼最铺张。',
        note: '二十八宿中星数最多者之一，对应巨爵、乌鸦一带。宜先抓亮星骨架，勿强求数尽全宿。',
        constellations: ['翼宿']
      },
      {
        id: 'yi-qingqiu',
        verse: '青丘七星翼东守，军门一星丘外立。',
        note: '青丘、军门为翼宿附座。认星策略：翼宿铺开后，向东寻青丘，再及军门。',
        constellations: ['翼宿', '青丘', '军门']
      },
      {
        id: 'zhen',
        verse: '轸宿四星如车轸，青龙之首角相接。',
        note: '轸为朱雀之尾，四星如车轸（乌鸦座）。与角宿首尾相接，二十八宿环天一周于此合拢。',
        constellations: ['轸宿', '角宿']
      },
      {
        id: 'zhen-qifu',
        verse: '长沙一星轸中显，军门器府夹轸旁。',
        note: '轸宿附座有长沙、左辖、右辖等（示意以军门、器府等可高亮官为主）。环天既合，可回角宿重走青龙。',
        constellations: ['轸宿', '军门', '器府']
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

/** 歌诀引用过的全部星官名（供星空层按需挂载 extra） */
export function getBuTianGeAsterismNames() {
  const names = new Set()
  BU_TIAN_GE_LINES.forEach((l) => l.constellations.forEach((n) => names.add(n)))
  return names
}

/** 按 flatIndex 取行 */
export function getBuTianGeLine(flatIndex) {
  return BU_TIAN_GE_LINES[flatIndex] ?? null
}

/** 某行涉及的星官名（去重） */
export function getConstellationsForLine(line) {
  if (!line?.constellations?.length) return []
  return [...new Set(line.constellations)]
}

/** 按星官名取首条歌诀附注（供缺 culture 时加厚说明） */
export function getBuTianGeNoteForAsterism(name) {
  if (!name) return ''
  for (const line of BU_TIAN_GE_LINES) {
    if (line.constellations.includes(name)) return line.note || ''
  }
  return ''
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
