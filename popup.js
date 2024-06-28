// 获取添加任务按钮，并添加点击事件监听器
document.getElementById('add-task').addEventListener('click', function() {
  const taskDetail = document.getElementById('new-task').value;
  const taskPriority = document.getElementById('task-priority').value;
  const taskDate = document.getElementById('task-date').value;

  if (taskDetail && taskPriority) {
    chrome.storage.local.get({ tasks: [] }, function(data) {
      const tasks = data.tasks;
      tasks.push({
        detail: taskDetail,
        priority: taskPriority,
        date: taskDate,
        completed: false,
        created: new Date().toISOString()
      });
      chrome.storage.local.set({ tasks: tasks }, function() {
        displayTasks();
      });
    });
    document.getElementById('new-task').value = '';
    document.getElementById('task-priority').value = 'medium';
    document.getElementById('task-date').value = '';
  }
});

// 根据优先级返回不同的图标
function getPriorityIcon(priority) {
  switch (priority) {
    case 'high':
      return '*'; // 高优先级图标
    case 'medium':
      return '🔥'; // 中优先级图标
    case 'low':
      return '🟢'; // 低优先级图标
    default:
      return '';
  }
}

// 显示任务列表
function displayTasks() {
  chrome.storage.local.get({ tasks: [] }, function(data) {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    const tasks = data.tasks.sort((a, b) => (a.priority === 'high' ? -1 : (b.priority === 'high' ? 1 : (a.priority === 'medium' ? -1 : 1))));
    tasks.forEach(function(task, index) {
      if (!task.completed) {
        const li = document.createElement('li');
        const icon = getPriorityIcon(task.priority);
        li.innerHTML = `
          <span class="priority-icon">${icon}</span>
          <div class="task-info">
            <span>${task.detail}</span>
            <span>${task.priority}</span>
          </div>
          <div class="task-dates">
            <small>Created: ${new Date(task.created).toLocaleDateString()}</small>
            ${task.date ? `<small>Due: ${new Date(task.date).toLocaleDateString()}</small>` : ''}
          </div>
        `;
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', function() {
          tasks[index].completed = this.checked;
          chrome.storage.local.set({ tasks: tasks }, displayTasks);
        });

        li.insertBefore(checkbox, li.firstChild);
        taskList.appendChild(li);
      }
    });
  });
}

// 页面加载时显示任务列表
document.addEventListener('DOMContentLoaded', displayTasks);
