const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend files
app.use(express.static("public"));


// ===============================
// TEST API
// ===============================

app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "MTurk Clone API is working!"
    });
});


// ===============================
// GET ALL TASKS
// ===============================

app.get("/api/tasks", (req, res) => {

    const sql = `
        SELECT
            tasks.id,
            tasks.title,
            tasks.description,
            tasks.category,
            tasks.payment,
            tasks.deadline,
            tasks.status,
            tasks.created_at,
            users.name AS requester_name
        FROM tasks
        JOIN users ON tasks.requester_id = users.id
        WHERE tasks.status = 'available'
        ORDER BY tasks.id DESC
    `;

    db.all(sql, [], (err, rows) => {

        if (err) {
            console.error("Error fetching tasks:", err.message);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch tasks"
            });
        }

        res.json({
            success: true,
            count: rows.length,
            tasks: rows
        });
    });
});


// ===============================
// GET SINGLE TASK
// ===============================

app.get("/api/tasks/:id", (req, res) => {

    const taskId = req.params.id;

    const sql = `
        SELECT
            tasks.id,
            tasks.title,
            tasks.description,
            tasks.category,
            tasks.payment,
            tasks.deadline,
            tasks.status,
            tasks.created_at,
            users.name AS requester_name
        FROM tasks
        JOIN users ON tasks.requester_id = users.id
        WHERE tasks.id = ?
    `;

    db.get(sql, [taskId], (err, row) => {

        if (err) {
            console.error("Error fetching task:", err.message);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch task"
            });
        }

        if (!row) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        res.json({
            success: true,
            task: row
        });
    });
});


// ===============================
// CREATE NEW TASK
// ===============================

app.post("/api/tasks", (req, res) => {

    const {
        title,
        description,
        category,
        payment,
        deadline,
        requester_id
    } = req.body;

    if (
        !title ||
        !description ||
        !category ||
        payment === undefined ||
        !deadline ||
        !requester_id
    ) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    const sql = `
        INSERT INTO tasks
        (title, description, category, payment, deadline, requester_id, status)
        VALUES (?, ?, ?, ?, ?, ?, 'available')
    `;

    db.run(
        sql,
        [
            title,
            description,
            category,
            payment,
            deadline,
            requester_id
        ],
        function (err) {

            if (err) {
                console.error("Error creating task:", err.message);

                return res.status(500).json({
                    success: false,
                    message: "Failed to create task"
                });
            }

            res.status(201).json({
                success: true,
                message: "Task created successfully",
                taskId: this.lastID
            });
        }
    );
});


// ===============================
// APPLY FOR A TASK
// ===============================

app.post("/api/tasks/:id/apply", (req, res) => {

    const taskId = req.params.id;
    const { worker_id } = req.body;

    if (!worker_id) {
        return res.status(400).json({
            success: false,
            message: "Worker ID is required"
        });
    }

    db.get(
        `SELECT * FROM tasks WHERE id = ? AND status = 'available'`,
        [taskId],
        (err, task) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Database error"
                });
            }

            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: "Task not found or not available"
                });
            }

            db.get(
                `SELECT * FROM users WHERE id = ? AND role = 'worker'`,
                [worker_id],
                (err, worker) => {

                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: "Database error"
                        });
                    }

                    if (!worker) {
                        return res.status(404).json({
                            success: false,
                            message: "Worker not found"
                        });
                    }

                    db.get(
                        `SELECT * FROM applications
                         WHERE task_id = ? AND worker_id = ?`,
                        [taskId, worker_id],
                        (err, application) => {

                            if (err) {
                                return res.status(500).json({
                                    success: false,
                                    message: "Database error"
                                });
                            }

                            if (application) {
                                return res.status(400).json({
                                    success: false,
                                    message: "You have already applied for this task"
                                });
                            }

                            db.run(
                                `INSERT INTO applications
                                (task_id, worker_id, status)
                                VALUES (?, ?, 'applied')`,
                                [taskId, worker_id],
                                function (err) {

                                    if (err) {
                                        return res.status(500).json({
                                            success: false,
                                            message: "Failed to apply for task"
                                        });
                                    }

                                    res.status(201).json({
                                        success: true,
                                        message: "Applied for task successfully",
                                        applicationId: this.lastID
                                    });
                                }
                            );
                        }
                    );
                }
            );
        }
    );
});


// ===============================
// GET WORKER APPLICATIONS
// ===============================

app.get("/api/applications/worker/:workerId", (req, res) => {

    const workerId = req.params.workerId;

    const sql = `
        SELECT
            applications.id,
            applications.status,
            applications.applied_at,
            applications.completed_at,
            tasks.id AS task_id,
            tasks.title,
            tasks.description,
            tasks.category,
            tasks.payment,
            tasks.deadline
        FROM applications
        JOIN tasks
            ON applications.task_id = tasks.id
        WHERE applications.worker_id = ?
        ORDER BY applications.id DESC
    `;

    db.all(sql, [workerId], (err, rows) => {

        if (err) {
            console.error(
                "Error fetching applications:",
                err.message
            );

            return res.status(500).json({
                success: false,
                message: "Failed to fetch applications"
            });
        }

        res.json({
            success: true,
            count: rows.length,
            applications: rows
        });
    });
});


// ===============================
// COMPLETE A TASK
// ===============================

app.patch("/api/applications/:id/complete", (req, res) => {

    const applicationId = req.params.id;

    db.get(
        `SELECT * FROM applications WHERE id = ?`,
        [applicationId],
        (err, application) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Database error"
                });
            }

            if (!application) {
                return res.status(404).json({
                    success: false,
                    message: "Application not found"
                });
            }

            if (application.status === "completed") {
                return res.status(400).json({
                    success: false,
                    message: "Task is already completed"
                });
            }

            db.run(
                `UPDATE applications
                 SET status = 'completed',
                     completed_at = CURRENT_TIMESTAMP
                 WHERE id = ?`,
                [applicationId],
                function (err) {

                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: "Failed to complete task"
                        });
                    }

                    db.get(
                        `SELECT payment FROM tasks WHERE id = ?`,
                        [application.task_id],
                        (err, task) => {

                            if (err || !task) {
                                return res.status(500).json({
                                    success: false,
                                    message: "Task payment not found"
                                });
                            }

                            db.run(
                                `INSERT INTO earnings
                                (worker_id, task_id, amount, status)
                                VALUES (?, ?, ?, 'pending')`,
                                [
                                    application.worker_id,
                                    application.task_id,
                                    task.payment
                                ],
                                function (err) {

                                    if (err) {
                                        return res.status(500).json({
                                            success: false,
                                            message: "Task completed but earnings could not be recorded"
                                        });
                                    }

                                    res.json({
                                        success: true,
                                        message: "Task completed successfully",
                                        earningsId: this.lastID,
                                        amount: task.payment
                                    });
                                }
                            );
                        }
                    );
                }
            );
        }
    );
});


// ===============================
// GET WORKER EARNINGS
// ===============================

app.get("/api/earnings/worker/:workerId", (req, res) => {

    const workerId = req.params.workerId;

    const sql = `
        SELECT
            earnings.id,
            earnings.amount,
            earnings.status,
            earnings.created_at,
            tasks.title AS task_title
        FROM earnings
        JOIN tasks
            ON earnings.task_id = tasks.id
        WHERE earnings.worker_id = ?
        ORDER BY earnings.id DESC
    `;

    db.all(sql, [workerId], (err, rows) => {

        if (err) {
            console.error(
                "Error fetching earnings:",
                err.message
            );

            return res.status(500).json({
                success: false,
                message: "Failed to fetch earnings"
            });
        }

        const total = rows.reduce(
            (sum, earning) => {
                return sum + Number(earning.amount);
            },
            0
        );

        res.json({
            success: true,
            count: rows.length,
            total: total,
            earnings: rows
        });
    });
});


// ===============================
// SUBMIT REVIEW
// ===============================

app.post("/api/reviews", (req, res) => {

    const {
        task_id,
        worker_id,
        rating,
        review
    } = req.body;

    if (
        !task_id ||
        !worker_id ||
        rating === undefined ||
        !review
    ) {
        return res.status(400).json({
            success: false,
            message: "All review fields are required"
        });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({
            success: false,
            message: "Rating must be between 1 and 5"
        });
    }

    // Check whether worker completed the task
    db.get(
        `SELECT * FROM applications
         WHERE task_id = ?
         AND worker_id = ?
         AND status = 'completed'`,
        [task_id, worker_id],
        (err, application) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Database error"
                });
            }

            if (!application) {
                return res.status(400).json({
                    success: false,
                    message: "You can only review completed tasks"
                });
            }

            // Check whether review already exists
            db.get(
                `SELECT * FROM reviews
                 WHERE task_id = ?
                 AND worker_id = ?`,
                [task_id, worker_id],
                (err, existingReview) => {

                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: "Database error"
                        });
                    }

                    if (existingReview) {
                        return res.status(400).json({
                            success: false,
                            message: "You have already reviewed this task"
                        });
                    }

                    // Insert review
                    db.run(
                        `INSERT INTO reviews
                        (task_id, worker_id, rating, review)
                        VALUES (?, ?, ?, ?)`,
                        [
                            task_id,
                            worker_id,
                            rating,
                            review
                        ],
                        function (err) {

                            if (err) {
                                return res.status(500).json({
                                    success: false,
                                    message: "Failed to submit review"
                                });
                            }

                            res.status(201).json({
                                success: true,
                                message: "Review submitted successfully",
                                reviewId: this.lastID
                            });
                        }
                    );
                }
            );
        }
    );
});


// ===============================
// GET REVIEWS FOR A TASK
// ===============================

app.get("/api/reviews/task/:taskId", (req, res) => {

    const taskId = req.params.taskId;

    const sql = `
        SELECT
            reviews.id,
            reviews.task_id,
            reviews.worker_id,
            reviews.rating,
            reviews.review,
            reviews.created_at,
            users.name AS worker_name
        FROM reviews
        JOIN users
            ON reviews.worker_id = users.id
        WHERE reviews.task_id = ?
        ORDER BY reviews.id DESC
    `;

    db.all(sql, [taskId], (err, rows) => {

        if (err) {
            console.error(
                "Error fetching reviews:",
                err.message
            );

            return res.status(500).json({
                success: false,
                message: "Failed to fetch reviews"
            });
        }

        res.json({
            success: true,
            count: rows.length,
            reviews: rows
        });
    });
});


// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {
    console.log(`MTurk Clone running at http://localhost:${PORT}`);
});