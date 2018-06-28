// UI

// Instructions
const INS = {
      idle:"Not Monitoring",
      straight:"Stand Straight",
      slouch:"Slouch",
      monitoring:"Slouchy will keep an eye on your posture",
      error:"An error occurred :("
};

// Sub Instructions
const subIns = {
      idle:"Press get started to record your posture",
      front:"Look forward",
      left:"Look left",
      right:"Look right",
      back:"Lean back",
      monitoring:"Let this tab open and you'll be notify if you are slouching",
      error:"Try reloading the page"
};

let instruct;
let subInstruct;
let alertSlouch;

// Change instructions during training  (could be done in a better way I think)
function animInstruct(ctr_pic){

  instruct.innerHTML = INS.straight;

  if(ctr_pic >= NB_PIC-1){
    instruct.innerHTML = INS.monitoring;
    subInstruct.innerHTML = subIns.monitoring;
  }else{
    if(ctr_pic % (NB_PIC/2) == 0){
      subInstruct.innerHTML = subIns.front;
    }else if(ctr_pic % (NB_PIC/4) == 0){
      subInstruct.innerHTML = subIns.back;
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

// Show a notification when the user is slouching
function notifySlouching() {

  if (Notification.permission !== "granted")
    Notification.requestPermission();
  else {

    var notification = new Notification('Got you', {
      icon: './style/img/notif.png',
      body: "It seems that you are slouching !",
    });

    notification.onclick = function () {
      window.open("https://thefallen.one/#risk");
    };

  }
}

function show_error(error){
  console.log(error);
  instruct.innerHTML = INS.error;
  subInstruct.innerHTML = subIns.error;
}

function ui_idle(){
  instruct.innerHTML = INS.idle;
  subInstruct.innerHTML = subIns.idle;
  alertSlouch.style.visibility = 'hidden';
}
