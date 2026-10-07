const form = document.getElementById('add-form');
const input = document.getElementById('number-input');
const list = document.getElementById('number-list');
const tip = document.getElementById('tip');
const filters = document.querySelector('.filters');

// 联系人数组：{ name: 名字, done: 是否已联系 }
let contacts = JSON.parse(localStorage.getItem('contacts') || '[]'); // 恢复
let currentFilter = 'all'; // all / active / done

const save = () => localStorage.setItem('contacts', JSON.stringify(contacts));

const render = () => {
  list.innerHTML = '';
  const shown = contacts.filter(c =>
    currentFilter === 'all' ? true :
    currentFilter === 'active' ? !c.done : c.done
  );
  if (shown.length === 0) {
    const li = document.createElement('li');
    li.textContent = '没有符合条件的联系人';
    list.appendChild(li);
    return;
  }
  shown.forEach(contact => {
    const li = document.createElement('li');
    li.dataset.index = contacts.indexOf(contact); // 在完整数组中的下标，供删除使用
    li.textContent = contact.name;
    if (contact.done) li.classList.add('done');

    const del = document.createElement('span');
    del.className = 'del';
    del.textContent = '删除';
    li.appendChild(del);

    li.addEventListener('click', (e) => {
      if (e.target.classList.contains('del')) return; // 点“删除”时不切换状态
      contact.done = !contact.done;    // 切换状态：改的是数组里的对象
      save();
      render();
    });
    list.appendChild(li);
  });
};

// 添加联系人
form.addEventListener('submit', function (e) {
  e.preventDefault();

  const name = input.value.trim();
  if (!name) {
    tip.textContent = '请输入名字';
    return;
  }
  tip.textContent = '';

  contacts.push({ name, done: false });  // 先改数组
  save();
  input.value = '';
  input.focus();
  render();                              // 再统一渲染
});

// 删除联系人（事件委托）
list.addEventListener('click', function (e) {
  if (e.target.classList.contains('del')) {
    contacts.splice(Number(e.target.parentElement.dataset.index), 1);
    save();
    tip.textContent = '';
    render();
  }
});

// 过滤：全部 / 未联系 / 已联系
filters.addEventListener('click', (e) => {
  if (e.target.tagName !== 'BUTTON') return;
  currentFilter = e.target.dataset.filter;   // data-filter属性
  render();
});

render();
