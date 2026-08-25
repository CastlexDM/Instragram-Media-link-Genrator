# Instagram Media Linker — Stage 2B Live Provider

Next.js app for organizing publicly available Instagram profile media into a copy-friendly table.

## Live Public-Profile Provider

This version uses the Apify `scraper-engine/instagram-api-scraper` Actor as the server-side provider. The Actor accepts public Instagram profile URLs/usernames and supports separate post/reel result modes.

The Apify API is called **only from the Next.js server**, so your Apify token is never exposed to the browser.

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

## Screenshots

### 1. Instagram Media Linker — Main Interface

The main interface provides a simple search experience for entering a public Instagram profile and selecting the type of media to retrieve.

<img width="1917" height="1015" alt="image" src="https://github.com/user-attachments/assets/2a34c0a3-4ecf-47b5-a2d1-b297b6bf6ad0" />
<img width="1917" height="1020" alt="image" src="https://github.com/user-attachments/assets/82492f2f-c5c5-4170-82a2-b97878549861" />


### 2. Media Results Table

Retrieved public Instagram media is organized into a clean, copy-friendly table, making it easier to work with the returned media and Instagram permalink information.

<img width="1917" height="1015" alt="image" src="https://github.com/user-attachments/assets/21a14234-cba6-4553-8503-83292b0a93df" />
<img width="887" height="627" alt="image" src="https://github.com/user-attachments/assets/271c2ea9-9b62-44f5-bb43-82dd2ecbcb68" />


### 3. Media Selection / Result View

The result interface provides an organized view of the available public media returned by the provider.

<img width="542" height="910" alt="image" src="https://github.com/user-attachments/assets/e2297057-139b-43b6-9709-cac1a8c5c47f" />

## Notes

* Only public-profile data returned by the provider is used.
* Private/restricted profiles may return no public media.
* Media URLs can be temporary CDN URLs and may expire; the Instagram permalink remains the stable page link.
* The app currently requests up to 100 results per media type per search. The backend supports up to 2400 per type.
* Use the service in accordance with Instagram/Meta terms, Apify terms, and applicable law.

## Project

**Instagram Media Linker — Stage 2B**

A Next.js-based tool for organizing publicly available Instagram profile media into an easy-to-use, copy-friendly interface.
