// 作业二任务2：命名参数设计——"实验报告生成器"
// required 必填项：标题、作者；可缺省项带默认值；可空项用 ?? 兜底
String buildReport({
  required String title,
  required String student,
  String course = '物理',
  List<String> sections = const ['目的', '步骤', '数据', '结论'],
  String? conclusion,
}) {
  final buffer = StringBuffer('《$title》\n');
  buffer.write('作者：$student（$course）\n');
  buffer.write('章节：${sections.join('、')}\n');
  buffer.write('结论：${conclusion ?? '待补充'}');
  return buffer.toString();
}

void runReportGeneratorDemo() {
  print('===== 五、自主实践：实验报告生成器 =====');

  // 调用1：只给必填项，其余全走默认值
  print(buildReport(title: '单摆测重力加速度', student: '李华'));
  print('---');

  // 调用2：换课程 + 自定义章节，结论仍缺省
  print(buildReport(
    title: '透镜成像规律',
    student: '小明',
    course: '科学',
    sections: ['假设', '器材', '记录'],
  ));
  print('---');

  // 调用3：全参数，命名参数与顺序无关
  print(buildReport(
    conclusion: '误差主要来自摆角偏大',
    student: '王芳',
    course: '物理',
    title: '摆角对周期的影响',
  ));
}
