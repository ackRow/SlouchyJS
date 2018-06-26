// WebCam

navigator.getUserMedia = ( navigator.getUserMedia ||
                       navigator.webkitGetUserMedia ||
                       navigator.mozGetUserMedia ||
                       navigator.msGetUserMedia);

let mediaStreamTrack, imageCapture, video;

// Get access to the webcam
function getMediaStream(train)
{
   window.navigator.mediaDevices.getUserMedia({video: true})
   .then(function(mediaStream)
   {
       hasWebcamAccess = true;

       video = document.getElementById('video');
       video.srcObject = mediaStream;

       mediaStreamTrack = mediaStream.getVideoTracks()[0];
       imageCapture = new ImageCapture(mediaStreamTrack);

       if(train){
         queryTrainingData(); // Start training
       }
   })
   .catch(error);
}

function error(error)
{
   //console.error('error:', error);
   hasWebcamAccess = false;
   jump("info");
}

// Weird way to convert a frame to an array of rgb pixel between 0 and 1
function loadPhoto()
{

  /*return imageCapture.takePhoto() // Get dataset for python neural net
  .then(blob => {
      let url = window.URL.createObjectURL(blob);
      return url;
  })
  .catch(error);*/

  // return a Promise
  return imageCapture.grabFrame().then(imageBitmap => {

     canvas.width = IMG_SIZE;
     canvas.height = IMG_SIZE;

     ctx = canvas.getContext('2d');
     ctx.drawImage(imageBitmap, 0,0, canvas.width, canvas.height);

     let x = [];

     for(let i = 0; i < IMG_SIZE; i++){
       x[i] = [];
       for(let j = 0; j < IMG_SIZE; j++){
         let pixel = ctx.getImageData(j,i,1,1).data;

         // rgb is inverted for Keras pre trained model ?
         x[i][j] = [pixel[2]/255.0, pixel[1]/255.0, pixel[0]/255.0];
       }
     }
      return x;
    })
    .catch(error => {
      console.log(error);
      throw "Stop training";
    });
};

// Stop the recording and training or monitoring
function stop(){

	STOP = true;
  hasWebcamAccess = false;
  ui_idle();

  mediaStreamTrack.stop();
}


let recTime, fpsInterval, then, ctr_pic;
let y;

// Take NB_PIC during recTime to train the neural network
function takeBunchPic(){

  //UI animate
  animInstruct(ctr_pic);

  if (ctr_pic < NB_PIC){

    loadPhoto().then(
      function(x) {
        X_train.push(x);
        Y_train.push(y);
      }).catch(error => {
        console.log(error);
      });

    ctr_pic++;
    if(ctr_pic >= NB_PIC/2){
      y = [0, 1];
    }

    if(!STOP)
      setTimeout(takeBunchPic, fpsInterval);

  }else{
    /*X_train.forEach(function(elmt){
      window.open(elmt, '_blank');
    });*/
    train();
  }
}

// Launch the training sequence
function queryTrainingData(){

  // UI
  instruct.innerHTML = INS.straight;

  // variable
  ctr_pic = 0;
  recTime = 30000;// ms
  fpsInterval = recTime/NB_PIC;

  //then = Date.now(); show progress ?

  //neural net
  y = [1, 0];
  X_train = [];
  Y_train = [];

  takeBunchPic();
}


// take picture in the background to check the posture
function backPic(){

	if(!STOP){

    loadPhoto().then(
      function(x) {
        if(predict(x) == 1.0){
    	    alertSlouch.style.visibility = 'visible';
    	    notifySlouching();
    	  }else {
    	    alertSlouch.style.visibility = 'hidden';
    	  }
      }).catch(error => {
        console.log(error);
    });

	  setTimeout(backPic, backgrndPicInterval);
	}

}
