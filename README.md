# Brother Eye

### NOTE: This app is no longer live due to maintenance purposes. Please read the operational demo section for a visual walkthrough.
---
- [1. Overview](#1-overview)
- [2. System Architecture](#2-system-architecture)
- [3. What the Application Does](#3-what-the-application-does)
  - [3.1 Facial Authentication](#31-facial-authentication)
  - [3.2 Face Registration (Database Upload)](#32-face-registration-database-upload)
- [4. Operational Demo](#4-operational-demo)

---

## 1. Overview

Brother Eye is a serverless facial authentication system, fully managed by a Python/AWS backend and React frontend. It leverages **Amazon Rekognition** for facial comparison and indexing, and uses **AWS Lambda, API Gateway, S3, and DynamoDB** to form a scalable, event-driven backend architecture. Brother Eye serves as an elementary employee/visitor access authentication system.

The application allows users to:
- Register a user into the system via image for future authentication
- Authenticate a user against a stored database of known individuals

## Run Locally

The React application is located at the repository root. From this directory, run:

```bash
npm install
npm start
```

Then open [http://localhost:3000](http://localhost:3000). To create a production build, run `npm run build`.

---

## 2. System Architecture

**Frontend**
- React (single-page application)
- Files:
  - `App.js` – Main application logic
  - `App.css` – Styling
  - `start.png` – Default placeholder image
  - `info.png` – UI help icon

**Backend**
- AWS S3
  - **Employee Image Bucket**
    - Stores registered facial images
  - **Visitor Image Bucket**
    - Temporarily stores authentication images
- AWS API Gateway
  - Public REST API entry point
  - Routes requests to Lambda functions
  - Supports:
    - `PUT` for image uploads
    - `GET` for authentication requests
- AWS Lambda (Serverless)
  - Registration Lambda handles uploads to the employee image bucket
  - Authentication Lambda handles:
    - Sending uploaded images to Amazon Rekognition
    - Performing facial comparison
    - Querying DynamoDB for user details
    - Returning authentication result
- AWS Rekognition
  - Detects faces in uploaded images
  - Compares faces against stored images
  - Determines match confidence
- AWS DynamoDB
  - Stores employee metadata:
    - First name
    - Last name
    - Image reference key

---

## 3. What the Application Does

### 3.1 Facial Authentication
Users can upload a facial image to verify whether it exists in the database.

**Flow:**
1. User uploads an image from the UI
2. Image is stored in a temporary **visitor S3 bucket**
3. API Gateway triggers an **Authentication Lambda**
4. Lambda calls **Amazon Rekognition** to compare the face
5. If matched:
   - Employee details are retrieved from DynamoDB

   - Authentication success response is returned
6. If not matched:
   - Authentication failure response is returned

### 3.2 Face Registration (Database Upload)
Users can upload new facial images directly into the recognition database.

**Flow:**
1. User uploads an image from the UI (required naming format of Firstname_Lastname.jpeg)
2. Image is stored in the **central employee S3 bucket**
3. Image subsequently becomes part of the facial recognition dataset and added to DynamoDB

---

## 4. Operational Demo

### 1. Select the 'Add' page to add an individual to the database
<img width="1440" height="787" alt="step1" src="https://github.com/user-attachments/assets/2fdf56af-2983-41e5-b3f0-87921e9c230e" />

### 2. Upon file upload, submit the image for future authentication
<img width="1440" height="788" alt="step2" src="https://github.com/user-attachments/assets/5687c239-04f5-4472-aa0f-d6ee121a92b0" />

### 3. For authentication, select the 'Verify' page and upload an image to verify individual access
<img width="1440" height="789" alt="step3" src="https://github.com/user-attachments/assets/06439abe-685c-46f8-a112-e7d453a3d054" />

