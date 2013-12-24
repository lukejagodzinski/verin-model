Behavior = function () {
};

Behavior.create = function (name, definition) {
  // Check parameters validity.
  if (! name || ! _.isString(name)) {
    throw new Error('Pass behavior name');
  }
  if (! definition || ! _.isObject(definition)) {
    throw new Error('Pass behavior\'s definition');
  }

  // Create behavior class.
  var Behavior = Utils.createConstructor(name, function (options) {
    var self = this;

    // Check if "new" keyword was used to create instance.
    if (! (self instanceof Behavior)) {
      throw new Error('Use "new" to create instance of "' + name + '" behavior');
    }

    // Extend behavior with provided data.
    _.extend(self, _.pick(definition, [
      'options',
      'fields',
      'required',
      'validators',
      'methods',
      'hooks'
    ]));

    // Extend behavior options with model specific options.
    self.options = _.extend({}, self.options, options);

    // Run behavior constructor if provided.
    if (_.has(definition, 'constructor')) {
      definition.constructor.call(self);
    }
  });

  // Add behavior to behaviors list with the specified name.
  Behaviors[name] = Behavior;
};

Behaviors = {};
