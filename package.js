Package.describe({
  summary: "Model layer for Meteor"
});

Package.on_use(function (api) {
  api.use(['meteor', 'underscore']);
  
  api.add_files([
    'lib/schema.js',
    'lib/utils.js',
    'lib/model_base.js',
    'lib/model.js',
    'lib/behavior.js'
    ], ['client', 'server']);
  
  api.export([
    'Model',
    'Behavior',
    'Behaviors'
  ], ['client', 'server']);
});
