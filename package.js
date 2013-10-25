Package.describe({
  summary: "Model layer designed for Meteor."
});

Package.on_use(function (api) {
  api.use(['meteor', 'underscore', 'underscore-string']);
  
  api.add_files([
    'lib/model.js',
    'lib/behaviour.js'
    ], ['client', 'server']);
  
  api.export([
    'ZeitgeistModel',
    'ZeitgeistBehaviour',
    'ZeitgeistBehaviours',
    'Model',
    'Behaviour',
    'Behaviours'
  ], ['client', 'server']);
});
