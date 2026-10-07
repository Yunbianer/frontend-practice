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

// 清洗：只保留0至10000之间的合理金额
const cleanExpenses = (list) => list.filter(e => e.amount > 0 && e.amount <= 10000);

// 总消费
const totalExpense = (list) => list.reduce((sum, e) => sum + e.amount, 0);

// 平均消费
const averageExpense = (list) => {
  if (list.length === 0) return 0; // 空数组保护，除零会产生NaN
  return (totalExpense(list) / list.length).toFixed(2);
};

// 最大单笔消费
const biggestExpense = (list) => list.reduce((max, e) => e.amount > max.amount ? e : max, list[0]);

// 大额消费名单（30元及以上）
const highExpenses = (list) => list.filter(e => e.amount >= 30).map(e => e.item);

console.log('清洗后：', cleanExpenses(expenses));
console.log('总消费：', totalExpense(cleanExpenses(expenses)));
console.log('平均消费：', averageExpense(cleanExpenses(expenses)));
console.log('最大单笔：', biggestExpense(cleanExpenses(expenses)));
console.log('大额消费：', highExpenses(cleanExpenses(expenses)));
