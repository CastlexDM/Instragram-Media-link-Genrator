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

![Instagram Media Linker Main Interface](https://github.com/user-attachments/assets/cac0d98c-8419-4b79-b801-9149bc36fe0a)

### 2. Media Results Table

Retrieved public Instagram media is organized into a clean, copy-friendly table, making it easier to work with the returned media and Instagram permalink information.

![Instagram Media Results](https://github.com/user-attachments/assets/e1979dc1-b39d-4352-9434-9010ff7cd721)

### 3. Media Selection / Result View

The result interface provides an organized view of the available public media returned by the provider.

![Instagram Media Selection](https://github.com/user-attachments/assets/7b6ad15d-7eff-48eb-9b34-b52b5771fe76)

## Notes

* Only public-profile data returned by the provider is used.
* Private/restricted profiles may return no public media.
* Media URLs can be temporary CDN URLs and may expire; the Instagram permalink remains the stable page link.
* The app currently requests up to 100 results per media type per search. The backend supports up to 2400 per type.
* Use the service in accordance with Instagram/Meta terms, Apify terms, and applicable law.

## Project

**Instagram Media Linker — Stage 2B**

A Next.js-based tool for organizing publicly available Instagram profile media into an easy-to-use, copy-friendly interface.
