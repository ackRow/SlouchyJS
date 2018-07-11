"use strict";
"version 0.2.0";

/*
 * Copyright(C) 2018 Hugo Rosenkranz
 *
 * This Source Code Form is subject to the terms of the
 * Mozilla Public License, v. 2.0. If a copy of the MPL
 * was not distributed with this file, You can obtain one at
 * http://mozilla.org/MPL/2.0/.
 */

const monitorInterval = 5000; // time in milliseconds between each posture check

let STOP;
let canvas;
let webcam;


/** Webcam Helper Functions (Training + Monitoring) **/

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


/** Helper Functions **/

function loadWebCam(){
  webcam.getMediaStream().catch(error => jump("htu"))
}

function askPermission(){
  if (!Notification) {
    alert('Desktop notifications not available in your browser. Try Google Chrome.');
    return;
  }

  if (Notification.permission !== "granted"){
    jump("info");
    Notification.requestPermission();
  }else{
    /* If the user has already accepted the notification permission
      We can assume that he already knows the website and load the webcam directly.
    */
    loadWebCam();
  }
}

function isChrome(){
  let isChromium = window.chrome;
  let winNav = window.navigator;
  let vendorName = winNav.vendor;
  let isOpera = typeof window.opr !== "undefined";
  let isIEedge = winNav.userAgent.indexOf("Edge") > -1;
  let isIOSChrome = winNav.userAgent.match("CriOS");

  return isChromium !== null &&
          typeof isChromium !== "undefined" &&
          vendorName === "Google Inc." &&
          isOpera === false &&
          isIEedge === false;
}

// Wrapper
function canUseWebcamTo(func){
  if(!isChrome()){
    alert("You must use Google Chrome");
  }else if(!webcam.HasWebcamAccess()){
    webcam.getMediaStream().then(success => func()).catch(error => jump("htu"));
  }else{
    func();
  }
}


/** Main Functions **/

function backgroundMonitoring(){

  STOP = false;
  //then = Date.now(); // Record time for statistics

  canUseWebcamTo(takeMonitoringPhotos);

  ui_background();
}


function startTraining(){
  STOP = false;

  canUseWebcamTo(queryTrainingData);
}


function stop(){
  STOP = true;

  webcam.stop();
  ui_idle();
}



/** Init Function **/

window.onload = function(){

  webcam = new WebCam(document.getElementById("video"), document.getElementById("myCanvas")); // hidden canvas to process captured photo

  askPermission(); /* If the user hasn't accepted one of the permissions
  //                    He will be redirected to Information section. */
  //loadWebCam(); // load webcam directly for tests

  instruct = document.getElementById("instruct");
  subInstruct = document.getElementById("subInstruct");

  alertSlouch = document.getElementById("alertSlouch");

  ui_idle(); // Setting up labels...
}
