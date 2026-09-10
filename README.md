# playwright-ts-daily

Daily TypeScript + Playwright practice, with a full CI/CD pipeline:
**GitHub (daily commits) → Jenkins (TS compile + Playwright tests) → Render (auto-deploy dashboard)**

## Structure

```
days/
  day-01/
    day01.spec.ts   <- write ~5 tests/programs here each day
  day-02/
    day02.spec.ts
scripts/
  update-tracker.js <- builds tracker.json + public/index.html dashboard
Jenkinsfile          <- CI/CD pipeline definition
playwright.config.ts
tsconfig.json
```

## Local setup

```bash
npm install
npx playwright install --with-deps
npm run typecheck   # TypeScript compile check
npm test            # run Playwright tests
npm run track       # regenerate tracker.json + public/index.html
```

## Daily workflow

1. Create a new folder: `days/day-02/`
2. Add `day02.spec.ts` with your 5 programs/tests for the day.
3. Run locally: `npm run typecheck && npm test`
4. Commit: `git commit -am "day-02: 5 playwright tests"`
5. Push to GitHub — this triggers Jenkins automatically (via webhook).

## Jenkins setup

1. Run Jenkins (Docker is easiest):
   ```bash
   docker run -p 8080:8080 -p 50000:50000 jenkins/jenkins:lts
   ```
2. Install the **NodeJS** and **Pipeline** plugins.
3. Create a new **Pipeline** job → "Pipeline script from SCM" → point it at this GitHub repo, branch `main`, script path `Jenkinsfile`.
4. Add a GitHub webhook (`Settings > Webhooks`) pointing to `http://<your-jenkins-host>/github-webhook/` so every push triggers a build.
5. In Jenkins, add a credential of type "Secret text" with ID `render-deploy-hook-url` containing your Render deploy hook URL (see below).

## Render setup

1. Create a new **Static Site** (or Web Service) on Render, connected to this GitHub repo.
2. Set the publish directory to `public`.
3. Under Settings, copy the **Deploy Hook URL** — this is what Jenkins calls after tests pass.
4. Optionally enable Render's own "auto-deploy on push" as a fallback.

## What runs on every push

1. Checkout code
2. `npm ci`
3. `tsc --noEmit` — TypeScript compile/type-check gate
4. Install Playwright browsers
5. `playwright test` — runs all `days/**/*.spec.ts`
6. Regenerate the tracker dashboard (`public/index.html`)
7. On `main` branch + all green: trigger Render deploy hook

## Adding a new day

Copy the pattern from `days/day-01`, write your 5 tests, commit, push. The tracker dashboard (deployed on Render) will automatically reflect the new day count and test count after the next Jenkins build.

# playwright-ts-daily

Daily TypeScript + Playwright practice with a full CI/CD pipeline:

**GitHub → Jenkins (typecheck + tests) → Render (dashboard)**

## What it does

- You add one folder per day: `days/day-NN/dayNN.spec.ts`.
- Each day contains ~5 Playwright + TypeScript programs/tests.
- Jenkins runs `tsc --noEmit` and `playwright test` on every push.
- The tracker script (`scripts/update-tracker.ts`) regenerates a static
  dashboard in `public/index.html` and `tracker.json`.
- If the build is on `main` and green, Jenkins triggers a Render deploy hook.

## Structure
