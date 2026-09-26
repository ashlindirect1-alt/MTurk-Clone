const params = new URLSearchParams(window.location.search);

const taskId = params.get("id");


// ===============================
// LOAD TASK DETAILS
// ===============================

async function loadTaskDetails() {

    const taskDetails = document.getElementById("taskDetails");

    if (!taskId) {

        taskDetails.innerHTML = `
            <p class="loading">
                Task ID is missing.
            </p>
        `;

        return;
    }


    try {

        const response = await fetch(
            `/api/tasks/${taskId}`
        );

        const data = await response.json();


        if (!data.success) {

            taskDetails.innerHTML = `
                <p class="loading">
                    Task not found.
                </p>
            `;

            return;
        }


        const task = data.task;


        taskDetails.innerHTML = `

            <div class="task-detail-card">

                <h1>
                    ${task.title}
                </h1>

                <p class="task-description">
                    <strong>Description:</strong><br>
                    ${task.description}
                </p>


                <div class="task-info">

                    <div class="info-box">
                        <strong>Category</strong>
                        ${task.category}
                    </div>


                    <div class="info-box">
                        <strong>Requester</strong>
                        ${task.requester_name}
                    </div>


                    <div class="info-box">
                        <strong>Deadline</strong>
                        ${task.deadline}
                    </div>


                    <div class="info-box">
                        <strong>Payment</strong>
                        $${Number(task.payment).toFixed(2)}
                    </div>

                </div>


                <button
                    class="apply-btn"
                    onclick="applyForTask(${task.id})"
                >
                    Apply for Task
                </button>

            </div>

        `;

    } catch (error) {

        console.error(
            "Error loading task:",
            error
        );

        taskDetails.innerHTML = `
            <p class="loading">
                Unable to load task details.
            </p>
        `;
    }
}


// ===============================
// APPLY FOR TASK
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
// LOAD REVIEWS
// ===============================

async function loadReviews() {

    const reviewsList =
        document.getElementById("reviewsList");


    try {

        const response = await fetch(
            `/api/reviews/task/${taskId}`
        );

        const data = await response.json();


        if (!data.success) {

            reviewsList.innerHTML = `
                <p>
                    Unable to load reviews.
                </p>
            `;

            return;
        }


        const reviews = data.reviews;


        if (reviews.length === 0) {

            reviewsList.innerHTML = `
                <p>
                    No reviews yet.
                </p>
            `;

            return;
        }


        reviewsList.innerHTML = reviews.map(
            review => {

                const stars =
                    "★".repeat(review.rating) +
                    "☆".repeat(5 - review.rating);


                return `

                    <div class="review-card">

                        <div class="stars">
                            ${stars}
                        </div>

                        <p>
                            ${review.review}
                        </p>

                        <small>
                            By ${review.worker_name}
                            • ${review.created_at}
                        </small>

                    </div>

                `;
            }
        ).join("");


    } catch (error) {

        console.error(
            "Error loading reviews:",
            error
        );

        reviewsList.innerHTML = `
            <p>
                Unable to load reviews.
            </p>
        `;
    }
}


// ===============================
// SUBMIT REVIEW
// ===============================

document
    .getElementById("reviewForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();


        const rating =
            document.getElementById("rating").value;

        const review =
            document.getElementById("review").value.trim();


        if (!rating || !review) {

            alert(
                "Please select a rating and write a review."
            );

            return;
        }


        try {

            const response = await fetch(
                "/api/reviews",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        task_id: Number(taskId),

                        worker_id: 2,

                        rating: Number(rating),

                        review: review

                    })
                }
            );


            const data = await response.json();


            if (data.success) {

                alert(
                    "Review submitted successfully!"
                );


                document
                    .getElementById("reviewForm")
                    .reset();


                loadReviews();

            } else {

                alert(
                    data.message
                );
            }


        } catch (error) {

            console.error(
                "Error submitting review:",
                error
            );

            alert(
                "Unable to submit review."
            );
        }

    });


// ===============================
// START
// ===============================

loadTaskDetails();

loadReviews();