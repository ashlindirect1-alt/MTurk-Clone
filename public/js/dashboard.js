async function loadDashboard() {
    const applicationsList = document.getElementById("applicationsList");
    const applicationCount = document.getElementById("applicationCount");
    const completedCount = document.getElementById("completedCount");
    const totalEarnings = document.getElementById("totalEarnings");

    try {
        const response = await fetch("/api/applications/worker/2");
        const data = await response.json();

        if (!data.success) {
            throw new Error("Failed to load applications");
        }

        const applications = data.applications;

        // Application count
        applicationCount.textContent = applications.length;

        // Completed count
        const completed = applications.filter(
            application => application.status === "completed"
        );

        completedCount.textContent = completed.length;

        // Calculate earnings
        const earnings = completed.reduce(
            (total, application) => {
                return total + Number(application.payment);
            },
            0
        );

        totalEarnings.textContent =
            `$${earnings.toFixed(2)}`;

        // Display applications
        if (applications.length === 0) {
            applicationsList.innerHTML = `
                <p class="empty">
                    You have not applied for any tasks yet.
                </p>
            `;
            return;
        }

        applicationsList.innerHTML = applications.map(application => {

            return `
                <div class="application-card">

                    <h3>${application.title}</h3>

                    <p>
                        Category: ${application.category}
                    </p>

                    <p>
                        Deadline: ${application.deadline}
                    </p>

                    <p class="payment">
                        Payment: $${Number(application.payment).toFixed(2)}
                    </p>

                    <span class="status">
                        ${application.status}
                    </span>

                    ${
                        application.status === "applied"
                        ? `
                            <button
                                class="complete-btn"
                                onclick="completeTask(${application.id})"
                            >
                                Complete Task
                            </button>
                        `
                        : `
                            <p class="completed-message">
                                ✓ Task Completed
                            </p>
                        `
                    }

                </div>
            `;

        }).join("");

    } catch (error) {

        console.error(
            "Error loading dashboard:",
            error
        );

        applicationsList.innerHTML = `
            <p class="empty">
                Unable to load applications.
            </p>
        `;

        applicationCount.textContent = "0";
        completedCount.textContent = "0";
        totalEarnings.textContent = "$0.00";
    }
}


// COMPLETE TASK
async function completeTask(applicationId) {

    const confirmComplete = confirm(
        "Are you sure you want to mark this task as completed?"
    );

    if (!confirmComplete) {
        return;
    }

    try {

        const response = await fetch(
            `/api/applications/${applicationId}/complete`,
            {
                method: "PATCH"
            }
        );

        const data = await response.json();

        if (data.success) {

            alert(
                `Task completed successfully!\nEarned: $${Number(data.amount).toFixed(2)}`
            );

            // Reload dashboard
            loadDashboard();

        } else {

            alert(data.message);

        }

    } catch (error) {

        console.error(
            "Error completing task:",
            error
        );

        alert(
            "Unable to complete the task."
        );
    }
}


// Load dashboard when page opens
loadDashboard();