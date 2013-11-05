var ModelUtilities = {
  extendObject: function (object, definition) {
    ReactiveSchema(object, definition._schema);
    _.each(definition._behaviors, function (behavior) {
      _.extend(object, behavior._fields);
    });
  },

  extendPrototype: function (prototype, definition) {
    _.extend(prototype, {
      _definition: definition,
    }, definition._methods);
    _.each(definition._behaviors, function (behavior) {
      _.extend(prototype, behavior._methods);
    });
  },

  setup: function (definition, setup) {
    if (_.isFunction(setup)) {
      setup.call(definition);
    } else if (_.isObject(setup)) {
      // List of allowed schema fields and its corresponding functions.
      var types = {
        constructor: 'setConstructor',
        schema: 'schema',
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
  },

  runEvents: function (name) {
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
  },
  getFields: function (object) {
    return ReactiveObjects.getObjectProperties(object)
  },
  getChangedFields: function (object) {
    var fields = {};
    for (index in ReactiveSchema.changedLog(object)) {
      fields[index] = object[index];
    }
    return fields;
  }
};

var Definition = function (collection, setup) {
  this._collection = collection;
  this._constructor = function (attrs) {
    _.extend(this, attrs);
  };
  this._schema = {};
  this._methods = {};
  this._events = {};
  this._behaviors = {};

  ModelUtilities.setup(this, setup);
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

Definition.prototype.setSchema = function (schema) {
  if (!_.isObject(schema)) {
    throw new Error('Invalid parameters passed to `setSchema` function');
  }
  _.extend(this._schema, schema);
};

ModelBase = function () {};

ModelBase.prototype.save = function () {
  var self = this;

  // Check if all required fields had been given.


  // Execute pre events.
  ModelUtilities.runEvents.call(self, 'preSave');
  if (self._id) {
    ModelUtilities.runEvents.call(self, 'preUpdate');
  } else {
    ModelUtilities.runEvents.call(self, 'preInsert');
  }

  // Decide if we need to update or insert document into collection.
  if (self._id) {
    self._definition._collection.update(self._id, { $set: ModelUtilities.getChangedFields(self) });
  } else {
    self._id = self._definition._collection.insert(ModelUtilities.getFields(self));
  }
  
  // Execute post events.
  if (self._id) {
    ModelUtilities.runEvents.call(self, 'postUpdate');
  } else {
    ModelUtilities.runEvents.call(self, 'postInsert');
  }
  ModelUtilities.runEvents.call(self, 'postSave');
  
  ReactiveSchema.resetChangedLog(self)

  return self._id;
};

ModelBase.prototype.remove = function () {
  var self = this;

  ModelUtilities.runEvents.call(self, 'preRemove');
  self._definition._collection.remove(this._id);
  delete self._id;
  ModelUtilities.runEvents.call(self, 'postRemove');
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
  var Model = function () {
    var self = this,
        args = arguments;

    // Extend object of `Model` class with model definition.
    ModelUtilities.extendObject(self, definition);

    // Run constructor function.
    definition._constructor.apply(self, args);

    //New instance should not display changes
    ReactiveSchema.resetChangedLog(self)
  };

  // Extend `Model` class with `ModelBase` class and model definition.
  Model.prototype = new ModelBase();
  ModelUtilities.extendPrototype(Model.prototype, definition);
  Model.constructor = Model;

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
