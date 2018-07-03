/*
 * Copyright(C) 2018 Hugo Rosenkranz
 *
 * This Source Code Form is subject to the terms of the
 * Mozilla Public License, v. 2.0. If a copy of the MPL
 * was not distributed with this file, You can obtain one at
 * http://mozilla.org/MPL/2.0/.
 */

const CLASSES = ['STRAIGHT','SLOUCH'];
const NB_CLASSES = CLASSES.length
const IMG_SIZE = 50;

const NB_PIC = 200; // TRAINING_SIZE

const EPOCHS = 10;
const BATCH_SIZE = 64;

let X_train = []
let Y_train = []

let history;

let model;

tf.loadModel('https://thefallen.one/SlouchyJS/example/vgg16-327-samples/model.json').then(function(result, error){
  if(!error){
    model = result;
    const LEARNING_RATE = 0.0005;
    const optimizer = tf.train.sgd(LEARNING_RATE);

    model.compile({
      optimizer: optimizer,
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    });

    console.log("model successfully loaded ! ");
  }else
    ui_error(error);
}).catch(error => ui_error(error));

function train(){
  xs = tf.tensor4d(X_train, [NB_PIC, IMG_SIZE, IMG_SIZE, 3]);
  ys = tf.tensor2d(Y_train, [NB_PIC, NB_CLASSES]);

  model.fit(xs, ys, {epochs: EPOCHS, shuffle:true/*, batchSize:BATCH_SIZE*/}).then(
    function(result) {
      const accuracy = result.history.acc;
      console.log(accuracy) // show the accuracy to the user ?
      backgroundMonitoring();
    },
    function(error) {
      ui_error(error);
    }
  );
}

// Get a prediction of the posture based on webcam photo
function predict(X){
  const y_pred = model.predict(tf.tensor4d([X], [1, IMG_SIZE, IMG_SIZE, 3]));
  const y_class = tf.argMax(y_pred, [1]).dataSync();

  return y_class;
}
