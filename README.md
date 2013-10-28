# ZeitgeistModel

Model layer for Meteor

## Contribution

If you have any suggestions or want to write new features or behaviours please contact me, or just create pull request.

The ZeitgeistModel package is a part of a bigger project I'm working on, named [Zeitgeist Portal](https://github.com/jagi/zeitgeist). It's an open source information portal for [The Zeitgeist Movement](http://thezeitgeistmovement.com) chapters around the world, but can be used by anyone to create their own information portal. If you know Meteor and want to help please contact me. The Zeitgeist Movement is non profit organization that fights for a betterment of mankind. For more information go the official [website](http://thezeitgeistmovement.com).

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

### Creating model

To define `Model` class you have to define `Meteor.Collection` first. It's just as simple as in the example below:

```js
// Define Collection
var Posts = new Meteor.Collection('posts');

// Define Model
var Post = Model(Posts, function() {
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

### Fetching documents from database

You can convert document fetched from database to the object of given class just by passing this document to the class constructor.

```js
var p = new Post(Posts.findOne());
```

For now there is no direct way to fetch documents from database that are automatically object of a given class. I'm open for suggestions how it could be achieved without messing in Meteor's code.

### Model definition

When defining `Model` class you have to pass as a second parameter function that describes this model. In this function you can use several methods that are provided to describe model class.

#### this.initialize()

You can pass a constructor function as a parameter of this method.

```js
var Post = Model(Posts, function () {
  this.initialize(function () {
    // Do some stuff when object of given class is created
    this.creationDate = new Date();
  });
});
```

#### this.fields()

Defines model's properties with their default values.

```js
var Post = Model(Posts, function () {
  this.fields({
    title: null,
    commentsCount: 0
  });
});
```

#### this.required()

Defines model's properties that are required to save document into database. Each required field has its corresponding error massage that is thrown when the field is not present.

```js
var Post = Model(Posts, function () {
  this.fields({
    title: null
  });
  
  this.required({
    title: 'You have to name post'
  });
});
```

#### this.methods()

Defines model's methods.

```js
var User = Model(Users, function () {
  this.fields({
    birthDate: null
  });
  
  this.methods({
    getAge: function () {
      var age;
      // Calculate age by taking actual date and `birthDate`
      return age;
    }
  });
});
```

#### this.events()

Define model's events being executed before and after save, insert, update or remove. There are following defined events:

- preSave
- preInsert
- preUpdate
- preRemove
- postSave
- postInsert
- postUpdate
- postRemove
 
`preSave` event is executed both when inserting or updating document into database. `preSave` is not executed when removing.

```js
var Post = Model(Posts, function () {
  this.events({
    preUpdate: function () {
      this.updatedAt = new Date();
    }
  });
});
```

#### this.behaviour()

Behaviours are often repeated actions that can be automated and shipped as an addon for the model. As an example take situation when you have to update `createdAt` and `updatedAt` fields whenever document is saved in a database. Instead doing it by hand you can just use `timestampable` behaviour and it will be done automatically.

```js
var Post = Model(Posts, function () {
  this.behaviour('timestampable', {
    // Pass behaviour options if needed
  });
});

var p = new Post();
p.save(); // `createdAt` field will be filled with a current date
p.save(); // `updatedAt` field will be filled with a current date
```

There are few behaviours already written for you but you can create your own:

- [timestampable](https://github.com/jagi/zeitgeist-timestampable/) takes care of updating `createdAt` and `updatedAt` fields whenever document is save into database
- [sluggable](https://github.com/jagi/zeitgeist-sluggable/) creates browser friendly version of field (string), e.g. from "The post title!" to "the-post-title"
- [viewable](https://github.com/jagi/zeitgeist-viewable/) introduce views counter into model
- [voteable](https://github.com/jagi/zeitgeist-voteable/) allows user to vote up/down on given document

### Writing behaviours

Soon...
