const taskInput = document.getElementById("taskInput");
const taskDate = document.getElementById("taskDate");
const taskTime = document.getElementById("taskTime");
const taskPriority = document.getElementById("taskPriority");
const addTaskBtn = document.getElementById("addTaskBtn");

const taskList = document.getElementById("taskList");

const searchInput = document.getElementById("searchInput");
const filterBtns = document.querySelectorAll(".filters button");

const totalTasksEl = document.getElementById("totalTasks");
const completedTasksEl = document.getElementById("completedTasks");
const pendingTasksEl = document.getElementById("pendingTasks");

const progress = document.getElementById("progress");

const themeToggle = document.getElementById("themeToggle");
const themeIcon = themeToggle.querySelector("i");

const clearCompletedBtn = document.getElementById("clearCompleted");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let filter = "all";

/* INIT */
render();

/* Escape HTML so task text can never break the page layout */
function escapeHTML(str){
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

/* ADD TASK */
function addTask(){

    if(taskInput.value.trim() === "") return;

    const task = {
        id:Date.now(),
        text:taskInput.value.trim(),
        date:taskDate.value,
        time:taskTime.value,
        priority:taskPriority.value,
        completed:false
    };

    tasks.push(task);
    save();
    clearInputs();
    render();

}

addTaskBtn.addEventListener("click", addTask);

/* Add task on Enter key inside the task input */
taskInput.addEventListener("keydown", (e) => {
    if(e.key === "Enter"){
        addTask();
    }
});

/* CLEAR INPUTS */
function clearInputs(){
    taskInput.value="";
    taskDate.value="";
    taskTime.value="";
    taskInput.focus();
}

/* RENDER */
function render(){

    taskList.innerHTML="";

    let filtered = tasks;

    if(filter==="active") filtered = tasks.filter(t=>!t.completed);
    if(filter==="completed") filtered = tasks.filter(t=>t.completed);

    const search = searchInput.value.toLowerCase();

    filtered = filtered.filter(t =>
        t.text.toLowerCase().includes(search)
    );

    if(filtered.length === 0){

        const emptyMsg = document.createElement("li");
        emptyMsg.classList.add("empty-state");
        emptyMsg.textContent = tasks.length === 0
            ? "No tasks yet — add one above to get started."
            : "No tasks match your search/filter.";

        taskList.appendChild(emptyMsg);

    }

    filtered.forEach(task => {

        const li = document.createElement("li");
        li.classList.add("task", task.priority);

        if(task.completed) li.classList.add("completed");

        li.innerHTML = `
            <div>
                <strong>${escapeHTML(task.text)}</strong>
                <span class="priority-tag ${task.priority}">${task.priority}</span>
                <br>
                <small>${escapeHTML(task.date || "")} ${escapeHTML(task.time || "")}</small>
            </div>

            <div>
                <button class="done">✔</button>
                <button class="edit">✏</button>
                <button class="delete">🗑</button>
            </div>
        `;

        /* DONE */
        li.querySelector(".done").onclick = () => {
            task.completed = !task.completed;
            save();
            render();
        };

        /* DELETE */
        li.querySelector(".delete").onclick = () => {

            const confirmed = confirm("Delete this task?");
            if(!confirmed) return;

            tasks = tasks.filter(t=>t.id!==task.id);
            save();
            render();
        };

        /* EDIT */
        li.querySelector(".edit").onclick = () => {
            const newText = prompt("Edit task", task.text);
            if(newText && newText.trim() !== ""){
                task.text = newText.trim();
                save();
                render();
            }
        };

        taskList.appendChild(li);
    });

    updateStats();
}

/* SAVE */
function save(){
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

/* SEARCH */
searchInput.addEventListener("input", render);

/* FILTER */
filterBtns.forEach(btn=>{
    btn.onclick = () => {
        filterBtns.forEach(b=>b.classList.remove("active"));
        btn.classList.add("active");
        filter = btn.dataset.filter;
        render();
    };
});

/* CLEAR COMPLETED */
clearCompletedBtn.addEventListener("click", () => {

    const hasCompleted = tasks.some(t => t.completed);

    if(!hasCompleted) return;

    const confirmed = confirm("Clear all completed tasks?");
    if(!confirmed) return;

    tasks = tasks.filter(t => !t.completed);
    save();
    render();

});

/* STATS */
function updateStats(){
    const total = tasks.length;
    const completed = tasks.filter(t=>t.completed).length;
    const pending = total - completed;

    totalTasksEl.textContent = "Total: "+total;
    completedTasksEl.textContent = "Completed: "+completed;
    pendingTasksEl.textContent = "Pending: "+pending;

    const percent = total === 0 ? 0 : (completed/total)*100;
    progress.style.width = percent + "%";
}

/* THEME */
themeToggle.onclick = () => {
    document.body.classList.toggle("dark");

    const isDark = document.body.classList.contains("dark");

    localStorage.setItem("theme", isDark ? "dark":"light");

    updateThemeIcon(isDark);
};

function updateThemeIcon(isDark){
    themeIcon.classList.toggle("fa-moon", !isDark);
    themeIcon.classList.toggle("fa-sun", isDark);
}

/* LOAD THEME */
window.onload = () => {
    const isDark = localStorage.getItem("theme") === "dark";

    if(isDark){
        document.body.classList.add("dark");
    }

    updateThemeIcon(isDark);
};