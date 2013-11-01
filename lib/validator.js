ValidatorBase = function () {
  this._options = {};
  this._validate = function () {};
};

ValidatorBase.prototype.hasOption = function (name) {
  if (!_.isString(name)) {
    throw new Error('Invalid parameters passed to `hasOption` function');
  }
  return _.has(this._options, name);
};

ValidatorBase.prototype.setOption = function (name, value) {
  if (!_.isString(name) || value === undefined) {
    throw new Error('Invalid parameters passed to `setOption` function');
  }
  this._options[name] = value;
};

ValidatorBase.prototype.setOptions = function (options) {
  if (!_.isObject(options)) {
    throw new Error('Invalid parameters passed to `setOptions` function');
  }
  _.extend(this._options, options);
};

ValidatorBase.prototype.getOption = function (name) {
  if (!_.has(this._options, name)) {
    throw new Error('There is no option `' + name + '`');
  }
  return this._options[name];
};

ValidatorBase.prototype.getOptions = function () {
  return this._options;
};

ValidatorBase.prototype.setValidate = function (validate) {
  if (!_.isFunction(validate)) {
    throw new Error('Pass validation function as a parameter of the `setValidate` function');
  }
  this._validate = validate;
};

ValidatorBase.prototype.validate = function (value) {
  if (value === undefined) {
    throw new Error('There is no value to validate');
  }
  this._validate(value);
};

Validator = function (name, setup) {
  // Check parameters validity.
  if (!name || !_.isString(name)) {
    throw new Error('Pass validator name');
  }
  if (!setup || !_.isFunction(setup)) {
    throw new Error('Pass validator setup function');
  }

  var Validator = function () {
    var args = arguments;
    setup.apply(this, args);
  };

  Validator.prototype = new ValidatorBase();
  Validator.constructor = Validator;

  // Add validator to validators list with the specified name.
  Validators[name] = Validator;

  return Validator;
};

Validators = {};
