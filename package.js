Package.describe({
  summary: "Model layer designed for Meteor."
});

Package.on_use(function (api) {
  api.use(['meteor', 'underscore', 'zeitgeist-class']);
  
  api.add_files([
    'lib/definition.js',
    'lib/model_utils.js',
    'lib/model_base.js',
    'lib/model.js',
    'lib/behavior_base.js',
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
