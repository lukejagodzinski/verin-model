var methods = {};

methods.constructor = function (constructor) {
  if (!_.isFunction(constructor)) {
    throw new Error('Invalid constructor function');
  }
  this.constructor = constructor;
};

methods.fields = function (fields) {
  if (!_.isObject(fields)) {
    throw new Error('Invalid parameters passed to `setFields` function');
  }
  _.extend(this.fields, fields);
};

methods.required = function (required) {
  if (!_.isObject(required)) {
    throw new Error('Invalid parameters passed to `setRequired` function');
  }
  _.extend(this.required, required);
};

methods.validator = function (name, options) {
  // Check parameters type validity.
  if(!_.isString(name) || !_.isObject(options)) {
    throw new Error('Invalid parameters type');
  }
  this.validators[name] = new Validators[name](options);
};

methods.validators = function (validators) {
  var self = this;

  if (!_.isObject(validators)) {
    throw new Error('Invalid parameters passed to `setValidators` function');
  }
  _.each(validators, function (validator, name) {
    methods.validator.call(self, name, validator);
  });
};

methods.methods = function (methods) {
  if (!_.isObject(methods)) {
    throw new Error('Invalid parameters passed to `setMethods` function');
  }
  _.extend(this.methods, methods);
};

methods.events = function (events) {
  if (!_.isObject(events)) {
    throw new Error('Invalid parameters passed to `setEvents` function');
  }
  _.extend(this.events, events);
};

methods.behavior = function (name, options) {
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
  this.behaviors[name] = new BehaviorFunction(options);
};

methods.behaviors = function (behaviors) {
  var self = this;

  if (!_.isObject(behaviors)) {
    throw new Error('Invalid parameters passed to `setBehaviors` function');
  }
  _.each(behaviors, function (behavior, name) {
    methods.behavior.call(self, name, behavior);
  });
};

Definition = function (collection, schema) {
  var self = this;

  self.collection = collection;
  self.fields = {};
  self.required = {};
  self.validators = {};
  self.methods = {};
  self.events = {};
  self.behaviors = {};

  var properties = [
    'constructor',
    'fields',
    'required',
    'validators',
    'methods',
    'events',
    'behaviors'
  ];

  _.each(properties, function (name) {
    if (_.has(schema, name)) {
      methods[name].call(self, schema[name]);
    }
  });
};
