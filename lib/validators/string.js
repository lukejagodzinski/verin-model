Validator('string', function (options) {
  options = options || {};
  
  this.setOptions(options);

  this.setValidate(function (value) {
    var self = this,
        length = value.length;

    if (self.hasOption('minLength') && length < self.getOption('minLength')) {
      throw new Error('minLength');
    }

    if (self.hasOption('maxLength') && length > self.getOption('maxLength')) {
      throw new Error('maxLength');
    }
  });
});
