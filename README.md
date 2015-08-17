immutable and type checked model layer for [cerebral](https://github.com/christianalfoni/cerebral) based on [tcomb](https://github.com/gcanti/tcomb)

# API

*Note. If you don't know how to define types with tcomb you may want to take a look at its [README](https://github.com/gcanti/tcomb/blob/master/README.md) or the [GUIDE](https://github.com/gcanti/tcomb/blob/master/GUIDE.md).*

## model API

```js
Model(initialState, [State])
```

**Example**

```js
var Controller = require('cerebral');
var Model = require('cerebral-tcomb');
var t = Model.t; // the tcomb library is re-exported

// define the state type
var State = t.struct({
  email: t.String,
  profile: t.struct({
    age: t.Number
  }),
  tags: t.list(t.String),
  other: t.Any
});

// the initial state of the application
var initialState = State({
  email: 'a@domain.com',
  profile: {
    age: 41
  },
  tags: ['web developer'],
  other: {a: 1}
});

// any default input you want each action to receive
var defaultInput = {};

// instantiate the controller
// the argument `State` is optional, by default its value
// is the initialState's constructor
var model = Model(initialState, State);

// instantiate the controller
var controller = Controller(, defaultInput);

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
state.unset('email'); // it throws if email is not a t.maybe(t.String)
state.unset(['profile', 'age']); // it throws if profile.age is not a t.maybe(t.Number)
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
