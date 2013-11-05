Package.describe({
  summary: "Model layer designed for Meteor."
});

Package.on_use(function (api) {
  api.use(['meteor', 'underscore']);
  
  api.add_files([
    'lib/model.js',
    'lib/behavior.js'
    ], ['client', 'server']);
  
  api.export([
    'Model'
  ], ['client', 'server']);
});
