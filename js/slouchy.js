const backgrndPicInterval = 5000; // 5s

let STOP;
let hasWebcamAccess = false;
let canvas;

function backgroundMonitoring(){

  console.log("in background");
  STOP = false;
  //then = Date.now(); // Record time for statistics

  if(!hasWebcamAccess){
    getMediaStream(false);
  }

  backPic(); // interval of backgrndPicInterval
}

function jump(h){
    let top = document.getElementById(h).offsetTop; //Getting Y of target element
    window.scrollTo(0, top);                        //Go there directly or some transition
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
    getMediaStream(false); // load WebCam without training
  }
}

function startTraining(){
  if(!isChrome()){
    alert("You must use Google Chrome"); // temporary
    return;
  }
  STOP = false;
  if(hasWebcamAccess)
    queryTrainingData();
  else
    getMediaStream(true);
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

window.onload = function(){

  //askPermission(); /* If the user hasn't accepted one of the permissions
  //                    He will be redirected to Information section. */
  getMediaStream(false); // load WebCam directly for local test

  // hidden canvas to process captured photo
  canvas = document.getElementById("myCanvas");

  instruct = document.getElementById("instruct");
  subInstruct = document.getElementById("subInstruct");

  alertSlouch = document.getElementById("alertSlouch");

  ui_idle(); // Setting up labels...

  if(!isChrome()){ // temporary
    STOP = true;
    jump("htu");
  }
}
