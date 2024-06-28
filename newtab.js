document.getElementById('add-task-button').addEventListener('click', function() {
  const modal = document.createElement('div');
  modal.style.position = 'fixed';
  modal.style.top = '50%';
  modal.style.left = '50%';
  modal.style.transform = 'translate(-50%, -50%)';
  modal.style.background = 'rgba(255, 255, 255, 0.9)';
  modal.style.padding = '20px';
  modal.style.borderRadius = '10px';
  modal.style.zIndex = 1000;

  modal.innerHTML = `
    <h3 style="color: #000;">Add New Task</h3>
    <div style="margin-bottom: 10px;">
      <label for="task-detail" style="color: #000;">Task detail:</label>
      <input id="task-detail" type="text" placeholder="Enter task detail" required style="width: 100%;" />
    </div>
    <div style="margin-bottom: 10px;">
      <label for="task-priority" style="color: #000;">Priority:</label>
      <select id="task-priority" required style="width: 100%;">
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
    </div>
    <div style="margin-bottom: 10px;">
      <label for="task-date" style="color: #000;">Due Date:</label>
      <input id="task-date" type="date" style="width: 100%;" />
    </div>
    <button id="save-task">Save</button>
    <button id="cancel-task">Cancel</button>
  `;

  document.body.appendChild(modal);

  document.getElementById('save-task').addEventListener('click', function() {
    const taskDetail = document.getElementById('task-detail').value;
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

      document.body.removeChild(modal);
    }
  });

  document.getElementById('cancel-task').addEventListener('click', function() {
    document.body.removeChild(modal);
  });

  modal.addEventListener('click', function(event) {
    if (event.target === modal) {
      document.body.removeChild(modal);
    }
  });
});

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

document.addEventListener('DOMContentLoaded', displayTasks);
