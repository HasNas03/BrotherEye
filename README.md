# Brother Eye

This repository contains a React app for face verification and registration, backed by AWS services. The hosted demo is currently unavailable; see [Operational Demo](#4-operational-demo) for screenshots.

## 1. Overview

Brother Eye lets users register a face and verify it later. The frontend is built with React; the AWS backend uses Lambda, API Gateway, S3, Rekognition, and DynamoDB.

## Run Locally

From the repository root, install dependencies and start the development server:

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000). To create a production build, run `npm run build`. Face registration and verification require the AWS backend.

## GitHub Pages

The GitHub Actions workflow builds the React app and syncs its production files to the repository root on each push to `main`. In the repository's **Settings → Pages**, choose **Deploy from a branch**, select `main`, and choose `/(root)`. The published app will replace the README as the repository's Pages homepage.

The workflow needs permission to push its generated site files. In **Settings → Actions → General → Workflow permissions**, allow read and write permissions. After pushing the workflow to `main`, wait for the **Build GitHub Pages site** workflow to finish.

---

## 2. System Architecture

The React frontend sends uploads and verification requests through API Gateway. Lambda functions use S3 to store images, Rekognition to index and compare faces, and DynamoDB to retrieve registered-person details.

---

## 3. What the Application Does

Use **Add** to register a face with an image named `Firstname_Lastname.jpg`. Use **Verify** to compare a photo against registered faces and view the authentication result.

---

## 4. Operational Demo

### 1. Select the 'Add' page to add an individual to the database
<img width="1440" height="787" alt="step1" src="https://github.com/user-attachments/assets/2fdf56af-2983-41e5-b3f0-87921e9c230e" />

### 2. Upon file upload, submit the image for future authentication
<img width="1440" height="788" alt="step2" src="https://github.com/user-attachments/assets/5687c239-04f5-4472-aa0f-d6ee121a92b0" />

### 3. For authentication, select the 'Verify' page and upload an image to verify individual access
<img width="1440" height="789" alt="step3" src="https://github.com/user-attachments/assets/06439abe-685c-46f8-a112-e7d453a3d054" />
