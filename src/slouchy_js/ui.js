/*
 * Copyright(C) 2018 Hugo Rosenkranz
 *
 * This Source Code Form is subject to the terms of the
 * Mozilla Public License, v. 2.0. If a copy of the MPL
 * was not distributed with this file, You can obtain one at
 * http://mozilla.org/MPL/2.0/.
 */

// Instructions
const INS = {
  idle:"Not Monitoring",
  straight:"Stand Straight",
  slouch:"Slouch",
  monitoring:"Slouchy will keep an eye on your posture",
  error:"An error occurred :(",
  training:"Processing pictures",
  load_model:"Loading Neural Network",
  steemconnect:"Connecting"
};

// Sub Instructions
const subIns = {
  idle:"Press get started to record your posture",
  ready:"Slouchy is ready to record your posture",
  front:"Look forward",
  left:"Look left",
  right:"Look right",
  back:"Lean back",
  monitoring:"Let this tab open and you'll be notify if you are slouching",
  error:"Try reloading the page",
  loading:"Please wait..."
};

const trainingBtnText = {
  idle:"Get Started",
  ready:"Monitor",
  training:"Training",
  monitoring:"Retrain"
};

// Caption
let instruct;
let subInstruct;
let welcomeCaption;
let usernameCaption;
let accountText;

// Div
let alertSlouch;

//Button
let trainingBtn;
let loginBtn;
let savingBtn;

// Scroll to html anchor
function jump(h){
  let top = document.getElementById(h).offsetTop; //Getting Y of target element
  window.scrollTo(0, top);                        //Go there directly or some transition
}

// Change Button when Training
function ui_train(){
  trainingBtn.innerHTML = trainingBtnText.training;
  trainingBtn.disabled = true;
}

// Change instructions during training  (could be done in a better way I think)
function ui_anim(current_iter, total_iter){

  instruct.innerHTML = INS.straight;

  if(current_iter >= total_iter-1){
    instruct.innerHTML = INS.training;
    subInstruct.innerHTML = subIns.loading;
  }else{
    if(current_iter % (total_iter/2) == 0){
      subInstruct.innerHTML = subIns.front;
    }else if(current_iter % (total_iter/4) == 0){
      subInstruct.innerHTML = subIns.front;//subIns.back;
    }else if(current_iter % (total_iter/2+total_iter/4+total_iter/8) == 0){
      subInstruct.innerHTML = subIns.right;
    }else if(current_iter % (total_iter/4+total_iter/8) == 0){
      subInstruct.innerHTML = subIns.right;
    }else if(current_iter % (total_iter/8) == 0){
      subInstruct.innerHTML = subIns.left;
    }

  // changing 1 picture ahead to let the time for the user to change posture
  if(current_iter >= (total_iter/2)-1){
      instruct.innerHTML = INS.slouch;
    }
  }
}

// Init UI
function ui_idle(hasTrain){
  if(hasTrain){
    trainingBtn.innerHTML = trainingBtnText.ready;
    subInstruct.innerHTML = subIns.ready;
  }
  else{
    trainingBtn.innerHTML = trainingBtnText.idle;
    subInstruct.innerHTML = subIns.idle;
  }

  trainingBtn.disabled = false;

  instruct.innerHTML = INS.idle;

  alertSlouch.style.visibility = 'hidden';
}

// An error occured...
function ui_error(error){
  console.error(error);

  trainingBtn.innerHTML = trainingBtnText.idle;
  trainingBtn.disabled = true;

  instruct.innerHTML = INS.error;
  subInstruct.innerHTML = error;//subIns.error;
}

// Inform the user that he's been monitored in background and can switch tab
function ui_background(){
  trainingBtn.innerHTML = trainingBtnText.monitoring;
  trainingBtn.disabled = false;

  instruct.innerHTML = INS.monitoring;
  subInstruct.innerHTML = subIns.monitoring;
}

// Show alert and notification if slouching
function ui_monitor(is_slouchy){
  if(is_slouchy){
    alertSlouch.style.visibility = 'visible';
    notifySlouching();
  }else {
    alertSlouch.style.visibility = 'hidden';
  }
}

function ui_loading(message){
  instruct.innerHTML = INS[message];
  subInstruct.innerHTML = subIns.loading;
  trainingBtn.disabled = true;
}

function ui_account(manager){
  //console.log(manager)
  if(manager.HasLoggedIn()){

    accountText.style.display = 'none';
    loginBtn.innerHTML = "Logout";
    usernameCaption.innerHTML = manager.account.name;
    welcomeCaption.style.display = 'block';
  }else{

    accountText.style.display = 'block';
    loginBtn.innerHTML = "Login";
    welcomeCaption.style.display = 'none';
  }
}

// Show slouchy notification or ask for permission
function notifySlouching() {

  if (Notification.permission !== "granted")
    Notification.requestPermission();
  else {

    var notification = new Notification('Got you', {
      icon: './style/img/dr_ha.png',
      body: "It seems that you are slouching !",
    });

    notification.onclick = function () {
      window.open("./#risk");
    };
  }
}
