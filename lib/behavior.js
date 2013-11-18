Behavior = function (name, definition) {
  // Check parameters validity.
  if (! name || ! _.isString(name)) {
    throw new Error("Pass behavior's name");
  }
  if (! definition || ! _.isObject(definition)) {
    throw new Error("Pass behavior's definition");
  }

  var Behavior = BehaviorBase.extend(definition);

  // Add behavior to behaviors list with the specified name.
  Behaviors[name] = Behavior;

  return Behavior;
};

Behaviors = {};
