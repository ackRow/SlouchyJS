"use strict";
"version 0.6.0";

/*
 * Copyright(C) 2018 Hugo Rosenkranz
 *
 * This Source Code Form is subject to the terms of the
 * Mozilla Public License, v. 2.0. If a copy of the MPL
 * was not distributed with this file, You can obtain one at
 * http://mozilla.org/MPL/2.0/.
 */

const monitorInterval = 5000; // time in milliseconds between each posture check

let STOP = true; // Idle state
let canvas;

// Object
let webcam;
let neural_net;
let accountManager;

/** Webcam Helper Functions (Training + Monitoring) **/
let monitorTimeout;
let trainTimeout;

let recTime, recInterval, then, ctr_pic;

const NB_PIC = 200; // number training images
let X_train;
let Y_train;
let y;

// Take NB_PIC during recTime to train the neural network
function takeTrainingPhotos() {
  //if(!STOP) {
    //UI animate
    ui_anim(ctr_pic, NB_PIC);

    if (ctr_pic < NB_PIC){

      webcam.takePicture(neural_net.img_size).then(
        function(x) {
          X_train.push(x);
          Y_train.push(y);
        }).catch(error => {
          //ui_error(error);
          console.error(error);
          ctr_pic--;
        });

      ctr_pic++;
      if(ctr_pic >= NB_PIC/2){
        y = [0, 1];
      }

      trainTimeout = setTimeout(takeTrainingPhotos, recInterval);
    }else{

      neural_net.train(X_train, Y_train, NB_PIC, 5)
      .then(result => backgroundMonitoring())
      .catch(error => ui_error(error));
    }
  //}
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
  //if(!STOP){
    webcam.takePicture(neural_net.img_size).then(
      function(x) {
        ui_monitor(neural_net.predict(x) == 1.0);

      }).catch(error => {
        ui_error(error);
    });

    monitorTimeout = setTimeout(takeMonitoringPhotos, monitorInterval);
  //}
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
    webcam.getMediaStream().then(success => func()).catch(error => { 
      ui_error(error);
      jump("htu");
    });
  }else{
    func();
  }
}

/** Main Functions **/
function backgroundMonitoring(){
  STOP = false;
  ui_background();
  //then = Date.now(); // Record time for statistics

  canUseWebcamTo(takeMonitoringPhotos);

}

function startTraining(){
  STOP = false;
  ui_train();

  canUseWebcamTo(queryTrainingData);
}

function stop(){
  if(!STOP){
    STOP = true;
    clearTimeout(monitorTimeout);
    clearTimeout(trainTimeout);
    //webcam.stop();
    ui_idle(neural_net.HasTrain());
  }else if(webcam.HasWebcamAccess())
    webcam.stop();
}

function saveModel(){

  return neural_net.uploadModel('./models/', accountManager.getId()).then(
    function(result, err){
      if(!err){
        alert('Upload Successful');

      }else{
        ui_error(error);
      }
    })
}

function loadModel(user_id){
    // Try to load a model
    let url = './models/'+user_id+'/model.json';
    return tf.loadModel(url).then(function(result, error){
      if(!error){
        if(!STOP)
          stop();
        neural_net.setModel(result, true);
      }
    });
}

/** Init Function **/
function loadUIElement(){
  
  trainingBtn = document.getElementById("trainingBtn");
  trainingBtn.onclick = function(){
    if(neural_net.HasTrain() && STOP)
      backgroundMonitoring();
    else{
      clearTimeout(monitorTimeout);
      startTraining();
    }
  };

  loginBtn = document.getElementById("loginBtn");
  loginBtn.onclick = function(){
    if(accountManager.HasLoggedIn())
      accountManager.logout(ui_account)
    else
      window.location = accountManager.loginUrl();
  }

  savingBtn = document.getElementById("savingBtn");
  savingBtn.onclick = function(){
    if(neural_net.HasTrain() && accountManager.HasLoggedIn()){
      savingBtn.innerHTML = "Saving...";

      saveModel().then( res => {
        savingBtn.innerHTML = "Save";
      });
    }else if(!neural_net.HasTrain()){
      alert("Please click on Get Started");
    }else{
      alert("Please log in with your Steem account");
    }
  }

  instruct = document.getElementById("instruct");
  subInstruct = document.getElementById("subInstruct");
  welcomeCaption = document.getElementById("welcomeCaption");
  usernameCaption = document.getElementById("username");
  accountText = document.getElementById("accountText");

  alertSlouch = document.getElementById("alertSlouch");

  ui_loading("steemconnect");
}

window.onload = function(){

  webcam = new WebCam(document.getElementById("video"),
                      document.getElementById("myCanvas")); // hidden canvas to process captured photo

  neural_net = new NeuralNet(['STRAIGHT','SLOUCH'], 50); // classes and img_size
  neural_net.simpleCNN(); // creating a CNN (2 conv2d + pooling + 2 dense)
  neural_net.compile(tf.train.adam(0.005), 'logcosh')

  askPermission(); /* If the user hasn't accepted one of the permissions
  //                    He will be redirected to the information section. */
  //loadWebCam(); // load webcam directly for tests

  /* SteemConnect */
  accountManager = new AccountManager(sc2.Initialize({
                                      app: 'deari.app',
                                      callbackURL: 'https://slouchy.deari.app/redirect.php',
                                      scope: ['login']//['custom_json']
                                    }));

  /* UI element */
  loadUIElement();

  // Try to connect to Steem
  accountManager.retrieveUserInfo(new URL(window.location.href).searchParams,
    function(accManager){
      ui_account(accManager);
      if(accManager.HasLoggedIn()){
        ui_loading("load_model");
        loadModel(accManager.getId())
        .then(success => ui_idle(neural_net.HasTrain()))
        .catch(error => ui_idle(neural_net.HasTrain()));
      }else{
        ui_idle(neural_net.HasTrain());
      }                          
  });
}
