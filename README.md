# LeetCode Tracker Dashboard ⭐⭐⭐⭐

An elegant, feature-rich developer dashboard to track solved LeetCode challenges, visualize problem-solving streaks, log contest performance, and analyze DSA prep metrics. 

Designed with a premium dark neon aesthetic, glowing panels, and responsive widgets.

## Tech Stack
* **Frontend**: React (Vite), Recharts (Data Visualizations), Lucide-React (Icons)
* **Backend**: Node.js, Express
* **Database**: MongoDB (via Mongoose) with an **automatic local JSON file database fallback** if MongoDB is not running.

---

## Features

1. **Track Solved Problems**: Log your progress with difficulty tiers, category tags, solving time, runtime/memory beats percentages, code snippets, and custom personal notes.
2. **Streak System**: Track your current and longest streak of consecutive days solved, backed by a visual GitHub-style contribution heat map depicting daily activities.
3. **Contest Ratings**: Manage your ratings from LeetCode contests. Includes peak rating metrics, performance ranks, and an interactive rating progression area chart.
4. **Performance Analytics**: Visual analytics panels displaying Easy/Medium/Hard splits (donut chart), category breakdowns (horizontal bar charts), velocity line charts, and progress bars tracking weekly/monthly targets.
5. **Database Fallback**: Runs instantly out of the box using local storage JSON files. If a MongoDB URI is configured, it connects seamlessly.

---

## How to Get Started

### 1. Install Dependencies
You can install dependencies for the root, frontend, and backend with a single command from the project root:
```bash
npm run install-all
```

### 2. Run the Application
Start both the React Vite frontend and Express backend concurrently with one command:
```bash
npm run dev
```

* **Frontend Dashboard**: [http://localhost:5173](http://localhost:5173)
* **Backend REST API**: [http://localhost:5000/api](http://localhost:5000/api)
* **Backend Health Check**: [http://localhost:5000/health](http://localhost:5000/health)

---

## Database Configuration

### Local JSON Database (Default)
By default, the backend operates without requiring a MongoDB installation. Data is saved in:
* `backend/data/problems.json`
* `backend/data/contests.json`

On the first launch, if these files are empty, the application auto-populates **8 mock LeetCode problems** and **3 contest records** to make the dashboard immediately interactive.

### MongoDB Integration
To connect the application to a real MongoDB database:
1. Ensure your MongoDB instance is running.
2. Open the `.env` file in the root directory.
3. Uncomment or set the `MONGO_URI` configuration:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/leetcode-tracker
   ```
4. Restart the servers. The backend will automatically detect the database and connect, seeding the database if it is empty.
