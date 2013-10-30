var ModelUtilities = {
  extendObject: function (object, definition) {
    _.extend(object, definition._fields);
  },

  extendPrototype: function (prototype, definition) {
    _.extend(prototype, {
      _definition: definition,
    }, definition._methods);
  },

  getRequired: function () {
    var self = this;

    // Get list of required fields from model.
    var required = _.extend({}, self._definition._required);
    // Get list of required fields from behaviors.
    _.each(self._definition._behaviors, function (behaviorDefinition) {
      _.extend(required, behaviorDefinition._required);
    });

    return required;
  },

  checkRequired: function () {
    var self = this;

    // Get list of required fields.
    var required = ModelUtilities.getRequired.call(self);

    // Iterate over required fields and check if they are present in the object
    // and not null or undefined.
    _.each(required, function (errorMessage, fieldName) {
      if (!_.has(self, fieldName) || self[fieldName] === null || self[fieldName] === undefined) {
        throw new Meteor.Error(422, errorMessage);
      }
    });
  },

  getFields: function () {
    var self = this;

    // Get list of allowed fields from model.
    var fields = _.extend({}, self._definition._fields);
    // Get list of allowed fields from behaviors.
    _.each(self._definition._behaviors, function (behaviorDefinition) {
      _.extend(fields, behaviorDefinition._fields);
    });

    // Get only keys from the fields object.
    fields = _.keys(fields);

    // Pick only allowed fields from the object.
    var attrs = _.pick(self, fields);
    return _.omit(attrs, _.functions(attrs));
  },

  getEvents: function () {
    var self = this;

    // Prepare events object.
    var events = {
      preSave: [],
      postSave: [],
      preInsert: [],
      postInsert: [],
      preUpdate: [],
      postUpdate: [],
      preRemove: [],
      postRemove: []
    };
    // Get events from model.
    _.each(self._definition._events, function (event, eventName) {
      events[eventName].push(event);
    });
    // Get events from behaviors.
    _.each(self._definition._behaviors, function (behaviorDefinition) {
      _.each(behaviorDefinition._events, function (event, eventName) {
        events[eventName].push(event);
      });
    });

    return events;
  },

  runEvents: function (eventName) {
    var self = this,
        events = ModelUtilities.getEvents.call(self);

    _.each(events[eventName], function (event) {
      event.call(self);
    });
  }
};

var ModelMethods = {
  save: function () {
    var self = this,
        events = ModelUtilities.getEvents.call(self);

    // Check if all required fields had been given.
    ModelUtilities.checkRequired.call(self);

    // Execute pre events.
    ModelUtilities.runEvents.call(self, 'preSave');
    if (self._id) {
      ModelUtilities.runEvents.call(self, 'preUpdate');
    } else {
      ModelUtilities.runEvents.call(self, 'preInsert');
    }

    // Get only fields that need to be save in database.
    var fields = ModelUtilities.getFields.call(self);

    // Decide if we need to update or insert document into collection.
    if (self._id) {
      self._definition._collection.update(self._id, { $set: fields });
    } else {
      self._id = self._definition._collection.insert(fields);
    }

    // Execute post events.
    if (self._id) {
      ModelUtilities.runEvents.call(self, 'postUpdate');
    } else {
      ModelUtilities.runEvents.call(self, 'postInsert');
    }
    ModelUtilities.runEvents.call(self, 'postSave');

    return self._id;
  },

  remove: function () {
    var self = this;

    ModelUtilities.runEvents.call(self, 'preRemove');
    self._definition._collection.remove(this._id);
    delete self._id;
    ModelUtilities.runEvents.call(self, 'postRemove');
  }
};

Definition = function () {
  this._collection = null;
  this._initialize = function () {};
  this._fields = {};
  this._methods = {};
  this._events = {};
  this._required = {};
  this._behaviors = {};
  this._validators = {};
};

Definition.prototype.collection = function () {
  return this._collection;
};

Definition.prototype.initialize = function (initialize) {
  if (arguments.length === 1 && _.isFunction(initialize)) {
    this._initialize = initialize;
  } else {
    throw new Error('Invalid parameters passed to `initialize` function');
  }
};

Definition.prototype.fields = function (fields) {
  if (arguments.length === 0) {
    return this._fields;
  } else if (arguments.length === 1 && _.isObject(fields)) {
    _.extend(this._fields, fields);
  } else {
    throw new Error('Invalid parameters passed to `fields` function');
  }
};

Definition.prototype.methods = function (methods) {
  if (arguments.length === 0) {
    return this._methods;
  } else if (arguments.length === 1 && _.isObject(methods)) {
    _.extend(this._methods, methods);
  } else {
    throw new Error('Invalid parameters passed to `methods` function');
  }
};

Definition.prototype.events = function (events) {
  if (arguments.length === 0) {
    return this._events;
  } else if (arguments.length === 1 && _.isObject(events)) {
    _.extend(this._events, events);
  } else {
    throw new Error('Invalid parameters passed to `events` function');
  }
};

Definition.prototype.required = function (required) {
  if (arguments.length === 0) {
    return this._required;
  } else if (arguments.length === 1 && _.isObject(required)) {
    _.extend(this._required, required);
  } else {
    throw new Error('Invalid parameters passed to `required` function');
  }
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

Definition.prototype.setValidator = function (name, validator) {
  this._validators[name] = validator;
};

Definition.prototype.setValidators = function (validators) {
  _.each(validators, function (validator, name) {
    this.setValidator(name, validator);
  });
};

Definition.prototype.getValidator = function (name) {
  return this._validators[name];
};

Definition.prototype.getValidators = function () {
  return this._validators;
};

Model = function (collection, constructor) {
  // Check parameters validity.
  if (!collection) {
    throw new Error('Pass `Meteor.Collection` object as a first parameter of the `Meteor.Model` function');
  }
  if (!constructor || !_.isFunction(constructor)) {
    throw new Error('Pass model definition constructor function as a second parameter of the `Meteor.Model` function');
  }

  // Create model definition object.
  var definition = new Definition();
  definition._collection = collection;
  constructor.call(definition);

  // Create `Model` class for given `collection`.
  var Model = function (attrs) {
    var self = this;

    // Extend new object with fields defined in the definition object.
    ModelUtilities.extendObject(self, definition, attrs);
    // Extend new object with behaviors.
    _.each(definition._behaviors, function (behavior) {
      BehaviorUtilities.extendObject(self, behavior);
    });
    // Execute constructor function for current object.
    definition._initialize.call(self);

    _.extend(self, attrs);
  };

  // Extend `Model` class's prototype.
  ModelUtilities.extendPrototype(Model.prototype, definition);
  // Extend `Model` class's prototype with behaviors.
  _.each(definition._behaviors, function (behavior) {
    BehaviorUtilities.extendPrototype(Model.prototype, behavior);
  });

  _.extend(Model.prototype, ModelMethods);

  return Model;
};

Model = Model;
