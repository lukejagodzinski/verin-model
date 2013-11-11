ModelUtils = {};

ModelUtils.extendBaseModel = function (modelDef) {
  var inheritDef = {};

  // Constructor
  if (_.has(modelDef, '_constructor')) {
    inheritDef.constructor = modelDef._constructor;
  }

  // Object
  inheritDef.object = {};
  if (_.has(modelDef, '_fields')) {
    _.extend(inheritDef.object, modelDef._fields);
  }
  _.each(modelDef._behaviors, function (behavior) {
    _.extend(inheritDef.object, behavior._fields);
  });

  // Prototype
  inheritDef.prototype = {
    _definition: modelDef
  };
  _.extend(inheritDef.prototype, modelDef._methods);
  _.each(modelDef._behaviors, function (behavior) {
    _.extend(inheritDef.prototype, behavior._methods);
  });

  return BaseModel.extend(inheritDef);
};

ModelUtils.setup = function (definition, setup) {
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

ModelUtils.checkRequired = function () {
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

ModelUtils.getFields = function () {
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

ModelUtils.runEvents = function (name) {
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