// 统计模块 - 数据统计和可视化展示

/**
 * 计算任务连续打卡天数
 */
function calculateStreak(taskId) {
  const data = loadData();
  const records = data.records.filter(r => r.taskId === taskId);

  if (records.length === 0) {
    return 0;
  }

  // 按日期排序(从新到旧)
  const sortedDates = [...new Set(records.map(r => r.date))].sort().reverse();

  let streak = 0;
  const today = formatDate(new Date());
  const yesterday = formatDate(new Date(Date.now() - 86400000));

  // 检查今天或昨天是否有打卡
  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
    return 0;
  }

  // 计算连续天数
  for (let i = 0; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i]);
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() - i);

    if (formatDate(currentDate) === formatDate(expectedDate)) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * 计算任务最长连续打卡记录
 */
function calculateLongestStreak(taskId) {
  const data = loadData();
  const records = data.records.filter(r => r.taskId === taskId);

  if (records.length === 0) {
    return 0;
  }

  // 获取所有唯一日期并排序
  const dates = [...new Set(records.map(r => r.date))].sort();

  let longestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i - 1]);
    const currDate = new Date(dates[i]);

    const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return longestStreak;
}

/**
 * 计算任务累计打卡天数
 */
function calculateTotalDays(taskId) {
  const data = loadData();
  const records = data.records.filter(r => r.taskId === taskId);
  return new Set(records.map(r => r.date)).size;
}

/**
 * 获取月度统计数据
 */
function getMonthlyStats(year, month) {
  const data = loadData();
  const startDate = formatDate(new Date(year, month, 1));
  const endDate = formatDate(new Date(year, month + 1, 0));

  const monthRecords = data.records.filter(r =>
    r.date >= startDate && r.date <= endDate
  );

  // 总打卡次数
  const totalCheckIns = monthRecords.length;

  // 各任务打卡次数
  const taskStats = {};
  data.tasks.forEach(task => {
    const count = monthRecords.filter(r => r.taskId === task.id).length;
    if (count > 0) {
      taskStats[task.id] = {
        name: task.name,
        count: count,
        color: task.color
      };
    }
  });

  // 有打卡的天数
  const activeDays = new Set(monthRecords.map(r => r.date)).size;

  // 当月总天数
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // 完成率
  const completionRate = ((activeDays / daysInMonth) * 100).toFixed(1);

  return {
    totalCheckIns,
    taskStats,
    activeDays,
    daysInMonth,
    completionRate
  };
}

/**
 * 获取近30天打卡趋势
 */
function getTrendData() {
  const data = loadData();
  const trend = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = formatDate(date);

    const count = getCheckInCountByDate(dateStr);
    trend.push({
      date: dateStr,
      count: count
    });
  }

  return trend;
}

/**
 * 渲染统计面板
 */
function renderStatistics() {
  renderOverallStats();
  renderTaskStats();
  renderMonthlyStats();
  renderTrendChart();
}

/**
 * 渲染总体统计
 */
function renderOverallStats() {
  const container = document.getElementById('overallStats');
  if (!container) return;

  const data = loadData();
  const totalTasks = data.tasks.length;
  const todayCheckedIn = data.tasks.filter(t => isTaskCheckedInToday(t.id)).length;

  container.innerHTML = `
    <div class="stat-item">
      <div class="stat-value">${totalTasks}</div>
      <div class="stat-label">总任务数</div>
    </div>
    <div class="stat-item">
      <div class="stat-value">${todayCheckedIn}/${totalTasks}</div>
      <div class="stat-label">今日完成</div>
    </div>
    <div class="stat-item">
      <div class="stat-value">${data.records.length}</div>
      <div class="stat-label">累计打卡</div>
    </div>
  `;
}

/**
 * 渲染各任务统计
 */
function renderTaskStats() {
  const container = document.getElementById('taskStats');
  if (!container) return;

  const data = loadData();

  if (data.tasks.length === 0) {
    container.innerHTML = '<div class="empty-state">暂无任务数据</div>';
    return;
  }

  container.innerHTML = '';

  data.tasks.forEach(task => {
    const streak = calculateStreak(task.id);
    const longestStreak = calculateLongestStreak(task.id);
    const totalDays = calculateTotalDays(task.id);

    const taskStatCard = document.createElement('div');
    taskStatCard.className = 'task-stat-card';

    taskStatCard.innerHTML = `
      <div class="task-stat-header">
        <span class="task-stat-color" style="background-color: ${task.color}"></span>
        <span class="task-stat-name">${task.name}</span>
      </div>
      <div class="task-stat-details">
        <div class="task-stat-detail">
          <span class="detail-label">连续打卡:</span>
          <span class="detail-value ${streak > 0 ? 'highlight' : ''}">${streak} 天</span>
        </div>
        <div class="task-stat-detail">
          <span class="detail-label">最长记录:</span>
          <span class="detail-value">${longestStreak} 天</span>
        </div>
        <div class="task-stat-detail">
          <span class="detail-label">累计打卡:</span>
          <span class="detail-value">${totalDays} 天</span>
        </div>
      </div>
    `;

    container.appendChild(taskStatCard);
  });
}

/**
 * 渲染月度统计
 */
function renderMonthlyStats() {
  const container = document.getElementById('monthlyStats');
  if (!container) return;

  const now = new Date();
  const stats = getMonthlyStats(now.getFullYear(), now.getMonth());

  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ];

  container.innerHTML = `
    <h4>${now.getFullYear()}年 ${monthNames[now.getMonth()]}</h4>
    <div class="monthly-stats-grid">
      <div class="monthly-stat-item">
        <span class="monthly-stat-label">总打卡次数:</span>
        <span class="monthly-stat-value">${stats.totalCheckIns}</span>
      </div>
      <div class="monthly-stat-item">
        <span class="monthly-stat-label">活跃天数:</span>
        <span class="monthly-stat-value">${stats.activeDays}/${stats.daysInMonth}</span>
      </div>
      <div class="monthly-stat-item">
        <span class="monthly-stat-label">完成率:</span>
        <span class="monthly-stat-value">${stats.completionRate}%</span>
      </div>
    </div>
  `;
}

/**
 * 渲染趋势图表(简化版,使用CSS柱状图)
 */
function renderTrendChart() {
  const container = document.getElementById('trendChart');
  if (!container) return;

  const trend = getTrendData();
  const maxCount = Math.max(...trend.map(t => t.count), 1);

  container.innerHTML = '';

  trend.forEach((item, index) => {
    const bar = document.createElement('div');
    bar.className = 'trend-bar';

    const height = (item.count / maxCount) * 100;
    bar.style.height = `${Math.max(height, 5)}%`;

    if (item.count > 0) {
      bar.classList.add('has-checkin');
    }

    bar.title = `${item.date}: ${item.count} 次打卡`;

    container.appendChild(bar);
  });
}

/**
 * 更新统计(外部调用接口)
 */
function updateStatistics() {
  renderStatistics();
}
