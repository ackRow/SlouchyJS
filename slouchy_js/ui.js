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
      loading:"Processing pictures..."
};

// Sub Instructions
const subIns = {
      idle:"Press get started to record your posture",
      front:"Look forward",
      left:"Look left",
      right:"Look right",
      back:"Lean back",
      monitoring:"Let this tab open and you'll be notify if you are slouching",
      error:"Try reloading the page",
      loading:"Please wait",
};

let instruct;
let subInstruct;
let alertSlouch;

// Scroll to html anchor
function jump(h){
    let top = document.getElementById(h).offsetTop; //Getting Y of target element
    window.scrollTo(0, top);                        //Go there directly or some transition
}

// Change instructions during training  (could be done in a better way I think)
function ui_anim(ctr_pic){

  instruct.innerHTML = INS.straight;

  if(ctr_pic >= NB_PIC-1){
    instruct.innerHTML = INS.loading;
    subInstruct.innerHTML = subIns.loading;
  }else{
    if(ctr_pic % (NB_PIC/2) == 0){
      subInstruct.innerHTML = subIns.front;
    }else if(ctr_pic % (NB_PIC/4) == 0){
      subInstruct.innerHTML = subIns.front;//subIns.back;
    }else if(ctr_pic % (NB_PIC/2+NB_PIC/4+NB_PIC/8) == 0){
      subInstruct.innerHTML = subIns.right;
    }else if(ctr_pic % (NB_PIC/4+NB_PIC/8) == 0){
      subInstruct.innerHTML = subIns.right;
    }else if(ctr_pic % (NB_PIC/8) == 0){
      subInstruct.innerHTML = subIns.left;
    }

  // changing 1 picture ahead to let the time for the user to change posture
  if(ctr_pic >= (NB_PIC/2)-1){
      instruct.innerHTML = INS.slouch;
    }
  }

}

// Init UI
function ui_idle(){
  instruct.innerHTML = INS.idle;
  subInstruct.innerHTML = subIns.idle;
  alertSlouch.style.visibility = 'hidden';
}

// An error occured...
function ui_error(error){
  console.error(error);
  instruct.innerHTML = INS.error;
  subInstruct.innerHTML = error;//subIns.error;
}

// Inform the user that he's been monitored in background and can switch tab
function ui_background(){
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


// Show slouchy notification or ask for permission
function notifySlouching() {

  if (Notification.permission !== "granted")
    Notification.requestPermission();
  else {

    var notification = new Notification('Got you', {
      icon: './style/img/notif.png',
      body: "It seems that you are slouching !",
    });

    notification.onclick = function () {
      window.open("https://deari.app/SlouchyJS/#risk");
    };

  }
}