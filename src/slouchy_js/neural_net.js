/*
 * Copyright(C) 2018 Hugo Rosenkranz
 *
 * This Source Code Form is subject to the terms of the
 * Mozilla Public License, v. 2.0. If a copy of the MPL
 * was not distributed with this file, You can obtain one at
 * http://mozilla.org/MPL/2.0/.
 */

class NeuralNet {

  constructor(classes, img_size){
    this.classes = classes;
    this.nb_classes = classes.length;

    this.img_size = img_size;

    this.hasTrain = false;
  }

  HasTrain(){
    return this.hasTrain;
  }

  compile(optimizer, loss){
    this.model.compile({
      optimizer: optimizer,
      loss: loss,
      metrics: ['accuracy'],
    });
  }

  train(x_train, y_train, training_size, epochs){
    let xs = tf.tensor4d(x_train, [training_size, this.img_size, this.img_size, 3]);
    let ys = tf.tensor2d(y_train, [training_size, this.nb_classes]);

    return this.model.fit(xs, ys, {epochs: epochs, shuffle:true/*, batchSize:BATCH_SIZE*/}).then(
      function(result) {
        //this.accuracy = result.history.acc;
        console.log(result.history.acc) // show the accuracy to the user ?
        this.hasTrain = true;
        //backgroundMonitoring();
      }.bind(this),
        function(error){
          throw error;
      });
  }

  predict(X){
    let y_pred = this.model.predict(tf.tensor4d([X], [1, this.img_size, this.img_size, 3]));
    let y_class = tf.argMax(y_pred, [1]).dataSync();

    return y_class;
  }

  setModel(customModel, preTrained){
    this.model = customModel;
    this.hasTrain = preTrained;
  }

  async uploadModel(url, user){
    let resp = await neural_net.model.save(tf.io.browserHTTPRequest(
    url, {method: 'POST', headers: {'user': user}}));

    return resp;
  }

  simpleCNN(){
    this.model = tf.sequential();

    this.model.add(tf.layers.conv2d({
      inputShape: [this.img_size, this.img_size, 3],
      kernelSize: 5,
      filters: 8,
      strides: 1,
      activation: 'relu',
      kernelInitializer: 'VarianceScaling'
    }));

    this.model.add(tf.layers.maxPooling2d({
      poolSize: [2, 2],
      strides: [2, 2]
    }));


    this.model.add(tf.layers.conv2d({
      kernelSize: 5,
      filters: 16,
      strides: 1,
      activation: 'relu',
      kernelInitializer: 'VarianceScaling'
    }));

    this.model.add(tf.layers.maxPooling2d({
      poolSize: [2, 2],
      strides: [2, 2]
    }));

    this.model.add(tf.layers.flatten());

    this.model.add(tf.layers.dense({
      units: 128,
      activation: 'elu'
    }));

    this.model.add(tf.layers.dense({
      units: this.nb_classes,
      kernelInitializer: 'VarianceScaling',
      activation: 'sigmoid'
    }));
  }
}