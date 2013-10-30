BehaviorUtilities = {
  extendObject: function (object, behavior) {
    _.extend(object, behavior._fields);
  },

  extendPrototype: function (prototype, behavior) {
    _.extend(prototype, behavior._methods);
  }
};

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

BehaviorBase.prototype.options = function (options) {
  if (arguments.length === 0) {
    return this._options;
  } else if (arguments.length === 1 && _.isObject(options)) {
    _.extend(this._options, options);
  } else {
    throw new Error('Invalid parameters passed to `options` function');
  }
};

BehaviorBase.prototype.fields = function (fields) {
  if (arguments.length === 0) {
    return this._fields;
  } else if (arguments.length === 1 && _.isObject(fields)) {
    _.extend(this._fields, fields);
  } else {
    throw new Error('Invalid parameters passed to `fields` function');
  }
};

BehaviorBase.prototype.methods = function (methods) {
  if (arguments.length === 0) {
    return this._methods;
  } else if (arguments.length === 1 && _.isObject(methods)) {
    _.extend(this._methods, methods);
  } else {
    throw new Error('Invalid parameters passed to `methods` function');
  }
};

BehaviorBase.prototype.events = function (events) {
  if (arguments.length === 0) {
    return this._events;
  } else if (arguments.length === 1 && _.isObject(events)) {
    _.extend(this._events, events);
  } else {
    throw new Error('Invalid parameters passed to `events` function');
  }
};

BehaviorBase.prototype.required = function (required) {
  if (arguments.length === 0) {
    return this._required;
  } else if (arguments.length === 1 && _.isObject(required)) {
    _.extend(this._required, required);
  } else {
    throw new Error('Invalid parameters passed to `required` function');
  }
};

Behavior = function (name, constructor) {
  // Check parameters validity.
  if (!name || !_.isString(name)) {
    throw new Error('Pass behavior name');
  }
  if (!constructor || !_.isFunction(constructor)) {
    throw new Error('Pass behavior constructor');
  }

  var Behavior = function (options) {
    constructor.call(this, options);
  };

  Behavior.prototype = new BehaviorBase();
  Behavior.constructor = Behavior;

  // Add behavior to behaviours list with the specified name.
  Behaviors[name] = Behavior;

  return Behavior;
};

Behaviors = {};
