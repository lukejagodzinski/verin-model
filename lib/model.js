Model = function (collection, schema, transform) {
  // Check parameters validity.
  if (! (collection instanceof Meteor.Collection)) {
    throw new Error('Pass `Meteor.Collection` object');
  }
  if (! _.isObject(schema)) {
    throw new Error('Model schema has to be object');
  }
  transform = transform || true;

  // Create model definition object.
  var definition = new Definition(collection, schema);

  // Create `Model` class for given `collection`.
  var Model = ModelBase.extend(definition);

  // Autotransform documents to model class.
  if (transform) {
    var transformFunction = function (doc) {
      return new Model(doc);
    };
    definition.collection._transform = Deps._makeNonreactive(transformFunction);
  } else {
    definition.collection._transform = null;
  }

  return Model;
};
