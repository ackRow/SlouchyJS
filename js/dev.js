/*
 * Copyright(C) 2018 Hugo Rosenkranz
 *
 * This Source Code Form is subject to the terms of the
 * Mozilla Public License, v. 2.0. If a copy of the MPL
 * was not distributed with this file, You can obtain one at
 * http://mozilla.org/MPL/2.0/.
 */

/** Functions for research and developement **/

let dataset_size = NB_PIC;

let straight_pic = [];
let slouchy_pic = [];

let i_pic;

// Helper function
function webCam2Blob(){
  return imageCapture.takePhoto()
  .then(blob => {
      return blob;
  })
  .catch(error);
}


function takeBunchPic_dataset(){

  //UI animate
  animInstruct((i_pic/dataset_size)*NB_PIC);

  let dataset = straight_pic;

  if(i_pic >= dataset_size/2){
    dataset = slouchy_pic;
  }

  if (i_pic < dataset_size){

    webCam2Blob().then(
      function(x) {
        dataset.push(x);
      }).catch(error => {
        console.log(error);
      });

    i_pic++;

    if(!STOP)
      setTimeout(takeBunchPic_dataset, 250);

  }else{
    straight_pic.forEach(function(elmt, i){
      download(elmt, i+"_straight.jpg", "image/jpg" );
    });
    slouchy_pic.forEach(function(elmt, i){
      download(elmt, i+"_slouchy.jpg", "image/jpg" );
    });
  }
}

// download your training pictures (e.g. to process them with Python)
function createDataset(nb_pic){
  STOP = false;
  if(!hasWebcamAccess){
    getMediaStream(false);
  }

  dataset_size = nb_pic;
  i_pic = 0;
  takeBunchPic_dataset();
}

// save trained neural net to your pc
function downloadNeuralNet(){
  model.save('downloads://my-slouchy-model');
}

// load custom neural net from url
function loadNeuralNet(url){
  tf.loadModel(url).then(function(result, error){
  if(!error){
    model = result;

    console.log("custom model successfully loaded ! ");
  }else
    console.error("error");
  });
}
