Cosmology = Cosmology || {};

Cosmology.Class = function (properties, options) {
  // Validate parameters.
  if (this instanceof Cosmology.Class) {
    throw new Error('Do not use "new" keyword to create class');
  }
  if (!_.isObject(properties)) {
    throw new Error('Pass class properties');
  }
  if (!_.isObject(options)) {
    throw new Error('Pass class options');
  }

  var Class = function ( /* arguments */ ) {
    // Run `init` constructor if exists in object or prototype.
    if (this.init) this.init.apply(this, arguments);
  };

  return Class;
};

Class = Cosmology.Class;

return;

Model = function VerinModel(name, schema) {
  // Initialize schema.
  schema = new Schema(schema);

  // Create model class.
  var Model = Utils.createConstructor(name, _.has(schema, 'init') ? schema.init : schema.extend);

  // Create dummy constructor function creating parent's instance and to don't run constructor.
  function ctor() {
    this.constructor = Model;
  }
  ctor.prototype = schema.extend.prototype;
  Model.prototype = new ctor();
  Model.prototype.constructor = Model;
  Model.schema = schema;
  // Apply schema to class's prototype.
  _.extend(Model.prototype, schema.fields, schema.methods);

  // Autotransform collection's documents to objects of given class.
  if (schema.transform) {
    var transformFunction = function (doc) {
      return new Model(doc);
    };
    schema.collection._transform = LocalCollection.wrapTransform(transformFunction);
  }

  return Model;
};