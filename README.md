# AWY V3 — Always With You

## Deploy to Netlify
1. Upload the entire folder to your GitHub repository.
2. In Netlify, import the GitHub repository.
3. Build command: leave blank.
4. Publish directory: `.` (a single dot).
5. Deploy.
6. In Netlify: Site configuration → Environment variables, add:
   - `OPENAI_API_KEY` = your OpenAI API key
   - Optional: `OPENAI_MODEL` = `gpt-5.6-luna`
7. Redeploy.

## Important
Never put the OpenAI API key inside `src/app.js`, `index.html`, or GitHub.
The Netlify Function keeps the key server-side.

## Local testing
Install Netlify CLI, then:
npm install
netlify dev
