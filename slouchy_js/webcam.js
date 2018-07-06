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
    let myClass = this;

    navigator.getUserMedia = ( navigator.getUserMedia ||
                     navigator.webkitGetUserMedia ||
                     navigator.mozGetUserMedia ||
                     navigator.msGetUserMedia);

    return window.navigator.mediaDevices.getUserMedia({video: true})
     .then(function(mediaStream)
     {
        myClass.hasWebcamAccess = true;

         //video = document.getElementById('video');
        myClass.videoElmt.srcObject = mediaStream;

        myClass.mediaStreamTrack = mediaStream.getVideoTracks()[0];
        myClass.imageCapture = new ImageCapture(myClass.mediaStreamTrack);

     })
     .catch(function(error)
      {
         myClass.hasWebcamAccess = false;
         console.error(error);
      });
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
      console.error(error);
      throw "Stop training";
    });
  }

  HasWebcamAccess() {
    return this.hasWebcamAccess;
  }

  getImageCapture() {
    return this.imageCapture;
  }

}

/** Helper Functions **/

let recTime, recInterval, then, ctr_pic;
let y;

// Take NB_PIC during recTime to train the neural network
function takeTrainingPhotos() {
  if(!STOP) {
    //UI animate
    ui_anim(ctr_pic);

    if (ctr_pic < NB_PIC){

      webcam.takePicture(IMG_SIZE).then(
        function(x) {
          X_train.push(x);
          Y_train.push(y);
        }).catch(error => {
          ui_error(error);
        });

      ctr_pic++;
      if(ctr_pic >= NB_PIC/2){
        y = [0, 1];
      }

      setTimeout(takeTrainingPhotos, recInterval);

    }else{
      train();
    }
  }
}

// Launch the training sequence
function queryTrainingData() {
  ctr_pic = 0; // counter
  recTime = 30000;// ms
  recInterval = recTime/NB_PIC;

  //then = Date.now(); show progress ?

  //neural net
  y = [1, 0];
  X_train = [];
  Y_train = [];

  takeTrainingPhotos();
}


// take pictures each 5s to monitor posture in background
function takeMonitoringPhotos() {
  if(!STOP){
    webcam.takePicture(IMG_SIZE).then(
      function(x) {
        ui_monitor(predict(x) == 1.0);

      }).catch(error => {
        ui_error(error);
    });

    setTimeout(takeMonitoringPhotos, monitorInterval);
  }

}
