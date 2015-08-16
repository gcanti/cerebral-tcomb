var tape = require('tape');
var Controller = require('../.');
var t = Controller.t;

var Type = t.struct({
  email: t.maybe(t.String),
  profile: t.struct({
    age: t.maybe(t.Number)
  }),
  tags: t.list(t.String),
  other: t.Any
});

var initialState = {
  email: 'a@domain.com',
  profile: {
    age: 41
  },
  tags: ['web developer'],
  other: {a: 1}
};

tape('controller', function (tape) {

  tape.test('get', function (assert) {
    assert.plan(2);
    var controller = Controller(initialState, null, Type);
    controller.signal('test', function (input, state, output) {
      assert.strictEqual(controller.get('email'), 'a@domain.com', 'path as string');
      assert.strictEqual(controller.get(['email']), 'a@domain.com', 'path as array');
    });
    controller.signals.test();
  });

  tape.test('set', function (assert) {
    assert.plan(2);
    var controller = Controller(initialState, null, Type);
    controller.signal('test', function (input, state, output) {
      state.set('email', 'b@domain.com', 'path as string');
      assert.strictEqual(controller.get('email'), 'b@domain.com');
      state.set(['profile', 'age'], 42, 'path as array');
      assert.strictEqual(controller.get(['profile', 'age']), 42);
    });
    controller.signals.test();
  });

  tape.test('unset', function (assert) {
    assert.plan(2);
    var controller = Controller(initialState, null, Type);
    controller.signal('test', function (input, state, output) {
      state.unset('email');
      assert.strictEqual(controller.get('email'), null, 'path as string');
      state.unset(['profile', 'age']);
      assert.strictEqual(controller.get(['profile', 'age']), null, 'path as array');
    });
    controller.signals.test();
  });

  tape.test('concat', function (assert) {
    assert.plan(1);
    var controller = Controller(initialState, null, Type);
    controller.signal('test', function (input, state, output) {
      state.concat('tags', ['rock climber', 'SF reader']);
      assert.deepEqual(controller.get('tags'), ['web developer', 'rock climber', 'SF reader']);
    });
    controller.signals.test();
  });

  tape.test('push', function (assert) {
    assert.plan(1);
    var controller = Controller(initialState, null, Type);
    controller.signal('test', function (input, state, output) {
      state.push('tags', 'rock climber');
      assert.deepEqual(controller.get('tags'), ['web developer', 'rock climber']);
    });
    controller.signals.test();
  });

  tape.test('splice', function (assert) {
    assert.plan(1);
    var controller = Controller(initialState, null, Type);
    controller.signal('test', function (input, state, output) {
      state.set('tags', ['web developer', 'rock climber', 'SF reader'])
      state.splice('tags', [1, 1], [1, 1, 'bass player']);
      assert.deepEqual(controller.get('tags'), ['web developer', 'bass player']);
    });
    controller.signals.test();
  });

  tape.test('merge', function (assert) {
    assert.plan(2);
    var controller = Controller(initialState, null, Type);
    controller.signal('test', function (input, state, output) {
      state.merge(['other'], {b: 2});
      assert.deepEqual(controller.get('other'), {a: 1, b: 2});
      state.merge(['other', 'a'], {c: 3});
      assert.deepEqual(controller.get('other'), {a: {c: 3}, b: 2});
    });
    controller.signals.test();
  });

  tape.test('pop', function (assert) {
    assert.plan(1);
    var controller = Controller(initialState, null, Type);
    controller.signal('test', function (input, state, output) {
      state.pop('tags');
      assert.deepEqual(controller.get('tags'), []);
    });
    controller.signals.test();
  });

  tape.test('shift', function (assert) {
    assert.plan(1);
    var controller = Controller(initialState, null, Type);
    controller.signal('test', function (input, state, output) {
      state.shift('tags');
      assert.deepEqual(controller.get('tags'), []);
    });
    controller.signals.test();
  });

  tape.test('unshift', function (assert) {
    assert.plan(1);
    var controller = Controller(initialState, null, Type);
    controller.signal('test', function (input, state, output) {
      state.unshift('tags', 'rock climber');
      assert.deepEqual(controller.get('tags'), ['rock climber', 'web developer']);
    });
    controller.signals.test();
  });

});