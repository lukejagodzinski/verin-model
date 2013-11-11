Package.describe({
  summary: "Model layer designed for Meteor."
});

Package.on_use(function (api) {
  api.use(['meteor', 'underscore', 'zeitgeist-class']);
  
  api.add_files([
    'lib/model_utils.js',
    'lib/base_model.js',
    'lib/model.js',
    'lib/behavior.js',
    'lib/validator.js',
    'lib/validators/string.js'
    ], ['client', 'server']);
  
  api.export([
    'Model',
    'Behavior',
    'Behaviors',
    'Validator',
    'Validators',
    'StringValidator'
  ], ['client', 'server']);
});
