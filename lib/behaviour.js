BehaviourDefinition = function (constructor) {
  this._initialize = function () {};
  this._fields = {};
  this._methods = {};
  this._events = {};
  this._required = {};
  this._options = {};

  constructor.call(this);
};

BehaviourDefinition.prototype.initialize = ModelDefinition.prototype.initialize;
BehaviourDefinition.prototype.fields = ModelDefinition.prototype.fields;
BehaviourDefinition.prototype.methods = ModelDefinition.prototype.methods;
BehaviourDefinition.prototype.events = ModelDefinition.prototype.events;
BehaviourDefinition.prototype.required = ModelDefinition.prototype.required;

BehaviourDefinition.prototype.options = function (options) {
  if (arguments.length === 1 && _.isObject(options)) {
    _.extend(this._options, options);
  } else {
    throw new Error('Invalid parameters passed to `options` function');
  }
};

BehaviourDefinition.extendObject = function (object, definition) {
  _.extend(object, definition._fields);
};

BehaviourDefinition.extendPrototype = function (prototype, definition) {
  _.extend(prototype, definition._methods);
};

ZeitgeistBehaviour = function (behaviourName, behaviourConstructor) {
  // Check parameters validity.
  if (!behaviourName || !_.isString(behaviourName)) {
    throw new Error('Pass behaviour name as a first parameter of the `Meteor.Model.Behaviour` function');
  }
  if (!behaviourConstructor || !_.isFunction(behaviourConstructor)) {
    throw new Error('Pass behaviour definition constructor function as a second parameter of the `Meteor.Model.Behaviour` function');
  }

  var Behaviour = function (behaviourOptions) {
    // Create behaviour definition object.
    var definition = new BehaviourDefinition(behaviourConstructor);

    // Extend behaviour default options with model specific options.
    definition.options(behaviourOptions);

    return definition;
  };

  // Add behaviour to behaviours list with the specified name.
  Behaviours[behaviourName] = Behaviour;

  return Behaviour;
};

Behaviour = ZeitgeistBehaviour;
Behaviours = ZeitgeistBehaviours = {};
