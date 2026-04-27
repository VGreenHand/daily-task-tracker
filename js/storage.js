// 数据存储模块 - 管理所有数据的持久化

const STORAGE_KEY = 'dailyTaskTracker';
const LAST_VISIT_KEY = 'lastVisitDate';

// 默认数据结构
const defaultData = {
  tasks: [],
  records: [],
  settings: {
    theme: 'light'
  }
};

/**
 * 数据迁移 - 确保旧数据兼容新版本
 */
function migrateData(data) {
  if (!data) return data;

  // 为没有 order 字段的任务按当前顺序补充
  if (data.tasks && Array.isArray(data.tasks)) {
    data.tasks.forEach((task, index) => {
      if (task.order === undefined) {
        task.order = index;
      }
    });
  }

  return data;
}

/**
 * 从LocalStorage加载数据
 */
function loadData() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return migrateData(parsed);
    }
    return JSON.parse(JSON.stringify(defaultData));
  } catch (error) {
    console.error('加载数据失败:', error);
    return JSON.parse(JSON.stringify(defaultData));
  }
}

/**
 * 更新任务排序
 * @param {string[]} taskIds - 按新顺序排列的任务ID数组
 */
function reorderTasks(taskIds) {
  const data = loadData();

  taskIds.forEach((id, index) => {
    const task = data.tasks.find(t => t.id === id);
    if (task) {
      task.order = index;
    }
  });

  saveData(data);
}

/**
 * 保存数据到LocalStorage
 */
function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('保存数据失败:', error);
    return false;
  }
}

/**
 * 导出为JSON文件下载
 */
function exportToJSON() {
  try {
    const data = loadData();
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = formatDate(new Date());
    a.href = url;
    a.download = `task-backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('数据导出成功!', 'success');
    return true;
  } catch (error) {
    console.error('导出失败:', error);
    showNotification('导出失败: ' + error.message, 'error');
    return false;
  }
}

/**
 * 从JSON文件导入数据
 */
function importFromJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        let data = JSON.parse(e.target.result);

        // 验证数据格式
        if (!validateData(data)) {
          reject(new Error('数据格式不正确'));
          return;
        }

        // 数据迁移，确保兼容最新版本
        data = migrateData(data);

        // 保存导入的数据
        saveData(data);
        showNotification('数据导入成功!', 'success');
        resolve(data);
      } catch (error) {
        console.error('导入失败:', error);
        showNotification('导入失败: ' + error.message, 'error');
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };

    reader.readAsText(file);
  });
}

/**
 * 验证数据格式
 */
function validateData(data) {
  if (!data || typeof data !== 'object') {
    return false;
  }

  if (!Array.isArray(data.tasks) || !Array.isArray(data.records)) {
    return false;
  }

  return true;
}

/**
 * 检查每日重置
 */
function checkDailyReset() {
  const lastVisit = localStorage.getItem(LAST_VISIT_KEY);
  const today = formatDate(new Date());

  if (lastVisit !== today) {
    localStorage.setItem(LAST_VISIT_KEY, today);
    return true; // 需要重置
  }
  return false; // 不需要重置
}

/**
 * 格式化日期为 YYYY-MM-DD
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 显示通知消息
 */
function showNotification(message, type = 'info') {
  // 创建通知元素
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  // 添加到页面
  document.body.appendChild(notification);

  // 显示动画
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);

  // 自动隐藏
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}
