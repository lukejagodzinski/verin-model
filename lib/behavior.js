BehaviorBase = function () {
  this._fields = {};
  this._methods = {};
  this._events = {};
  this._required = {};
  this._options = {};
};

BehaviorBase.prototype.hasOption = function (name) {
  if (!_.isString(name)) {
    throw new Error('Invalid parameters passed to `hasOption` function');
  }
  return _.has(this._options, name);
};

BehaviorBase.prototype.setOption = function (name, value) {
  if (!_.isString(name) || value === undefined) {
    throw new Error('Invalid parameters passed to `setOption` function');
  }
  this._options[name] = value;
};

BehaviorBase.prototype.setOptions = function (options) {
  if (!_.isObject(options)) {
    throw new Error('Invalid parameters passed to `setOptions` function');
  }
  _.extend(this._options, options);
};

BehaviorBase.prototype.getOption = function (name) {
  if (!_.has(this._options, name)) {
    throw new Error('There is no option `' + name + '`');
  }
  return this._options[name];
};

BehaviorBase.prototype.getOptions = function () {
  return this._options;
};

BehaviorBase.prototype.setFields = function (fields) {
  if (!_.isObject(fields)) {
    throw new Error('Invalid parameters passed to `setFields` function');
  }
  _.extend(this._fields, fields);
};

BehaviorBase.prototype.getFields = function () {
  return this._fields;
};

BehaviorBase.prototype.setMethods = function (methods) {
  if (!_.isObject(methods)) {
    throw new Error('Invalid parameters passed to `setMethods` function');
  }
  _.extend(this._methods, methods);
};

BehaviorBase.prototype.getMethods = function () {
  return this._methods;
};

BehaviorBase.prototype.setEvents = function (events) {
  if (!_.isObject(events)) {
    throw new Error('Invalid parameters passed to `setEvents` function');
  }
  _.extend(this._events, events);
};

BehaviorBase.prototype.getEvents = function () {
  return this._events;
};

BehaviorBase.prototype.setRequired = function (required) {
  if (!_.isObject(required)) {
    throw new Error('Invalid parameters passed to `setRequired` function');
  }
  _.extend(this._required, required);
};

BehaviorBase.prototype.getRequired = function () {
  return this._required;
};

Behavior = function (name, setup) {
  // Check parameters validity.
  if (!name || !_.isString(name)) {
    throw new Error('Pass behavior name');
  }
  if (!setup || !_.isFunction(setup)) {
    throw new Error('Pass behavior setup function');
  }

  var Behavior = function (options) {
    setup.call(this, options);
  };

  Behavior.prototype = new BehaviorBase();
  Behavior.constructor = Behavior;

  // Add behavior to behaviors list with the specified name.
  Behaviors[name] = Behavior;

  return Behavior;
};

Behaviors = {};
