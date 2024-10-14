
// Get references to elements
const boxes = document.querySelectorAll('.box');

// Optional: If you want to add more dynamic effects, you can modify box properties here
boxes.forEach(box => {
  // Add interaction or effects if needed
});

const cards = document.querySelectorAll('.card');
const addTaskBtn = document.getElementById('add-task-btn');
const taskModal = document.getElementById('task-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const addTaskBtnModal = document.getElementById('add-task-btn-modal');
const taskInput = document.getElementById('task-input');
const categorySelect = document.getElementById('category-select');
const taskList = document.getElementById('task-list');
const taskCategoryTitle = document.getElementById('task-category-title');
const backHome = document.getElementById('back-home');
const taskDisplay = document.getElementById('task-display');
const prioritySelect = document.getElementById('priority-select');
const completedTaskBtn = document.getElementById('completed-tasks-btn');
const incompleteTaskBtn = document.getElementById('incomplete-tasks-btn');
const celebrationPopup = document.getElementById('celebration-popup');

// Store tasks for each category
const tasks = JSON.parse(localStorage.getItem('tasks')) || {
    personal: [],
    work: [],
    shopping: [],
    health: [],
    education: [],
    fun: []
};

// Store completed tasks separately
const completedTasks = JSON.parse(localStorage.getItem('completedTasks')) || [];

// Helper: Save tasks to local storage
const saveTasks = () => localStorage.setItem('tasks', JSON.stringify(tasks));

// Helper: Save completed tasks to local storage
const saveCompletedTasks = () => localStorage.setItem('completedTasks', JSON.stringify(completedTasks));

// Helper: Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerText = message;
    document.body.appendChild(notification);
    notification.addEventListener('click', () => notification.remove());
    setTimeout(() => notification.remove(), 5000);
}

// Display tasks of a given category (can be filtered by completed/uncompleted)
function displayTasks(category, filter = 'all') {
    taskList.innerHTML = ''; // Clear the task list
    let taskArray = tasks[category];

    if (filter === 'incomplete') {
        taskArray = taskArray.filter(task => !task.completed); // Filter out completed tasks
    } else if (filter === 'completed') {
        taskArray = completedTasks.filter(task => task.category === category); // Filter completed tasks by category
    }

    if (!taskArray.length) {
        taskList.innerHTML = '<p>No tasks found.</p>';
        return;
    }

    // Sort tasks by priority before displaying
    taskArray.sort((a, b) => {
        const priorityOrder = { low: 1, medium: 2, high: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // Render each task
    taskArray.forEach((taskObj, index) => {
        const taskElement = createTaskElement(taskObj, category, index);
        taskList.appendChild(taskElement);
    });
}

// Create a task element with actions (complete/incomplete icons)
function createTaskElement(taskObj, category, index) {
    const taskElement = document.createElement('div');
    taskElement.classList.add('task-item');
    if (taskObj.completed) {
        taskElement.classList.add('complete'); // Style for completed tasks
    }

    taskElement.innerHTML = `
        <div class="task-details">
            <span class="task-text">${taskObj.task}</span>
            <div class="task-info">
                <span class="task-time">🕒 ${taskObj.time}</span>
                <span class="task-priority">📌 ${taskObj.priority}</span>
            </div>
        </div>
        <div class="task-actions">
            <button class="complete-btn" title="Complete"><i class="fas fa-check"></i></button>
            <button class="incomplete-btn" style="display:${taskObj.completed ? 'inline' : 'none'};" title="Mark as Incomplete"><i class="fas fa-undo"></i></button>
            <button class="delete-task" title="Delete"><i class="fas fa-trash"></i></button>
            <button class="update-task" title="Update"><i class="fas fa-edit"></i></button>
        </div>
    `;

    // Add event listeners for task actions
    const completeBtn = taskElement.querySelector('.complete-btn');
    const deleteBtn = taskElement.querySelector('.delete-task');
    const updateBtn = taskElement.querySelector('.update-task');
    const incompleteBtn = taskElement.querySelector('.incomplete-btn');

    completeBtn.addEventListener('click', () => {
        completeTask(category, index);
        updateTaskList(); // Call this to refresh the task list UI
    });
    
    deleteBtn.addEventListener('click', () => {
        deleteTask(category, index);
        updateTaskList(); // Call this to refresh the task list UI
    });
    
    updateBtn.addEventListener('click', () => {
        updateTask(category, index);
        updateTaskList(); // Call this to refresh the task list UI
    });

    incompleteBtn.addEventListener('click', () => {
        markAsIncomplete(category, index);
        updateTaskList(); // Call this to refresh the task list UI
    });

    return taskElement;
}


// Complete task function
function completeTask(category, index) {
    const completedTask = tasks[category][index];
    completedTask.completed = true;
    completedTasks.push({ ...completedTask, category });
    tasks[category].splice(index, 1);
    saveTasks();
    saveCompletedTasks();
    displayTasks(category);
    showNotification('Task completed successfully!');
}

// Mark task as incomplete
function markAsIncomplete(category, index) {
    const taskToMarkIncomplete = completedTasks.find((task, i) => task.category === category && i === index);
    if (taskToMarkIncomplete) {
        taskToMarkIncomplete.completed = false;
        tasks[category].push(taskToMarkIncomplete);
        completedTasks.splice(index, 1);
        saveTasks();
        saveCompletedTasks();
        displayTasks(category);
        showNotification('Task marked as incomplete.');
    }
}

// Delete task function
function deleteTask(category, index) {
    if (confirm("Are you sure you want to delete this task?")) {
        tasks[category].splice(index, 1);
        saveTasks();
        displayTasks(category);
        showNotification('Task deleted successfully!');
    }
}

// Update task function
function updateTask(category, index) {
    const newTask = prompt('Update task:', tasks[category][index].task);
    const newPriority = prompt('Update priority (low, medium, high):', tasks[category][index].priority);
    
    if (newTask && newPriority) {
        tasks[category][index].task = newTask;
        tasks[category][index].priority = newPriority;
        saveTasks();
        displayTasks(category);
        showNotification('Task updated successfully!');
    } else {
        showNotification('Update cancelled.');
    }
}

// Handle card clicks to display tasks
cards.forEach(card => {
    card.addEventListener('click', () => {
        const category = card.dataset.category.toLowerCase();
        taskCategoryTitle.innerText = `${category.charAt(0).toUpperCase() + category.slice(1)} Tasks`;
        taskDisplay.style.display = 'block';
        document.querySelector('.cards-section').style.display = 'none';
        backHome.style.display = 'block';
        displayTasks(category);
    });
});

// Go back to home screen when "Back Home" button is clicked
backHome.addEventListener('click', () => {
    taskDisplay.style.display = 'none';
    document.querySelector('.cards-section').style.display = 'grid';
    backHome.style.display = 'none';
});

// Display only completed tasks when button is clicked
completedTaskBtn.addEventListener('click', () => {
    const selectedCategory = taskCategoryTitle.innerText.split(' ')[0].toLowerCase();
    displayTasks(selectedCategory, 'completed');
});

// Display only incomplete tasks when button is clicked
incompleteTaskBtn.addEventListener('click', () => {
    const selectedCategory = taskCategoryTitle.innerText.split(' ')[0].toLowerCase();
    displayTasks(selectedCategory, 'incomplete');
});

// Event Listeners for modal
addTaskBtn.addEventListener('click', () => {
    taskModal.style.display = 'block';
    taskInput.focus();
});

closeModalBtn.addEventListener('click', () => {
    taskModal.style.display = 'none';
});

// Add new task when modal button is clicked
addTaskBtnModal.addEventListener('click', () => {
    const taskText = taskInput.value.trim();
    const selectedCategory = categorySelect.value;
    const priority = prioritySelect.value;

    if (!taskText) {
        alert('Please enter a task.');
        return;
    }

    const timestamp = new Date().toLocaleString();
    tasks[selectedCategory].push({ task: taskText, completed: false, time: timestamp, priority });
    taskModal.style.display = 'none';
    taskInput.value = '';
    saveTasks();
    displayTasks(selectedCategory);
    showNotification('Task added successfully!');
});

// Close modal on outside click
window.addEventListener('click', (event) => {
    if (event.target === taskModal) {
        taskModal.style.display = 'none';
    }
});

// Update task list function
function updateTaskList() {
    const taskContainer = taskList; // The container where tasks are displayed
    taskContainer.innerHTML = ''; // Clear existing tasks
    const selectedCategory = taskCategoryTitle.innerText.split(' ')[0].toLowerCase(); // Get the selected category

    // Re-display tasks based on the selected category
    displayTasks(selectedCategory);
}
