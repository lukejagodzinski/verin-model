Schema = function (schema) {
    var self = this;

    // Check schema validity.
    if (!_.has(schema, 'collection')) {
        throw new Error('Collection property has to be set');
    }
    if (!(schema.collection instanceof Meteor.Collection)) {
        throw new Error('Invalid collection type');
    }

    // TODO: DETAILED SCHEMA VALIDATION FOR EACH ATTRIBUTE.

    // Extend schema with provided data.
    _.extend(self, _.pick(schema, [
        'behaviors',
        'collection',
        'init',
        'extend',
        'fields',
        'hooks',
        'methods',
        'required',
        'transform',
        'validators'
    ]));

    // Default values.
    self.transform = self.transform || false;
    self.extend = self.extend || ModelBase;

    // Create behaviors objects.
    _.each(self.behaviors, function (options, name) {
        // Check if behavior exists in the "Behaviors" list.
        if (!_.has(Behaviors, name)) {
            throw new Error('"' + name + '" behavior does not exist');
        }

        // Get behavior function.
        var Behavior = Behaviors[name];

        // Create new behavior object and insert it into schema.
        var behavior = self.behaviors[name] = new Behavior(options);

        Utils.extendSchema(self, _.pick(behavior, [
            'fields',
            'hooks',
            'methods',
            'required',
            'validators'
        ]));
    });
};