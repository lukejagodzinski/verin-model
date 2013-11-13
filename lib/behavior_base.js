var methods = {};

methods.setOptions = function (options) {
  if (!_.isObject(options)) {
    throw new Error('Invalid parameters passed to `setOptions` function');
  }
  _.extend(this.options, options);
};

methods.setFields = function (fields) {
  if (!_.isObject(fields)) {
    throw new Error('Invalid parameters passed to `setFields` function');
  }
  _.extend(this.fields, fields);
};

methods.setMethods = function (methods) {
  if (!_.isObject(methods)) {
    throw new Error('Invalid parameters passed to `setMethods` function');
  }
  _.extend(this.methods, methods);
};

methods.setEvents = function (events) {
  if (!_.isObject(events)) {
    throw new Error('Invalid parameters passed to `setEvents` function');
  }
  _.extend(this.events, events);
};

methods.setRequired = function (required) {
  if (!_.isObject(required)) {
    throw new Error('Invalid parameters passed to `setRequired` function');
  }
  _.extend(this.required, required);
};

BehaviorBase = Class.extend({
  constructor: function () {
    var self = this;

    self.fields = {};
    self.methods = {};
    self.events = {};
    self.required = {};
    self.options = {};
  },
  prototype: methods
});
