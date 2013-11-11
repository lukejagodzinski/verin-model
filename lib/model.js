var PrototypeMethods = {};

PrototypeMethods.save = function () {
  var self = this;

  // Check if all required fields had been given.
  Utils.checkRequired.call(self);

  // Execute pre events.
  Utils.runEvents.call(self, 'preSave');
  if (self._id) {
    Utils.runEvents.call(self, 'preUpdate');
  } else {
    Utils.runEvents.call(self, 'preInsert');
  }

  // Get only fields that need to be save in database.
  var fields = Utils.getFields.call(self);

  // Decide if we need to update or insert document into collection.
  if (self._id) {
    self._definition._collection.update(self._id, { $set: fields });
  } else {
    self._id = self._definition._collection.insert(fields);
  }

  // Execute post events.
  if (self._id) {
    Utils.runEvents.call(self, 'postUpdate');
  } else {
    Utils.runEvents.call(self, 'postInsert');
  }
  Utils.runEvents.call(self, 'postSave');

  return self._id;
};

PrototypeMethods.remove = function () {
  var self = this;

  Utils.runEvents.call(self, 'preRemove');
  self._definition._collection.remove(this._id);
  delete self._id;
  Utils.runEvents.call(self, 'postRemove');
};

var Utils = {};

Utils.runConstructor = function (object, definition, args) {
  if (_.has(definition, 'constructor') && _.isFunction(definition.constructor)) {
    definition.constructor.apply(object, args);
  } else {
    if (object.constructor.__super__ && object.constructor.__super__.constructor) {
      return object.constructor.__super__.constructor.apply(this, args);
    }
  }
};

Utils.createObject = function (definition) {
  var object = {};

  _.extend(object, definition._fields);

  _.each(definition._behaviors, function (behavior) {
    _.extend(object, behavior._fields);
  });

  return object;
};

Utils.createPrototype = function (definition) {
  var prototype = {};

  _.extend(prototype, {
    _definition: definition
  }, definition._methods, PrototypeMethods);

  _.each(definition._behaviors, function (behavior) {
    _.extend(prototype, behavior._methods);
  });

  return prototype;
};

Utils.setup = function (definition, setup) {
  if (_.isFunction(setup)) {
    setup.call(definition);
  } else if (_.isObject(setup)) {
    // List of allowed schema fields and its corresponding functions.
    var types = {
      constructor: 'setConstructor',
      fields: 'setFields',
      required: 'setRequired',
      validators: 'setValidators',
      methods: 'setMethods',
      events: 'setEvents',
      behaviors: 'setBehaviors'
    };
    _.each(setup, function (options, name) {
      if (types[name]) {
        definition[types[name]](options);
      }
    });
  }
};

Utils.checkRequired = function () {
  var self = this;

  // Get list of required fields from model.
  var required = _.extend({}, self._definition._required);
  // Get list of required fields from behaviors.
  _.each(self._definition._behaviors, function (behavior) {
    _.extend(required, behavior._required);
  });

  // Iterate over required fields and check if they are present in the object
  // and not null or undefined.
  _.each(required, function (errorMessage, fieldName) {
    if (!_.has(self, fieldName) || self[fieldName] === null || self[fieldName] === undefined) {
      throw new Meteor.Error(422, errorMessage);
    }
  });
};

Utils.getFields = function () {
  var self = this;

  // Get list of allowed fields from model.
  var fields = _.extend({}, self._definition._fields);
  // Get list of allowed fields from behaviors.
  _.each(self._definition._behaviors, function (behavior) {
    _.extend(fields, behavior._fields);
  });

  // Get only keys from the fields object.
  fields = _.keys(fields);

  // Pick only allowed fields from the object.
  var attrs = _.pick(self, fields);
  return _.omit(attrs, _.functions(attrs));
};

Utils.runEvents = function (name) {
  var self = this,
      events = [];

  // Get events from model.
  if (self._definition._events[name]) {
    events.push(self._definition._events[name]);
  }
  // Get events from behaviors.
  _.each(self._definition._behaviors, function (behavior) {
    if (behavior._events[name]) {
      events.push(behavior._events[name]);
    }
  });
  // Run events.
  _.each(events, function (event) {
    event.call(self);
  });
};

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

  Utils.setup(this, setup);
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
  var Model = Class.extend({
    constructor: function (/* arguments */) {
      Utils.runConstructor(this, definition, arguments);
    },
    object: Utils.createObject(definition),
    prototype: Utils.createPrototype(definition)
  });

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
