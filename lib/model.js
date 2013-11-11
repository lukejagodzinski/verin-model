var Definition = function (collection, setup) {
  this._collection = collection;
  this._constructor = function (attrs) {
    _.extend(this, attrs);
  };
  this._fields = {};
  this._required = {};
  this._validators = {};
  this._methods = {};
  this._events = {};
  this._behaviors = {};

  ModelUtils.setup(this, setup);
};

Definition.prototype.getCollection = function () {
  return this._collection;
};

Definition.prototype.setConstructor = function (constructor) {
  if (!_.isFunction(constructor)) {
    throw new Error('Invalid constructor function');
  }
  this._constructor = constructor;
};

Definition.prototype.setFields = function (fields) {
  if (!_.isObject(fields)) {
    throw new Error('Invalid parameters passed to `setFields` function');
  }
  _.extend(this._fields, fields);
};

Definition.prototype.getFields = function () {
  return this._fields;
};

Definition.prototype.setRequired = function (required) {
  if (!_.isObject(required)) {
    throw new Error('Invalid parameters passed to `setRequired` function');
  }
  _.extend(this._required, required);
};

Definition.prototype.getRequired = function () {
  return this._required;
};

Definition.prototype.setValidator = function (name, options) {
  // Check parameters type validity.
  if(!_.isString(name) || !_.isObject(options)) {
    throw new Error('Invalid parameters type');
  }
  this._validators[name] = new Validators[name](options);
};

Definition.prototype.setValidators = function (validators) {
  var self = this;

  if (!_.isObject(validators)) {
    throw new Error('Invalid parameters passed to `setValidators` function');
  }
  _.each(validators, function (validator, name) {
    self.setValidator(name, validator);
  });
};

Definition.prototype.getValidator = function (name) {
  return this._validators[name];
};

Definition.prototype.getValidators = function () {
  return this._validators;
};

Definition.prototype.setMethods = function (methods) {
  if (!_.isObject(methods)) {
    throw new Error('Invalid parameters passed to `setMethods` function');
  }
  _.extend(this._methods, methods);
};

Definition.prototype.getMethods = function () {
  return this._methods;
};

Definition.prototype.setEvents = function (events) {
  if (!_.isObject(events)) {
    throw new Error('Invalid parameters passed to `setEvents` function');
  }
  _.extend(this._events, events);
};

Definition.prototype.getEvents = function () {
  return this._events;
};

Definition.prototype.setBehavior = function (name, options) {
  options = options || {};

  // Check parameters type validity.
  if(!_.isString(name) || !_.isObject(options)) {
    throw new Error('Invalid parameters type');
  }
  // Check if behavior exists in the `Behaviors` list.
  if (!_.has(Behaviors, name)) {
    throw new Error('`' + name + '` behavior does not exist');
  }
  // Get given behavior function.
  var BehaviorFunction = Behaviors[name];
  // Check if behavior is a function.
  if (!_.isFunction(BehaviorFunction)) {
    throw new Error('`' + name + '` behavior is not a function');
  }
  // Execute behavior function with model specific behavior options.
  this._behaviors[name] = new BehaviorFunction(options);
};

Definition.prototype.setBehaviors = function (behaviors) {
  var self = this;

  if (!_.isObject(behaviors)) {
    throw new Error('Invalid parameters passed to `setBehaviors` function');
  }
  _.each(behaviors, function (behavior, name) {
    self.setBehavior(name, behavior);
  });
};

Definition.prototype.getBehavior = function (name) {
  // Check if model implements given behavior.
  if (!_.has(this._behaviors, name)) {
    throw new Error('`' + name + '` behavior is not implemented');
  }
  return this._behaviors[name];
};

Definition.prototype.getBehaviors = function () {
  return this._behaviors;
};

Model = function (collection, setup, transform) {
  // Check parameters validity.
  if (!(collection instanceof Meteor.Collection)) {
    throw new Error('Pass `Meteor.Collection` object');
  }
  if (!_.isFunction(setup) && !_.isObject(setup)) {
    throw new Error('Pass model definition setup function');
  }
  transform = transform || true;

  // Create model definition object.
  var definition = new Definition(collection, setup);

  // Create `Model` class for given `collection`.
  var Model = ModelUtils.extendBaseModel(definition);

  // Autotransform documents to model class.
  if (transform) {
    var transformFunction = function (doc) {
      return new Model(doc);
    };
    definition._collection._transform = Deps._makeNonreactive(transformFunction);
  } else {
    definition._collection._transform = null;
  }

  return Model;
};
