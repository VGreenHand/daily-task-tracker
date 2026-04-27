// 日历模块 - 实时日历展示和日期导航

let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth(); // 0-11

/**
 * 渲染日历
 */
function renderCalendar() {
  updateCalendarHeader();
  renderCalendarGrid();
}

/**
 * 更新日历头部(年月显示)
 */
function updateCalendarHeader() {
  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ];

  const headerEl = document.getElementById('calendarHeader');
  if (headerEl) {
    headerEl.textContent = `${currentYear}年 ${monthNames[currentMonth]}`;
  }
}

/**
 * 渲染日历网格
 */
function renderCalendarGrid() {
  const gridEl = document.getElementById('calendarGrid');
  if (!gridEl) return;

  gridEl.innerHTML = '';

  // 添加星期标题
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  weekDays.forEach(day => {
    const dayHeader = document.createElement('div');
    dayHeader.className = 'calendar-day-header';
    dayHeader.textContent = day;
    gridEl.appendChild(dayHeader);
  });

  // 获取当月第一天是星期几
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  // 获取当月天数
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // 获取上个月的最后几天
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  // 添加上个月的空白日期
  for (let i = firstDay - 1; i >= 0; i--) {
    const dayCell = createDayCell(
      prevMonthDays - i,
      true,
      currentMonth === 0 ? currentYear - 1 : currentYear,
      currentMonth === 0 ? 11 : currentMonth - 1
    );
    gridEl.appendChild(dayCell);
  }

  // 添加当月的日期
  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday =
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear();

    const dayCell = createDayCell(day, false, currentYear, currentMonth, isToday);
    gridEl.appendChild(dayCell);
  }

  // 添加下个月的前几天以填满网格
  const totalCells = gridEl.children.length;
  const remainingCells = 42 - totalCells; // 6行 x 7列 = 42

  for (let day = 1; day <= remainingCells; day++) {
    const dayCell = createDayCell(
      day,
      true,
      currentMonth === 11 ? currentYear + 1 : currentYear,
      currentMonth === 11 ? 0 : currentMonth + 1
    );
    gridEl.appendChild(dayCell);
  }
}

/**
 * 创建日期单元格
 */
function createDayCell(day, isOtherMonth, year, month, isToday = false) {
  const cell = document.createElement('div');
  cell.className = 'calendar-day';

  if (isOtherMonth) {
    cell.classList.add('other-month');
  }

  if (isToday) {
    cell.classList.add('today');
  }

  // 日期数字
  const dayNumber = document.createElement('span');
  dayNumber.className = 'day-number';
  dayNumber.textContent = day;
  cell.appendChild(dayNumber);

  // 检查该日期是否有打卡记录
  const dateStr = formatDate(new Date(year, month, day));
  const checkInCount = getCheckInCountByDate(dateStr);

  if (checkInCount > 0) {
    // 添加打卡标记
    const marker = document.createElement('div');
    marker.className = 'checkin-marker';

    // 根据打卡数量设置不同颜色深度
    if (checkInCount <= 2) {
      marker.classList.add('level-1');
    } else if (checkInCount <= 4) {
      marker.classList.add('level-2');
    } else {
      marker.classList.add('level-3');
    }

    cell.appendChild(marker);
  }

  // 点击日期查看详情
  cell.addEventListener('click', () => {
    showDateDetails(dateStr);
  });

  return cell;
}

/**
 * 切换到上一个月
 */
function previousMonth() {
  if (currentMonth === 0) {
    currentMonth = 11;
    currentYear--;
  } else {
    currentMonth--;
  }
  renderCalendar();
}

/**
 * 切换到下一个月
 */
function nextMonth() {
  if (currentMonth === 11) {
    currentMonth = 0;
    currentYear++;
  } else {
    currentMonth++;
  }
  renderCalendar();
}

/**
 * 跳转到今天
 */
function goToToday() {
  const today = new Date();
  currentYear = today.getFullYear();
  currentMonth = today.getMonth();
  renderCalendar();
}

/**
 * 显示指定日期的打卡详情
 */
function showDateDetails(dateStr) {
  const records = getRecordsByDate(dateStr);
  const data = loadData();

  // 创建模态框
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';

  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';

  // 标题
  const title = document.createElement('h3');
  title.textContent = `${dateStr} 打卡详情`;
  modalContent.appendChild(title);

  // 打卡列表
  const list = document.createElement('div');
  list.className = 'date-details-list';

  if (records.length === 0) {
    list.innerHTML = '<p class="empty-message">该日期没有打卡记录</p>';
  } else {
    records.forEach(record => {
      const task = data.tasks.find(t => t.id === record.taskId);
      if (task) {
        const item = document.createElement('div');
        item.className = 'detail-item';

        const colorDot = document.createElement('span');
        colorDot.className = 'detail-color-dot';
        colorDot.style.backgroundColor = task.color;

        const taskName = document.createElement('span');
        taskName.textContent = task.name;

        item.appendChild(colorDot);
        item.appendChild(taskName);
        list.appendChild(item);
      }
    });
  }

  modalContent.appendChild(list);

  // 关闭按钮
  const closeBtn = document.createElement('button');
  closeBtn.className = 'modal-close-btn';
  closeBtn.textContent = '关闭';
  closeBtn.addEventListener('click', () => {
    document.body.removeChild(modal);
  });

  modalContent.appendChild(closeBtn);
  modal.appendChild(modalContent);

  // 点击背景关闭
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });

  document.body.appendChild(modal);
}

/**
 * 更新日历(外部调用接口)
 */
function updateCalendar() {
  renderCalendar();
}

// 初始化日历事件监听
function initCalendarEvents() {
  const prevBtn = document.getElementById('prevMonth');
  const nextBtn = document.getElementById('nextMonth');
  const todayBtn = document.getElementById('goToToday');

  if (prevBtn) {
    prevBtn.addEventListener('click', previousMonth);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', nextMonth);
  }

  if (todayBtn) {
    todayBtn.addEventListener('click', goToToday);
  }
}
