// 函数示例：命名参数、默认值与箭头函数

// 命名参数（Flutter 组件构造函数的统一风格）
// required 标记必填，其余可缺省或给默认值
void enroll({required String name, int age = 18, String? className}) {
  print('报名：$name，$age 岁，班级：${className ?? '未分班'}');
}

// 箭头函数：单表达式简写
int add(int a, int b) => a + b;

void runFuncDemo() {
  print('===== 三、函数 =====');

  enroll(name: '李华', className: '2班'); // age 用默认值 18
  enroll(name: '小明'); // className 可空，允许省略
  enroll(name: '王芳', age: 20, className: '3班');

  print('箭头函数 add(3, 4) = ${add(3, 4)}');
}
