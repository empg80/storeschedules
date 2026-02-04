# Store Schedules

Store Schedules is a web application for managing a retail team's work schedules.  
It allows you to manage employees, plan weekly shifts, and track vacations and absences in a simple, visual interface.

## Demo

Live demo: https://storeschedules.netlify.app/

## Features

- Employee management (basic info, weekly base hours, role, contact details)
- Weekly schedule planning by employee and day
- Visual overview of shifts per day and per week
- Notes per day and per employee
- Global notes per day
- Vacation and absence tracking with colored days
- Local data persistence using `localStorage`
- Import and export data as JSON files
- Deployed with automatic builds from GitHub on Netlify

## Tech Stack

- **Frontend:** React + Vite
- **Language:** TypeScript / JavaScript (depending on file)
- **Styling:** CSS
- **Build & Dev:** Vite
- **Hosting:** Netlify (continuous deployment from GitHub)

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm or yarn

### Installation

```bash
git clone https://github.com/<your-username>/gestor-horarios-react.git
cd gestor-horarios-react
npm install
Development
bash
npm run dev
This starts the development server.
Open the URL shown in the terminal (usually http://localhost:5173) in your browser.

Production Build
bash
npm run build
The production-ready files are generated in the dist folder.

Preview Production Build
bash
npm run preview
Deployment
This project is deployed on Netlify with continuous deployment from GitHub.

Netlify configuration:

Build command: npm run build

Publish directory: dist

Every push to the main branch triggers a new deployment.

Data Management
The app stores data in the browser using localStorage.
You can:

Export all application data to a JSON file

Import data from a previously exported JSON file

This makes it easy to move or back up your schedules.

Project Goals
The main goal of this project is to provide a lightweight internal tool for small retail teams to:

Organize weekly shifts

Avoid scheduling conflicts

Keep track of absences, vacations, and daily notes

License
This project is for personal and educational use.
Feel free to fork it and adapt it for your own store or team.
