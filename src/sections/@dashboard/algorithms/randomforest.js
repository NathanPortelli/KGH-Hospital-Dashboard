import { RandomForestRegression as RFRegression } from 'ml-random-forest';

const dataset = [  ];

const trainingSet = new Array(dataset.length);
const predictions = new Array(dataset.length);

for (let i = 0; i < dataset.length; i+1) {
  trainingSet[i] = dataset[i].slice(0, 3);
  predictions[i] = dataset[i][3];
}

const options = {
  seed: 3,
  maxFeatures: 2,
  replacement: false,
  nEstimators: 200
};

const regression = new RFRegression(options);
regression.train(trainingSet, predictions);
const result = regression.predict(trainingSet);
console.log("randomforest result", result)