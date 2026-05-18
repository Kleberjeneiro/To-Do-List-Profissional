const loginScreen = document.getElementById('loginScreen');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const logoutBtn = document.getElementById('logoutBtn');
const userGreeting = document.getElementById('userGreeting');
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const categoryInput = document.getElementById('categoryInput');
const taskList = document.getElementById('taskList');
const filterButtons = document.querySelectorAll('.filter');
const themeToggle = document.getElementById('themeToggle');
const totalTasks = document.getElementById('totalTasks');
const doneTasks = document.getElementById('doneTasks');
const pendingTasks = document.getElementById('pendingTasks');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'Todas';

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function saveUser(username) {
  localStorage.setItem('user', username);
}

function getUser() {
  return localStorage.getItem('user');
}

function showDashboard() {
  const user = getUser();
  if (user) {
    loginScreen.classList.add('hidden');
    dashboard.classList.remove('hidden');
    userGreeting.textContent = `Olá, ${user}!`;
    renderTasks();
  }
}

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  saveUser(usernameInput.value.trim());
  showDashboard();
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('user');
  dashboard.classList.add('hidden');
  loginScreen.classList.remove('hidden');
});

taskForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const newTask = {
    id: Date.now(),
    title: taskInput.value.trim(),
    category: categoryInput.value,
    completed: false,
  };

  tasks.push(newTask);
  saveTasks();
  taskInput.value = '';
  renderTasks();
});

function renderTasks() {
  taskList.innerHTML = '';

  const filteredTasks = currentFilter === 'Todas'
    ? tasks
    : tasks.filter(task => task.category === currentFilter);

  if (filteredTasks.length === 0) {
    taskList.innerHTML = '<li class="empty">Nenhuma tarefa encontrada.</li>';
  }

  filteredTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.draggable = true;
    li.dataset.id = task.id;

    li.innerHTML = `
      <button class="check-btn" onclick="toggleTask(${task.id})">✓</button>
      <div class="task-info">
        <strong class="task-title">${task.title}</strong>
        <small>${task.category}</small>
      </div>
      <span>☰</span>
      <button class="delete-btn" onclick="deleteTask(${task.id})">🗑</button>
    `;

    addDragEvents(li);
    taskList.appendChild(li);
  });

  updateStats();
}

function toggleTask(id) {
  tasks = tasks.map(task =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    currentFilter = button.dataset.filter;
    renderTasks();
  });
});

function updateStats() {
  totalTasks.textContent = tasks.length;
  doneTasks.textContent = tasks.filter(task => task.completed).length;
  pendingTasks.textContent = tasks.filter(task => !task.completed).length;
}

function addDragEvents(item) {
  item.addEventListener('dragstart', () => {
    item.classList.add('dragging');
  });

  item.addEventListener('dragend', () => {
    item.classList.remove('dragging');
    updateOrder();
  });
}

taskList.addEventListener('dragover', (event) => {
  event.preventDefault();
  const dragging = document.querySelector('.dragging');
  const afterElement = getDragAfterElement(taskList, event.clientY);

  if (!dragging) return;

  if (afterElement == null) {
    taskList.appendChild(dragging);
  } else {
    taskList.insertBefore(dragging, afterElement);
  }
});

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.task-item:not(.dragging)')];

  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;

    if (offset < 0 && offset > closest.offset) {
      return { offset, element: child };
    }

    return closest;
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function updateOrder() {
  const ids = [...document.querySelectorAll('.task-item')].map(item => Number(item.dataset.id));
  tasks.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
  saveTasks();
}

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const darkMode = document.body.classList.contains('dark');
  localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  themeToggle.textContent = darkMode ? '☀️ Modo claro' : '🌙 Modo escuro';
});

function loadTheme() {
  const theme = localStorage.getItem('theme');
  if (theme === 'dark') {
    document.body.classList.add('dark');
    themeToggle.textContent = '☀️ Modo claro';
  }
}

loadTheme();
showDashboard();
