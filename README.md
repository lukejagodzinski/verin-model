# Verin Model

Model layer for Meteor

**Table of Contents**

- [Functionalities](#functionalities)
- [Installation](#installation)
- [Key Concepts](#key-concepts)
  - [Saving, updating and removing documents](#saving-updating-and-removing-documents)
  - [Fetching documents](#fetching-documents)
  - [Model schema](#model-schema)
    - [Constructor](#constructor)
    - [Fields](#fields)
    - [Required fields](#required-fields)
    - [Methods](#methods)
    - [Hooks](#hooks)
    - [Behaviors](#behaviors)
- [Writing behaviors](#writing-behaviors)
- [Contribution](#contribution)
- [License](#license)

## Functionalities

- Fields and their default values
- Methods definition
- Required fields defnition with error messages
- Validators (soon)
- Behaviors
- `Before` and `After` save, insert, update and remove hooks

## Installation

Verin Model can be installed with [Meteorite](https://github.com/oortcloud/meteorite/).

```sh
$ mrt add verin-model
```

## Key Concepts

### Creating model

To define model class you have to define `Meteor.Collection` first. It's just as simple as in the example below:

```js
// Define Collection
var Posts = new Meteor.Collection('posts');

// Define Model
var Post = Model('Post', {
  collection: Posts
  // Describe Model class
});
```

### Saving, updating and removing documents

Each `Model` class has `save` and `remove` methods. Those methods use Meteor `Collection` passed to `Model`'s schema. Thanks to that you no longer have to execute `insert`, `update` or `remove` methods on `Collection` object explicitly. See the example below.

```js
var p = new Post();
p.save(); // Executes `Posts.insert()` and returns document's id
// Change Post object here
p.save(); // Executes `Posts.update()`
p.remove(); // Executes `Posts.remove()`
```

### Fetching documents

You can convert document fetched from database to the object of given class just by passing this document to the class constructor.

```js
var p = new Post(Posts.findOne());
```

You can also fetch objects from database that are automatically transformed to you model class by setting to `true` third argument of `Model` function.

```js
var Post = Model(('Post', { collection: Posts }, true);
```

### Model schema

The `Model` function takes as a second argument schema object that defines a model. There're several properties that can be used inside schema.

#### Constructor

You can pass constructor function as `constructor` parameter.

```js
var Post = Model('Post', {
  collection: Posts,
  constructor: function (attrs) {
    // Do some stuff when creating object of given class
    this.creationDate = new Date();
  }
});
```

#### Fields

To define model's properties with their default values use `fields` property.

```js
var Post = Model('Post', {
  collection: Posts,
  fields: {
    title: null,
    commentsCount: 0
  }
});
```

#### Required fields

To define required fields use `required` property. Each required field has its corresponding error massage that is thrown when the field is not present.

```js
var Post = Model('Post', {
  collection: Posts,
  fields: {
    title: null
  },
  required: {
    title: 'You have to name post'
  }
});
```

#### Methods

Use `methods` property to defines model's methods.

```js
var User = Model('User', {
  collection: Users,
  fields: {
    birthDate: null
  },
  methods: {
    getAge: function () {
      var age;
      // Calculate age by taking actual date and `birthDate`
      return age;
    }
  }
});
```

#### Hooks

Use `hooks` property to define model's hooks that will be executed before and after save, insert, update or remove. There are following defined events:

- beforeSave
- beforeInsert
- beforeUpdate
- beforeRemove
- afterSave
- afterInsert
- afterUpdate
- afterRemove
 
`beforeSave` hook is executed both when inserting or updating document into database. `beforeSave` is not executed when removing.

```js
var Post = Model('Post', {
  collection: Posts,
  hooks: {
    beforeUpdate: function () {
      this.updatedAt = new Date();
    }
  }
});
```

#### Behaviors

Use `behaviors` property to set model's behaviors. Behaviors are often repeated actions that can be automated and shipped as an addon for the model. As an example take situation when you have to update `createdAt` and `updatedAt` fields whenever document is saved in a database. Instead doing it by hand you can just use `timestampable` behavior and it will be done automatically.

```js
var Post = Model('Post', {
  collection: Posts,
  behaviors: {
    timestampable: {
      // Pass behaviour options if needed
    }
  }
});

var p = new Post();
p.save(); // `createdAt` field will be filled with a current date
p.save(); // `updatedAt` field will be filled with a current date
```

There are few behaviours already written for you but you can create your own:

- [timestampable](https://github.com/jagi/verin-timestampable/) takes care of updating `createdAt` and `updatedAt` fields whenever document is save into database
- [sluggable](https://github.com/jagi/verin-sluggable/) creates browser friendly version of field (string), e.g. from "The post title!" to "the-post-title"
- [viewable](https://github.com/jagi/verin-viewable/) introduce views counter into model
- [voteable](https://github.com/jagi/verin-voteable/) allows user to vote up/down on given document

## Writing behaviors

Soon...

## Contribution

If you have any suggestions or want to write new features or behaviors please contact me, or just create issue or pull request.

## License

MIT
