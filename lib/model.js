var Utilities = {
  getRequired: function () {
    var self = this;

    // Get list of required fields from model.
    var required = _.extend({}, self._definition._required);
    // Get list of required fields from behaviours.
    _.each(self._definition._behaviours, function (behaviourDefinition) {
      _.extend(required, behaviourDefinition._required);
    });

    return required;
  },

  checkRequired: function () {
    var self = this;

    // Get list of required fields.
    var required = Utilities.getRequired.call(self);

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
    // Get list of allowed fields from behaviours.
    _.each(self._definition._behaviours, function (behaviourDefinition) {
      _.extend(fields, behaviourDefinition._fields);
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
    // Get events from behaviours.
    _.each(self._definition._behaviours, function (behaviourDefinition) {
      _.each(behaviourDefinition._events, function (event, eventName) {
        events[eventName].push(event);
      });
    });

    return events;
  },

  runEvents: function (eventName) {
    var self = this,
        events = Utilities.getEvents.call(self);

    _.each(events[eventName], function (event) {
      event.call(self);
    });
  }
};

var ModelMethods = {
  save: function () {
    var self = this,
        events = Utilities.getEvents.call(self);

    // Check if all required fields had been given.
    Utilities.checkRequired.call(self);

    // Execute pre events.
    Utilities.runEvents.call(self, 'preSave');
    if (self._id) {
      Utilities.runEvents.call(self, 'preUpdate');
    } else {
      Utilities.runEvents.call(self, 'preInsert');
    }

    // Get only fields that need to be save in database.
    var fields = Utilities.getFields.call(self);

    // Decide if we need to update or insert document into collection.
    if (self._id) {
      self._definition._collection.update(self._id, { $set: fields });
    } else {
      self._id = self._definition._collection.insert(fields);
    }

    // Execute post events.
    if (self._id) {
      Utilities.runEvents.call(self, 'postUpdate');
    } else {
      Utilities.runEvents.call(self, 'postInsert');
    }
    Utilities.runEvents.call(self, 'postSave');

    return self._id;
  },

  remove: function () {
    var self = this;

    Utilities.runEvents.call(self, 'preRemove');
    self._definition._collection.remove(this._id);
    delete self._id;
    Utilities.runEvents.call(self, 'postRemove');
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
  if (arguments.length === 0) {
    return this._fields;
  } else if (arguments.length === 1 && _.isObject(fields)) {
    _.extend(this._fields, fields);
  } else {
    throw new Error('Invalid parameters passed to `fields` function');
  }
};

ModelDefinition.prototype.methods = function (methods) {
  if (arguments.length === 0) {
    return this._methods;
  } else if (arguments.length === 1 && _.isObject(methods)) {
    _.extend(this._methods, methods);
  } else {
    throw new Error('Invalid parameters passed to `methods` function');
  }
};

ModelDefinition.prototype.events = function (events) {
  if (arguments.length === 0) {
    return this._events;
  } else if (arguments.length === 1 && _.isObject(events)) {
    _.extend(this._events, events);
  } else {
    throw new Error('Invalid parameters passed to `events` function');
  }
};

ModelDefinition.prototype.required = function (required) {
  if (arguments.length === 0) {
    return this._required;
  } else if (arguments.length === 1 && _.isObject(required)) {
    _.extend(this._required, required);
  } else {
    throw new Error('Invalid parameters passed to `required` function');
  }
};

ModelDefinition.prototype.behaviour = function (behaviourName, behaviourOptions) {
  // PARAMETERS CHECKING
  // Check parameters number.
  if (arguments.length < 1) {
    throw new Error('Invalid parameters number passed to `behaviour` function');
  }
  // Check parameters type validity.
  if(!_.isString(behaviourName) || (!_.isObject(behaviourOptions) && behaviourOptions !== undefined)) {
    throw new Error('Invalid parameters type passed to `behaviour` function');
  }
  // GETTER
  // Return behaviour with the given name, if behaviour function was already
  // executed on the given model.
  if (_.has(this._behaviours, behaviourName)) {
    return this._behaviours[behaviourName];
  }
  // SETTER
  // Check if behaviour exists in the behaviours list `ZeitgeistBehaviours`.
  if (!_.has(ZeitgeistBehaviours, behaviourName)) {
    throw new Error('`' + behaviourName + '` behaviour does not exist');
  }
  var behaviourConstructor = ZeitgeistBehaviours[behaviourName];
  // Check if behaviour is a function.
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
    _definition: definition,
  }, definition._methods);
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
