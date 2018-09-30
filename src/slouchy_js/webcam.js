/*
 * Copyright(C) 2018 Hugo Rosenkranz
 *
 * This Source Code Form is subject to the terms of the
 * Mozilla Public License, v. 2.0. If a copy of the MPL
 * was not distributed with this file, You can obtain one at
 * http://mozilla.org/MPL/2.0/.
 */

/** Init and Take Picture from the WebCam **/
class WebCam {

  constructor(videoElmt, canvas) {
    this.videoElmt = videoElmt;
    this.canvas = canvas;
    this.hasWebcamAccess = false;
  }

  // Get access to the webcam (return a Promise)
  getMediaStream() {
    navigator.getUserMedia = ( navigator.getUserMedia ||
                     navigator.webkitGetUserMedia ||
                     navigator.mozGetUserMedia ||
                     navigator.msGetUserMedia);

    return window.navigator.mediaDevices.getUserMedia({video: true})
     .then(function(mediaStream)
     {
        this.hasWebcamAccess = true;
        
        // transmitting footage from the webcam to the html video
        this.videoElmt.srcObject = mediaStream;

        this.mediaStreamTrack = mediaStream.getVideoTracks()[0];
        // Allow us to extract image from the video stream
        this.imageCapture = new ImageCapture(this.mediaStreamTrack);

     }.bind(this))
     .catch(function(error)
      {
         this.hasWebcamAccess = false;
         throw "No webcam found";
      }.bind(this))
  }

  // Releasing the webcam
  stop() {
    if(this.hasWebcamAccess)
      this.mediaStreamTrack.stop();

    this.hasWebcamAccess = false;
  }

  // Weird way to convert a frame to an array of rgb pixel between 0 and 1 (return a Promise)
  takePicture(img_size) {
    return this.imageCapture.grabFrame().then(imageBitmap => {
      this.canvas.width = img_size;
      this.canvas.height = img_size;

      let ctx = this.canvas.getContext('2d');
      ctx.drawImage(imageBitmap, 0,0, this.canvas.width, this.canvas.height);
      let x = [];

      for(let i = 0; i < img_size; i++){
        x[i] = [];
        for(let j = 0; j < img_size; j++){
          let pixel = ctx.getImageData(j,i,1,1).data;

          // rgb is inverted for Keras pre trained model ?
          x[i][j] = [pixel[2]/255.0, pixel[1]/255.0, pixel[0]/255.0];
        }
      }
      return x;
    })
    .catch(error => {
      //console.error(error);
      throw "Webcam Overload";
    });
  }

  HasWebcamAccess() {
    return this.hasWebcamAccess;
  }

  getImageCapture() {
    return this.imageCapture;
  }

}