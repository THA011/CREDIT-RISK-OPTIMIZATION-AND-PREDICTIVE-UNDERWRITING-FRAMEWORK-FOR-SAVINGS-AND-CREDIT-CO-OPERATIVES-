## Private Dashboard and Client Viewer

This project now includes a simple Firebase-backed workflow to manage portfolio drafts (text sections, images, videos) and share partial previews with clients.

### Files
- `dashboard.html` / `dashboard.js`: Owner-only dashboard to create/update projects, upload media, and generate a client viewer link.
- `viewer.html`: Client-facing page that shows a partial preview depending on project visibility.
- `firebase.js`: Holds Firebase configuration placeholders and a small init helper.

### Setup
1. Create a Firebase project.
2. In Project settings → General, create a Web App and copy the config.
3. Open `firebase.js` and replace placeholders in `window.firebaseAppConfig` with your values.
4. In Firestore, create a database in production mode.
5. In Storage, create a default bucket.

### Minimal Firestore Security Rules (adjust before production)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /projects/{projectId} {
      allow read: if true; // demo: everyone can read
      allow write: if request.auth != null && request.auth.token.email == 'owner@example.com';
    }
  }
}
```

### Minimal Storage Rules (adjust before production)
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /projects/{projectId}/{allPaths=**} {
      allow read: if true; // demo: everyone can view uploaded media
      allow write: if request.auth != null && request.auth.token.email == 'owner@example.com';
    }
  }
}
```

Replace `owner@example.com` with your Google account email. For production, implement proper role-based rules and client-specific authorization.

### Usage
1. Open `dashboard.html` in a modern browser.
2. Click Sign In and choose the owner Google account.
3. Fill Project ID, Title, choose `client` visibility for previews, add JSON sections, and upload images/videos.
4. Save Project. Use the viewer link to share: `viewer.html?project=YOUR_ID`.

### Notes
- Sections accept HTML for rich text.
- Media uploads store in Storage; their URLs are saved in Firestore.
- `viewer.html` shows:
  - private: no sections/media
  - client: first 1–2 sections and all media
  - public: all sections and media

# Freelance.Analytics.Statistics_011
Showcasing my data analysis and statistical prowess through SPSS, Python, and R projects. Open to freelance opportunities in data analytics, visualization, and statistical consulting.
https://colab.research.google.com/drive/1oAPU_smcoNNAQHfvJ10DRFe2qARvIOaV# 
Freelance.Analytics.Statistics_011## 

