import defaultImageSource from './start.png';
import { useEffect, useState } from 'react';
import './App.css';

const uuid = require('uuid');
const API_URL = 'https://04zc8qo7og.execute-api.us-east-1.amazonaws.com/dev';

function App() {
  const [activeMode, setActiveMode] = useState('verify');
  const [authImage, setAuthImage] = useState(null);
  const [registrationImage, setRegistrationImage] = useState(null);
  const [authPreview, setAuthPreview] = useState(defaultImageSource);
  const [registrationPreview, setRegistrationPreview] = useState(defaultImageSource);
  const [authMessage, setAuthMessage] = useState({
    type: 'neutral',
    text: 'Choose a photo to check it against the registered faces.',
  });
  const [registrationMessage, setRegistrationMessage] = useState({
    type: 'neutral',
    text: 'Add a face to the database for future authentication.',
  });
  const [busyAction, setBusyAction] = useState(null);

  useEffect(() => {
    if (!authImage) {
      setAuthPreview(defaultImageSource);
      return undefined;
    }

    const previewUrl = URL.createObjectURL(authImage);
    setAuthPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [authImage]);

  useEffect(() => {
    if (!registrationImage) {
      setRegistrationPreview(defaultImageSource);
      return undefined;
    }

    const previewUrl = URL.createObjectURL(registrationImage);
    setRegistrationPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [registrationImage]);

  async function sendImage(event) {
    event.preventDefault();
    if (!authImage || busyAction) return;

    setBusyAction('authenticate');
    setAuthMessage({ type: 'loading', text: 'Checking this face…' });

    try {
      const visitorImageName = uuid.v4();
      const uploadResponse = await fetch(
        `${API_URL}/input-pic-bucket/${visitorImageName}.jpeg`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'image/jpeg' },
          body: authImage,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error('The image could not be uploaded. Please try again.');
      }

      const params = new URLSearchParams({
        objectKey: `${visitorImageName}.jpeg`,
      });
      const authResponse = await fetch(
        `${API_URL}/employee?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      if (!authResponse.ok) {
        throw new Error('Authentication is temporarily unavailable. Please try again.');
      }

      const result = await authResponse.json();
      if (result.Message === 'Success') {
        setAuthMessage({
          type: 'success',
          text: `Welcome, ${result.firstName} ${result.lastName}. Your identity was verified.`,
        });
      } else {
        setAuthMessage({
          type: 'failure',
          text: 'No match found. Make sure this person has been added to the database.',
        });
      }
    } catch (error) {
      console.error(error);
      setAuthMessage({
        type: 'failure',
        text: error.message || 'We could not process this image. Please try again.',
      });
    } finally {
      setBusyAction(null);
    }
  }

  async function uploadToCentralS3(event) {
    event.preventDefault();
    if (!registrationImage || busyAction) return;

    setBusyAction('register');
    setRegistrationMessage({ type: 'loading', text: 'Adding this face…' });

    try {
      const response = await fetch(
        `${API_URL}/central-image-bucket/${encodeURIComponent(registrationImage.name)}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'image/jpeg' },
          body: registrationImage,
        }
      );

      if (!response.ok) {
        throw new Error('The image could not be added. Please try again.');
      }

      setRegistrationMessage({ type: 'success', text: 'Image added to the database successfully' });
    } catch (error) {
      console.error(error);
      setRegistrationMessage({
        type: 'failure',
        text: error.message || 'We could not add this image. Please try again.',
      });
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Brother Eye home">
          <span className="brand-mark" aria-hidden="true">
            <span />
          </span>
          <span>brother<span className="brand-accent">eye</span></span>
        </a>
        <nav className="mode-switch" aria-label="Choose an action">
          <button
            className={`mode-button ${activeMode === 'verify' ? 'mode-button-active' : ''}`}
            type="button"
            aria-pressed={activeMode === 'verify'}
            onClick={() => setActiveMode('verify')}
          >
            Verify
          </button>
          <button
            className={`mode-button ${activeMode === 'add' ? 'mode-button-active' : ''}`}
            type="button"
            aria-pressed={activeMode === 'add'}
            onClick={() => setActiveMode('add')}
          >
            Add
          </button>
        </nav>
        <span className="topbar-note">
          <span className="status-dot" />
          Maintenance mode
        </span>
      </header>

      <section className="intro">
        <h1>{activeMode === 'verify' ? 'Recognize the right face, every time' : 'Add someone new.'}</h1>
        <p className="intro-copy">
          {activeMode === 'verify'
            ? 'Check a photo against registered faces.'
            : 'Register a face for future authentication.'}
        </p>
      </section>

      <section className="workflow-layout" aria-label="Maintenance status and face identity">
        <aside className="maintenance-card" aria-label="Maintenance notice">
          <span className="maintenance-icon" aria-hidden="true">!</span>
          <div>
            <p className="maintenance-label">SERVICE NOTICE</p>
            <h2>Currently offline</h2>
            <p>
              Brother Eye is no longer live due to maintenance purposes. Live face
              verification and registration are unavailable.
            </p>
          </div>
        </aside>

        <section className="workflow" aria-label="Face identity actions">
          {activeMode === 'verify' ? (
            <article className="workflow-card authentication-card">
          <div className="card-heading">
            <div className="step-icon verify-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M4 8V5h3M17 5h3v3M20 16v3h-3M7 19H4v-3" />
                <circle cx="12" cy="10" r="3" />
                <path d="M6.5 18c.8-2.4 2.7-3.7 5.5-3.7s4.7 1.3 5.5 3.7" />
              </svg>
            </div>
            <div>
              <span className="step-label"></span>
              <h2>Verify identity</h2>
            </div>
          </div>

          <p className="card-description">
            Upload a photo and we’ll check it against registered faces.
          </p>

          <form onSubmit={sendImage}>
            <label className="upload-zone" htmlFor="auth-image">
              <span className="upload-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v5h14v-5" />
                </svg>
              </span>
              <span className="upload-title">
                {authImage ? authImage.name : 'Choose a photo to verify'}
              </span>
              <span className="upload-hint">
                {authImage ? 'Select another photo' : 'JPG, PNG or JPEG'}
              </span>
              <input
                id="auth-image"
                type="file"
                accept="image/*"
                onChange={(event) => setAuthImage(event.target.files[0] || null)}
              />
            </label>

            <div className="preview-frame">
              <img
                className={authImage ? 'preview-image' : 'preview-image preview-placeholder'}
                src={authPreview}
                alt={authImage ? 'Selected photo preview' : 'Face preview placeholder'}
              />
              <span className="preview-caption">
                {authImage ? 'READY TO VERIFY' : 'PHOTO PREVIEW'}
              </span>
            </div>

            <button
              className="action-button primary-button"
              type="submit"
              disabled={!authImage || busyAction !== null}
            >
              {busyAction === 'authenticate' ? 'Verifying…' : 'Authenticate photo'}
              <span aria-hidden="true">→</span>
            </button>
          </form>

          <p className={`feedback feedback-${authMessage.type}`} role="status" aria-live="polite">
            <span className="feedback-indicator" aria-hidden="true" />
            {authMessage.text}
          </p>
            </article>
          ) : (
            <article className="workflow-card registration-card">
          <div className="card-heading">
            <div className="step-icon add-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <circle cx="9" cy="8" r="3.5" />
                <path d="M2.8 19c.5-3.1 2.6-4.8 6.2-4.8 1.6 0 2.9.4 3.9 1.1M18 11v8m-4-4h8" />
              </svg>
            </div>
            <div>
              <span className="step-label"></span>
              <h2>Add a face</h2>
            </div>
          </div>

          <p className="card-description">
            Register a new person so they can be recognized next time.
          </p>

          <form onSubmit={uploadToCentralS3}>
            <label className="upload-zone" htmlFor="registration-image">
              <span className="upload-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v5h14v-5" />
                </svg>
              </span>
              <span className="upload-title">
                {registrationImage ? registrationImage.name : 'Choose a photo to add'}
              </span>
              <span className="upload-hint">
                {registrationImage ? 'Select another photo' : 'JPG, PNG or JPEG'}
              </span>
              <input
                id="registration-image"
                type="file"
                accept="image/*"
                onChange={(event) => setRegistrationImage(event.target.files[0] || null)}
              />
            </label>

            <div className="preview-frame">
              <img
                className={registrationImage ? 'preview-image' : 'preview-image preview-placeholder'}
                src={registrationPreview}
                alt={registrationImage ? 'Selected photo preview' : 'Face preview placeholder'}
              />
              <span className="preview-caption">
                {registrationImage ? 'READY TO ADD' : 'PHOTO PREVIEW'}
              </span>
            </div>

            <div className="naming-note">
              <span className="note-icon" aria-hidden="true">i</span>
              <span>
                Please name the file <strong>Firstname_Lastname.jpg</strong> to ensure proper identification.
              </span>
            </div>

            <button
              className="action-button secondary-button"
              type="submit"
              disabled={!registrationImage || busyAction !== null}
            >
              {busyAction === 'register' ? 'Adding to database…' : 'Add to database'}
              <span aria-hidden="true">→</span>
            </button>
          </form>

          <div
            className={`feedback feedback-${registrationMessage.type} ${
              registrationMessage.type === 'success' ? 'feedback-prominent' : ''
            }`}
            role="status"
            aria-live="polite"
          >
            {registrationMessage.type === 'success' ? (
              <>
                <span className="feedback-check" aria-hidden="true">✓</span>
                <span className="feedback-copy">
                  <strong>{registrationMessage.text}</strong>
                  <span className="feedback-detail">
                    {registrationImage.name} is ready for future identity verification.
                  </span>
                </span>
              </>
            ) : (
              <>
                <span className="feedback-indicator" aria-hidden="true" />
                {registrationMessage.text}
              </>
            )}
          </div>
            </article>
          )}
        </section>
      </section>

      <footer className="page-footer">
        <span className="footer-mark" aria-hidden="true" />
        Images are sent to AWS for identity verification and registration.
      </footer>
    </main>
  );
}

export default App;
