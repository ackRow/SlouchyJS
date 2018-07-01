/*
 * Copyright(C) 2018 Hugo Rosenkranz
 *
 * This Source Code Form is subject to the terms of the
 * Mozilla Public License, v. 2.0. If a copy of the MPL
 * was not distributed with this file, You can obtain one at
 * http://mozilla.org/MPL/2.0/.
 */

navigator.getUserMedia = ( navigator.getUserMedia ||
                       navigator.webkitGetUserMedia ||
                       navigator.mozGetUserMedia ||
                       navigator.msGetUserMedia);

/** Init and Take Picture from the WebCam **/
class WebCam {

  constructor(videoELmt, canvas) {
    this.videoElmt = videoELmt;
    this.canvas = canvas;
    this.hasWebcamAccess = false;
  }

  // Get access to the webcam (return a Promise)
  getMediaStream()
  {
     return window.navigator.mediaDevices.getUserMedia({video: true})
       .then(function(mediaStream)
       {
           this.hasWebcamAccess = true;

           //video = document.getElementById('video');
           videoElmt.srcObject = mediaStream;

           this.mediaStreamTrack = mediaStream.getVideoTracks()[0];
           this.imageCapture = new ImageCapture(mediaStreamTrack);

       })
       .catch(function(error)
        {
           this.hasWebcamAccess = false;
           throw "Can't access webcam";
           //jump("info");
        });
  }

  // Releasing the webcam
  stop(){
    if(hasWebcamAccess)
      mediaStreamTrack.stop();
  }

  // Weird way to convert a frame to an array of rgb pixel between 0 and 1 (return a Promise)
  takePicture(img_size){
    return imageCapture.grabFrame().then(imageBitmap => {

     canvas.width = img_size;
     canvas.height = img_size;

     ctx = canvas.getContext('2d');
     ctx.drawImage(imageBitmap, 0,0, canvas.width, canvas.height);

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
      throw "Stop training";
    });
  }

}

/** Helper Functions **/

let recTime, recInterval, then, ctr_pic;
let y;

// Take NB_PIC during recTime to train the neural network
function takeBunchPic(){

  //UI animate
  animInstruct(ctr_pic);

  if (ctr_pic < NB_PIC){

    webcam.takePicture().then(
      function(x) {
        X_train.push(x);
        Y_train.push(y);
      }).catch(error => {
        console.error(error);
      });

    ctr_pic++;
    if(ctr_pic >= NB_PIC/2){
      y = [0, 1];
    }

    if(!STOP)
      setTimeout(takeBunchPic, recInterval);

  }else{
    train();
  }
}

// Launch the training sequence
function queryTrainingData(){

  ctr_pic = 0; // counter
  recTime = 30000;// ms
  recInterval = recTime/NB_PIC;

  //then = Date.now(); show progress ?

  //neural net
  y = [1, 0];
  X_train = [];
  Y_train = [];

  takeBunchPic();
}


// take pictures each 5s to monitor posture in background
function bckgrndPic(){

	if(!STOP){

    webcam.takePicture().then(
      function(x) {
        ui_monitor(predict(x) == 1.0);
        
      }).catch(error => {
        console.log(error);
    });

	  setTimeout(backPic, bckgrndPicInterval);
	}

}
