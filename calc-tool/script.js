// 个人消费数据
const expenses = [
  { item: '午餐', amount: 25, category: '餐饮' },
  { item: '地铁', amount: 6, category: '交通' },
  { item: '电影票', amount: 45, category: '娱乐' },
  { item: '晚餐', amount: 38, category: '餐饮' },
  { item: '奶茶', amount: 15, category: '餐饮' },
  { item: '打车', amount: 22, category: '交通' },
  { item: '游戏充值', amount: -10, category: '娱乐' }, // 故意混入非法值：负金额
  { item: '未知消费', amount: 99999, category: '其他' }  // 故意混入非法值：金额过大
];
