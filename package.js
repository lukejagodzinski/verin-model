Package.describe({
  summary: "Model layer designed for Meteor."
});

Package.on_use(function (api) {
  api.use(['meteor', 'underscore', 'underscore-string']);
  
  api.add_files([
    'lib/model.js',
    'lib/behaviour.js',
    'lib/validator.js',
    'lib/validators/string.js'
    ], ['client', 'server']);
  
  api.export([
    'Model',
    'Behaviour',
    'Validator',
    'StringValidator',
    'Behaviours'
  ], ['client', 'server']);
});
