# ZeitgeistModel

Model layer for Meteor

## Functionalities

- Fields and their default values
- Methods definition
- Required fields defnition with error messages
- Validators (soon)
- Behaviours
- `Pre` and `Post` events

## License

MIT

## Installation

ZeitgeistModel can be installed with [Meteorite](https://github.com/oortcloud/meteorite/).

```sh
$ mrt add zeitgeist-model
```

## API

### Basics

To define `Model` class you have to define `Meteor.Collection` first. It's just as simple as in the example below:

```js
// Define Collection
var Posts = new Meteor.Collection('posts');

// Define Model
var Post = new Model(Posts, function() {
  // Describe Model class
});
```

### Saving, updating and removing documents

Each `Model` class has `save` and `remove` methods. Those methods use `Collection` passed to `Model` function. Thanks to that you no longer have to execute `insert`, `update` or `remove` methods on `Collection` object. See the example below.

```js
var p = new Post();
p.save(); // Executes `Posts.insert()` and returns document's id
// Change Post object here
p.save(); // Executes `Posts.update()`
p.remove(); // Executes `Posts.remove()`
```

## Contribution

If you have any suggestions or want to write new features or behaviours please contact me, or just create pull request.
