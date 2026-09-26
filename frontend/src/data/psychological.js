export const meditationAudios = [
  {
    id: 1,
    title: '深呼吸放松',
    duration: '5分钟',
    description: '通过深呼吸训练，帮助身体放松，缓解紧张情绪',
    icon: '🌬️',
    steps: [
      '找一个安静舒适的地方坐下或躺下',
      '闭上眼睛，将注意力集中在呼吸上',
      '慢慢吸气4秒，感受腹部隆起',
      '屏住呼吸2秒',
      '慢慢呼气6秒，感受腹部收缩',
      '重复这个过程，让身心逐渐放松'
    ]
  },
  {
    id: 2,
    title: '身体扫描冥想',
    duration: '10分钟',
    description: '从头到脚逐一感受身体各部位，释放紧张和压力',
    icon: '🧘',
    steps: [
      '舒适地躺下，闭上眼睛',
      '将注意力带到头顶，感受头皮的感觉',
      '慢慢向下移动，注意额头、眼睛、脸颊、嘴巴',
      '继续向下，颈部、肩膀、手臂、胸部、腹部',
      '再到背部、臀部、大腿、小腿、双脚',
      '如果发现紧张的部位，尝试深呼吸放松它'
    ]
  },
  {
    id: 3,
    title: '慈心冥想',
    duration: '8分钟',
    description: '培养对自己和他人的慈悲心，获得内心的平静',
    icon: '💖',
    steps: [
      '舒适地坐好，闭上眼睛',
      '先将慈悲心导向自己："愿我平安，愿我健康，愿我快乐"',
      '然后想到一位你深爱的人："愿你平安，愿你健康，愿你快乐"',
      '再想到一位普通朋友，送出同样的祝福',
      '最后将慈悲心扩展到所有生命',
      '感受这份爱和温暖在心中流动'
    ]
  },
  {
    id: 4,
    title: '正念观呼吸',
    duration: '15分钟',
    description: '专注于当下的呼吸，培养正念觉知',
    icon: '🌸',
    steps: [
      '找一个安静的地方，舒适地坐下',
      '挺直脊背但不要僵硬',
      '将注意力放在呼吸上，感受空气进出身体',
      '当思绪飘走时，温柔地将注意力带回呼吸',
      '不要评判自己，只是觉察',
      '让自己安住在当下的每一刻'
    ]
  }
];

export const selfAssessmentQuestions = [
  {
    id: 1,
    question: '最近一周，您是否经常感到紧张或焦虑？',
    options: [
      { value: 0, label: '很少或没有' },
      { value: 1, label: '偶尔' },
      { value: 2, label: '经常' },
      { value: 3, label: '几乎每天' }
    ]
  },
  {
    id: 2,
    question: '您是否能够控制自己的担忧？',
    options: [
      { value: 3, label: '很少或没有' },
      { value: 2, label: '偶尔' },
      { value: 1, label: '经常' },
      { value: 0, label: '几乎每天' }
    ]
  },
  {
    id: 3,
    question: '您是否容易感到烦躁或易怒？',
    options: [
      { value: 0, label: '很少或没有' },
      { value: 1, label: '偶尔' },
      { value: 2, label: '经常' },
      { value: 3, label: '几乎每天' }
    ]
  },
  {
    id: 4,
    question: '您是否感到疲劳或精力不足？',
    options: [
      { value: 0, label: '很少或没有' },
      { value: 1, label: '偶尔' },
      { value: 2, label: '经常' },
      { value: 3, label: '几乎每天' }
    ]
  },
  {
    id: 5,
    question: '您是否有睡眠困扰（入睡困难、易醒或早醒）？',
    options: [
      { value: 0, label: '很少或没有' },
      { value: 1, label: '偶尔' },
      { value: 2, label: '经常' },
      { value: 3, label: '几乎每天' }
    ]
  },
  {
    id: 6,
    question: '您是否感到对事物失去兴趣或愉悦感？',
    options: [
      { value: 0, label: '很少或没有' },
      { value: 1, label: '偶尔' },
      { value: 2, label: '经常' },
      { value: 3, label: '几乎每天' }
    ]
  },
  {
    id: 7,
    question: '您是否感到孤独或与他人隔绝？',
    options: [
      { value: 0, label: '很少或没有' },
      { value: 1, label: '偶尔' },
      { value: 2, label: '经常' },
      { value: 3, label: '几乎每天' }
    ]
  },
  {
    id: 8,
    question: '您是否能够获得足够的情感支持？',
    options: [
      { value: 3, label: '总是可以' },
      { value: 2, label: '大部分时间可以' },
      { value: 1, label: '偶尔可以' },
      { value: 0, label: '很少或没有' }
    ]
  }
];

export const getResultInterpretation = (score) => {
  if (score <= 6) {
    return {
      level: '心理状态良好',
      color: 'green',
      description: '您目前的心理状态比较稳定。继续保持良好的生活习惯，定期与家人朋友交流，适度进行放松活动。',
      suggestions: [
        '继续保持规律的作息和适度运动',
        '花时间做自己喜欢的事情',
        '与家人朋友保持良好的沟通',
        '可以尝试每天进行几分钟的冥想练习'
      ]
    };
  } else if (score <= 12) {
    return {
      level: '轻度压力',
      color: 'yellow',
      description: '您可能正在经历一些压力，这是正常的反应。建议您关注自己的情绪变化，采取适当的方式缓解压力。',
      suggestions: [
        '每天安排一些放松时间',
        '尝试深呼吸或冥想练习',
        '与信任的人分享自己的感受',
        '保持规律的饮食和睡眠',
        '适度进行户外活动'
      ]
    };
  } else if (score <= 18) {
    return {
      level: '中度压力',
      color: 'orange',
      description: '您的压力水平较高，建议您认真对待自己的心理健康。可以尝试多种放松方法，必要时寻求专业帮助。',
      suggestions: [
        '每天进行10-15分钟的放松练习',
        '考虑寻求心理咨询师的帮助',
        '与医生讨论您的情绪状态',
        '减少不必要的压力源',
        '增加社会支持，多与亲友相处'
      ]
    };
  } else {
    return {
      level: '较重心理负担',
      color: 'red',
      description: '您目前的心理负担较重，强烈建议您寻求专业心理支持。您不需要独自面对这些困难。',
      suggestions: [
        '请尽快联系专业心理咨询师或医生',
        '告诉家人您的感受，寻求他们的支持',
        '考虑加入支持小组，与有类似经历的人交流',
        '不要自责，寻求帮助是勇敢的表现',
        '可以拨打心理援助热线获得即时支持'
      ]
    };
  }
};

export const hotlines = [
  {
    name: '全国心理援助热线',
    number: '400-161-9995',
    service: '24小时服务'
  },
  {
    name: '北京心理危机研究与干预中心',
    number: '010-82951332',
    service: '24小时服务'
  },
  {
    name: '上海市心理援助热线',
    number: '021-12320-5',
    service: '24小时服务'
  },
  {
    name: '广东省心理援助热线',
    number: '020-12320-5',
    service: '24小时服务'
  }
];
