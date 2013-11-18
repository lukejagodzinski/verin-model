ModelUtils = {};

ModelUtils.checkRequired = function () {
  var self = this;

  // Get list of required fields from model.
  var required = _.extend({}, self._definition.required);
  // Get list of required fields from behaviors.
  _.each(self._definition.behaviors, function (behavior) {
    _.extend(required, behavior.required);
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
  var fields = _.extend({}, self._definition.fields);
  // Get list of allowed fields from behaviors.
  _.each(self._definition.behaviors, function (behavior) {
    _.extend(fields, behavior.fields);
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
  if (self._definition.events[name]) {
    events.push(self._definition.events[name]);
  }
  // Get events from behaviors.
  _.each(self._definition.behaviors, function (behavior) {
    if (behavior.events[name]) {
      events.push(behavior.events[name]);
    }
  });
  // Run events.
  _.each(events, function (event) {
    event.call(self);
  });
};
