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

### 1. Arrive at the application main page, and click the bottom 'Choose File' in order to first upload an individual (e.g. Steve Irwin)
<img width="1440" height="900" alt="Screenshot 2026-01-08 at 6 42 51 PM" src="https://github.com/user-attachments/assets/1b50a87e-dce8-4401-877b-a36dc682cff9" />
<img width="1440" height="900" alt="Screenshot 2026-01-08 at 6 45 31 PM" src="https://github.com/user-attachments/assets/623c9059-bbd8-4997-9e97-d34b5b3885dc" />

---
### 2. 
#### 2.1 Once the image is selected, click 'Upload to Database' to upload the user to the central database
<img width="1440" height="900" alt="Screenshot 2026-01-08 at 6 56 53 PM" src="https://github.com/user-attachments/assets/83b32877-4494-4aba-b43b-b220761b79c8" />

#### 2.2 The image is now uploaded, and uploaded of Steve Irwin can be used for verification

---
### 3. Click the top 'Choose File' in order to upload an image-to-verify of Steve Irwin
<img width="1440" height="900" alt="Screenshot 2026-01-08 at 8 20 20 PM" src="https://github.com/user-attachments/assets/616e3795-39b6-4957-92dc-8e7ba349eb07" />

### 4. Once the image is selected, click 'Authenticate Image' to verify the image identity against the central database
<img width="1440" height="900" alt="Screenshot 2026-01-08 at 8 22 53 PM" src="https://github.com/user-attachments/assets/8ff99e97-6f6b-4697-a5b7-4f34d94a2130" />

### 5. Facial authentication attempts for a user not first added to the database (e.g. Gordon Ramsay), will gracefully fail
<img width="1440" height="900" alt="Screenshot 2026-01-08 at 8 31 12 PM" src="https://github.com/user-attachments/assets/e5386b1f-ad13-4441-b5fd-01201b2f0143" />
