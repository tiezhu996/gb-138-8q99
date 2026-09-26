export const regions = [
  { id: 'all', name: '全部地区' },
  { id: 'beijing', name: '北京' },
  { id: 'shanghai', name: '上海' },
  { id: 'guangdong', name: '广东' },
  { id: 'jiangsu', name: '江苏' },
  { id: 'zhejiang', name: '浙江' },
  { id: 'sichuan', name: '四川' },
  { id: 'hubei', name: '湖北' },
  { id: 'hunan', name: '湖南' },
  { id: 'shandong', name: '山东' },
  { id: 'henan', name: '河南' },
  { id: 'hebei', name: '河北' },
  { id: 'liaoning', name: '辽宁' },
  { id: 'shaanxi', name: '陕西' },
  { id: 'chongqing', name: '重庆' },
  { id: 'tianjin', name: '天津' }
];

export const institutions = [
  {
    id: 1,
    name: '北京协和医院安宁疗护中心',
    region: 'beijing',
    type: '公立医院',
    address: '北京市东城区帅府园1号',
    phone: '010-69156114',
    services: ['疼痛管理', '症状控制', '心理支持', '家属辅导'],
    description: '国内领先的安宁疗护中心，拥有专业的多学科团队，为晚期患者提供全面的照护服务。'
  },
  {
    id: 2,
    name: '中国医学科学院肿瘤医院宁养院',
    region: 'beijing',
    type: '公立医院',
    address: '北京市朝阳区潘家园南里17号',
    phone: '010-87788899',
    services: ['居家宁养', '疼痛控制', '心理疏导', '社会支持'],
    description: '专注于晚期肿瘤患者的安宁疗护服务，提供居家照护和门诊咨询。'
  },
  {
    id: 3,
    name: '北京老年医院关怀科',
    region: 'beijing',
    type: '公立医院',
    address: '北京市海淀区温泉路118号',
    phone: '010-62402950',
    services: ['临终关怀', '老年护理', '康复护理', '家属支持'],
    description: '针对老年患者的特点提供专业的安宁疗护服务，注重生活质量提升。'
  },
  {
    id: 4,
    name: '上海复旦大学附属肿瘤医院姑息治疗科',
    region: 'shanghai',
    type: '公立医院',
    address: '上海市徐汇区东安路270号',
    phone: '021-64175590',
    services: ['姑息治疗', '疼痛管理', '营养支持', '心理干预'],
    description: '国内最早开展姑息治疗的医疗机构之一，服务规范专业。'
  },
  {
    id: 5,
    name: '上海新华医院宁养院',
    region: 'shanghai',
    type: '公立医院',
    address: '上海市杨浦区控江路1665号',
    phone: '021-25078999',
    services: ['居家照护', '门诊服务', '疼痛治疗', '社工服务'],
    description: '提供居家宁养服务，让患者在熟悉的环境中获得专业照护。'
  },
  {
    id: 6,
    name: '上海市静安区临汾路街道社区卫生服务中心',
    region: 'shanghai',
    type: '社区卫生',
    address: '上海市静安区临汾路385号',
    phone: '021-56887979',
    services: ['社区安宁疗护', '居家护理', '家庭病床', '家属指导'],
    description: '全国社区安宁疗护试点单位，提供便捷的社区照护服务。'
  },
  {
    id: 7,
    name: '广东省人民医院宁养院',
    region: 'guangdong',
    type: '公立医院',
    address: '广州市越秀区中山二路106号',
    phone: '020-83827812',
    services: ['宁养服务', '疼痛控制', '心理辅导', '社会支持'],
    description: '广东省安宁疗护示范单位，服务质量得到广泛认可。'
  },
  {
    id: 8,
    name: '中山大学肿瘤防治中心姑息医学科',
    region: 'guangdong',
    type: '公立医院',
    address: '广州市越秀区东风东路651号',
    phone: '020-87343388',
    services: ['姑息治疗', '症状控制', '营养支持', '康复指导'],
    description: '华南地区领先的姑息治疗中心，拥有国际化的治疗理念。'
  },
  {
    id: 9,
    name: '深圳市第二人民医院宁养院',
    region: 'guangdong',
    type: '公立医院',
    address: '深圳市福田区笋岗西路3002号',
    phone: '0755-83366388',
    services: ['居家宁养', '门诊咨询', '疼痛治疗', '心理支持'],
    description: '深圳地区重要的安宁疗护服务机构，服务覆盖全市。'
  },
  {
    id: 10,
    name: '江苏省肿瘤医院安宁疗护中心',
    region: 'jiangsu',
    type: '公立医院',
    address: '南京市玄武区百子亭42号',
    phone: '025-83283597',
    services: ['安宁疗护', '疼痛管理', '症状控制', '家属关怀'],
    description: '江苏省安宁疗护临床重点专科，服务水平领先。'
  },
  {
    id: 11,
    name: '江苏省人民医院老年医学科',
    region: 'jiangsu',
    type: '公立医院',
    address: '南京市鼓楼区广州路300号',
    phone: '025-83718836',
    services: ['老年照护', '临终关怀', '康复护理', '营养咨询'],
    description: '综合实力强劲的老年医学中心，提供全周期照护服务。'
  },
  {
    id: 12,
    name: '浙江大学医学院附属第一医院姑息治疗中心',
    region: 'zhejiang',
    type: '公立医院',
    address: '杭州市上城区庆春路79号',
    phone: '0571-87236114',
    services: ['姑息治疗', '疼痛管理', '心理干预', '营养支持'],
    description: '浙江省领先的姑息治疗中心，多学科协作模式成熟。'
  },
  {
    id: 13,
    name: '浙江省肿瘤医院安宁疗护中心',
    region: 'zhejiang',
    type: '公立医院',
    address: '杭州市拱墅区半山东路1号',
    phone: '0571-88122222',
    services: ['安宁疗护', '症状控制', '社工服务', '家属辅导'],
    description: '专注于肿瘤晚期患者的安宁疗护，注重人文关怀。'
  },
  {
    id: 14,
    name: '四川大学华西医院姑息医学科',
    region: 'sichuan',
    type: '公立医院',
    address: '成都市武侯区国学巷37号',
    phone: '028-85422114',
    services: ['姑息治疗', '疼痛管理', '营养支持', '心理治疗'],
    description: '西南地区领先的姑息医学中心，学科实力雄厚。'
  },
  {
    id: 15,
    name: '四川省肿瘤医院宁养院',
    region: 'sichuan',
    type: '公立医院',
    address: '成都市武侯区人民南路四段55号',
    phone: '028-85420305',
    services: ['宁养服务', '居家照护', '疼痛控制', '社会支持'],
    description: '四川省安宁疗护示范基地，服务覆盖全省。'
  },
  {
    id: 16,
    name: '华中科技大学同济医学院附属同济医院姑息医学科',
    region: 'hubei',
    type: '公立医院',
    address: '武汉市硚口区解放大道1095号',
    phone: '027-83662688',
    services: ['姑息治疗', '症状管理', '心理干预', '康复指导'],
    description: '华中地区姑息医学的领军单位，诊疗规范专业。'
  },
  {
    id: 17,
    name: '武汉大学中南医院宁养中心',
    region: 'hubei',
    type: '公立医院',
    address: '武汉市武昌区东湖路169号',
    phone: '027-67812888',
    services: ['宁养服务', '疼痛治疗', '营养咨询', '家属支持'],
    description: '湖北省安宁疗护培训基地，致力于提升区域服务水平。'
  },
  {
    id: 18,
    name: '中南大学湘雅医院姑息医学科',
    region: 'hunan',
    type: '公立医院',
    address: '长沙市开福区湘雅路87号',
    phone: '0731-84328888',
    services: ['姑息治疗', '疼痛管理', '心理辅导', '社会支持'],
    description: '湖南省姑息医学的开创者，服务质量一流。'
  },
  {
    id: 19,
    name: '湖南省肿瘤医院宁养院',
    region: 'hunan',
    type: '公立医院',
    address: '长沙市岳麓区桐梓坡路283号',
    phone: '0731-88651900',
    services: ['宁养服务', '居家照护', '症状控制', '社工服务'],
    description: '专注于肿瘤患者的安宁疗护，人文关怀特色鲜明。'
  },
  {
    id: 20,
    name: '山东大学齐鲁医院姑息治疗科',
    region: 'shandong',
    type: '公立医院',
    address: '济南市历下区文化西路107号',
    phone: '0531-82169114',
    services: ['姑息治疗', '疼痛管理', '营养支持', '心理干预'],
    description: '山东省领先的姑息治疗中心，学科建设完善。'
  },
  {
    id: 21,
    name: '山东省肿瘤医院宁养院',
    region: 'shandong',
    type: '公立医院',
    address: '济南市槐荫区济兖路440号',
    phone: '0531-87984777',
    services: ['宁养服务', '居家护理', '疼痛控制', '家属辅导'],
    description: '山东省安宁疗护示范单位，服务口碑良好。'
  },
  {
    id: 22,
    name: '郑州大学第一附属医院姑息医学科',
    region: 'henan',
    type: '公立医院',
    address: '郑州市二七区建设东路50号',
    phone: '0371-66913114',
    services: ['姑息治疗', '症状管理', '心理支持', '营养咨询'],
    description: '河南省规模最大的姑息治疗中心，服务能力强。'
  },
  {
    id: 23,
    name: '河南省肿瘤医院安宁疗护中心',
    region: 'henan',
    type: '公立医院',
    address: '郑州市金水区东明路127号',
    phone: '0371-65587335',
    services: ['安宁疗护', '疼痛控制', '社工服务', '家属关怀'],
    description: '河南省安宁疗护培训中心，推动全省服务规范化。'
  },
  {
    id: 24,
    name: '河北医科大学第四医院宁养院',
    region: 'hebei',
    type: '公立医院',
    address: '石家庄市长安区健康路12号',
    phone: '0311-86095588',
    services: ['宁养服务', '居家照护', '疼痛治疗', '心理辅导'],
    description: '河北省安宁疗护的先行者，服务经验丰富。'
  },
  {
    id: 25,
    name: '中国医科大学附属第一医院姑息治疗科',
    region: 'liaoning',
    type: '公立医院',
    address: '沈阳市和平区南京北街155号',
    phone: '024-83283333',
    services: ['姑息治疗', '症状控制', '营养支持', '心理干预'],
    description: '东北地区领先的姑息治疗中心，诊疗水平高。'
  },
  {
    id: 26,
    name: '辽宁省肿瘤医院宁养中心',
    region: 'liaoning',
    type: '公立医院',
    address: '沈阳市大东区小河沿路44号',
    phone: '024-31916688',
    services: ['宁养服务', '疼痛管理', '家属支持', '社工服务'],
    description: '辽宁省安宁疗护示范基地，服务体系完善。'
  },
  {
    id: 27,
    name: '西安交通大学第一附属医院姑息医学科',
    region: 'shaanxi',
    type: '公立医院',
    address: '西安市雁塔区雁塔西路277号',
    phone: '029-85323338',
    services: ['姑息治疗', '疼痛管理', '心理辅导', '营养咨询'],
    description: '西北地区领先的姑息医学中心，学科实力强。'
  },
  {
    id: 28,
    name: '陕西省肿瘤医院安宁疗护中心',
    region: 'shaanxi',
    type: '公立医院',
    address: '西安市雁塔区健康西路27号',
    phone: '029-85276200',
    services: ['安宁疗护', '症状控制', '居家照护', '家属关怀'],
    description: '陕西省安宁疗护示范单位，服务特色鲜明。'
  },
  {
    id: 29,
    name: '重庆大学附属肿瘤医院宁养院',
    region: 'chongqing',
    type: '公立医院',
    address: '重庆市沙坪坝区汉渝路181号',
    phone: '023-65301681',
    services: ['宁养服务', '疼痛控制', '心理支持', '社会服务'],
    description: '重庆市安宁疗护的领军机构，服务质量优秀。'
  },
  {
    id: 30,
    name: '天津医科大学肿瘤医院姑息治疗科',
    region: 'tianjin',
    type: '公立医院',
    address: '天津市河西区体院北环湖西路',
    phone: '022-23340123',
    services: ['姑息治疗', '疼痛管理', '营养支持', '心理干预'],
    description: '天津市领先的姑息治疗中心，多学科协作模式成熟。'
  }
];

export const serviceTypes = [
  '疼痛管理',
  '症状控制',
  '心理支持',
  '家属辅导',
  '居家宁养',
  '营养支持',
  '康复指导',
  '社工服务',
  '家庭病床'
];
