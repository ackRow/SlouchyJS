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

const bckgrndPicInterval = 5000; // 5s

let STOP;
let canvas;
let webcam;


/** Helper Functions **/

function jump(h){
    let top = document.getElementById(h).offsetTop; //Getting Y of target element
    window.scrollTo(0, top);                        //Go there directly or some transition
}

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




/** Main Functions **/

function backgroundMonitoring(){

  STOP = false;
  ui_background();
  //then = Date.now(); // Record time for statistics

  bckgrndPic();
}


function startTraining(){
  STOP = false;

  queryTrainingData();
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
