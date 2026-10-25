# SubsTracker

A simple web app to track your subscriptions (Netflix, Spotify, etc.), see your monthly spending, and know when each one renews.

## Objectives

- Connect a frontend to a backend API.
- Use all 5 HTTP methods: GET, POST, PUT, PATCH, DELETE.
- Save data online so it stays after a page reload.
- Let users log in securely.
- Write modular JavaScript with automatic tests.

## Features

- Sign up and log in (Supabase)
- Add, edit, pause/activate, and delete subscriptions
- Total monthly spend in USD, KES, EUR, or GBP (live exchange rates)
- Filter subscriptions by status
- Renewal calendar with a "Next Due" notice
- Input validation with clear error messages

## Technologies

- HTML, CSS, and JavaScript . 
- **Supabase** for login
- **JSON Server** on **Render** for storing subscriptions
- **ExchangeRate-API** for currency rates
- **Jest** for tests



## Live Links

- **Live App:** (https://gachu-oss.github.io/SubsTracker/)
- **Backend API:** https://substracker-backend-65ro.onrender.com/subscriptions
- **Backend Repo:** https://github.com/gachu-oss/substracker-backend-

> The backend runs on Render's free plan, so the first request after a while can take up to 50 seconds to wake up.

## Tests

```bash
npm test
```

To see the test coverage report:
```bash
npm run test:coverage
```

Result: 13 tests pass