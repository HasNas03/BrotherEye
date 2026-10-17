// NewPage.js
import React from 'react';

function Rules() {
  return (
    <div>
      <h2>New Page</h2>
      <p className='instructions'>
          Authenticate Image: <br/>Upload an image from your computer to be facially authenticated. If it is in the backend database, 
          you will be authenticated!
          <br/><br/>
          Upload to Database: <br/>In order to successfully authenticate a face, an image of the same face must be present in the 
          database. This option allows you to upload an image directly to the database for future authentications of the same face.
      </p>
    </div>
  );
}

export default Rules;