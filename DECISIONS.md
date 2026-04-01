# Candidate Decisions & Notes

Please use this file to briefly outline your technical choices and the rationale behind them.

## 1. State Management & Architecture
*Why did you structure your state the way you did? Which patterns did you choose for handling the flaky API requests, loading states, and error handling?*

- **Local React state** — A single list view does not need Redux or a global store, so filters and product data stay in component state and are passed down via props where needed.
- **Resilient requests** — Each fetch goes through `fetchPageWithRetry`, which retries up to three times with exponential backoff (`RETRY_BASE_MS * 2^(attempt-1)`), which pairs well with the mock API’s random failures and slow responses.
- **Debounced search** — The search input is debounced before calling `fetchProducts`, so typing does not spam the flaky endpoint on every keystroke.
- **Infinite scroll** — `IntersectionObserver` watches a sentinel near the bottom of the list and loads the next page when it enters view, with a root margin so the next batch can start loading slightly early.


## 2. Trade-offs and Omissions
*What did you intentionally leave out given the constraints of a take-home assignment? If you had more time, what you would prioritize next?*

- I would implement custom hook for fetching the product data and add unit test as well 

## 3. AI Usage
*How did you utilize AI tools (ChatGPT, Copilot, Cursor, etc.) during this assignment? Provide a brief summary of how they assisted you.*

- I have used **Cursor** and **ChatGPT** for planning and refactors. They gave me Suggestions that I reviewed and integrated where they matched the assignment constraints.

## 4. Edge Cases Identified
*Did you notice any edge cases or bugs that you didn't have time to fix? Please list them here.*

-no didn't notice any
