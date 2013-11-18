BehaviorBase = function () {};

BehaviorBase.extend = function (definition) {
  var self = this;

  var extendOptions = {
    constructor: function (options) {
      this.options = this.options || {};
      _.extend(this.options, options);
    },
    object: {
      options: {},
      fields: {},
      required: {},
      validators: {},
      methods: {},
      events: {}
    },
    prototype: {},
    statics: {}
  };

  // Get only allowed properties from the definition object.
  var allowedProperties = [
    'options',
    'fields',
    'required',
    'validators',
    'methods',
    'events'
  ];
  definition = _.pick(definition, allowedProperties);

  _.extend(extendOptions.object, definition);

  return Class.extend.call(self, extendOptions);
};
