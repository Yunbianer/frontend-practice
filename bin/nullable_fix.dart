// 作业二任务1：空安全改写
// 原始隐患版（含 4 处隐患，逐一标注）：
//
// String? getName() => null;
// int? findScore() => 88;
//
// void unsafe() {
//   String name = getName()!;              // 隐患1：返回 null 时 ! 直接崩溃
//   int score = findScore();               // 隐患2：int? 不能直接赋给 int，编译报错
//   print('长度：${getName()!.length}');    // 隐患3：空值链上反复 !，到处是崩溃点
//   if (getName() != null) {               // 隐患4：函数返回值每次重新计算，
//     print(getName()!.length);            //   判空和用值分离，编译器不会类型提升
//   }
// }

String? getName() => null;
int? findScore() => 88;

void runNullableFixDemo() {
  print('===== 五、自主实践：空安全改写 =====');

  // 改写1：隐患1 → 用 ?? 提供默认值，null 时走兜底而不是崩溃
  final String name = getName() ?? '匿名';
  print('改写1 name = $name');

  // 改写2：隐患2 → 先用可空类型接住，需要非空 int 时再 ?? 给默认
  final int? rawScore = findScore();
  final int score = rawScore ?? 0;
  print('改写2 score = $score');

  // 改写3：隐患3 → ?. 安全调用，null 时整体短路返回 null，配合 ?? 输出提示
  print('改写3 长度 = ${getName()?.length ?? '没有名字，跳过统计'}');

  // 改写4：隐患4 → 先把返回值存进局部变量再判空；
  // 局部变量判空后 Dart 自动类型提升，if 内用 .length 不加 ! 也不报错
  final String? maybe = getName();
  if (maybe != null) {
    print('改写4 if 内长度 = ${maybe.length}');
  } else {
    print('改写4 名字为空，已安全跳过');
  }
}
