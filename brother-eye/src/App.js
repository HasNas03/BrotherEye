import defaultImageSource from './start.png';
import info from './info.png';
import { useState } from 'react';
// import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
// import Rules from './Rules';
import './App.css';

// UUID lib to generate a unique filename for visitor images (prevents different visitors from uploading 
// files with the same name)
const uuid = require('uuid');

function App() {

  // stores the file object selected by the user from <input type="file">
  // empty because no image has been selected yet
  const [image, setImage] = useState('');

  const [uploadResultMessage, setuploadResultMessage] = useState(
    'Please upload an image to be authenticated');

  // holds whether authentication succeeded
  const [isAuth, setAuth] = useState(false);


  // ============================================================
  // AUTH FLOW
  // ============================================================
  // Called when the user submits the "Authenticate Image" form.
  // 1. upload visitor image to S3 through API Gateway
  // 2. call authenticate() with the image's unique filename
  // 3. auth lambda searches rekognition collection
  // 4. atched id is looked up in dynamodb
  // 5. frontend receives success/failure
  // ============================================================
  function sendImage(e) {
    e.preventDefault();

    // Generate a unique filename for this visitor image
    // e.g. "550e8400-e29b-41d4-a716-446655440000"
    const visitorImageName = uuid.v4();

    // upload the visitor image
    fetch(
      `https://04zc8qo7og.execute-api.us-east-1.amazonaws.com/dev/input-pic-bucket/${visitorImageName}.jpeg`,
      {
        method: 'PUT', // PUT to upload/create the image
        headers: {
          'Content-Type': 'image/jpeg'
        },
        body: image
      }
    )

    // authenticate that S3 image
    .then(async () => {
      // authenticate() will tell the auth lambda which s3 object
      // should be checked
      const response = await authenticate(visitorImageName);
      if (response.Message === 'Success') {
        // mark authentication as successful
        setAuth(true);
        // display the person name returned
        setuploadResultMessage(
          `Facial Authentication successful, welcome ${response['firstName']} ${response['lastName']}`);
      }

      // no registered person matched
      else {
        setAuth(false);
        setuploadResultMessage(
          'Facial Authentication failed'
        );
      }
    })

    // handles errors like failed upload/API request
    .catch(error => {
      setAuth(false);
      setuploadResultMessage(
        'Auth error. Cannot detect a face');
      console.error(error);
    });
  }


  // ============================================================
  // CALL AUTH LAMBDA
  // ============================================================
  // - visitor image already uploaded to s3
  // - function sends the S3 object key/filename to the authentication API
  //   so lambda knows which visitor image in S3 to process

  async function authenticate(visitorImageName) {

    // build query parameter
    const params = new URLSearchParams({
      objectKey: `${visitorImageName}.jpeg`
    });


    // construct the API Gateway URL
    //
    // final URL will look roughly like /employee?objectKey=550e8400-....jpeg
    const requestUrl =
      `https://04zc8qo7og.execute-api.us-east-1.amazonaws.com/dev/employee?${params.toString()}`;


    // call the authentication API/Lambda
    return await fetch(requestUrl, {
      method: 'GET', // we're requesting an authentication result
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',}

    })

    .then(response => response.json())
    .then((data) => {
      return data;
    })
    .catch(error => console.error(error));
  }


  // ============================================================
  // REGISTRATION FLOW
  // ============================================================
  // 1. uploads a known person's image to the central image s3 bucket via APIGW PUT
  // 2. the upload triggers the registration Lambda to index via rekognition and store in db
  
  function uploadToCentralS3(e) {
    e.preventDefault();
    // registration images keep their original filename
    const centralImageName = image.name;


    // upload registered persons image to the central S3 bucket
    fetch(
      `https://04zc8qo7og.execute-api.us-east-1.amazonaws.com/dev/central-image-bucket/${centralImageName}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'image/jpeg'},
        body: image
      }
    )

    // if upload succeeded
    .then(() => {
      setuploadResultMessage(
        'Image uploaded to central database successfully');
      console.log("uploaded");})

    // if upload failed
    .catch(error => {
      setuploadResultMessage(
        'Error uploading image to database');
      console.error(error);});
  }


  // ============================================================
  // FILE SELECTION HANDLER
  // ============================================================
  //
  // Runs whenever the user selects a file from either file input.
  // ============================================================
  function handleImageChange(e) {
    setImage(e.target.files[0]);
  }


  // ============================================================
  // USER INTERFACE
  // ============================================================
  return (
    <div className="App">

      <div className="icon-container">

        {/* Display information icon */}
        <img
          src={info}
          alt="Icon"
          className="icon"
        />


        {/* Instructions for visitor authentication */}
        <p className='icon2'>
          Authenticate Image:
          <br/><br/>

          Upload an image from your computer for facial authentication.
          If it is in the database, you will be authenticated!
        </p>


        {/* Instructions for registering a new person */}
        <p className='icon2'>
          Upload to Database:
          <br/><br/>

          In order to successfully authenticate a face, an image of
          the same face must be present in the database.

          Upload a facial image directly to the database in the format

          <b className='bold'>
            'Firstname_Lastname.filetype'
          </b>

          <br/>

          for future authentication!
        </p>

      </div>


      {/* Application title */}
      <h2 className='title'>
        Brother Eye
      </h2>


      {/* Intro text */}
      <h4 style={{color: 'white'}}>
        Welcome, please read the info page before using the application.
        Happy authenticating!
      </h4>


      {/* ======================================================
          AUTHENTICATION FORM

          Selecting file → handleImageChange()
          Clicking button → sendImage()
          ====================================================== */}
      <form onSubmit={sendImage}>

        {/* Store selected visitor image in `image` state */}
        <input
          type='file'
          name='image'
          onChange={handleImageChange}
        />

        {/* Submitting this form calls sendImage() */}
        <button
          className='button'
          type='submit'
        >
          Authenticate Image
        </button>

      </form>


      {/* ======================================================
          REGISTRATION FORM

          Selecting file → handleImageChange()
          Clicking button → uploadToCentralS3()

          Uploading to central S3 can trigger registration Lambda.
          ====================================================== */}
      <form onSubmit={uploadToCentralS3}>

        <input
          type='file'
          name='centralImage'
          onChange={handleImageChange}
        />

        <button
          className='button2'
          type='submit'
        >
          Upload to Database
        </button>

      </form>


      {/* Display success/failure message.
          CSS class changes depending on authentication result. */}
      <div className={`message ${isAuth ? 'success' : 'failure'}`}>
        {uploadResultMessage}
      </div>


      <div className='images'>

        {/* Preview the user's selected image.

            If an image has been selected:
                URL.createObjectURL(image)
                creates a temporary browser URL so it can be displayed.

            Otherwise:
                show start.png.
        */}
        <img
          src={
            image
              ? URL.createObjectURL(image)
              : defaultImageSource
          }
          alt="Visitor Image"
          height={350}
          width={350}
          className='image'
        />

      </div>

    </div>
  );
}


// Makes App available to the rest of the React application.
export default App;