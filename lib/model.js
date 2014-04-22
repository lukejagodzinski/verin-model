Model = function VerinModel(name, schema) {
    // Check parameters validity.
    if (this instanceof VerinModel) {
        throw new Error('Do not use "new" keyword to create model');
    }
    if (!_.isString(name)) {
        throw new Error('Pass model name');
    }
    if (!_.isObject(schema)) {
        throw new Error('Pass model schema');
    }

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