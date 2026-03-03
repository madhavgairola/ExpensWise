# ExpensWise 2.0 🧠💰

ExpensWise 2.0 is a modern, AI-powered personal finance tracker that actually helps you understand your spending habits instead of just making you stare at tables all day. Built with a sleek dark mode UI and glassmorphism components, it's designed to make budgeting feel less like a chore and more like a command center for your money.

## Why I Built This

I wanted a finance app that didn't just tell me *what* I spent, but *how* I was doing compared to my usual habits. Most apps just show you a progress bar. ExpensWise takes your transaction history, figures out your average daily spend, and uses Google's Gemini AI to give you personalized, actionable insights—like telling you to chill on the coffee purchases if you're trending over budget.

## Features that Actually Matter

*   **Smart AI Insights:** Connects to Gemini API to analyze your spending bucket and gives you real advice based on your current trajectory.
*   **Persistent Guest Mode:** Let's say you just want to toy around with the app without committing to an account—Guest Mode uses a shared persistent account so you can actually see data carry over.
*   **Dynamic Dashboard:** Real-time metrics comparing your current run-rate against your historical averages.
*   **Premium UI:** No boring generic spreadsheets. Everything is wrapped in a custom mint-green (`#3ecf8e`) and dark-themed interface built from scratch.

## Tech Stack

*   **Frontend:** React (Vite) with Lucide Icons and Framer Motion for buttery smooth page transitions.
*   **Backend:** Node.js & Express.
*   **Database:** PostgreSQL handled entirely by Prisma ORM.
*   **Auth:** Custom JWT-based authentication with bcrypt hashing.
*   **AI:** Google Generative AI integration.

## Getting Started Locally

If you want to spin this up on your own machine, here's how:

1.  **Clone the repo:**
    ```bash
    git clone https://github.com/yourusername/expenswise-2.0.git
    cd expenswise-2.0
    ```

2.  **Install dependencies (for both folders):**
    ```bash
    npm install
    cd frontend && npm install && cd ..
    ```

3.  **Set up your environment variables:**
    Create a `.env` file in the root directory. You'll need:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/expenswisedb"
    JWT_SECRET="your_super_secret_key"
    GEMINI_API_KEY="your_google_gemini_api_key_here"
    PORT=3000
    ```

4.  **Push the database schema:**
    ```bash
    npx prisma db push
    ```

5.  **Run the app:**
    Start the backend server:
    ```bash
    npm run dev
    ```
    In a new terminal, start the React frontend:
    ```bash
    cd frontend && npm run dev
    ```

## What's Next?
- [ ] Exporting data to CSV (coming soon!)
- [ ] More granular category tagging
- [ ] Better mobile responsiveness for the chat widget

---
*If this project helps you get your finances in check, consider dropping a ⭐ on the repo!*
