// 任务管理模块 - 任务的增删改查和打卡操作

/**
 * 生成唯一ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 添加新任务
 */
function addTask(taskName, color = '#2196F3') {
  if (!taskName || taskName.trim() === '') {
    showNotification('任务名称不能为空', 'error');
    return null;
  }

  const data = loadData();
  const newTask = {
    id: generateId(),
    name: taskName.trim(),
    createdAt: formatDate(new Date()),
    color: color
  };

  data.tasks.push(newTask);
  saveData(data);

  showNotification('任务添加成功!', 'success');
  return newTask;
}

/**
 * 编辑任务名称
 */
function editTask(taskId, newName) {
  if (!newName || newName.trim() === '') {
    showNotification('任务名称不能为空', 'error');
    return false;
  }

  const data = loadData();
  const task = data.tasks.find(t => t.id === taskId);

  if (!task) {
    showNotification('任务不存在', 'error');
    return false;
  }

  task.name = newName.trim();
  saveData(data);

  showNotification('任务更新成功!', 'success');
  return true;
}

/**
 * 删除任务
 */
function deleteTask(taskId) {
  const data = loadData();
  const taskIndex = data.tasks.findIndex(t => t.id === taskId);

  if (taskIndex === -1) {
    showNotification('任务不存在', 'error');
    return false;
  }

  // 确认删除
  if (!confirm('确定要删除这个任务吗?相关的打卡记录也将被删除。')) {
    return false;
  }

  // 删除任务
  data.tasks.splice(taskIndex, 1);

  // 删除相关的打卡记录
  data.records = data.records.filter(r => r.taskId !== taskId);

  saveData(data);

  showNotification('任务已删除', 'success');
  return true;
}

/**
 * 打卡任务
 */
function checkInTask(taskId) {
  const data = loadData();
  const task = data.tasks.find(t => t.id === taskId);

  if (!task) {
    showNotification('任务不存在', 'error');
    return false;
  }

  const today = formatDate(new Date());

  // 检查今日是否已打卡
  const alreadyCheckedIn = data.records.some(r =>
    r.taskId === taskId && r.date === today
  );

  if (alreadyCheckedIn) {
    showNotification('今日已打卡!', 'info');
    return false;
  }

  // 添加打卡记录
  data.records.push({
    taskId: taskId,
    date: today,
    timestamp: Date.now()
  });

  saveData(data);

  showNotification(`"${task.name}" 打卡成功!`, 'success');
  return true;
}

/**
 * 检查任务今日是否已打卡
 */
function isTaskCheckedInToday(taskId) {
  const data = loadData();
  const today = formatDate(new Date());

  return data.records.some(r =>
    r.taskId === taskId && r.date === today
  );
}

/**
 * 获取任务的所有打卡记录
 */
function getTaskRecords(taskId) {
  const data = loadData();
  return data.records.filter(r => r.taskId === taskId);
}

/**
 * 获取指定日期的打卡记录
 */
function getRecordsByDate(date) {
  const data = loadData();
  return data.records.filter(r => r.date === date);
}

/**
 * 获取某日期的打卡任务数量
 */
function getCheckInCountByDate(date) {
  const records = getRecordsByDate(date);
  return records.length;
}

/**
 * 渲染任务列表
 */
function renderTaskList() {
  const data = loadData();
  const taskListEl = document.getElementById('taskList');

  if (!taskListEl) return;

  taskListEl.innerHTML = '';

  if (data.tasks.length === 0) {
    taskListEl.innerHTML = '<div class="empty-state">暂无任务,点击"添加任务"开始吧!</div>';
    return;
  }

  data.tasks.forEach(task => {
    const isCheckedIn = isTaskCheckedInToday(task.id);
    const taskCard = createTaskCard(task, isCheckedIn);
    taskListEl.appendChild(taskCard);
  });
}

/**
 * 创建任务卡片元素
 */
function createTaskCard(task, isCheckedIn) {
  const card = document.createElement('div');
  card.className = `task-card ${isCheckedIn ? 'checked-in' : ''}`;
  card.dataset.taskId = task.id;

  // 任务颜色标记
  const colorMark = document.createElement('div');
  colorMark.className = 'task-color-mark';
  colorMark.style.backgroundColor = task.color;
  card.appendChild(colorMark);

  // 任务信息
  const taskInfo = document.createElement('div');
  taskInfo.className = 'task-info';

  const taskName = document.createElement('span');
  taskName.className = 'task-name';
  taskName.textContent = task.name;
  taskName.title = '双击编辑任务名称';

  // 双击编辑
  taskName.addEventListener('dblclick', (e) => {
    e.stopPropagation();
    enableTaskEdit(taskName, task.id);
  });

  taskInfo.appendChild(taskName);

  // 创建日期
  const createdDate = document.createElement('small');
  createdDate.className = 'task-created-date';
  createdDate.textContent = `创建于 ${task.createdAt}`;
  taskInfo.appendChild(createdDate);

  card.appendChild(taskInfo);

  // 打卡状态图标
  const statusIcon = document.createElement('div');
  statusIcon.className = 'task-status-icon';
  if (isCheckedIn) {
    statusIcon.innerHTML = '✓';
    statusIcon.title = '今日已打卡';
  }
  card.appendChild(statusIcon);

  // 删除按钮
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'task-delete-btn';
  deleteBtn.innerHTML = '×';
  deleteBtn.title = '删除任务';
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (deleteTask(task.id)) {
      renderTaskList();
      updateCalendar();
      updateStatistics();
    }
  });
  card.appendChild(deleteBtn);

  // 点击卡片打卡
  card.addEventListener('click', () => {
    if (!isCheckedIn) {
      if (confirm(`确认完成 "${task.name}" 吗?`)) {
        if (checkInTask(task.id)) {
          renderTaskList();
          updateCalendar();
          updateStatistics();
        }
      }
    }
  });

  return card;
}

/**
 * 启用任务名称编辑
 */
function enableTaskEdit(nameElement, taskId) {
  const currentName = nameElement.textContent;
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'task-edit-input';
  input.value = currentName;

  nameElement.replaceWith(input);
  input.focus();
  input.select();

  // 保存编辑
  const saveEdit = () => {
    const newName = input.value.trim();
    if (newName && newName !== currentName) {
      if (editTask(taskId, newName)) {
        renderTaskList();
      }
    } else {
      renderTaskList();
    }
  };

  // 失去焦点时保存
  input.addEventListener('blur', saveEdit);

  // 按Enter保存
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      saveEdit();
    }
  });

  // 按Esc取消
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      renderTaskList();
    }
  });
}

/**
 * 显示添加任务表单
 */
function showAddTaskForm() {
  const formContainer = document.getElementById('addTaskForm');
  if (!formContainer) return;

  formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';

  if (formContainer.style.display === 'block') {
    const input = document.getElementById('newTaskName');
    if (input) {
      input.focus();
    }
  }
}

/**
 * 处理添加任务
 */
function handleAddTask() {
  const input = document.getElementById('newTaskName');
  const colorPicker = document.getElementById('taskColorPicker');

  if (!input) return;

  const taskName = input.value.trim();
  const color = colorPicker ? colorPicker.value : '#2196F3';

  if (addTask(taskName, color)) {
    input.value = '';
    showAddTaskForm();
    renderTaskList();
    updateStatistics();
  }
}
