# cerebral-tcomb

A Cerebral package with tcomb

# API

## How to instantiate a cerebral-tcomb controller

```js
var Controller = require('cerebral-tcomb');
var t = Controller.t;

// define the type of the state
var Type = t.struct({
  email: t.maybe(t.String),
  profile: t.struct({
    age: t.maybe(t.Number)
  }),
  tags: t.list(t.String),
  other: t.Any
});

// the initial state of the application
var initialState = {
  email: 'a@domain.com',
  profile: {
    age: 41
  },
  tags: ['web developer'],
  other: {a: 1}
};

// any default input you want each action to receive
var defaultInput = {};

// instantiate the controller
var controller = Controller(initialState, defaultInput, Type);

controller.signal('test', function (input, state, output) {
  // use the API here
});
```

## state API

Note: a path can be a string or an array.

```js
var Path = union([t.String, t.list(t.String)]);
```

### get(path: Path)

```js
state.get('email'); // => 'a@domain.com'
state.get(['profile', 'age']); // => 41
```

### set(path: Path, value: t.Any)

```js
state.set('email', 'b@domain.com');
state.set(['profile', 'age'], 42);
```

### unset(path: Path)

Same as `set(path, null)`.

```js
state.unset('email');
state.unset(['profile', 'age']);
```

### concat(path: Path, value: t.Array)

```js
state.concat('tags', ['rock climber', 'SF reader']); // tags will be ['web developer', 'rock climber', 'SF reader']
```

### push(path: Path, value: t.Any)

Same as `concat(path, [value])`.

### splice(path: Path, ...args)

For each item in `args` call `splice()` on the target with the parameters provided by the item.

```js
state.set('tags', ['web developer', 'rock climber', 'SF reader']);
state.splice('tags', [1, 1], [1, 1, 'bass player']); // tags will be ['web developer', 'bass player']
```

### pop(path: Path)

```js
state.pop('tags'); // tags will be []
```

### shift(path: Path)

```js
state.shift('tags'); // tags will be []
```

### unshift(path: Path, value: t.Any)

```js
state.unshift('tags', 'rock climber'); // tags will be ['rock climber', 'web developer']
```

### merge(path: Path, value: t.Any)

```js
state.merge(['other'], {b: 2}); // other will be {a: 1, b: 2}
```

# License

The MIT License (MIT)
