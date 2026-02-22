export interface IChingLine {
  lineValue: string;
  description: string;
}

export interface IChingHexagram {
  number: number;
  name: string;
  translation: string;
  description: string;
  lines: IChingLine[];
}

export const hexagrams_1_16: IChingHexagram[] = [
  {
    number: 1,
    name: "Ch'ien",
    translation: 'Creative Activity',
    description:
      'Heaven above\nand Heaven below:\nHeaven in constant motion.\nWith the strength\nof the dragon,\nthe Superior Person\nsteels himself\nfor ceaseless activity.\n\nProductive activity.\nPotent Influence.\nSublime success\nif you keep to your course.',
    lines: [
      {
        lineValue: 'Line One',
        description: 'The dragon remains\nbeneath the surface.\nDo not act.',
      },
      {
        lineValue: 'Line Two',
        description:
          'The dragon climbs\nto the surface.\nSeek advice\nfrom an authority\nyou respect.',
      },
      {
        lineValue: 'Line Three',
        description:
          'The Superior Person\nbuilds by day\nand remains vigilant\nthrough the night.\nDanger,\nbut he will persevere.',
      },
      {
        lineValue: 'Line Four',
        description: 'The flying dragon\nhovers over the chasm\nfrom which he was born.',
      },
      {
        lineValue: 'Line Five',
        description:
          'The dragon rises high\nfor all to see.\nHe has become\nthe mentor\nhe always longed to find.',
      },
      { lineValue: 'Line Six', description: 'Even a dragon\nmay fly too high.' },
    ],
  },
  {
    number: 2,
    name: "K'un",
    translation: 'Receptive Force',
    description:
      'Earth above\nand Earth below:\nThe Earth\ncontains and sustains.\nIn this situation,\nThe Superior Person\nshould not take\nthe initiative;\nhe should follow\nthe initiative of another.\nHe should seek\nreceptive allies\nin the southwest;\nhe should break ties\nwith immovable allies\nin the northeast.\n\nResponsive devotion.\nReceptive influence.\nSublime success\nif you keep to your course.',
    lines: [
      {
        lineValue: 'Line One',
        description: 'When frost\ncrunches underfoot\ncan winter ice\nbe far behind?',
      },
      {
        lineValue: 'Line Two',
        description:
          'Straight, square, and true.\nBy being\ninstead of doing,\nnothing is left undone.',
      },
      {
        lineValue: 'Line Three',
        description:
          "Hide your brilliance.\nFeeling no threat,\nthey won't resist\nthe completion\nof your goal.\nAll you lose is credit\nfor the accomplishment.",
      },
      {
        lineValue: 'Line Four',
        description:
          'Be a tied-up sack,\nletting your inner contents\nremain unseen.\nThere will be no praise,\nbut also no blame.',
      },
      { lineValue: 'Line Five', description: 'A yellow robe.\nSupreme good fortune.' },
      {
        lineValue: 'Line Six',
        description:
          'The battling dragons\nare too evenly matched.\nEach spills\nblack and yellow blood\nto the soil below',
      },
    ],
  },
  {
    number: 3,
    name: 'Chun',
    translation: 'Difficulty at the Beginning',
    description:
      'Thunder from the Deep:\nThe Superior Person\ncarefully weaves order\nout of confusion.\n\nSupreme success\nif you keep to your course.\nCarefully consider\nthe first move.\nSeek help.',
    lines: [
      {
        lineValue: 'Line One',
        description:
          'You have run up\nagainst an obstacle\nat the very head\nof the trail.\nKeep to your course.\nSeek mutual aid.',
      },
      {
        lineValue: 'Line Two',
        description:
          'Her horses\nrear in fright;\nbut the highwayman\nmeans no harm.\nHe seeks only\nthe hand of the maiden.\nShe must refuse him,\nfor she fears\na very long journey\nlies ahead\nbefore she can marry.',
      },
      {
        lineValue: 'Line Three',
        description:
          'A hunter\nwho pursues his prey\nwithout a guide\nwill lose his way\nin the deeps\nof the forest.\nThe Superior Person\nknows his limitations\nand gives up the chase.\nTo advance\nbrings regret.',
      },
      {
        lineValue: 'Line Four',
        description:
          'Her horses break away.\nTurning back,\nshe must learn to trust,\nand accept\nthe escort of\nher spurned highwayman.\nWhat seemed at first\nmisfortune\nwill lead to marriage.',
      },
      {
        lineValue: 'Line Five',
        description:
          'He could rescue them,\nif only\nthey would trust.\nFor now,\nhe must provide\nprotection\nand small comfort\nfrom the shadows.',
      },
      {
        lineValue: 'Line Six',
        description:
          'The horses break free.\nIf the need for aid\ngoes unrecognized,\ntears and blood\nwill flow',
      },
    ],
  },
  {
    number: 4,
    name: 'Meng',
    translation: 'Inexperience',
    description:
      'A fresh Spring\nat the foot of the Mountain:\nThe Superior Person\nrefines his character\nby being thorough\nin every activity.\nThe sage\ndoes not recruit students;\nthe students seek him.\nHe asks nothing\nbut a sincere desire\nto learn.\nIf the student doubts or challenges his authority,\nthe sage regretfully\ncuts his losses.\n\nSuccess\nif you are sincerely firm.',
    lines: [
      {
        lineValue: 'Line One',
        description:
          'A little discipline\nwill make the fool\nsit up and take notice.\nAfterwards, the matter should be dropped,\nor some will question which is the master\nand which the fool.',
      },
      {
        lineValue: 'Line Two',
        description:
          'The man is gentle with the misguided\nand understands the hearts of women.\nSuch a one can be trusted\nwith the kingdom.',
      },
      {
        lineValue: 'Line Three',
        description:
          'No one respects\na lovestruck woman\nwho throws herself\nat the object of her desire.\nDo not idolize.',
      },
      {
        lineValue: 'Line Four',
        description:
          'You are so terrified\nof being wrong,\nyou leave no room\nfor learning what is right.',
      },
      {
        lineValue: 'Line Five',
        description:
          'Like a wide-eyed child,\nyou wholly and naively trust\nthe goodness of others.\nSuch honor brings out their best.',
      },
      {
        lineValue: 'Line Six',
        description:
          'The best way to prove a fool wrong\nis to let him have his way.\nTo severely restrict his folly\nwill invite him to always believe\nthat his way would have been right.',
      },
    ],
  },
  {
    number: 5,
    name: 'Hsu',
    translation: 'Calculated Waiting',
    description:
      'Deep Waters in the Heavens:\nThunderclouds approaching from the west,\nbut no rain yet.\nThe Superior Person\nnourishes himself\nand remains of good cheer\nto condition himself\nfor the moment of truth.\n\nGreat success\nif you sincerely\nkeep to your course.\nYou may cross\nto the far shore.',
    lines: [
      {
        lineValue: 'Line One',
        description:
          'No trouble in sight,\nbut vague anxieties\nabout what lies\nbeyond the horizon.\nWhether real or not,\nthe threat\nhas already won\nyour peace of mind.',
      },
      {
        lineValue: 'Line Two',
        description:
          'Taking your post\nin the sand,\nceaselessly watching\nthe far shore\nfor enemy movements,\nyou must endure\nthe taunts and contempt\nof your comrades.\nGood fortune\nin the end.',
      },
      {
        lineValue: 'Line Three',
        description:
          'Anxiety prods you\nto premature action.\nWading into the river,\nyou become mired\nin the bed of mud.\nNot only does the enemy\nrealize you detect them,\nbut they see\nyour vulnerability\nas an opportunity\nto strike.',
      },
      {
        lineValue: 'Line Four',
        description:
          'The enemy is upon you.\nYou wait in blood,\npreparing yourself\nfor their blows;\nbut your own ability\ncan see you through,\nif you stand your ground\nand maintain balance.',
      },
      {
        lineValue: 'Line Five',
        description:
          'You smile\nand join in the banquet,\nrelaxing and\ngaining perspective,\nyet vigilant\nand prepared\nfor the next onslaught.\nSuch genuine grace\nunder pressure\nensures victory\nand good fortune.',
      },
      {
        lineValue: 'Line Six',
        description:
          'The showdown comes,\nwith the opponents\ntoo evenly matched.\nJust as all hopes\nof survival are dashed,\nthree strangers appear.\nThey will tip the scales\nin favor of the contender\nwho recognizes them\nfor what they are',
      },
    ],
  },
  {
    number: 6,
    name: 'Sung',
    translation: 'Conflict',
    description:
      'The high Heavens\nover a yawning\nDeep chasm:\nan expansive void\nwhere nothing can dwell.\nEven though\nhe sincerely knows\nhe is right,\nthe Superior Person\nanticipates opposition\nand carefully prepares\nfor any incident.\n\nGood fortune\nif your conflict\nresults in compromise.\nMisfortune\nif your conflict\nescalates to confrontation.\nSeek advice.\nPostpone your crossing\nto the far shore.',
    lines: [
      {
        lineValue: 'Line One',
        description:
          "No quarrel will blossom,\nunless you let your pride\nfertilize this budding conflict.\nLet the one who insults you\nexpose himself for what he is.\nDon't fight this battle\nuntil you've already won it.",
      },
      {
        lineValue: 'Line Two',
        description:
          'Knowing\nhis comrades would be annihilated\nagainst their much stronger foe,\nhe orders a full retreat,\nretires into seclusion,\nand is condemned by the very neighbors\nhe saved from ruin.',
      },
      {
        lineValue: 'Line Three',
        description:
          'He stands on his integrity,\nno matter what ill winds\nmay blast him.\nStand or fall,\nin the end he will remain\nexactly who he is.',
      },
      {
        lineValue: 'Line Four',
        description:
          'Realizing the very root of conflict\nlies within his own heart,\nhe lays down his arms\nand resolves to accept\nthe things he cannot change.',
      },
      {
        lineValue: 'Line Five',
        description:
          'Bring the conflict\nbefore a just authority.\nIf you are truly in the right,\njustice will bring good fortune.',
      },
      {
        lineValue: 'Line Six',
        description:
          'You can certainly win\nthis conflict.\nSuch a victory, though,\nwill bring a lifetime\nof defending your prize\nagainst thieves and challengers',
      },
    ],
  },
  {
    number: 7,
    name: 'Shih',
    translation: 'Recruiting Allies',
    description:
      "Deep Water\nbeneath the Earth's surface:\nUntapped resources\nare available.\nThe Superior Person\nnourishes and\ninstructs the people,\nbuilding a loyal,\ndisciplined following.\n\nGood fortune.\nNo mistakes\nif you follow a course\nled by experience.",
    lines: [
      {
        lineValue: 'Line One',
        description: 'Knowing neither purpose\nnor direction,\nthe soldiers march blindly onward.',
      },
      {
        lineValue: 'Line Two',
        description:
          'The general marches\nwith his soldiers,\nsharing their fate,\ngood or bad,\nfacing the consequences\nof his own decisions.\nFor this he is loved and trusted\nby all.',
      },
      { lineValue: 'Line Three', description: 'A wagonload of corpses\nthis way comes.' },
      {
        lineValue: 'Line Four',
        description: 'It is never a mistake\nto retreat to a stronger position.',
      },
      {
        lineValue: 'Line Five',
        description:
          'The seasoned veteran\nis elevated to command,\nand none too soon.\nFor the game is in the field,\nand it would be wise to catch it.',
      },
      {
        lineValue: 'Line Six',
        description:
          'The victor divides the spoils\namong the loyal,\nleaving the jackals with\nneither reward nor obligation',
      },
    ],
  },
  {
    number: 8,
    name: 'Pi',
    translation: 'Bonding',
    description:
      'Deep waters\non the face of the Earth:\nSurface Waters flow together.\nThe Superior Person\nrecognizes the situation\ncalls for joining together.\nThus he cultivates\nfriendly relations with all.\n\nGood fortune is possible.\nCast the coins again\nto discover if you have\nthe qualities needed\nto lead such a group.\nThen there will be no error.\nThose uncertain\nwill gradually join.\nThose who join too late\nwill meet with misfortune.',
    lines: [
      {
        lineValue: 'Line One',
        description:
          'Confidently and sincerely seeking union.\nHis devotion to you and to truth\nmakes this alliance correct.\nUnexpected good fortune.',
      },
      {
        lineValue: 'Line Two',
        description:
          'Devotion comes from deep inside you.\nGood fortune\nif you keep to your course.',
      },
      { lineValue: 'Line Three', description: 'You are seeking union\nwith unworthy people.' },
      {
        lineValue: 'Line Four',
        description:
          'You express your devotion\nhumbly and openly.\nGood fortune\nif you keep to this course.',
      },
      {
        lineValue: 'Line Five',
        description:
          'The hunter surrounds the game\non only three sides,\nallowing an avenue of escape.\nIn seeking allegiance with others,\nleave room for them to say "no";\nthis way, those choosing to join you\nwill be sincere.',
      },
      {
        lineValue: 'Line Six',
        description: 'Without a head,\nthe union\ncannot hold together.\nMisfortune',
      },
    ],
  },
  {
    number: 9,
    name: "Hsiao Ch'u",
    translation: 'Gentle Restraint',
    description:
      'Winds of change\nhigh in the Heavens:\nAir currents\ncarry the weather.\nDense clouds\nblow in from the west,\nbut still no rain.\nThe Superior Person\nfine tunes the image\nhe presents to the world.\n\nSmall successes.',
    lines: [
      {
        lineValue: 'Line One',
        description:
          'He turns back\nto his proper course.\nNo harm done.\nIn fact, good fortune\ncomes of this return.',
      },
      { lineValue: 'Line Two', description: 'He lets himself\nbe drawn back.\nGood fortune.' },
      {
        lineValue: 'Line Three',
        description:
          "The spokes burst out of a wagon wheel,\nstopping the couple's journey.\nThe man and wife waste time and energy\nblaming each other,\ncausing major damage to their love\ninstead of fixing the minor damage\nto the wagon.",
      },
      {
        lineValue: 'Line Four',
        description:
          'By gaining confidence,\nthe man keeps control of the conflict,\navoiding the blood that could be spilled\nby fear.\nNo mistakes.',
      },
      {
        lineValue: 'Line Five',
        description:
          'His sincerity is the cord that binds\nthe hearts of others to his.\nHe holds wealth\nwho holds the hearts of others.',
      },
      {
        lineValue: 'Line Six',
        description:
          "The needed rain finally pours down,\nbringing a well-earned time of rest.\nIt is Nature's time to enrich the crops,\nso leave it to her.\nTo work the fields in the rain and mud\nwould only undo all good effort.\nDo not seek more;\nthe gibbous moon seeks to be full,\nbut once full can do nothing but wane",
      },
    ],
  },
  {
    number: 10,
    name: 'Lu',
    translation: 'Worrying the Tiger',
    description:
      'Heaven shines down\non the Marsh\nwhich reflects it back imperfectly:\nThough the Superior Man\ncarefully discriminates\nbetween high and low,\nand acts in accord\nwith the flow of the Tao,\nthere are still situations\nwhere a risk must be taken.\n\nYou tread upon\nthe tail of the tiger.\nNot perceiving you as a threat,\nthe startled tiger does not bite.\nSuccess.',
    lines: [
      {
        lineValue: 'Line One',
        description:
          'He treads the simple path\nof least resistance,\nmaking swift and blameless\nprogress.',
      },
      {
        lineValue: 'Line Two',
        description:
          'A man of modest independence\ntreads a smooth and level path.\nGood fortune\nif you stay on course.',
      },
      {
        lineValue: 'Line Three',
        description:
          "A one-eyed man may still see,\na lame man may still walk,\nbut it takes every resource\nto circumvent the tiger.\nWhen this tiger is stepped on\nhe bites.\nOnly a warrior supremely loyal to his cause\nwould enter a battle he knows\nhe hasn't the resources to survive.",
      },
      {
        lineValue: 'Line Four',
        description:
          'He shows humble hesitation\nand breathless caution,\nyet still resolutely takes a necessary step\non the tail of the tiger.\nHis modest manner saves him\nfrom the bite.',
      },
      {
        lineValue: 'Line Five',
        description:
          'Though fully aware of the danger\nthat lies on the narrow path ahead,\nthe man is fully commited to move forward.\nThe future is uncertain.',
      },
      {
        lineValue: 'Line Six',
        description:
          "At your journey's end,\nlook back and examine\nthe path you chose.\nIf you find no causes for shame,\nonly good works that make you shine,\nyou may take this as an omen\nof the certainty of great reward",
      },
    ],
  },
  {
    number: 11,
    name: "T'ai",
    translation: 'Peace',
    description:
      'Heaven and Earth embrace,\ngiving birth to Peace.\nThe Superior Person\nserves as midwife,\npresenting the newborn gift\nto the people.\n\nThe small depart;\nthe great approach.\nSuccess.\nGood fortune.',
    lines: [
      {
        lineValue: 'Line One',
        description:
          'When the grass is pulled up\nthe earth in which it is firmly rooted\ncomes up with it.\nYou share your new wealth\nwith loved ones,\ncreating a conduit\nfor even greater fortune.',
      },
      {
        lineValue: 'Line Two',
        description:
          'Despite his success,\nhe is gentle to those who impose,\nhe fords the icy stream between him and another,\nhe does not forget his duties to those distant,\nhe does not abandon his companions;\nhe truly walks the Golden Mean.',
      },
      {
        lineValue: 'Line Three',
        description:
          'Every plain leads to a slope.\nAll going leads to a return.\nHe who keeps his inner faith\nin the midst of oppression\nwill persevere.\nDo not rail against what must be;\nsavor fully what remains.',
      },
      {
        lineValue: 'Line Four',
        description:
          'Instead of stretching to grasp\nthe wealth that may rise out of reach,\nhe stoops to help his companions\nclimb to his level.\nThey expect his resentment\nbut receive only his faith and love;\nthey no longer fear his power.',
      },
      {
        lineValue: 'Line Five',
        description:
          "The emperor gives his blessing\nto his daughter's marriage to a commoner.\nAll ranks of life benefit from this.",
      },
      {
        lineValue: 'Line Six',
        description:
          'The wall crumbles into the moat.\nSuch overfortification and defensiveness\nwill cause you more loss\nthan if you had remained totally exposed\nand had opened your arms to fate.',
      },
    ],
  },
  {
    number: 12,
    name: "P'i",
    translation: 'Stagnation',
    description:
      'Heaven and Earth\nmove away from each other.\nIn the ensuing void,\nthe small invade\nwhere the great\nhave departed.\nThere is no\ncommon meeting ground,\nso the Superior Person\nmust fall back\non his inner worth\nand decline\nthe rewards offered\nby the inferior invaders.\n\nDifficult trials\nas you hold to your course.',
    lines: [
      {
        lineValue: 'Line One',
        description:
          "When grass is pulled up\nthe earth in which it is firmly rooted\ncomes up with it.\nHe remains loyal\nto those who helped him,\nand carries them\nout of harm's way.",
      },
      {
        lineValue: 'Line Two',
        description:
          'He knows better than the sycophants\nhow to manipulate the petty rulers;\nbut instead he keeps his integrity\nand remains among the oppressed.',
      },
      {
        lineValue: 'Line Three',
        description:
          'A vague inward feeling of shame\nremains unrecognized\nbut still succeeds in haunting.',
      },
      {
        lineValue: 'Line Four',
        description:
          'He answers a Higher calling.\nWhether he survives or whether he falls,\nhe will serve as the inspiration\nto those who will overthrow\nthe oppressive regime.',
      },
      {
        lineValue: 'Line Five',
        description:
          'He turns the tide of oppression,\nbut never allows himself to rest on his laurels.\nWith every advance, he asks himself,\n"What if it should fail? What if it should fail?"\nHe ties his strategy to the lesson of mulberry shoots.',
      },
      {
        lineValue: 'Line Six',
        description:
          'The oppressive stagnation\nrots to the inevitable end\nthat all such corruption must meet.\nIts compost nourishes the seeds\nof great joy and fortune.',
      },
    ],
  },
  {
    number: 13,
    name: "T'ung Yen",
    translation: 'Social Mechanism',
    description:
      'Heaven reflects\nthe Flame of clarity:\nThe Superior Person\nanalyzes the various levels\nand working parts\nof the social structure,\nand uses them to advantage.\n\nSuccess\nif you keep to your course.\nYou may cross to the far shore.',
    lines: [
      {
        lineValue: 'Line One',
        description:
          'Sincere affection in the open.\nWhy should anything\nso deep and genuine\ncause embarrassment or shame?',
      },
      {
        lineValue: 'Line Two',
        description:
          'The clan holds tightly,\narmed against outsiders.\nThis inbreeds fear and cruelty,\nwhich can only give birth\nto strife and extinction.',
      },
      { lineValue: 'Line Three', description: 'You hold with unworthy allies.' },
      {
        lineValue: 'Line Four',
        description:
          'He greets them cordially,\nbut from a high vantage point\nwith secreted weapons close at hand.\nHis mistrust will slowly dissipate\nand good fortune will return.',
      },
      {
        lineValue: 'Line Five',
        description:
          'He is drawn to another.\nHe fights the attraction fiercely,\nbut his later surrender brings joy.',
      },
      {
        lineValue: 'Line Six',
        description:
          'He meets with others\nin the meadow.\nThere all are in the open,\nnone may remain hidden.\nNo remorse',
      },
    ],
  },
  {
    number: 14,
    name: 'Ta Yu',
    translation: 'Great Treasures',
    description:
      'The Fire of clarity\nilluminates the Heavens\nto those below:\nThe Superior Person possesses\ngreat inner treasures --\ncompassion, economy,\nand modesty.\nThese treasures allow\nthe benevolent will of Heaven\nto flow through him outward\nto curb evil and further good.\n\nSupreme success.',
    lines: [
      {
        lineValue: 'Line One',
        description:
          "No mistakes\nif you stay out of harm's way.\nRemain conscious of\ndangers and difficulties,\nand you will have no regrets.",
      },
      {
        lineValue: 'Line Two',
        description:
          'A large wagon for loading.\nYou have found the perfect means\nfor distributing and increasing\nyour treasures.',
      },
      {
        lineValue: 'Line Three',
        description:
          'A Prince gives his treasures freely\nto those who can better use them.\nA lesser man could not do this.',
      },
      {
        lineValue: 'Line Four',
        description:
          'He can make the distinction\nbetween his true treasures within\nand the material possessions\nothers covet.',
      },
      {
        lineValue: 'Line Five',
        description: 'His sincerity attracts and inspires\nothers whom gold could not.',
      },
      {
        lineValue: 'Line Six',
        description: 'Heaven blesses you\nwith good fortune.\nImprovement in all facets',
      },
    ],
  },
  {
    number: 15,
    name: "Ch'ien",
    translation: 'Modesty',
    description:
      'The Mountain\ndoes not overshadow\nthe Plain surrounding it:\nSuch modest consideration\nin a Superior Person\ncreates a channel\nthrough which excess\nflows to the needy.\n\nSuccess\nif you carry things through.',
    lines: [
      {
        lineValue: 'Line One',
        description:
          'The Superior Person\nis modest about his modesty,\nand thus may cross to the far shore.\nGood fortune.',
      },
      {
        lineValue: 'Line Two',
        description: 'Modesty that radiates\nThis course brings good fortune.',
      },
      {
        lineValue: 'Line Three',
        description: 'The Superior Person modestly\nbrings things to completion.\nGreat success.',
      },
      { lineValue: 'Line Four', description: 'Progressive modesty\ncontinues to gain.' },
      {
        lineValue: 'Line Five',
        description:
          'Modest yet firm resistance\nagainst an oppressor\nwill end the aggression\nand win concessions.',
      },
      {
        lineValue: 'Line Six',
        description: 'Modesty is the best face\nwhen correcting the errors\nof your own allies.',
      },
    ],
  },
  {
    number: 16,
    name: 'Yu',
    translation: 'Enthusiasm',
    description:
      'Thunder comes resounding\nout of the Earth:\nSimilar thunder roars up\nfrom the masses\nwhen the Superior Person strikes a chord\nin their hearts.\n\nWhip up enthusiasm,\nrally your forces,\nand move boldly forward.',
    lines: [
      { lineValue: 'Line One', description: 'Pride comes before a fall.' },
      {
        lineValue: 'Line Two',
        description:
          'Firm as a rock,\nbut only when necessary\nand appropriate.\nThis course\nbrings good fortune.',
      },
      {
        lineValue: 'Line Three',
        description:
          'You wait for a compelling signal,\nyet ignore the knock at the gate.\nMissed opportunity breeds regret.',
      },
      {
        lineValue: 'Line Four',
        description:
          'His music strikes a chord\nand wins hearts.\nHis trust makes them true,\nand brings great success.',
      },
      {
        lineValue: 'Line Five',
        description:
          'Thorough self-diagnosis\nof his own affliction\nkeeps him safely from the brink\nof fatal error.',
      },
      {
        lineValue: 'Line Six',
        description: 'Compulsive enthusiasm\ncan be set right\nif it learns from its mistakes.',
      },
    ],
  },
];

export const hexagrams_17_32: IChingHexagram[] = [
  {
    number: 17,
    name: 'Sui',
    translation: 'Following',
    description:
      "Thunder beneath\nthe Lake's surface.\nThe Superior Person\nallows himself\nplenty of sheltered rest\nand recuperation\nwhile awaiting\na clear sign to follow.\n\nSupreme success.\nNo mistakes\nif you keep to your course.",
    lines: [
      {
        lineValue: 'Line One',
        description:
          'An ending opens a new beginning.\nStepping out of your sanctuary\ninto new company\nwill bring achievement.',
      },
      { lineValue: 'Line Two', description: 'Indulging the child,\nyou lose the adult.' },
      {
        lineValue: 'Line Three',
        description: 'To find what you seek,\nyou must leave the child\nand follow the adult.',
      },
      {
        lineValue: 'Line Four',
        description:
          'Following for dishonorable reasons.\nPause for clarity\nand a return to integrity.\nOnce actions are sincere,\nyou may move forward blamelessly.',
      },
      { lineValue: 'Line Five', description: 'The path ahead\nis strewn with blessings.' },
      {
        lineValue: 'Line Six',
        description:
          'By virtue of your wise heart,\nyou are followed by a leader.\nCome down from your mountain,\nand you will be rewarded with another',
      },
    ],
  },
  {
    number: 18,
    name: 'Ku',
    translation: 'Repairing the Damage',
    description:
      'Winds sweep through the Mountain valley:\nThe Superior Person\nsweeps away\ncorruption and stagnation\nby stirring up the people\nand strengthening their spirit.\n\nSupreme success.\nBefore crossing\nto the far shore,\nconsider the move\nfor three days.\nAfter crossing,\ndevote three days\nof hard labor\nto damage control.',
    lines: [
      {
        lineValue: 'Line One',
        description:
          "Correcting his father's error,\na son treads dangerously close to dishonor.\nYet sparing his father from blame\nbrings good fortune in the end.",
      },
      {
        lineValue: 'Line Two',
        description: "Correcting his mother's error,\na son must not be too strident.",
      },
      {
        lineValue: 'Line Three',
        description: 'Restoring what his father damaged.\nSome regrets, but no great mistakes.',
      },
      {
        lineValue: 'Line Four',
        description: 'Tolerating the malpractices of the father\nwill lead the son to ruin.',
      },
      {
        lineValue: 'Line Five',
        description: "Setting right the father's ruins,\nThe son receives honors.",
      },
      {
        lineValue: 'Line Six',
        description: 'Refusing to serve\nthe conquerors of nations,\nhe sets out to conquer hearts',
      },
    ],
  },
  {
    number: 19,
    name: 'Lin',
    translation: 'Noble Calling',
    description:
      'The rich, loamy Earth\non the banks of the Marsh\nprovides fertile soil\nfor exceptional progress.\nThe Superior Person is\ninexhaustible\nin his willingness to teach,\nand without limit\nin his tolerance\nand support of others.\n\nSupreme success\nif you keep to your course.\nBut be aware that\nyour time is limited;\nYour power will wane,\nas Summer changes to Fall.',
    lines: [
      {
        lineValue: 'Line One',
        description:
          'Sharing the authority\nensures cooperation.\nThis course brings good fortune.',
      },
      {
        lineValue: 'Line Two',
        description: 'If you approach this matter together,\ngood fortune is certain.',
      },
      {
        lineValue: 'Line Three',
        description:
          'Aggressive action\nmeets inflexible resistance.\nIf regret leads to a softer approach,\nthere will be no irreparable damage.',
      },
      {
        lineValue: 'Line Four',
        description: 'Successful or not,\na sincere approach\nis the only course.',
      },
      {
        lineValue: 'Line Five',
        description: 'Your wise approach\nis worthy of a prince.\nGreat fortune will result.',
      },
      {
        lineValue: 'Line Six',
        description: 'You approach with\nhumble honesty and generosity.\nThis is a superior act',
      },
    ],
  },
  {
    number: 20,
    name: 'Kuan',
    translation: 'Contemplation',
    description:
      'The gentle Wind\nroams the Earth:\nThe Superior Person\nexpands his sphere of influence\nas he expands his awareness.\nDeeply devoted\nto his pursuit\nof clarity and wisdom,\nhe is unconscious of the inspiring,\npositive example\nhe is setting\nfor others to emulate.\n\nYou have cleansed yourself;\nnow stand ready\nto make your humble,\ndevout offering.',
    lines: [
      {
        lineValue: 'Line One',
        description:
          'You look at things like a child.\nThis is pardonable in a lesser man,\nbut a fatal flaw in one of your calibre.',
      },
      {
        lineValue: 'Line Two',
        description:
          'Peeking from behind a screen\nmay ensure your privacy,\nbut it offers you only a partial view.',
      },
      {
        lineValue: 'Line Three',
        description:
          'By looking back\nover the course of your life,\nyou will know if this is a time\nfor advance or retreat.',
      },
      {
        lineValue: 'Line Four',
        description: 'Observe the leader firsthand\nto decide the worthiness\nof the cause.',
      },
      {
        lineValue: 'Line Five',
        description:
          'His future is shaped\nby the quality of his influence\non others in the past.\nBe blameless.',
      },
      {
        lineValue: 'Line Six',
        description:
          'He contemplates his own integrity\nwithout regard to the good or bad consequences\nhis actions may have wrought.\nStand or fall, he must be true to himself.',
      },
    ],
  },
  {
    number: 21,
    name: 'Shih Ho',
    translation: 'Biting Through',
    description:
      'The merciless, searing judgement of Lightning\nfulfills the warning prophecies\nof distant Thunder.\nSage rulers\npreserved justice\nby clearly defining\nthe laws,\nand by delivering\nthe penalties decreed.\n\nThough unpleasant,\nit is best\nto let justice have its due.',
    lines: [
      {
        lineValue: 'Line One',
        description:
          'His feet are encased in stocks\nthat hide his toes.\nMild punishment, no blame.',
      },
      {
        lineValue: 'Line Two',
        description:
          'A bite so deep into the meat\nthat his nose disappears.\nHarsh, but no mistake.',
      },
      {
        lineValue: 'Line Three',
        description:
          'Biting into dried meat\nAnd striking something spoiled.\nUncomfortable, but no harm.',
      },
      {
        lineValue: 'Line Four',
        description:
          'Biting into dried meat\nand striking a piece of metal.\nIf you recognize the dangers,\nyou may follow this course to good fortune.',
      },
      {
        lineValue: 'Line Five',
        description:
          'Biting into dried meat\nand striking the golden arrowhead.\nKeeping to this perilous course\nwill result in unexpected reward.',
      },
      {
        lineValue: 'Line Six',
        description:
          'The wooden stocks cover his ears,\nmaking him deaf\nto the warnings to repent.\nMisfortune will deepen',
      },
    ],
  },
  {
    number: 22,
    name: 'Pi',
    translation: 'Grace',
    description:
      "Fire illuminates\nthe base of the Mountain:\nThe Superior Person\nrealizes he has not\nthe wisdom to move\nthe course of the world,\nexcept by attending\nto each day's affairs\nas they come.\n\nSuccess in small matters.\nThis is a good time\nto begin something.",
    lines: [
      { lineValue: 'Line One', description: 'Honoring his feet,\nhe leaves his carriage to walk.' },
      { lineValue: 'Line Two', description: 'Adorning the beard\nto the detriment of the chin.' },
      {
        lineValue: 'Line Three',
        description: 'Graceful as the mist.\nHolding to this course brings blessing.',
      },
      {
        lineValue: 'Line Four',
        description:
          'Artifice or simplicity?\nTwo riders on winged white horses:\none a bandit, the other an ardent suitor.',
      },
      {
        lineValue: 'Line Five',
        description:
          'Your small roll of silk\nseems a shameful offering\namong the splendor of his gardens,\nyet it is your sincerity and perseverance\nthat are truly prized.',
      },
      { lineValue: 'Line Six', description: 'Faultless grace is simple and pure' },
    ],
  },
  {
    number: 23,
    name: 'Po',
    translation: 'Splitting Apart',
    description:
      'The weight of the Mountain\npresses down upon a weak foundation of Earth:\nThe Superior Person\nwill use this time of oppression\nto attend to the needs\nof those less fortunate.\n\nAny action\nwould be ill-timed.\nStand fast.',
    lines: [
      {
        lineValue: 'Line One',
        description: 'The legs of the throne are hacked away.\nThe loyal are cut down.',
      },
      {
        lineValue: 'Line Two',
        description:
          'The arms of the throne are split to kindling.\nThose closest to the leader\nare slashed away.',
      },
      {
        lineValue: 'Line Three',
        description:
          'He moves among those\nwho would overturn the throne.\nDiscretion and a true heart\nare the key to survival.',
      },
      {
        lineValue: 'Line Four',
        description:
          'The seat of the throne is ripped apart;\nthe leader is falling.\nOutrageous fortune.',
      },
      {
        lineValue: 'Line Five',
        description:
          'Others follow you\nlike fish on a line.\nThe tide turns\nas you bring order from the chaos.',
      },
      {
        lineValue: 'Line Six',
        description:
          'Refusing fruit offered by the serpent,\nhe gains a carriage\nwhen the snake swallows its own tail\nand the light is restored',
      },
    ],
  },
  {
    number: 24,
    name: 'Fu',
    translation: 'Return',
    description:
      "Thunder regenerates\ndeep within Earth's womb:\nSage rulers recognized\nthat the end of Earth's\nseasonal cycle\nwas also the starting point\nof a new year\nand a time for dormancy.\nThey closed the passes\nat the Solstice\nto enforce a rest\nfrom commerce and activity.\nThe ruler himself did not travel.\n\nYou have passed this way before\nbut you are not regressing.\nThis is progress,\nfor the cycle now repeats itself,\nand this time you are aware\nthat it truly is a cycle.\nThe return of old familiars\nis welcome.\nYou can be as sure of this cycle\nas you are that seven days\nbring the start of a new week.\nUse this dormancy phase to plan\nwhich direction you will grow.",
    lines: [
      {
        lineValue: 'Line One',
        description: 'Return after straying off-trail.\nGood fortune and no blame.',
      },
      { lineValue: 'Line Two', description: 'Your return is welcome.\nGreat fortune.' },
      {
        lineValue: 'Line Three',
        description: 'Return after return after return.\nRisky, but never a mistake.',
      },
      {
        lineValue: 'Line Four',
        description: 'As the masses move on,\nyou see a better path\nand return alone.',
      },
      {
        lineValue: 'Line Five',
        description: 'Openly admitting your mistake,\nyou humbly and nobly return.\nNo blame.',
      },
      {
        lineValue: 'Line Six',
        description:
          'You have missed the opportunity\nfor a triumphant return.\nYou must now wait years\nbefore such an opportunity\ncycles your way again.\nGrave misfortune',
      },
    ],
  },
  {
    number: 25,
    name: 'Wu Wang',
    translation: 'Remaining Blameless',
    description:
      'Thunder rolls\nbeneath Heaven,\nas is its nature and place:\nSage rulers aligned themselves\nwith the changing seasons,\nnurturing and guiding\ntheir subjects to do the same.\n\nExceptional progress\nif you are mindful\nto keep out of the way\nof the natural Flow.\nIt would be a fatal error\nto try to alter its course.\nThis is a time of Being,\nnot Doing.',
    lines: [
      { lineValue: 'Line One', description: 'A guileless nature\nreaps good fortune.' },
      {
        lineValue: 'Line Two',
        description:
          "Plow your field\nfor a field well-plowed,\nnot for possible harvests.\nClear the wasteland\nfor land well-cleared,\nnot for potential rich fields.\nSuch guileless enterprise\ncan't help but succeed.",
      },
      {
        lineValue: 'Line Three',
        description:
          'An innocent man\nis unjustly accused\nof the theft of an ox\ntaken by a drifter.\nHis very simplicity\nwill acquit him.',
      },
      { lineValue: 'Line Four', description: 'No mistakes\nif your aim\nremains true.' },
      {
        lineValue: 'Line Five',
        description:
          'No medicine\nwill treat this malady.\nIts cause was internal,\nas will be its cure.',
      },
      {
        lineValue: 'Line Six',
        description: 'Any action,\nhowever innocent,\nwill bring misfortune.\nStand fast.',
      },
    ],
  },
  {
    number: 26,
    name: "Ta Ch'u",
    translation: 'Recharging Power',
    description:
      "Heaven's motherlode\nwaits within the Mountain:\nThe Superior Person\nmines deep into history's\nwealth of wisdom and deeds,\ncharging his character with\ntimeless strength.\n\nPersevere.\nDrawing sustenance\nfrom these sources\ncreates good fortune.\nThen you may cross\nto the far shore.",
    lines: [
      {
        lineValue: 'Line One',
        description: 'One more step brings disaster.\nA halt now proves strategic.',
      },
      {
        lineValue: 'Line Two',
        description:
          'The axles have been removed\nfrom your cart.\nGood reason to remain in place\nfor the moment.',
      },
      {
        lineValue: 'Line Three',
        description:
          'A good stallion with speed.\nDiscipline daily,\nstudy your goal,\nand advance is assured.',
      },
      {
        lineValue: 'Line Four',
        description:
          'Attaching a plank of wood\nto the brow of this young bull\nwill stunt the growth of his horns.\nSuch foresight brings great fortune.',
      },
      {
        lineValue: 'Line Five',
        description: 'The tusks of a gelded boar.\nOminous-looking,\nbut without purpose.',
      },
      {
        lineValue: 'Line Six',
        description: 'In harmony with the will of Heaven,\nyour strength is irresistible',
      },
    ],
  },
  {
    number: 27,
    name: 'I',
    translation: 'Providing Nourishment',
    description:
      'Beneath the immobile Mountain\nthe arousing Thunder stirs:\nThe Superior Person\npreserves his freedom\nunder oppressive conditions\nby watching what comes\nout of his mouth,\nas well as what goes in.\n\nEndure\nand good fortune will come.\nNurture others in need,\nas if you were feeding yourself.\nTake care\nnot to provide sustenance\nfor those who feed off others.\nStay as high as possible\non the food chain.',
    lines: [
      {
        lineValue: 'Line One',
        description:
          'You ignore your own succulent dinner\nto crave the dish set before another.\nMisfortune.',
      },
      {
        lineValue: 'Line Two',
        description:
          'Climbing steadily toward nourishment.\nyou stray from the hill path\nto gather wild fruit.\nYou wander toward disaster.',
      },
      {
        lineValue: 'Line Three',
        description:
          'You gorge yourself on tempting sweets,\ndevoid of nutritional value.\nSuch heedless compulsiveness\ncarries longlasting consequences.',
      },
      {
        lineValue: 'Line Four',
        description:
          'Climbing to the summit\nto obtain nourishment for others,\nyou are as alert as a tiger\nready to spring.\nThis is the correct path.',
      },
      {
        lineValue: 'Line Five',
        description:
          'Unspeakable delights\ntempt maddeningly from the far bank.\nYou must not cross this stream.',
      },
      {
        lineValue: 'Line Six',
        description:
          'Others depend on you for sustenance.\nIf you are aware of the great responsibility\nsuch a position carries,\nall will share good fortune.\nYou may cross to the far shore',
      },
    ],
  },
  {
    number: 28,
    name: 'Ta Kuo',
    translation: 'Critical Mass',
    description:
      'The Flood rises\nabove the tallest Tree:\nAmidst a rising tide\nof human folly,\nthe Superior Person\nretires to higher ground,\nrenouncing his world\nwithout looking back.\n\nAny direction is better\nthan where you now stand.',
    lines: [
      {
        lineValue: 'Line One',
        description:
          'He cushions the objects\nwith mats of white palm\nbefore setting them on the soft grass.\nSuch overcaution is no mistake.',
      },
      {
        lineValue: 'Line Two',
        description:
          'The old willow sprouts new shoots.\nAn older man takes a young wife.\nGood fortune abounds.',
      },
      {
        lineValue: 'Line Three',
        description: 'The supporting beam\nis bending to its breaking point.\nDisaster looms.',
      },
      {
        lineValue: 'Line Four',
        description:
          'You come to the rescue\nand reinforce the supporting structure.\nOrder and good fortune is restored.\nBut does your help carry a price?',
      },
      {
        lineValue: 'Line Five',
        description:
          'The withered willow blossoms.\nAn older woman takes a young husband.\nNo blame, no praise.',
      },
      {
        lineValue: 'Line Six',
        description:
          'Fording the flooded stream,\nhe disappears beneath the rushing waters\nand never resurfaces.\nMisfortune through no fault of his own',
      },
    ],
  },
  {
    number: 29,
    name: "K'an",
    translation: 'Dangerously Deep',
    description:
      'Water follows Water,\nspilling over any cliff,\nflowing past all obstacles,\nno matter\nthe depth or distance,\nto the sea.\n\nThe Superior Person\nlearns flexibility\nfrom the mistakes\nhe has made,\nand grows strong\nfrom the obstacles\nhe has overcome,\npressing on\nto show others the Way.',
    lines: [
      {
        lineValue: 'Line One',
        description: 'Deep beneath the earth,\nhe falls into an even deeper chasm.\nPerilous.',
      },
      {
        lineValue: 'Line Two',
        description:
          "This dark pit you find yourself in\nis rife with traps and pitfalls.\nDon't scramble toward freedom,\nbut concentrate on one small toehold\nat a time.",
      },
      {
        lineValue: 'Line Three',
        description: 'Deep, dangerous pitfalls on every side.\nStand fast.',
      },
      {
        lineValue: 'Line Four',
        description: 'A simple meal of rice and wine,\neaten from earthen bowls.\nThis is correct.',
      },
      {
        lineValue: 'Line Five',
        description:
          'The dark waters of this pit will rise no higher.\nYour greatest danger now lies in panic.\nKeep your wits and you will escape.',
      },
      {
        lineValue: 'Line Six',
        description:
          'Bound with ropes,\nthrown into a thorn-filled chasm.\nFor three years he is lost in this wasteland.\nMisfortune',
      },
    ],
  },
  {
    number: 30,
    name: 'Li',
    translation: 'Igniting',
    description:
      'Fire sparks\nmore Flames:\nThe Superior Person\nholds an inner Fire\nthat ignites passion\nin every heart it touches,\nuntil all the world\nis enlightened and aflame.\n\nWith so searing a flame,\nsuccess will not be denied you.\nTake care to be\nas peaceful and nurturing\nas the cow in the meadow;\nyou are strong enough\nto be gentle.',
    lines: [
      {
        lineValue: 'Line One',
        description: 'Meek and uncertain,\nhe nevertheless approaches the radiance.\nNo mistake.',
      },
      {
        lineValue: 'Line Two',
        description: 'Glowing yellow warmth\nas if from the sun.\nSupreme good fortune.',
      },
      {
        lineValue: 'Line Three',
        description:
          'Old men read the lesson in the setting sun.\nBeat the cymbal and sing in this life,\nor wail away the hours fearing death.\nTheir choice is their fortune.',
      },
      {
        lineValue: 'Line Four',
        description:
          'He bursts into flame,\ndazzles with his brilliance,\nspends his fuel,\ndies out quickly\nand is forgotten.',
      },
      {
        lineValue: 'Line Five',
        description: 'Tears of repentance flood.\nEnlightenment turns the tide\nfor the better.',
      },
      {
        lineValue: 'Line Six',
        description:
          'Sent as an instrument of justice,\nhe transcends his station,\ndelivering swift punishment to the perpetrators,\nbut mercy to the misled.\nFaultless',
      },
    ],
  },
  {
    number: 31,
    name: 'Hsien',
    translation: 'Attraction',
    description:
      'The joyous Lake is cradled\nby the tranquil Mountain:\nThe Superior Person\ntakes great satisfaction\nin encouraging others\nalong their journey.\nHe draws them to him\nwith his welcoming nature\nand genuine interest.\n\nSupreme success.\nThis course leads to marriage.',
    lines: [
      {
        lineValue: 'Line One',
        description:
          'He skillfully hides his excitement,\nbut is betrayed by the twitching\nof his big toe.',
      },
      {
        lineValue: 'Line Two',
        description:
          "Nervously shaking his leg\nshows his irresistible urge to advance.\nMisfortune if he does.\nGood fortune if he doesn't.",
      },
      {
        lineValue: 'Line Three',
        description:
          'Restless thighs signify\nimpatience and a lack of restraint.\nHe has lost his center\nand is obsessed with another.\nHumiliation.',
      },
      {
        lineValue: 'Line Four',
        description:
          'Trembling all over.\nOnly those who truly know him\nwould understand.\nFavorable if he stays on course.',
      },
      {
        lineValue: 'Line Five',
        description: 'Chills down the spine\nbut no startled movements.\nNo regrets.',
      },
      {
        lineValue: 'Line Six',
        description: 'A wagging tongue and working jaws.\nAll sound and fury\nsignifying nothing',
      },
    ],
  },
  {
    number: 32,
    name: 'Heng',
    translation: 'Durability',
    description:
      'Arousing Thunder\nand penetrating Wind,\nclose companions\nin any storm:\nThe Superior Person\npossesses a resiliency\nand durability\nthat lets him remain\nfirmly and faithfully\non course.\n\nSuch constancy\ndeserves success.',
    lines: [
      {
        lineValue: 'Line One',
        description:
          'He pledges his love too hastily,\nand awaits her promise in return.\nThis stunts the natural growth of affection.',
      },
      { lineValue: 'Line Two', description: 'These bad feelings will pass.' },
      {
        lineValue: 'Line Three',
        description: 'He must remain constant,\nor the only permanence\nwill reside in disgrace.',
      },
      { lineValue: 'Line Four', description: 'No game in the field.' },
      { lineValue: 'Line Five', description: 'To submit to insult\nis to invite injury.' },
      {
        lineValue: 'Line Six',
        description: 'Constant only in his inconstancy,\neven fortune is eventually exhausted.',
      },
    ],
  },
];

export const hexagrams_33_48: IChingHexagram[] = [
  {
    number: 33,
    name: 'Tun',
    translation: 'Retreat',
    description:
      'The tranquil Mountain\ntowers overhead,\nyet remains this side\nof Heaven:\nThe Superior Person\navoids the petty and superficial\nby keeping shallow men\nat a distance,\nnot in anger\nbut with dignity.\n\nSuch a retreat\nsweeps the path clear\nto Success.\nOccupy yourself\nwith minute detail.',
    lines: [
      {
        lineValue: 'Line One',
        description:
          'You have reached\nthe outlands of your retreat.\nTo hold your advantage,\nfall back no further.',
      },
      {
        lineValue: 'Line Two',
        description: 'He lashes himself to his cause\nwith thongs of yellow oxhide.',
      },
      {
        lineValue: 'Line Three',
        description:
          'Though it imperils his retreat,\nhe must provide for\nthe safety of those\nwho have served him loyally.',
      },
      {
        lineValue: 'Line Four',
        description:
          'The Superior Person sees retreat\nas an opportunity to\nstrengthen his position,\nand makes it so.\nThe inferior person sees retreat\nas a defeat,\nand makes it so.',
      },
      {
        lineValue: 'Line Five',
        description: 'He makes a dignified retreat\nand retains control of the situation.',
      },
      {
        lineValue: 'Line Six',
        description: 'He retires nobly,\nseeing that it is\nfor the good of all',
      },
    ],
  },
  {
    number: 34,
    name: 'Ta Chuang',
    translation: 'Awesome Power',
    description:
      'Thunder fills the Heavens\nwith its awful roar,\nnot out of pride,\nbut with integrity;\nif it did less,\nit would not be Thunder:\nBecause of his Great Power,\nthe Superior Person takes pains\nnot to overstep his position,\nso that he will not seem\nintimidating or threatening\nto the Established Order.\n\nOpportunity will arise\nalong this course.',
    lines: [
      {
        lineValue: 'Line One',
        description:
          'He uses all his remaining strength\nto stamp his hoof\nand paw the ground.\nIf his bluff is called,\nit will bring misfortune.',
      },
      { lineValue: 'Line Two', description: 'Good fortune ahead\nif you stay on course.' },
      {
        lineValue: 'Line Three',
        description:
          'The inferior person\nthrows all his energy\ntoward his goal.\nThe Superior Person\nmakes conserving energy\nhis goal.\nThe ram butts into a hedge,\nentangling his horns.',
      },
      {
        lineValue: 'Line Four',
        description:
          'Entanglements loosen,\nand a way opens\nthrough the wall\nthat has blocked you.\nThe opening is narrow\nand must be navigated\nwith the greatest caution,\nor you will be stopped\ndead in your tracks again.',
      },
      {
        lineValue: 'Line Five',
        description:
          'There are no threats\nleft before you.\nYou may set your ram free\nwithout regret.',
      },
      {
        lineValue: 'Line Six',
        description:
          'If the ram butts into the hedge,\nthe entangling thorns will prevent\nboth advance and retreat.\nIt is best\nto recognize this danger\nand avoid it',
      },
    ],
  },
  {
    number: 35,
    name: 'Chin',
    translation: 'Aspiration',
    description:
      'The Sun shines down\nupon the Earth:\nConstantly honing\nand refining his brilliance,\nthe Superior Person\nis a Godsend to his people.\nThey repay his benevolence\nwith a herd of horses,\nand he is granted audience\nthree times in a single day.\n\nPromotion.',
    lines: [
      {
        lineValue: 'Line One',
        description:
          'Meet their distrust\nwith tolerance\nand benevolence;\nsuch graciousness\nwill wear away\nany heart of stone.',
      },
      {
        lineValue: 'Line Two',
        description:
          'You advance in sorrow,\nbut this path\nleads to good fortune.\nAccept the boon\nof a wise woman.',
      },
      {
        lineValue: 'Line Three',
        description:
          'He is chosen unanimously\nto carry out\nthe will of the people.\nAll self-doubt vanishes.',
      },
      {
        lineValue: 'Line Four',
        description: 'Scurrying like a mouse.\nSuch blind panic\nincreases the danger.',
      },
      {
        lineValue: 'Line Five',
        description:
          "Advancing along this path\nwill prove rewarding\nif you don't lose your focus\nwith visions of success\nor failure.",
      },
      {
        lineValue: 'Line Six',
        description:
          'Though politically perilous,\nit is wiser to put infidels\nwithin your own city walls\nto the sword,\nrather than lead a Crusade\nto convert faraway lands',
      },
    ],
  },
  {
    number: 36,
    name: 'Ming I',
    translation: 'Eclipsing the Light',
    description:
      'Warmth and Light\nare swallowed by\ndeep Darkness:\nThe Superior Person\nshows his brilliance\nby keeping it veiled\namong the masses.\n\nStay true to your course,\ndespite the visible obstacles\nahead.',
    lines: [
      {
        lineValue: 'Line One',
        description:
          "The pheasant's wings\nfalter and droop\nfrom exhaustion.\nThe man wanders\nthree days without eating.\nHe goes where he must,\nthough scorn awaits him.",
      },
      {
        lineValue: 'Line Two',
        description:
          'The grieving pheasant\nhas a wounded left wing.\nThe agent of darkness\nwounds the man\nin his left thigh.\nStill the man\nhelps others to safety\nwith the strength of a horse.',
      },
      {
        lineValue: 'Line Three',
        description:
          'The wounded pheasant hesitates\noutside the grain-filled cage.\nThe man chases\nthe agent of darkness\nback into the night,\nrisking his own safety\nin the shadowy domain.',
      },
      {
        lineValue: 'Line Four',
        description:
          'The pheasant senses danger\nand flees the jaws of the trap.\nDescending\ninto the belly of the beast,\nthe man beholds\nthe true face of evil.\nIn revulsion and despair,\nhe flees what he knows\nhe can never defeat.',
      },
      {
        lineValue: 'Line Five',
        description:
          'The wounded pheasant\nis captured.\nDespite its fright,\nthis is a turn for the better.',
      },
      {
        lineValue: 'Line Six',
        description:
          'Its broken wing mended,\nthe pheasant is released\nto its fate.\nRealizing that darkness co-exists\nwith the light in his own heart,\nthe man transcends the bonds\nof good and evil,\nand freely roams\nthe heights of Heaven\nand the bowels of Hell',
      },
    ],
  },
  {
    number: 37,
    name: 'Chia Jen',
    translation: 'Family Duties',
    description:
      'Warming Air Currents\nrise and spread\nfrom the Hearthfire:\nThe Superior Person\nweighs his words carefully\nand is consistent\nin his behavior.\n\nBe as faithful\nas a good wife.',
    lines: [
      {
        lineValue: 'Line One',
        description: 'The father firmly enforces the rules\nthat protect his family.\nNo fault.',
      },
      {
        lineValue: 'Line Two',
        description:
          'The neglected wife\nresists temptation\nand returns\nto her family duties.\nFor her,\nthings will improve.',
      },
      {
        lineValue: 'Line Three',
        description:
          'Tempers are unleashed\nwithin the family.\nThe father carries\na heavy burden of guilt.\nIf his wife or children\ntaunt him,\nthis will only\nperpetuate the cycle.',
      },
      {
        lineValue: 'Line Four',
        description: "She is the jewel of the home,\nthe family's greatest blessing.",
      },
      {
        lineValue: 'Line Five',
        description:
          'A good ruler\ntempers justice with mercy.\nThis is best\nfor a household as well.',
      },
      {
        lineValue: 'Line Six',
        description: 'He sincerely wants to be fair.\nThis brings respect\nto the father',
      },
    ],
  },
  {
    number: 38,
    name: "K'uei",
    translation: 'Estrangement',
    description:
      'Fire distances itself\nfrom its nemesis,\nthe Lake:\nNo matter how large\nor diverse the group,\nthe Superior Person\nremains uniquely himself.\n\nSmall accomplishments\nare possible.',
    lines: [
      {
        lineValue: 'Line One',
        description:
          "Don't search after\nthe horses you've lost;\nThey will return in seven days.\nAcknowledge the presence\nof evil people:\nkeep a close eye on them,\nbut don't be baited\ninto dealing with them.",
      },
      {
        lineValue: 'Line Two',
        description:
          'He meets his lord\nin a narrow alleyway.\nThough he gets in the way,\nno harm is done.',
      },
      {
        lineValue: 'Line Three',
        description:
          'Bandits stop his oxen team\nand board his wagon.\nHe is scalped,\nhis face is disfigured,\nand he is left to die.\nNot only will he survive --\nhe will endure and triumph.',
      },
      {
        lineValue: 'Line Four',
        description:
          'Resolving to stand alone\nin his beliefs if he must,\nhe is immediately joined\nby a kindred spirit.',
      },
      {
        lineValue: 'Line Five',
        description:
          'A kindred spirit cuts through\nthe barriers that separate you.\nCan you cross\nthe small distance remaining?',
      },
      {
        lineValue: 'Line Six',
        description:
          'After long isolation\nand persecution,\nhe sees even\nthe one who loves him\nas a beast or demon.\nIf he will lay down his arms,\nthey can advance\ntoward good fortune together,\nthrough nothing more\nthan a gentle rain',
      },
    ],
  },
  {
    number: 39,
    name: 'Chien',
    translation: 'Obstacle',
    description:
      'Ominous roiling\nin the Crater Lake\natop the Volcano:\nWhen meeting an impasse,\nthe Superior Person\nturns his gaze within,\nand views the obstacle\nfrom a new perspective.\n\nOffer your opponent\nnothing to resist.\nLet a sage\nguide you in this.\nGood fortune\nlies along this course.',
    lines: [
      {
        lineValue: 'Line One',
        description:
          'Advance will meet\nwith opposition;\nRemaining in place\nwill meet with praise.',
      },
      {
        lineValue: 'Line Two',
        description:
          'He stoically faces\ntrial after trial,\nknowing his loyal labors\nwill benefit another.',
      },
      {
        lineValue: 'Line Three',
        description:
          'Advance will meet\nwith breathtaking obstacles.\nRemaining will meet\nwith criticism\nfrom family and friends.',
      },
      {
        lineValue: 'Line Four',
        description:
          'Advance alone\nagainst insurmountable odds,\nor remain in place,\ngathering strength and allies.',
      },
      {
        lineValue: 'Line Five',
        description: 'On the brink of crushing defeat,\nfriends come to the rescue.',
      },
      {
        lineValue: 'Line Six',
        description:
          'Advance will meet\nwith disastrous difficulties.\nWhat you seek\nis right at hand.\nAsk guidance\nfrom someone you respect',
      },
    ],
  },
  {
    number: 40,
    name: 'Hsieh',
    translation: 'Liberation',
    description:
      'A Thunderous Cloudburst\nshatters the oppressive humidity:\nThe Superior Person\nknows the release\nin forgiveness,\npardoning the faults of others\nand dealing gently with\nthose who sin against him.\n\nIt pays to accept things\nas they are for now.\nIf there is nothing else\nto be gained,\na return brings good fortune.\nIf there is something yet\nto be gained,\nact on it at once.',
    lines: [
      { lineValue: 'Line One', description: 'There has been\nno mistake.\nYou are not at fault.' },
      {
        lineValue: 'Line Two',
        description:
          'He kills three foxes\nin the hunt\nand wins the golden arrow.\nGreat fortune\nif you follow this course.',
      },
      {
        lineValue: 'Line Three',
        description:
          'The porter carries his burden\nin a gilded carriage\nwell beyond his means.\nThis attracts not only\nthe resentment of his peers,\nbut bandits as well.\nInjury and humiliation ahead.',
      },
      {
        lineValue: 'Line Four',
        description:
          'Free yourself from\nthis useless dependence.\nA new and trustworthy\ncompanion will appear.',
      },
      {
        lineValue: 'Line Five',
        description:
          'He escapes the traps\nset by inferior men,\nthen treats the conspirators\nas comrades.\nBy making them friends,\nhe rids himself of enemies.',
      },
      {
        lineValue: 'Line Six',
        description:
          'He calmly lifts his bow\nand picks off a falcon\natop a distant tower.\nSuch prowess breaks\nthe spirit of his challengers.\nNothing but good fortune\nfrom this point',
      },
    ],
  },
  {
    number: 41,
    name: 'Sun',
    translation: 'Decrease',
    description:
      'The stoic Mountain\ndrains its excess waters\nto the Lake below:\nThe Superior Person\ncurbs his anger\nand sheds his desires.\n\nTo be frugal and content\nis to possess\nimmeasurable wealth within.\nNothing of value\ncould be refused\nsuch a person.\nMake a portion of each meal\na share of your offering.',
    lines: [
      {
        lineValue: 'Line One',
        description:
          'Once your good work\nis accomplished,\nit is noble\nto move quietly on.\nBut your charges\nhave grown\nattached to you,\nand will feel\na deep loss\nif you go.',
      },
      {
        lineValue: 'Line Two',
        description:
          'You are able to provide\nwhat others need\nwithout depriving yourself.\nKeep to this humble\ncourse of aid,\nbut do not attempt\na heroic rescue,\nor unforeseen calamities\nwill fall.',
      },
      {
        lineValue: 'Line Three',
        description:
          'When three travel together,\ntwo will bond more closely,\nslighting the third.\nIf one journeys alone,\nhe will meet\na fellow seeker.',
      },
      {
        lineValue: 'Line Four',
        description:
          'Once he recognizes\nand admits his wound,\nwalls tumble down\nand others can get through\nto offer the balm\nhe needs for healing.',
      },
      {
        lineValue: 'Line Five',
        description:
          'He is showered\nwith precious gifts,\nand those giving\nwill hear no refusals.\nSupreme good fortune.',
      },
      {
        lineValue: 'Line Six',
        description:
          'He finds gain in that\nwhich others see no value.\nHis example generates\nwidespread support.\nThis course brings success',
      },
    ],
  },
  {
    number: 42,
    name: 'I',
    translation: 'Expansion',
    description:
      'Whirlwinds and Thunder:\nWhen the Superior Person\nencounters saintly behavior,\nhe adopts it;\nwhen he encounters\na fault within,\nhe transforms it.\n\nProgress in every endeavor.\nYou may cross to the far shore.',
    lines: [
      {
        lineValue: 'Line One',
        description:
          'The forces of the cosmos\nare cycling in your favor.\nThis is an ideal time for\ngreat progress and expansion\nin every endeavor.',
      },
      {
        lineValue: 'Line Two',
        description:
          'Your work is reverently\nadmired by another\nwho makes a substantial\ncontribution to your cause.\nThis patron is\ndeeply spiritual,\nand can benefit you\nin ways beyond\nthe material world.',
      },
      {
        lineValue: 'Line Three',
        description:
          "You are enriched\nby another's misfortune.\nThis is no basis\nfor guilt or shame;\nyou did nothing\nto bring on these events.",
      },
      {
        lineValue: 'Line Four',
        description:
          'Your balance and skill\nhave not gone unnoticed\nby those in power.\nThey will entrust you\nwith responsibilites that\nhave far-reaching influence.',
      },
      {
        lineValue: 'Line Five',
        description:
          'Your benevolence\nhas been recognized\nby those above you.\nYour plans will\ngreatly benefit all,\nand the favor you seek\nis as good as granted\nbefore you even ask.',
      },
      {
        lineValue: 'Line Six',
        description:
          "Your heart isn't in it,\nand others can sense this.\nEvery move you make is\nwatched with suspicion.\nSteel your resolve,\nor failure is certain",
      },
    ],
  },
  {
    number: 43,
    name: 'Kuai',
    translation: 'Breakthrough',
    description:
      'A Deluge from Heaven:\nThe Superior Person\nrains fortune upon\nthose in need,\nthen moves on\nwith no thought\nof the good he does.\n\nThe issue must be raised\nbefore an impartial authority.\nBe sincere and earnest,\ndespite the danger.\nDo not try to force the outcome,\nbut seek support where needed.\nSet a clear goal.',
    lines: [
      {
        lineValue: 'Line One',
        description:
          'Though you feel confident,\nyou are not equal to the\noverwhelming odds you face.\nOne step forward\nwill set you back a mile.',
      },
      {
        lineValue: 'Line Two',
        description:
          'An anquished cry\npierces the night.\nFully armed, sleepless\nand ever-watchful,\nbut there is no need\nfor fear.',
      },
      {
        lineValue: 'Line Three',
        description:
          'Keep a tight lock\non your mouth.\nIt takes resolve to face\nthe insults silently,\nbut they will\nprove harmless,\nand others will\ngradually warm to\nyour sense of dignity.',
      },
      {
        lineValue: 'Line Four',
        description:
          'Your legs are\ntorn and bleeding\nas you push heedlessly\nthrough the thorns\ntoward your target.\nIf you would allow yourself\nto be led down\nthe path of least resistance,\nyou would reach your goal.',
      },
      {
        lineValue: 'Line Five',
        description:
          'The wisest method for\ndealing with weeds\nis to remove them before\nthey are firmly rooted.\nIn this way,\nyour garden grows strong\nwithout violence.',
      },
      { lineValue: 'Line Six', description: 'A warning sign\ngoes unheeded.\nMisfortune ahead' },
    ],
  },
  {
    number: 44,
    name: 'Kou',
    translation: 'Compulsion',
    description:
      'A playful Zephyr dances\nand delights beneath\nindulgent Heaven:\nA Prince who shouts orders\nbut will not\nwalk among his people\nmay as well try to command\nthe four winds.\n\nA strong, addictive temptation,\nmuch more dangerous\nthan it seems.',
    lines: [
      {
        lineValue: 'Line One',
        description:
          'Get control of yourself.\nThis temptation has you\nrooting like a hog.\nOnly self-discipline\ncan steer you off this\nroad to disaster.',
      },
      {
        lineValue: 'Line Two',
        description:
          'A fish in the kitchen.\nAdequate for your\nhumble needs,\nbut not suitable for guests.\nNo mistake.',
      },
      {
        lineValue: 'Line Three',
        description:
          'They flay the skin from his thighs\nthen toss him\nin the wasteland\nto struggle home.\nHe will live to remember\nthis hideous lesson,\nand will avoid\nany more painful mistakes.',
      },
      {
        lineValue: 'Line Four',
        description: 'No fish for guests;\nnone even for yourself.\nMisfortune.',
      },
      {
        lineValue: 'Line Five',
        description: 'Keep this melon\ngrowing in the shade.\nIt is a blessing from heaven.',
      },
      {
        lineValue: 'Line Six',
        description:
          "You lower your horns\ntoward one who sincerely\nwants to become close to you.\nYour companion's\nunderstanding\nwill spare you any regret.",
      },
    ],
  },
  {
    number: 45,
    name: "Ts'ui",
    translation: 'Gathering',
    description:
      "The Lake rises\nby welcoming and receiving\nEarth's waters:\nThe King approaches his temple.\nIt is wise to seek\naudience with him there.\n\nSuccess follows this course.\nMaking an offering\nwill seal your good fortune.\nA goal will be realized now.",
    lines: [
      {
        lineValue: 'Line One',
        description:
          'You seem to blow\nboth hot and cold,\nsometimes seeking to join in,\nsometimes shrinking away.\nAdmit your fears out loud,\nand a true companion\nwill answer.\nJoy returns.',
      },
      {
        lineValue: 'Line Two',
        description:
          'It will prove good fortune\nto allow yourself\nto be drawn into this group.\nAttract an invitation\nby having something\nsmall but sincere to offer.',
      },
      {
        lineValue: 'Line Three',
        description:
          "You strive to find\ncommon ground\nthat doesn't exist.\nSighing in sadness\nand walking away\nwould be understood,\nthough you may think\nless of yourself.",
      },
      { lineValue: 'Line Four', description: 'No one will begrudge you\nthe good fortune ahead.' },
      {
        lineValue: 'Line Five',
        description:
          'You are in a position\nto bring people together\nand lead them.\nAt first there will be\ndoubters and detractors,\nbut your calm resolve\nwill win even their hearts.',
      },
      { lineValue: 'Line Six', description: 'A gathering of mourners.\nNo one is to blame' },
    ],
  },
  {
    number: 46,
    name: 'Sheng',
    translation: 'Upward Mobility',
    description:
      'Beneath the Soil,\nthe Seedling pushes upward\ntoward the light:\nTo preserve his integrity,\nthe Superior Person\ncontents himself with\nsmall gains that eventually lead\nto great accomplishment.\n\nSupreme success.\nHave no doubts.\nSeek guidance from\nsomeone you respect.\nA constant move\ntoward greater clarity\nwill bring reward.',
    lines: [
      {
        lineValue: 'Line One',
        description: 'You rise to a level\nwhere you are made welcome\nas a peer.',
      },
      {
        lineValue: 'Line Two',
        description: 'Even a small offering\nis appreciated,\nif it is sincere.',
      },
      {
        lineValue: 'Line Three',
        description: 'You have risen\nto become ruler\nof an empty city.',
      },
      {
        lineValue: 'Line Four',
        description: 'The king continues to\nfaithfully climb Mount Chi\nand make humble offering.',
      },
      { lineValue: 'Line Five', description: 'Climb these steps\nto good fortune.' },
      {
        lineValue: 'Line Six',
        description:
          'Climbing onward and upward\nthrough dark of night\nis perilous,\nbut your tenacity\nis admirable.\nGood fortune\nif you avoid\nthe slightest misstep',
      },
    ],
  },
  {
    number: 47,
    name: "K'un",
    translation: 'Exhaustion',
    description:
      'A Dead Sea,\nits Waters spent eons ago,\nmore deadly than\nthe desert surrounding it:\nThe Superior Person will stake\nhis life and fortune\non what he deeply believes.\n\nTriumph belongs\nto those who endure.\nTrial and tribulation can\nhone exceptional character\nto a razor edge\nthat slices deftly\nthrough every challenge.\nAction prevails\nwhere words will fail.',
    lines: [
      {
        lineValue: 'Line One',
        description:
          'He rests beneath a dead tree,\ntrying to make sense\nof this dark, desolate valley\nhe has strayed into.\nThese lost wanderings\nwill last three years.',
      },
      {
        lineValue: 'Line Two',
        description:
          'Chained to the banquet table,\na prisoner\nof his own rich tastes.\nHe offers prayer and sacrifice\nfor delivery from desire.\nWhen even the desire\nto be delivered\nhas been cleansed,\nhis prayers\nwill have been answered.',
      },
      {
        lineValue: 'Line Three',
        description:
          'Hemmed in by stone,\nwith nothing to climb\nbut thorns:\na trap of his own making.\nStruggling home,\nhe cannot find his wife.\nMisfortune.',
      },
      {
        lineValue: 'Line Four',
        description:
          'Captive and on display\nin a golden carriage,\nhe is ashamed\nof the spectacle\nhe has become.\nSuch regrets\nwill lead to\ngood fortune.',
      },
      {
        lineValue: 'Line Five',
        description:
          'Though his nose and feet\nwill surely be cut off,\nstill he must\nconfront the warlord.\nHe calmly accepts his fate,\nand offers prayer and sacrifice.',
      },
      {
        lineValue: 'Line Six',
        description:
          'He feels tightly bound\nby no more than\na few vines of ivy.\nIf he firmly resolves\nto break free,\nhe will find\nhe was held back\nby only his own\nguilt and fear',
      },
    ],
  },
  {
    number: 48,
    name: 'Ching',
    translation: 'The Well',
    description:
      'Deep Waters Penetrated\nand drawn to the surface:\nThe Superior Person\nrefreshes the people\nwith constant encouragement\nto help one another.\n\nEncampments, settlements,\nwalled cities, whole empires\nmay rise and fall,\nyet the Well at the center endures,\nnever drying to dust,\nnever overflowing.\nIt served those before\nand will serve those after.\nAgain and again\nyou may draw from the Well,\nbut if the bucket breaks\nor the rope is too short\nthere will be misfortune.',
    lines: [
      {
        lineValue: 'Line One',
        description:
          'The water in this old well\nhas seeped into the mud.\nNot even the animals\ncome to drink from it.',
      },
      {
        lineValue: 'Line Two',
        description:
          'Shooting at fish in the well\nputs holes in the bucket.\nNo one can draw\nfrom this well.',
      },
      {
        lineValue: 'Line Three',
        description:
          'This well has been cleansed,\nbut no one will drink from it.\nThis is a tragic mistake,\nfor it has much to offer\nprince and pauper alike.',
      },
      {
        lineValue: 'Line Four',
        description: 'The well is carefully retiled,\nand in time\nmade pure again.',
      },
      {
        lineValue: 'Line Five',
        description: 'The water in this well\ncomes from a cool, deep,\ninexhaustible spring.',
      },
      {
        lineValue: 'Line Six',
        description: 'This well is dependable\nand available to all.\nSupreme good fortune',
      },
    ],
  },
];

export const hexagrams_49_64: IChingHexagram[] = [
  {
    number: 49,
    name: 'Ko',
    translation: 'Revolution',
    description:
      'Fire ignites within the Lake,\ndefying conditions that would\ndeny it birth or survival:\nThe Superior Person reads\nthe Signs of the Times\nand makes the Season\napparent to all.\n\nThe support you need\nwill come only after\nthe deed is done.\nRenewed forces, however,\nwill provide fresh energy\nfor exceptional progress.\nPersevere.\nAll differences vanish.',
    lines: [
      { lineValue: 'Line One', description: 'Bound with bands\nof yellow oxhide.' },
      {
        lineValue: 'Line Two',
        description:
          'When the time is ripe,\nyou will be\nthe instrument of change.\nPlant the seeds\nof revolution now,\nand success is assured.',
      },
      {
        lineValue: 'Line Three',
        description:
          'Premature action\nwould prove disastrous.\nLet the talk of revolution\nferment among the people.\nWhen the rumors have\nreached your ear three times,\nthat is your signal to strike.',
      },
      {
        lineValue: 'Line Four',
        description:
          'Your honor is redeemed.\nAll impediments fall away\nand the path ahead is clear.',
      },
      {
        lineValue: 'Line Five',
        description:
          'You transform into a tiger\nbefore their eyes.\nYour very being\ncommands an awe\nthat makes consulting\nthe oracle unnecessary.',
      },
      {
        lineValue: 'Line Six',
        description:
          "You dodge the snares\nand snatch victory\nwith the lightning speed\nand agility of a panther.\nThe jackals lose their nerve\nand swear allegiance to you.\nYou have won your revolt.\nDon't seek to climb higher.\nInstead stabilize the new order\nfor the good of all",
      },
    ],
  },
  {
    number: 50,
    name: 'Ting',
    translation: 'The Caldron',
    description:
      'Fire rises hot and bright\nfrom the Wood beneath\nthe sacrificial caldron:\nThe Superior Person\npositions himself correctly\nwithin the flow of Cosmic forces.\n\nSupreme accomplishment.',
    lines: [
      {
        lineValue: 'Line One',
        description:
          'Tip over the caldron\nand get rid of\nits stagnant contents\nonce and for all.\nHe marries a woman\nto give her children\na home.\nBlameless.',
      },
      {
        lineValue: 'Line Two',
        description:
          "Your caldron contains\na hearty meal\nwith plenty to go around.\nYour rivals are jealous\nof your ability to provide,\nbut they can't harm you.\nGood fortune.",
      },
      {
        lineValue: 'Line Three',
        description:
          "You cooked a perfect meal\nin a caldron\nyou can't lift from the fire.\nThe feast is wasted.\nOnce the storm of resentment\nhas washed over you,\ngood fortune will come again.",
      },
      {
        lineValue: 'Line Four',
        description:
          'A leg of the caldron buckles,\nspilling the hot meal\non the very person\nyou wish to serve.\nTrust evaporates,\nand the void is filled\nwith shame and scorn.',
      },
      {
        lineValue: 'Line Five',
        description:
          'The caldron you cook in\nhas yellow handles\nand golden carrying rings.\nGood fortune\nif you keep to this course.',
      },
      {
        lineValue: 'Line Six',
        description:
          'Your caldron is fitted\nwith jade handles.\nGreat success\nin whatever you do.',
      },
    ],
  },
  {
    number: 51,
    name: 'Chen',
    translation: 'Thunder',
    description:
      "Thunder echoes upon Thunder,\ncommanding reverence\nfor its father Heaven:\nIn awe of\nHeaven's majestic power,\nthe Superior Person looks within\nand sets his life in order.\n\nThunder mingles with\nstartled screams of terror\nfor a hundred miles around.\nAs the people nervously laugh\nat their own fright,\nthe devout presents\nthe sacrificial chalice\nwith nary a drop of wine spilt.\nDeliverance.",
    lines: [
      {
        lineValue: 'Line One',
        description:
          'The thunderclap\nrips screams of terror\nfrom the hearts of all below.\nAfter its last echo,\nonly nervous laughter\ncan be heard.\nAll is well.',
      },
      {
        lineValue: 'Line Two',
        description:
          "This thunder erupts\nfrom the ground\nbeneath your feet,\ndelivering real danger.\nAbandon your belongings\nand climb to higher ground.\nDon't grieve over\ntreasures left behind.\nThey will return to you\nin seven days.",
      },
      {
        lineValue: 'Line Three',
        description:
          'These deafening thunderclaps\nwill roll on eastward.\nIf they shock you\ninto action, though,\ntheir passing will have left\na permanent change\nfor the good.',
      },
      {
        lineValue: 'Line Four',
        description:
          'If you run in blind terror\ntfrom this thunder,\nyou will end up\nhopelessly mired in the mud.',
      },
      {
        lineValue: 'Line Five',
        description:
          'Others run in\nconfusion and terror\ntfrom the violent thunderstorm.\nFully aware of the danger,\nyou keep to the task\nthat must be done.',
      },
      {
        lineValue: 'Line Six',
        description:
          "The lightning teeth\nof the thunder above\nand the yawning jaws\nof the earthquake below\nwreak havoc and ruin\non neighbors around you,\nwhile you remain\nmiraculously untouched.\nThere will be\nrumors and accusations.\nDon't react,\nor their fate will become yours",
      },
    ],
  },
  {
    number: 52,
    name: 'Ken',
    translation: 'The Mountain',
    description:
      "Above this Mountain's summit\nanother more majestic rises:\nThe Superior Person\nis mindful to keep his thoughts\nin the here and now.\n\nStilling the sensations\nof the Ego,\nhe roams his courtyard\nwithout moving a muscle,\nunencumbered by the fears\nand desires of his fellows.\nThis is no mistake.",
    lines: [
      {
        lineValue: 'Line One',
        description: 'Not even moving a toe.\nNo mistakes.\nHold to this course.',
      },
      {
        lineValue: 'Line Two',
        description:
          'Relaxing his legs.\nHe sees he cannot rescue\nthe one he follows.\nHe resigns himself to sorrow.',
      },
      {
        lineValue: 'Line Three',
        description:
          'He seeks stillness\nthrough rigidity\ninstead of relaxation.\nHe will paralyze\nhis legs\nand overtax his heart.',
      },
      {
        lineValue: 'Line Four',
        description: 'He keeps his trunk still\nthrough flexibility.\nFaultless.',
      },
      {
        lineValue: 'Line Five',
        description:
          'Keeping his jaw relaxed,\nwhat words he speaks\ncarry order and deliberation.\nConflict dissolves.',
      },
      {
        lineValue: 'Line Six',
        description: 'His constant goal\nis an end to striving.\nGood fortune',
      },
    ],
  },
  {
    number: 53,
    name: 'Chien',
    translation: 'Gradual Progress',
    description:
      'The gnarled Pine grows tenaciously off the Cliff face:\nThe Superior Person\nclings faithfully\nto dignity and integrity,\nthus elevating\nthe Collective Spirit of Man\nin his own small way.\n\nDevelopment.\nThe maiden is given\nin marriage.\nGood fortune\nif you stay on course.',
    lines: [
      {
        lineValue: 'Line One',
        description:
          'The wild geese\ndraw near shore.\nThe inexperience\nand brashness of youth\nmay lead to danger,\nbut a sharp warning\nwill set things right.',
      },
      {
        lineValue: 'Line Two',
        description:
          'The geese\ndraw near the cliff.\nThere will be feasting,\npeace, rest and joy.',
      },
      {
        lineValue: 'Line Three',
        description:
          'The wild geese nest\nin the open prairie.\nThe male leaves to forage;\nhe will not return.\nThe brooding female\nwill not hatch her young.\nPredators close in.',
      },
      {
        lineValue: 'Line Four',
        description:
          'The wild geese\nmust find shelter\nin the trees.\nOnly the broadest,\nflattest branches\nwill harbor them.\nNo mishaps.',
      },
      {
        lineValue: 'Line Five',
        description:
          'The wild geese\ndraw near the summit.\nFor three years\nthe female\nhas borne no young;\nnow nothing\nwill stop her.\nDeliverance.',
      },
      {
        lineValue: 'Line Six',
        description:
          'The wild geese\nfly to a home\nabove the clouds.\nThey no longer\nneed their feathers,\nand leave them behind\nfor the sacred dance.\nPeace everlasting',
      },
    ],
  },
  {
    number: 54,
    name: 'Kuei Mei',
    translation: 'A Loveless Marriage',
    description:
      'The Thunderstorm\ninseminates the swelling Lake,\nthen moves on\nwhere the Lake cannot follow:\nThe Superior Person\nviews passing trials\nin the light of Eternal Truths.\n\nAny action\nwill prove unfortunate.\nNothing furthers.',
    lines: [
      {
        lineValue: 'Line One',
        description:
          "Even becoming a concubine\nwould be an advance\nin this woman's life.\nFor the lame,\nany step forward\nis a good step.",
      },
      {
        lineValue: 'Line Two',
        description:
          "Left alone in her marriage,\nshe remains content\nin her illusions.\nSometimes a one-eyed man\nis blessed for\nwhat he can't see.",
      },
      {
        lineValue: 'Line Three',
        description:
          'Not fulfilled by her marriage,\nthe young woman returns home\nto her former life.',
      },
      {
        lineValue: 'Line Four',
        description:
          'The maiden waits\nfar longer than seems wise,\nto make sure\nher marriage is right.',
      },
      {
        lineValue: 'Line Five',
        description:
          'The princess bride\ndresses humbly,\nout of respect\nfor her commoner groom.\nHer bridesmaids\noutshine her by far.\nShe is a treasure.',
      },
      {
        lineValue: 'Line Six',
        description:
          "The groom draws no blood\nfrom the sacrifice.\nThe bride's basket\nremains empty.\nA barren marriage",
      },
    ],
  },
  {
    number: 55,
    name: 'Feng',
    translation: 'Abundance',
    description:
      "Thunder and Lightning\nfrom the dark heart of the storm:\nThe Superior Person\njudges fairly,\nso that consequences are just.\n\nThe leader reaches his peak\nand doesn't lament\nthe descent before him.\nBe like the noonday sun\nat its zenith.\nThis is success.",
    lines: [
      {
        lineValue: 'Line One',
        description:
          'He meets his soulmate,\nand they couple ceaselessly\nfor ten days.\nNo mistake.\nThis union will change worlds.',
      },
      {
        lineValue: 'Line Two',
        description:
          'The veil before his eyes\ncasts so dark a shade,\nhe sees the Big Dipper\nat noontime.\nAuthorities distrust\none with such vision.\nIt is best to emphasize\nwhy seeing the truth\nis the safest route\nto preserving power.',
      },
      {
        lineValue: 'Line Three',
        description:
          'The veil before his eyes\ncasts so dark a shade,\nhe can see the smallest stars\nat noontime.\nFor such vision,\nhe loses the use\nof his right arm.\nNo mistake.',
      },
      {
        lineValue: 'Line Four',
        description:
          'The veil before his eyes\ncasts so dark a shade,\nhe can see the polestar\nat noontime.\nIt leads him\nto his soulmate.\nNo mistake.',
      },
      {
        lineValue: 'Line Five',
        description: 'He attracts\nthe brilliant and able\nto his quest.\nGood fortune.',
      },
      {
        lineValue: 'Line Six',
        description:
          'In his large and splendid house,\nno friends or family dwell.\nHe sees no one\npass through his gate\nfor three years.\nMisfortune',
      },
    ],
  },
  {
    number: 56,
    name: 'Lu',
    translation: 'The Wanderer',
    description:
      'Fire on the Mountain,\ncatastrophic to man,\na passing annoyance\nto the Mountain:\nThe Superior Person\nwaits for wisdom and clarity\nbefore exacting Justice,\nthen lets no protest sway him.\n\nFind satisfaction in small gains.\nTo move constantly forward\nis good fortune to a Wanderer.',
    lines: [
      {
        lineValue: 'Line One',
        description:
          'A traveler with petty complaints\nand too many demands\nsoon wears out his welcome.',
      },
      {
        lineValue: 'Line Two',
        description:
          'The traveler lodges at an inn\nand keeps his belongings\nwith him at all times.\nHe gains a loyal servant.',
      },
      {
        lineValue: 'Line Three',
        description:
          'The traveler causes a fire\nthat burns down the inn.\nHe loses the trust\nof his servant\nand traveling companions.\nDanger.',
      },
      {
        lineValue: 'Line Four',
        description:
          'Taking shelter\nin an abandoned cabin,\nthe traveler finds\nhis stolen belongings\nbeside a razor-sharp axe.\nWhat should be delight\nfreezes to dread.',
      },
      {
        lineValue: 'Line Five',
        description:
          'The traveler\nkills a pheasant\nwith his first shot.\nFor the price of one arrow,\nhe has bought himself\npraise and high office.',
      },
      {
        lineValue: 'Line Six',
        description:
          "The traveler\nuses a bird's nest\nas kindling.\nHe chuckles at his cleverness,\nbut soon weeps\nwhen he loses his ox.\nMisfortune",
      },
    ],
  },
  {
    number: 57,
    name: 'Sun',
    translation: 'The Penetrating Wind',
    description:
      'Wind follows upon wind,\nwandering the earth,\npenetrating gently\nbut persistently:\nThe Superior Person\nexpands his influence\nby reaffirming his decisions\nand carrying out his promises.\n\nSmall, persistent, focused\neffort brings success.\nSeek advice\nfrom someone you respect.',
    lines: [
      {
        lineValue: 'Line One',
        description: 'Advance or retreat:\nthe determined warrior\nwill use either to advantage.',
      },
      {
        lineValue: 'Line Two',
        description:
          'A whirlwind beneath the bed.\nFortunetellers and magicians\nare summoned,\nbut none can interpret\nthis omen.\nAll will go well.',
      },
      {
        lineValue: 'Line Three',
        description: 'Half-hearted attempts\nto penetrate,\nover and over again.\nHumiliation.',
      },
      {
        lineValue: 'Line Four',
        description:
          'Self-doubt vanishes\nand determination grows.\nThree forms of game\nwill be taken in this hunt.',
      },
      {
        lineValue: 'Line Five',
        description:
          "Determination has settled\ninto a steady course\ntoward good fortune.\nThat was no way to start,\nbut it will lead to\na glorious ending.\nConsider any crossroad\nthree days before pressing on.\nCheck your bearings\nfor three days following,\nto ensure you haven't strayed\nfrom your course.",
      },
      {
        lineValue: 'Line Six',
        description:
          'The wind dies\nbeneath the bed.\nAll courage to persevere\nis gone.\nResources are depleted,\ndefenses are down.\nTo move ahead\nwith this course\nwould prove disastrous',
      },
    ],
  },
  {
    number: 58,
    name: 'Tui',
    translation: 'Empowering',
    description:
      'The joyous Lake spans\non and on to the horizon:\nThe Superior Person\nrenews and expands his Spirit\nthrough heart-to-heart exchanges with others.\n\nSuccess\nif you stay on course.',
    lines: [
      {
        lineValue: 'Line One',
        description: 'Harmony and quiet words.\nJoyous contentment.\nGood fortune.',
      },
      {
        lineValue: 'Line Two',
        description:
          "Rejoice in his sincerity.\nThis good fortune\nwill last into the future,\nif you don't let\nthe past resurface.",
      },
      {
        lineValue: 'Line Three',
        description: 'Arguing and negotiating\nto win love and joy.\nSelf-defeat.\nMisfortune.',
      },
      {
        lineValue: 'Line Four',
        description:
          'This experimentation\nwith diverse pleasures,\nthis fruitless chase after\nthe ultimate thrill,\nwill damage you.\nJoy is tranquil,\nnot mad rushing,\nand will arise from peace.',
      },
      { lineValue: 'Line Five', description: 'You place your trust\nin an unworthy ally.' },
      {
        lineValue: 'Line Six',
        description: "Don't let thrill-seeking comrades\ndivert you from true joy",
      },
    ],
  },
  {
    number: 59,
    name: 'Huan',
    translation: 'Dissolution',
    description:
      'Wind carries the Mists aloft:\nSage rulers dedicated their lives\nto serving a Higher Power\nand built temples\nthat still endure.\n\nThe King approaches his temple.\nSuccess if you stay on course.\nYou may cross to the far shore.',
    lines: [
      {
        lineValue: 'Line One',
        description: 'He gives aid\nwith the strength\nand stamina of a horse.\nGood fortune.',
      },
      {
        lineValue: 'Line Two',
        description:
          'When his dreams evaporate\nto mist on the breeze,\nhe returns to\nhis well of strength.\nRegret is washed away.',
      },
      {
        lineValue: 'Line Three',
        description:
          'His ego dissolves\nand the void is filled\nwith his Self.\nNo more\nfear and frustration.',
      },
      {
        lineValue: 'Line Four',
        description:
          'He scatters his group\nfar and wide.\nThose who return\nwill be of firmer resolve\nand leaner, stronger fibre.\nAn ingenious move.',
      },
      {
        lineValue: 'Line Five',
        description:
          'He cries in pain\nas he sweats out this fever.\nThe king opens\nthe royal stockpile\nto his subjects.\nNo mistake.',
      },
      { lineValue: 'Line Six', description: 'He follows the trail\nof his own blood\nto safety' },
    ],
  },
  {
    number: 60,
    name: 'Chieh',
    translation: 'Limitations',
    description:
      "Waters difficult to keep\nwithin the Lake's banks:\nThe Superior Person\nexamines the nature of virtue\nand makes himself a standard\nthat can be followed.\n\nSelf-discipline brings success;\nbut restraints too binding\nbring self-defeat.",
    lines: [
      {
        lineValue: 'Line One',
        description:
          'Roaming his own garden\nand courtyard,\nhe never strays out the gate.\nNo mistake.',
      },
      {
        lineValue: 'Line Two',
        description:
          'Pacing his own garden\nand courtyard,\nhe refuses to pass out the gate.\nMisfortune.',
      },
      {
        lineValue: 'Line Three',
        description:
          'He without self-restraint today\nforges the shackles\nthat hobble him tomorrow.',
      },
      {
        lineValue: 'Line Four',
        description: 'He is most content\nin frugality and simplicity:\nthe highest success.',
      },
      {
        lineValue: 'Line Five',
        description: 'He travels easily\nwith economy and simplicity.\nThis brings merit.',
      },
      {
        lineValue: 'Line Six',
        description:
          'Self-discipline\nteetering toward\nself-destruction.\nAn empty martyrdom.\nTurn back',
      },
    ],
  },
  {
    number: 61,
    name: 'Chung Fu',
    translation: 'Inner Truth',
    description:
      "The gentle Wind ripples\nthe Lake's surface:\nThe Superior Person\nfinds common ground\nbetween points of contention,\nwearing away rigid perspectives\nthat would lead to fatal error.\n\nPigs and fishes.\nYou may cross to the far shore.\nGreat fortune\nif you stay on course.",
    lines: [
      {
        lineValue: 'Line One',
        description:
          'The wading heron\nreleases all desire,\nso that a passing fish\nwill reward him with lunch.',
      },
      {
        lineValue: 'Line Two',
        description:
          'A crane calls from the shade\nand her young\nanswer with love.\nMy cup of life\nis filled to the brim.\nCome share it with me.',
      },
      {
        lineValue: 'Line Three',
        description:
          'True companions\nshare their fate.\nOne beats the drum,\none grows silent.\nOne weeps,\none sings.',
      },
      {
        lineValue: 'Line Four',
        description:
          'Just before the moon\nwaxes full,\nOne horse\nbreaks from the harness,\nand its mate remains.\nIt is as it should be.',
      },
      {
        lineValue: 'Line Five',
        description:
          'Finding himself,\nhis serene inner flame\nradiates warmth\nthat draws others near.\nHe does not Do;\nhe just Is.',
      },
      {
        lineValue: 'Line Six',
        description: "This cock's crow\npierces to Heaven.\nA warning best heeded.",
      },
    ],
  },
  {
    number: 62,
    name: 'Hsiao Kuo',
    translation: 'Lying Low',
    description:
      'Thunder high on the Mountain,\nactive passivity:\nThe Superior Person\nis unsurpassed in his ability\nto remain small.\nIn a time for humility,\nhe is supremely modest.\nIn a time of mourning,\nhe uplifts with somber reverence.\nIn a time of want,\nhe is resourcefully frugal.\n\nWhen a bird flies too high,\nits song is lost.\nRather than push upward now,\nit is best to remain below.\nThis will bring\nsurprising good fortune,\nif you keep to your course.',
    lines: [
      {
        lineValue: 'Line One',
        description: 'It is perilous\nfor so small a bird\nto fly so high.',
      },
      {
        lineValue: 'Line Two',
        description:
          'She invokes the spirit\nof her ancestor,\nbut is visited\nby her ancestress.\nHe heads\nstraight for the Prince\nbut is intercepted\nby the Minister.\nIt is best.',
      },
      {
        lineValue: 'Line Three',
        description:
          'Focusing so intensely\non your target\nhas given you tunnel vision.\nAn ambush could reach you\nfrom three sides.\nHeed this warning.',
      },
      {
        lineValue: 'Line Four',
        description:
          'This prize\nyou have strived for\ncould be the end of you.\nWake up to its danger\nand you will prevail.',
      },
      {
        lineValue: 'Line Five',
        description:
          "Don't take shelter\nfrom storms\nthat have not yet blown in.\nIt is too easy to shoot\na bird in a cave.",
      },
      {
        lineValue: 'Line Six',
        description:
          'He flies too high,\nbeyond his limit.\nThe plummet to earth\nis spent lamenting',
      },
    ],
  },
  {
    number: 63,
    name: 'Chi Chi',
    translation: 'Aftermath',
    description:
      'Boiling Water\nover open Flame,\none might extinguish\nthe other:\nThe Superior Person\ntakes a 360 degree view\nof the situation and prepares\nfor any contingency.\n\nSuccess in small matters\nif you stay on course.\nEarly good fortune\ncan end in disorder.',
    lines: [
      {
        lineValue: 'Line One',
        description:
          'The man brakes his wheels,\nbut the fox leaps the stream,\nwetting his tail\njust short of safety.\nNo harm.',
      },
      {
        lineValue: 'Line Two',
        description:
          'The woman has lost her screen.\nShe will remain exposed\nseven days\nbefore it is returned.',
      },
      {
        lineValue: 'Line Three',
        description:
          "He marches into\nthe Devil's Domain,\nand conquers it\nafter three grueling years.\nLesser men\ncould not do this.",
      },
      {
        lineValue: 'Line Four',
        description:
          'The finest clothes\ncan be shredded to rags.\nKeep a sharp eye\non the discontent.',
      },
      {
        lineValue: 'Line Five',
        description:
          "The sacrificial festival\nlaunched by\nhis eastern neighbor\ncannot overshadow\nthe western man's\nsimple, sincere offering.",
      },
      { lineValue: 'Line Six', description: 'His head disappears\nbeneath the waves.\nDanger' },
    ],
  },
  {
    number: 64,
    name: 'Wei Chi',
    translation: 'The End In Sight',
    description:
      'Fire ascends\nabove the Water:\nThe Superior Person\nexamines the nature of things\nand keeps each\nin its proper place.\n\nToo anxious\nthe young fox\ngets his tail wet,\njust as he completes\nhis crossing.\nTo attain success,\nbe like the man\nand not like the fox.',
    lines: [
      {
        lineValue: 'Line One',
        description: 'Careless so near to shore,\nthe fox gets his tail wet.\nHumiliation.',
      },
      {
        lineValue: 'Line Two',
        description: 'He brakes his wheels,\nbut remains on the path.\nGood fortune.',
      },
      {
        lineValue: 'Line Three',
        description:
          'Though the far shore is in sight,\neagerness invites carelessness.\nCross the river before\nstepping out of the boat.',
      },
      {
        lineValue: 'Line Four',
        description:
          "Deep in the Devil's Domain,\nthere is no room for despair.\nPersevere for three years,\nand victory will be yours.",
      },
      {
        lineValue: 'Line Five',
        description:
          'True to himself to the end,\ninner light radiates from him\nand warms others in the glow.\nGood fortune.',
      },
      {
        lineValue: 'Line Six',
        description:
          'Too much wine\nat the victory feast\ncan remove\nall cause for celebration.\nBe a good winner.',
      },
    ],
  },
];

export const HEXAGRAMS: IChingHexagram[] = [
  ...hexagrams_1_16,
  ...hexagrams_17_32,
  ...hexagrams_33_48,
  ...hexagrams_49_64,
];

export function getRandomHexagram(): IChingHexagram {
  const randomIndex = Math.floor(Math.random() * HEXAGRAMS.length);
  return HEXAGRAMS[randomIndex] as IChingHexagram;
}
