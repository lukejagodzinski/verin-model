var ModelUtils = {
  checkRequiredFields: function () {
    var self = this;

    // Get list of required fields.
    var required = _.extend({}, self._definition._required);
    _.each(self._definition._behaviours, function (behaviourDefinition) {
      _.extend(required, behaviourDefinition._required);
    });

    // Iterate over required fields and check if they are present in the object
    // and not null.
    _.each(required, function (errorMessage, fieldName) {
      if (!_.has(self, fieldName) || self[fieldName] === null || self[fieldName] === undefined) {
        throw new Meteor.Error(422, errorMessage);
      }
    });
  },

  getFieldsToSave: function () {
    var self = this;

    // Get list of allowed fields.
    var fields = _.extend({}, self._definition._fields);
    _.each(self._definition._behaviours, function (behaviourDefinition) {
      _.extend(fields, behaviourDefinition._fields);
    });

    // Get only keys from the fields object.
    fields = _.keys(fields);

    // Pick only allowed fields from the object.
    var attrs = _.pick(self, fields);
    return _.omit(attrs, _.functions(attrs));
  }
};

var ModelMethods = {
  save: function () {
    var self = this;

    // Check if all required fields had been given.
    ModelUtils.checkRequiredFields.call(self);
    // Get only fields that need to be save in database.
    var fields = ModelUtils.getFieldsToSave.call(self);
    
    // Decide if we need to update or insert document into collection.
    if (self._id) {
      self._definition._collection.update(self._id, { $set: fields });
    } else {
      self._id = self._definition._collection.insert(fields);
      return self._id;
    }
  },

  remove: function () {
    var self = this;

    self._definition._collection.remove(this._id);
  }
};

ModelDefinition = function (collection, constructor) {
  this._collection = collection;
  this._initialize = function () {};
  this._fields = {};
  this._methods = {};
  this._events = {};
  this._required = {};
  this._behaviours = {};

  constructor.call(this);
};

ModelDefinition.prototype.collection = function () {
  return this._collection;
};

ModelDefinition.prototype.initialize = function (initialize) {
  if (arguments.length === 1 && _.isFunction(initialize)) {
    this._initialize = initialize;
  } else {
    throw new Error('Invalid parameters passed to `initialize` function');
  }
};

ModelDefinition.prototype.fields = function (fields) {
  if (arguments.length === 1 && _.isObject(fields)) {
    _.extend(this._fields, fields);
  } else {
    throw new Error('Invalid parameters passed to `fields` function');
  }
};

ModelDefinition.prototype.methods = function (methods) {
  if (arguments.length === 1 && _.isObject(methods)) {
    _.extend(this._methods, methods);
  } else {
    throw new Error('Invalid parameters passed to `methods` function');
  }
};

ModelDefinition.prototype.events = function (events) {
  if (arguments.length === 1 && _.isObject(events)) {
    _.extend(this._events, events);
  } else {
    throw new Error('Invalid parameters passed to `events` function');
  }
};

ModelDefinition.prototype.required = function (required) {
  if (arguments.length === 1 && _.isObject(required)) {
    _.extend(this._required, required);
  } else {
    throw new Error('Invalid parameters passed to `required` function');
  }
};

ModelDefinition.prototype.behaviour = function (behaviourName, behaviourOptions) {
  behaviourOptions = behaviourOptions || {};
  // Check parameters number.
  if (arguments.length < 1) {
    throw new Error('Invalid parameters number passed to `behaviour` function');
  }
  // Check parameters type validity.
  if(!_.isString(behaviourName) || !_.isObject(behaviourOptions)) {
    throw new Error('Invalid parameters type passed to `behaviour` function');
  }
  // Check if behaviour exists.
  if (!_.has(Behaviours, behaviourName)) {
    throw new Error('`' + behaviourName + '` behaviour does not exist');
  }
  var behaviourConstructor = Behaviours[behaviourName];
  // Check if behaviour is function.
  if (!_.isFunction(behaviourConstructor)) {
    throw new Error('`' + behaviourName + '` behaviour is not function');
  }
  // Execute behaviour function with model specific behaviour options.
  this._behaviours[behaviourName] = behaviourConstructor(behaviourOptions);
};

ModelDefinition.extendObject = function (object, definition) {
  _.extend(object, definition._fields);
};

ModelDefinition.extendPrototype = function (prototype, definition) {
  _.extend(prototype, {
    _definition: definition
  });
};

ZeitgeistModel = function (collection, modelConstructor) {
  // Check parameters validity.
  if (!collection) {
    throw new Error('Pass `Meteor.Collection` object as a first parameter of the `Meteor.Model` function');
  }
  if (!modelConstructor || !_.isFunction(modelConstructor)) {
    throw new Error('Pass model definition constructor function as a second parameter of the `Meteor.Model` function');
  }

  // Create model definition object.
  var modelDefinition = new ModelDefinition(collection, modelConstructor);

  // Create `Model` class for given `collection`.
  var Model = function (attrs) {
    var self = this;

    // Extend new object with fields defined in the definition object.
    ModelDefinition.extendObject(self, modelDefinition, attrs);
    // Extend new object with behaviours.
    _.each(modelDefinition._behaviours, function (behaviourDefinition) {
      BehaviourDefinition.extendObject(self, behaviourDefinition);
    });
    // Execute constructor function for current object.
    modelDefinition._initialize.call(self);

    _.extend(self, attrs);
  };

  // Extend `Model` class's prototype.
  ModelDefinition.extendPrototype(Model.prototype, modelDefinition);
  // Extend `Model` class's prototype with behaviours.
  _.each(modelDefinition._behaviours, function (behaviourDefinition) {
    BehaviourDefinition.extendPrototype(Model.prototype, behaviourDefinition);
  });

  _.extend(Model.prototype, ModelMethods);

  return Model;
};

Model = ZeitgeistModel;
