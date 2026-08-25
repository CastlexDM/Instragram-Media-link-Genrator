# Instagram Media Linker — Stage 2B Live Provider

Next.js app for organizing publicly available Instagram profile media into a copy-friendly table.

## Live public-profile provider

This version uses the Apify `scraper-engine/instagram-api-scraper` Actor as the server-side provider. The Actor accepts public Instagram profile URLs/usernames and supports separate post/reel result modes. Its API is called only from the Next.js server so the Apify token is never sent to the browser.

### Setup

1. Create an Apify account and get an API token from **API & Integrations**.
2. Create `.env.local` in this project by copying `.env.local.example`.
3. Set:

```env
APIFY_API_TOKEN=your_real_token
```

4. Run:

```bash
npm install
npm run dev
```

5. Open `http://localhost:3000`.

## Notes

- Only public-profile data returned by the provider is used.
- Private/restricted profiles may return no public media.
- Media URLs can be temporary CDN URLs and may expire; the Instagram permalink remains the stable page link.
- The app currently requests up to 100 results per media type per search. The backend supports up to 2400 per type.
- Use the service in accordance with Instagram/Meta terms, Apify terms, and applicable law.
"# Instragram-Media-link-Genrator" 
