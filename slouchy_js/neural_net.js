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

const EPOCHS = 5;
const BATCH_SIZE = 64;

let X_train = []
let Y_train = []

let history;

// Simple CNN

let model = tf.sequential();

model.add(tf.layers.conv2d({
  inputShape: [IMG_SIZE, IMG_SIZE, 3],
  kernelSize: 5,
  filters: 8,
  strides: 1,
  activation: 'relu',
  kernelInitializer: 'VarianceScaling'
}));

model.add(tf.layers.maxPooling2d({
  poolSize: [2, 2],
  strides: [2, 2]
}));


model.add(tf.layers.conv2d({
  kernelSize: 5,
  filters: 16,
  strides: 1,
  activation: 'relu',
  kernelInitializer: 'VarianceScaling'
}));

model.add(tf.layers.maxPooling2d({
  poolSize: [2, 2],
  strides: [2, 2]
}));

model.add(tf.layers.flatten());

model.add(tf.layers.dense({
	units: 128,
	activation: 'elu'
}));

model.add(tf.layers.dense({
  units: NB_CLASSES,
  kernelInitializer: 'VarianceScaling',
  activation: 'sigmoid'
}));

const LEARNING_RATE = 0.005;
const optimizer = tf.train.adam(LEARNING_RATE);

model.compile({
  optimizer: optimizer,
  loss: 'logcosh',
  metrics: ['accuracy'],
});


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
