// 运算符与控制流示例：整除、成绩分级器与 for-in 循环

// 成绩分级器：if 分支条件必须是 bool
String gradeOf(int score) {
  if (score >= 90) return '优';
  if (score >= 80) return '良';
  if (score >= 60) return '中';
  return '不及格';
}

void runFlowDemo() {
  print('===== 四、运算符与控制流 =====');

  // / 结果是 double，~/ 是整除
  print('7 / 2 = ${7 / 2}'); // 3.5
  print('7 ~/ 2 = ${7 ~/ 2}'); // 3

  // for-in 遍历集合
  for (final i in [1, 2, 3]) {
    print('第$i题');
  }

  // 分级器跑一组分数
  final scores = [95, 82, 60, 45];
  for (final score in scores) {
    print('$score 分 → ${gradeOf(score)}');
  }
}
