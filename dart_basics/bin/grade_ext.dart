// 作业二任务3：成绩分级器扩展
// 在 gradeOf 基础上处理：边界 100/0、非法输入（<0 或 >100）
String gradeOfSafe(int score) {
  if (score < 0 || score > 100) return '非法分数';
  if (score == 100) return '满分';
  if (score >= 90) return '优';
  if (score >= 80) return '良';
  if (score >= 60) return '中';
  if (score == 0) return '零分';
  return '不及格';
}

// 非法输入的另一种来源：字符串解析，用 tryParse 空安全处理
String gradeFromText(String text) {
  final int? score = int.tryParse(text); // 解析失败返回 null，不抛异常
  if (score == null) return '无法解析：$text';
  return gradeOfSafe(score);
}

void runGradeExtDemo() {
  print('===== 五、自主实践：分级器扩展 =====');

  final scores = [100, 95, 82, 60, 45, 0, -1, 101];
  for (final s in scores) {
    print('gradeOfSafe($s) → ${gradeOfSafe(s)}');
  }

  for (final text in ['88', 'abc', '120']) {
    print('gradeFromText($text) → ${gradeFromText(text)}');
  }
}
