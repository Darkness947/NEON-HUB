<div align="center">
  <img src="client/src/assets/images/main_logo.png" alt="Neon Hub Logo" width="300" />

  <h1>Neon Hub</h1>

  <p>
    <strong>A production-grade, full-stack media tracking platform.</strong>
  </p>

  <p>
    <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version" />
    <img src="https://img.shields.io/badge/license-ISC-green.svg" alt="License" />
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" />
  </p>

  <h3>
    <a href="documentation/walkthrough.md">Explore the Walkthrough</a>
    <span> | </span>
    <a href="documentation/final-documentation.md">Read the Docs</a>
    <span> | </span>
    <a href="diagrams/system-architecture.md">View Architecture</a>
  </h3>
</div>

<br />

## 🌟 Overview

**Neon Hub** is the ultimate dashboard for organizing your digital life. Whether you're tracking the latest blockbuster movies, binge-watching TV series, or managing your video game backlog, Neon Hub provides a sleek, dark-themed, and responsive interface to keep everything in one place.

Powered by industry-leading APIs (TMDB & RAWG) and augmented with cutting-edge AI (Google Gemini), Neon Hub doesn't just track your media—it helps you discover what to experience next.

---

## 🚀 Key Features

*   🤖 **AI-Powered Insights:** Generate smart recommendations and deep side-by-side media comparisons using Google Gemini.
*   🎬 **Unified Library:** Track Movies, TV Series, and Video Games seamlessly in a single dashboard.
*   🌍 **Multi-Language Support:** Fully localized in English and Arabic with seamless RTL (Right-to-Left) UI transitions.
*   📊 **Rich Analytics:** View dynamic charts and progress rings detailing your completion rates and top genres.
*   ⭐ **Reviews & Ratings:** Rate your media and write detailed reviews.
*   📋 **Custom Lists:** Organize your content into personalized, custom-curated lists.
*   📱 **Fully Responsive:** Built with Bootstrap 5 and custom CSS to look beautiful on desktop, tablet, and mobile.
*   🛡️ **Production-Ready Security:** JWT authentication, bcrypt hashing, rate-limiting, and comprehensive error handling.

---

## 🛠️ Tech Stack

<div align="center">
  <img src="https://skillicons.dev/icons?i=react,vite,js,css,bootstrap,nodejs,express,postgres,netlify" alt="Tech Stack" />
</div>

<br />

| Layer | Technologies |
| --- | --- |
| **Frontend** | React, Vite, React Router v6, Bootstrap 5, Axios, i18next, React Helmet |
| **Backend** | Node.js (v22), Express.js, PostgreSQL (pg), JWT, bcrypt, node-cache |
| **Third-Party APIs** | TMDB (Movies/TV), RAWG (Games), Cloudinary (Images), Gemini (AI) |
| **Deployment Infrastructure** | Netlify (Frontend), Render (Backend), Neon DB (Database) |

---

## 🗺️ Documentation & Diagrams

We take pride in our comprehensive documentation. Explore the links below to understand how Neon Hub is built under the hood:

### 📖 Documentation
*   [Functional Requirements](documentation/requirements.md)
*   [User Walkthrough](documentation/walkthrough.md)
*   [Final Technical Documentation](documentation/final-documentation.md)

### 📊 Diagrams (Mermaid.js)
*   [System Architecture](diagrams/system-architecture.md)
*   [Entity Relationship Diagram (ERD)](diagrams/erd.md)
*   [Conceptual Class Diagram](diagrams/class-diagram.md)
*   [System Use Cases](diagrams/use-cases.md)
*   [Authentication Sequence](diagrams/sequence-auth.md)
*   [AI Integration Sequence](diagrams/sequence-ai.md)
*   **Workflows:**
    *   [Add Media Workflow](diagrams/workflow-add-media.md)
    *   [Review & Rating Workflow](diagrams/workflow-review.md)
    *   [AI Compare Workflow](diagrams/workflow-compare-ai.md)
    *   [AI Recommend Workflow](diagrams/workflow-recommend-ai.md)

---

## 🚦 Getting Started

### Prerequisites
*   Node.js 20+
*   npm 9+
*   PostgreSQL (Local or Cloud, e.g., Neon DB)
*   API Keys: TMDB, RAWG, Cloudinary, Gemini

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/neon-hub.git
cd neon-hub
```

### 2. Setup the Backend
```bash
cd server
npm install
cp .env.example .env
```
*Fill in your `.env` values (Database URL, API Keys, JWT Secret).*
```bash
npm run dev
```

### 3. Setup the Frontend
```bash
cd client
npm install
cp .env.example .env
```
*Ensure `VITE_API_URL` is pointing to your backend (e.g., `http://localhost:5000`).*
```bash
npm run dev
```

### 4. Open the App
Navigate to `http://localhost:5173` in your browser.

---


<div align="center">
  <i>Built with ❤️ for media enthusiasts everywhere.</i>
</div>
