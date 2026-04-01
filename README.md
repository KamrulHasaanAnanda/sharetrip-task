# Frontend - Round One

Welcome! Thank you for applying. This async take-home assignment is designed to see how you build, debug, and make decisions in a realistic frontend environment.

## The Scenario

We are building a new e-commerce product listing page. You have been provided a premium React boilerplate to get started. Your task is to build a high-quality product grid that fetches data from an API.

There's a catch: **Our backend is currently experiencing load issues.** The API is slow and highly flaky. Your UI needs to handle this gracefully without compromising the user experience.

## Requirements

1. **Fetch & Display:** Use `src/services/api.ts` to fetch products. Render them in a responsive grid.
2. **Product Card UI (Figma):** We test UI skills too! You only need to code the single **Product item UI** from this [Figma link](https://www.figma.com/design/x9iVC44evHLzfEUXrewfBH/Frontend-Task?node-id=0-1&t=bNULRU5xAWbTIaVq-1) just to demonstrate basic UI competency. You **do not** need to convert the entire Figma page. The rest of the application layout can remain as a structural grid. Translate the card accurately using Tailwind or Vanilla CSS.
3. **Pagination:** Implement pagination to handle multiple pages of data.
4. **Filtering:** Allow the user to filter products by `category`.
5. **Resilience:** The API `fetchProducts` function throws random errors and has unpredictable response times. Handle loading states and errors intuitively.
6. **UI & UX:** Maintain the premium, modern aesthetic of the boilerplate. The interface must be fully accessible.
7. **Styling:** Feel free to use **Tailwind CSS** or **Vanilla CSS** (or both). Both are pre-configured in this repository.
8. **AI Usage:** You **are allowed** to use AI tools (ChatGPT, Claude, Copilot, Cursor) if you wish to do so. If you choose to use them, please log *how* you used them in your decisions file.

## Submission Guidelines

When you are done, please provide:

1. **The Code:** A link to your own public GitHub repository containing your solution. Please do not submit zip files. If possible, deploying the project live on a free platform (Vercel, Netlify, etc.) and including the link is highly encouraged!
2. **DECISIONS.md:** Fill out the provided `DECISIONS.md` file.

## Getting Started

```bash
npm install
npm run dev
```

Good luck and build something great!
