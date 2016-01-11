module.exports = (function() {

  'use strict';

  const ModelArray = require('./model_array.js');
  const fs = require('fs');
  const async = require('async');

  /**
  * Factory for creating models
  * @class
  */
  class ModelFactory {

    /**
    * Create the ModelFactory with a provided Model to use as a reference.
    * @param {Nodal.Model} modelConstructor Must pass the constructor for the type of ModelFactory you wish to create.
    */
    constructor(modelConstructor) {

      this.Model = modelConstructor;

    }

    /**
    * Loads all model constructors in your ./app/models directory into an array
    * @return {Array} Array of model Constructors
    */
    static loadModels() {

      return fs
        .readDirSync('./app/models')
        .map(filename => require(`./app/models/${filename}`))

    }

    /**
    * Creates new factories from a supplied array of Models, loading in data keyed by Model name
    * @param {Array} Models Array of model constructors you wish to reference
    * @param {Object} objModelData Keys are model names, values are arrays of model data you wish to create
    * @param {Function} callback What to execute upon completion
    */
    static createFromModels(Models, objModelData, callback) {

      async.parallel(
        Models
          .filter(Model => objModelData[Model.name] && objModelData[Model.name].length)
          .map(Model => callback => new this(Model).create(objModelData[Model.name], callback)),
        (err, results) => callback(err || null, results)
      );

    }

    /**
    * Populates a large amount of model data from an Object.
    * @param {Array} Models Array of Model constructors
    */
    static populate(objModelData, callback) {

      return this.createFromModels(this.loadModels(), objModelData, callback);

    }

    /**
    * Creates models from an array of Objects containing the model data
    * @param {Array} arrModelData Array of objects to create model data from
    */
    create(arrModelData, callback) {

      ModelArray
        .from(arrModelData.map(data => new this.Model(data)))
        .saveAll(callback);

    }

  }

  return ModelFactory;

})();
