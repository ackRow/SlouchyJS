const CLASSES = ['STRAIGHT','SLOUCH'];
const NB_CLASSES = CLASSES.length
const IMG_SIZE = 50;

const NB_PIC = 200; // TRAINING_SIZE

const EPOCHS = 10;

let X_train = []
let Y_train = []

let history;

/* Simple CNN

const model = tf.sequential();

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
  units: NB_CLASSES,
  kernelInitializer: 'VarianceScaling',
  activation: 'sigmoid'
}));

const LEARNING_RATE = 0.15;
const optimizer = tf.train.sgd(LEARNING_RATE);

model.compile({
  optimizer: optimizer,
  loss: 'categoricalCrossentropy',
  metrics: ['accuracy'],
});

// Training the network
function train(){
  xs = tf.tensor4d(X_train, [NB_PIC, IMG_SIZE, IMG_SIZE, 3]);
  ys = tf.tensor2d(Y_train, [NB_PIC, NB_CLASSES]);
  model.fit(xs, ys, {epochs: EPOCHS, shuffle:true}).then(
    function(result) {
      const accuracy = result.history.acc;
      console.log(accuracy) // show the accuracy to the user ?
      backgroundMonitoring();
    },
    function(error) {
      show_error(error);
    }
  );
}*/

let model;

tf.loadModel('https://thefallen.one/SlouchyJS/js_model/model.json').then(function(result, error){
if(!error){
  model = result;
  console.log("model successfully loaded ! ");
}else
  console.error("error");
});

function train(){};

// Get a prediction of the posture based on webcam photo
function predict(X){
  const y_pred = model.predict(tf.tensor4d([X], [1, IMG_SIZE, IMG_SIZE, 3]));
  const y_class = tf.argMax(y_pred, [1]).dataSync();

  return y_class;
}
