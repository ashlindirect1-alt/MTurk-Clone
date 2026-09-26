let allTasks = [];


// ===============================
// LOAD TASKS
// ===============================

async function loadTasks() {

    const tasksList = document.getElementById("tasksList");
    const taskCount = document.getElementById("taskCount");

    try {

        const response = await fetch("/api/tasks");

        const data = await response.json();

        if (!data.success) {
            throw new Error("Failed to load tasks");
        }

        allTasks = data.tasks;

        displayTasks(allTasks);

    } catch (error) {

        console.error("Error loading tasks:", error);

        tasksList.innerHTML = `
            <p class="empty">
                Unable to load tasks.
            </p>
        `;

        taskCount.textContent = "0 tasks";
    }
}


// ===============================
// DISPLAY TASKS
// ===============================

function displayTasks(tasks) {

    const tasksList = document.getElementById("tasksList");
    const taskCount = document.getElementById("taskCount");

    taskCount.textContent =
        `${tasks.length} task${tasks.length !== 1 ? "s" : ""}`;


    if (tasks.length === 0) {

        tasksList.innerHTML = `
            <p class="empty">
                No tasks found.
            </p>
        `;

        return;
    }


    tasksList.innerHTML = tasks.map(task => {

        return `
            <div class="task-card">

                <span class="task-category">
                    ${task.category}
                </span>

                <h3>
                    ${task.title}
                </h3>

                <p class="task-description">
                    ${task.description}
                </p>

                <div class="task-info">

                    <span class="payment">
                        $${Number(task.payment).toFixed(2)}
                    </span>

                    <span class="deadline">
                        Due: ${task.deadline}
                    </span>

                </div>

                <p class="requester">
                    Posted by: ${task.requester_name}
                </p>


                <!-- View Details Button -->

                <button
                    class="apply-btn"
                    onclick="viewTaskDetails(${task.id})"
                >
                    View Details
                </button>


                <!-- Apply Button -->

                <button
                    class="apply-btn"
                    onclick="applyForTask(${task.id})"
                    style="margin-top: 10px;"
                >
                    Apply for Task
                </button>

            </div>
        `;

    }).join("");
}


// ===============================
// VIEW TASK DETAILS
// ===============================

function viewTaskDetails(taskId) {

    window.location.href =
        `task-details.html?id=${taskId}`;
}


// ===============================
// APPLY BUTTON
// ===============================

async function applyForTask(taskId) {

    try {

        const response = await fetch(
            `/api/tasks/${taskId}/apply`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    worker_id: 2
                })
            }
        );


        const data = await response.json();


        if (data.success) {

            alert(
                "Application submitted successfully!"
            );

        } else {

            alert(
                data.message
            );
        }

    } catch (error) {

        console.error(
            "Error applying for task:",
            error
        );

        alert(
            "Something went wrong. Please try again."
        );
    }
}


// ===============================
// SEARCH
// ===============================

document
    .getElementById("searchInput")
    .addEventListener(
        "input",
        filterTasks
    );


// ===============================
// CATEGORY FILTER
// ===============================

document
    .getElementById("categoryFilter")
    .addEventListener(
        "change",
        filterTasks
    );


// ===============================
// FILTER TASKS
// ===============================

function filterTasks() {

    const searchText =
        document
            .getElementById("searchInput")
            .value
            .trim()
            .toLowerCase();


    const category =
        document
            .getElementById("categoryFilter")
            .value
            .trim()
            .toLowerCase();


    const filteredTasks =
        allTasks.filter(task => {

            const title =
                String(task.title || "")
                    .toLowerCase();


            const description =
                String(task.description || "")
                    .toLowerCase();


            const taskCategory =
                String(task.category || "")
                    .trim()
                    .toLowerCase();


            const matchesSearch =
                title.includes(searchText) ||
                description.includes(searchText) ||
                taskCategory.includes(searchText);


            const matchesCategory =
                category === "all" ||
                taskCategory === category;


            return matchesSearch && matchesCategory;

        });


    displayTasks(filteredTasks);
}


// ===============================
// START
// ===============================

loadTasks();