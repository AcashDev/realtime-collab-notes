# Realtime Collaborative Notes App

A full-stack real-time collaborative notes application built with **MERN stack** (MongoDB, Express.js, React.js, Node.js) and **Socket.IO** for live editing. Multiple users can create, edit, and delete notes simultaneously, with edit history and version control.

---

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Setup & Installation](#setup--installation)
- [Usage](#usage)
- [Folder Structure](#folder-structure)
- [API Endpoints](#api-endpoints)
- [Socket.IO Events](#socketio-events)
- [License](#license)

---

## Features
- Real-time collaborative editing of notes using **Socket.IO**
- User authentication with **JWT**
- Notes history tracking (edit history)
- Optimistic concurrency control for notes
- Create, update, delete, and search notes
- Responsive UI for desktop and mobile

---

## Tech Stack
- **Frontend:** React.js, Redux Toolkit, Tailwind CSS, Material-UI (Skeleton loader)
- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **Realtime Communication:** Socket.IO
- **Authentication:** JWT
- **Date & Time:** Moment.js with timezone support
- **Version Control:** Git & GitHub

---

## Getting Started

### Prerequisites
- Node.js >= 18.x
- npm or yarn
- MongoDB database
- Git

---

## Setup & Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/AcashDev/realtime-collab-notes.git
   cd realtime-collab-notes
