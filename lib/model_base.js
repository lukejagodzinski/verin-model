var methods = {};

methods.save = function () {
  var self = this;

  // Check if all required fields had been given.
  ModelUtils.checkRequired.call(self);

  // Execute pre events.
  ModelUtils.runEvents.call(self, 'preSave');
  if (self._id) {
    ModelUtils.runEvents.call(self, 'preUpdate');
  } else {
    ModelUtils.runEvents.call(self, 'preInsert');
  }

  // Get only fields that need to be save in database.
  var fields = ModelUtils.getFields.call(self);

  // Decide if we need to update or insert document into collection.
  if (self._id) {
    self._definition.collection.update(self._id, { $set: fields });
  } else {
    self._id = self._definition.collection.insert(fields);
  }

  // Execute post events.
  if (self._id) {
    ModelUtils.runEvents.call(self, 'postUpdate');
  } else {
    ModelUtils.runEvents.call(self, 'postInsert');
  }
  ModelUtils.runEvents.call(self, 'postSave');

  return self._id;
};

methods.remove = function () {
  var self = this;

  ModelUtils.runEvents.call(self, 'preRemove');
  self._definition.collection.remove(this._id);
  delete self._id;
  ModelUtils.runEvents.call(self, 'postRemove');
};

ModelBase = Class.extend({
  constructor: function (attrs) {
    _.extend(this, attrs);
  },
  prototype: methods
});