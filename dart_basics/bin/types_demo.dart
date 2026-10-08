// 变量声明、字符串插值与空安全四件套示例

// 模拟真实场景中"可能为 null"的返回值（函数返回值不会被编译器做类型提升）
String? maybeName() => null;
String? maybeHu() => 'hu';

void runTypesDemo() {
  print('===== 二、变量与类型 =====');

  // 1. 变量声明：var 类型推断 / 显式类型 / final / const
  var title = '第一次作业'; // String
  int year = 2026;
  double score = 92.5;
  final now = DateTime.now(); // 运行时确定一次
  const pi = 3.14159; // 编译期常量
  print('$title（$year），分数 $score，pi = $pi');
  print('现在时间：$now');

  // 2. 字符串插值：变量直接 $name，表达式加花括号 ${...}
  print('你好，$title，成绩${score + 5}');

  // 3. 空安全四件套
  String? nickname = maybeName(); // 值来自函数，此刻为 null
  print('安全调用 nickname?.length = ${nickname?.length}'); // null 短路
  print('空默认 nickname ?? 未填写 = ${nickname ?? '未填写'}'); // 默认值

  String? confirmedName = maybeHu(); // 明确知道有值 'hu'
  print('空断言 confirmedName!.length = ${confirmedName!.length}'); // 2

  late String token; // 延迟初始化：承诺使用前必赋值
  token = 'abc123';
  print('late 变量 token = $token');

  // 故意实验：变量仍为 null 时使用 !，观察报错类型（用 try-catch 接住，程序不中断）
  String? temp = maybeName();
  try {
    print(temp!.length); // temp 为 null，这里会抛异常
  } catch (e) {
    print('null 时使用 ! 的报错：$e');
  }
}
