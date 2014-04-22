Utils = {};

Utils.extendSchema = function (schema) {
    _.each(Array.prototype.slice.call(arguments, 1), function (source) {
        if (source) {
            _.each(source, function (undefined, prop) {
                switch (prop) {
                case 'fields':
                case 'required':
                case 'validators':
                case 'methods':
                    if (_.has(schema, prop)) {
                        _.extend(schema[prop], source[prop]);
                    } else {
                        schema[prop] = source[prop];
                    }
                    break;
                case 'hooks':
                    schema.hooks = schema.hooks || {};
                    _.each(source.hooks, function (hook, name) {
                        schema.hooks[name] = schema.hooks[name] || [];
                        schema.hooks[name] = schema.hooks[name].concat(source.hooks[name]);
                    });
                    _.each(schema.hooks, function (hook, name) {
                        schema.hooks[name] = _.isArray(schema.hooks[name]) ? schema.hooks[name] : [schema.hooks[name]];
                    });
                    break;
                }
            });
        }
    });
    return schema;
};

Utils.checkRequired = function () {
    var self = this,
        schema = self.constructor.schema;

    // Iterate over required fields and check if they are present in the object
    // and not null or undefined.
    _.each(schema.required, function (errorMessage, fieldName) {
        if (!_.has(self, fieldName) || self[fieldName] === null || self[fieldName] === undefined) {
            throw new Meteor.Error(422, errorMessage);
        }
    });
};

Utils.getAllowedFields = function () {
    var self = this,
        schema = self.constructor.schema;
    // Get names of model's fields.
    fields = _.keys(schema.fields);
    // Get only allowed fields from the object.
    return _.pick(self, fields);
};

Utils.runHooks = function (name) {
    var self = this,
        schema = self.constructor.schema;
    // Get hooks.
    if (schema.hooks && _.has(schema.hooks, name)) {
        // Run hooks.
        _.each(schema.hooks[name], function (hook) {
            hook.call(self);
        });
    }
};

Utils.createConstructor = function (name, func) {
    var body = 'return function ' + name + '() { return f.apply(this, arguments); };';
    return new Function('f', body)(func);
};