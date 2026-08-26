# ⌨️ TypeForge

A minimalist, highly customizable, and robust typing speed test application. Built to a professional standard, TypeForge offers real-time WPM tracking, dynamic scrolling, multiple game modes, and a global leaderboard to compete with typists worldwide.

![TypeForge Screenshot](https://via.placeholder.com/900x450.png?text=TypeForge+-+Advanced+Typing+Test) *Replace this link with an actual screenshot of your app*

## ✨ Features

* **Real-time Metrics:** Live calculation of WPM (Words Per Minute) and Accuracy.
* **Multiple Game Modes:** 
  * ⏰ **Time:** Test your speed in 15, 30, 60, or 120-second intervals.
  * 📝 **Words:** Race to complete 10, 25, 50, or 100 words.
* **Flawless Typing Mechanics:** Advanced character tracking, strict backspace correction, and dynamic line-scrolling (Monkeytype style).
* **Global Leaderboard:** Save your high scores to a PostgreSQL database and compete globally.
* **Custom Themes:** 5 beautifully crafted color palettes (Rally, Terminal, Aurora, Ember, Graphite).
* **Premium UI/UX:** Frosted glassmorphism overlays, dot-matrix background, and sharp, step-end blinking carets.
* **Keyboard Shortcuts:** Quick restart using the `Tab` key.

## 🛠️ Tech Stack

**Frontend:**
* React.js (Vite)
* Custom CSS (CSS Variables, Flexbox/Grid, Animations)

**Backend:**
* Node.js
* Express.js
* PostgreSQL (Database)
* `pg` & `cors`

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

* [Node.js](https://nodejs.org/) installed
* [PostgreSQL](https://www.postgresql.org/) installed and running

### 1. Database Setup

Open your PostgreSQL terminal (or a tool like pgAdmin) and run the following commands to create the database and table:

```sql
CREATE DATABASE typeforge;

\c typeforge;

CREATE TABLE scores (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    top_score INT NOT NULL,
    accuracy INT NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
