ModelBase = function (attrs) {
  _.extend(this, attrs);
};

ModelBase.prototype = {};

ModelBase.prototype.save = function () {
  var self = this,
      schema = self.constructor.schema;

  // Check if all required fields had been given.
  Utils.checkRequired.call(self);

  // Execute pre hooks.
  Utils.runHooks.call(self, 'beforeSave');
  if (self._id) {
    Utils.runHooks.call(self, 'beforeUpdate');
  } else {
    Utils.runHooks.call(self, 'beforeInsert');
  }

  // Get only fields that need to be saved in database.
  var fields = Utils.getAllowedFields.call(self);

  // Decide if we need to update or insert document into collection.
  if (self._id) {
    schema.collection.update(self._id, { $set: fields });
  } else {
    self._id = schema.collection.insert(fields);
  }

  // Execute post hooks.
  if (self._id) {
    Utils.runHooks.call(self, 'afterUpdate');
  } else {
    Utils.runHooks.call(self, 'afterInsert');
  }
  Utils.runHooks.call(self, 'afterSave');

  return self._id;
};

ModelBase.prototype.remove = function () {
  var self = this,
      schema = self.constructor.schema;

  Utils.runHooks.call(self, 'beforeRemove');
  schema.collection.remove(this._id);
  self._id = undefined;
  Utils.runHooks.call(self, 'afterRemove');
};