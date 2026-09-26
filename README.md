# MTurk Clone

A functional web-based clone of Amazon Mechanical Turk (MTurk) built using Node.js, Express.js, and SQLite.

## Features

- Browse available micro-tasks
- Search tasks
- Filter tasks by category
- View task details
- Apply for tasks
- Complete tasks
- Track applications
- Track completed tasks
- Calculate total earnings
- Post new tasks
- Worker reviews and ratings
- SQLite database
- REST API

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Node.js
- Express.js
- SQLite
- CORS
- dotenv

## Project Structure

```text
MTurk-Clone/
├── database.js
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
├── public/
│   ├── index.html
│   ├── tasks.html
│   ├── dashboard.html
│   ├── post-task.html
│   ├── task-details.html
│   ├── css/
│   │   ├── tasks.css
│   │   └── dashboard.css
│   └── js/
│       ├── tasks.js
│       ├── dashboard.js
│       └── task-details.js
└── mturk.db