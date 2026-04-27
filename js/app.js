// 主应用逻辑 - 协调各模块,处理用户交互

/**
 * 初始化应用
 */
function initApp() {
  // 检查每日重置
  if (checkDailyReset()) {
    console.log('新的一天,重置今日状态');
  }

  // 初始化日历事件
  initCalendarEvents();

  // 渲染界面
  renderTaskList();
  renderCalendar();
  renderStatistics();

  // 绑定全局事件
  bindGlobalEvents();

  console.log('日常任务打卡系统已启动');
}

/**
 * 绑定全局事件
 */
function bindGlobalEvents() {
  // 添加任务按钮
  const addTaskBtn = document.getElementById('addTaskBtn');
  if (addTaskBtn) {
    addTaskBtn.addEventListener('click', showAddTaskForm);
  }

  // 确认添加任务
  const confirmAddBtn = document.getElementById('confirmAddTask');
  if (confirmAddBtn) {
    confirmAddBtn.addEventListener('click', handleAddTask);
  }

  // 取消添加任务
  const cancelAddBtn = document.getElementById('cancelAddTask');
  if (cancelAddBtn) {
    cancelAddBtn.addEventListener('click', () => {
      showAddTaskForm();
    });
  }

  // 按Enter添加任务
  const newTaskInput = document.getElementById('newTaskName');
  if (newTaskInput) {
    newTaskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleAddTask();
      }
    });
  }

  // 导出数据按钮
  const exportBtn = document.getElementById('exportData');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportToJSON);
  }

  // 导入数据按钮
  const importBtn = document.getElementById('importData');
  if (importBtn) {
    importBtn.addEventListener('click', () => {
      document.getElementById('importFileInput').click();
    });
  }

  // 文件输入变化
  const fileInput = document.getElementById('importFileInput');
  if (fileInput) {
    fileInput.addEventListener('change', handleFileImport);
  }
}

/**
 * 处理文件导入
 */
function handleFileImport(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (!confirm('导入数据将覆盖当前所有数据,确定要继续吗?')) {
    e.target.value = '';
    return;
  }

  importFromJSON(file)
    .then(() => {
      // 重新渲染界面
      renderTaskList();
      renderCalendar();
      renderStatistics();
      e.target.value = '';
    })
    .catch(error => {
      console.error('导入失败:', error);
    });
}

/**
 * 页面加载完成后初始化
 */
document.addEventListener('DOMContentLoaded', initApp);
