BehaviourUtilities = {
  extendObject: function (object, behaviour) {
    _.extend(object, behaviour._fields);
  },

  extendPrototype: function (prototype, behaviour) {
    _.extend(prototype, behaviour._methods);
  }
};

BehaviourBase = function () {
  this._fields = {};
  this._methods = {};
  this._events = {};
  this._required = {};
  this._options = {};
};

BehaviourBase.prototype.hasOption = function (name) {
  if (!_.isString(name)) {
    throw new Error('Invalid parameters passed to `hasOption` function');
  }
  return _.has(this._options, name);
};

BehaviourBase.prototype.setOption = function (name, value) {
  if (!_.isString(name) || value === undefined) {
    throw new Error('Invalid parameters passed to `setOption` function');
  }
  this._options[name] = value;
};

BehaviourBase.prototype.setOptions = function (options) {
  if (!_.isObject(options)) {
    throw new Error('Invalid parameters passed to `setOptions` function');
  }
  _.extend(this._options, options);
};

BehaviourBase.prototype.getOption = function (name) {
  if (!_.has(this._options, name)) {
    throw new Error('There is no option `' + name + '`');
  }
  return this._options[name];
};

BehaviourBase.prototype.getOptions = function () {
  return this._options;
};

BehaviourBase.prototype.options = function (options) {
  if (arguments.length === 0) {
    return this._options;
  } else if (arguments.length === 1 && _.isObject(options)) {
    _.extend(this._options, options);
  } else {
    throw new Error('Invalid parameters passed to `options` function');
  }
};

BehaviourBase.prototype.fields = function (fields) {
  if (arguments.length === 0) {
    return this._fields;
  } else if (arguments.length === 1 && _.isObject(fields)) {
    _.extend(this._fields, fields);
  } else {
    throw new Error('Invalid parameters passed to `fields` function');
  }
};

BehaviourBase.prototype.methods = function (methods) {
  if (arguments.length === 0) {
    return this._methods;
  } else if (arguments.length === 1 && _.isObject(methods)) {
    _.extend(this._methods, methods);
  } else {
    throw new Error('Invalid parameters passed to `methods` function');
  }
};

BehaviourBase.prototype.events = function (events) {
  if (arguments.length === 0) {
    return this._events;
  } else if (arguments.length === 1 && _.isObject(events)) {
    _.extend(this._events, events);
  } else {
    throw new Error('Invalid parameters passed to `events` function');
  }
};

BehaviourBase.prototype.required = function (required) {
  if (arguments.length === 0) {
    return this._required;
  } else if (arguments.length === 1 && _.isObject(required)) {
    _.extend(this._required, required);
  } else {
    throw new Error('Invalid parameters passed to `required` function');
  }
};

Behaviour = function (name, constructor) {
  // Check parameters validity.
  if (!name || !_.isString(name)) {
    throw new Error('Pass behaviour name as a first parameter of the `Behaviour` function');
  }
  if (!constructor || !_.isFunction(constructor)) {
    throw new Error('Pass behaviour constructor function as a second parameter of the `Behaviour` function');
  }

  var Behaviour = function () {
    var args = arguments;
    constructor.apply(this, args);
  };

  Behaviour.prototype = new ValidatorBase();
  Behaviour.constructor = Behaviour;

  // Add behaviour to behaviours list with the specified name.
  Behaviours[name] = Behaviour;

  return Behaviour;
};

Behaviours = {};
