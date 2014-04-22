Model = function VerinModel(name, schema, transform) {
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
    transform = transform || true;

    // Initialize schema.
    schema = new Schema(schema);

    // Create model class.
    var Model = Utils.createConstructor(name, function ( /* arguments */ ) {
        var self = this;

        // Check if "new" keyword was used to create instance.
        if (!(self instanceof Model)) {
            throw new Error('Use "new" keyword to create instance of "' + name + '" model');
        }

        // Apply schema to object.
        _.extend(self, schema.fields);

        // Call parent's constructor.
        ModelBase.apply(self, arguments);
        // Call constructor if defined.
        if (_.has(schema, 'constructor')) {
            schema.constructor.apply(self, arguments);
        }
    });

    // Extend class's prototype.
    Model.prototype = new ModelBase();
    Model.prototype.constructor = Model;
    Model.schema = schema;
    // Apply schema to class's prototype.
    _.extend(Model.prototype, schema.methods);

    // Autotransform collection's documents to objects of given class.
    if (transform) {
        var transformFunction = function (doc) {
            return new Model(doc);
        };
        schema.collection._transform = LocalCollection.wrapTransform(transformFunction);
    } else {
        schema.collection._transform = null;
    }

    return Model;
};