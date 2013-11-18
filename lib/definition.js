var methods = {};

methods.initialize = function (collection, schema) {
  var self = this;

  self.collection = collection;
  self.fields = {};
  self.required = {};
  self.validators = {};
  self.methods = {};
  self.events = {};
  self.behaviors = {};

  var properties = [
    'constructor',
    'fields',
    'required',
    'validators',
    'methods',
    'events',
    'behaviors'
  ];

  schema = _.pick(schema, properties);

  // Check schema validity.
  if (_.has(schema, 'constructor') && ! _.isFunction(schema.constructor)) {
    throw new Error('Invalid `constructor` parameter in model schema');
  }
  if (_.has(schema, 'fields') && ! _.isObject(schema.fields)) {
    throw new Error('Invalid `fields` parameter in model schema');
  }
  if (_.has(schema, 'required') && ! _.isObject(schema.required)) {
    throw new Error('Invalid `required` parameter in model schema');
  }
  if (_.has(schema, 'methods') && ! _.isObject(schema.methods)) {
    throw new Error('Invalid `methods` parameter in model schema');
  }
  if (_.has(schema, 'events') && ! _.isObject(schema.events)) {
    throw new Error('Invalid `events` parameter in model schema');
  }
  if (_.has(schema, 'validators')) {
    methods.setValidators.call(schema, schema.validators);
  }
  if (_.has(schema, 'behaviors')) {
    methods.setBehaviors.call(schema, schema.behaviors);
  }

  _.extend(self, schema);
};

methods.setValidator = function (name, options) {
  var self = this;

  // Check parameters type validity.
  if(!_.isString(name) || !_.isObject(options)) {
    throw new Error('Invalid parameters type');
  }
  self.validators[name] = new Validators[name](options);
};

methods.setValidators = function (validators) {
  var self = this;

  if (!_.isObject(validators)) {
    throw new Error('Invalid parameters passed to `setValidators` function');
  }
  _.each(validators, function (validator, name) {
    methods.setValidator.call(self, name, validator);
  });
};

methods.setBehavior = function (name, options) {
  var self = this;

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
  self.behaviors[name] = new BehaviorFunction(options);
};

methods.setBehaviors = function (behaviors) {
  var self = this;

  if (!_.isObject(behaviors)) {
    throw new Error('Invalid `behaviors` parameter in model schema');
  }
  _.each(behaviors, function (behavior, name) {
    methods.setBehavior.call(self, name, behavior);
  });
};

Definition = function (collection, schema) {
  var self = this;

  methods.initialize.call(self, collection, schema);
};
