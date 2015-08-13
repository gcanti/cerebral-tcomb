var tape = require('tape');
var Controller = require('../.');
var t = Controller.t;

var Type = t.struct({
  email: t.maybe(t.String),
  profile: t.struct({
    age: t.maybe(t.Number)
  }),
  tags: t.list(t.String),
  any: t.Any
});

var initialState = {
  email: 'a@domain.com',
  profile: {
    age: 41
  },
  tags: ['a'],
  any: {a: 1}
};

tape('controller', function (tape) {

  tape.test('initialState', function (assert) {
    assert.plan(2);
    var controller = Controller(initialState, null, Type);
    assert.strictEqual(controller.get('email'), 'a@domain.com');
    assert.strictEqual(controller.get(['profile', 'age']), 41);
  });

  tape.test('set', function (assert) {
    assert.plan(2);
    var controller = Controller(initialState, null, Type);
    controller.signal('test', function (input, state, output) {
      state.set('email', 'b@domain.com');
      state.set(['profile', 'age'], 42);
      assert.strictEqual(controller.get('email'), 'b@domain.com');
      assert.strictEqual(controller.get(['profile', 'age']), 42);
    });
    controller.signals.test();
  });

  tape.test('unset', function (assert) {
    assert.plan(2);
    var controller = Controller(initialState, null, Type);
    controller.signal('test', function (input, state, output) {
      state.unset('email');
      state.unset('profile', 'age');
      assert.strictEqual(controller.get('email'), null);
      assert.strictEqual(controller.get(['profile', 'age']), null);
    });
    controller.signals.test();
  });

  tape.test('push', function (assert) {
    assert.plan(1);
    var controller = Controller(initialState, null, Type);
    controller.signal('test', function (input, state, output) {
      state.push('tags', 'b');
      assert.deepEqual(controller.get('tags'), ['a', 'b']);
    });
    controller.signals.test();
  });

  tape.test('splice', function (assert) {
    assert.plan(1);
    var controller = Controller(initialState, null, Type);
    controller.signal('test', function (input, state, output) {
      state.set('tags', ['a', 'b', 'c'])
      state.splice('tags', [1, 1], [1, 1, 'd']);
      assert.deepEqual(controller.get('tags'), ['a', 'd']);
    });
    controller.signals.test();
  });

  tape.test('merge', function (assert) {
    assert.plan(1);
    var controller = Controller(initialState, null, Type);
    controller.signal('test', function (input, state, output) {
      state.merge('any', {b: 2});
      assert.deepEqual(controller.get('any'), {a: 1, b: 2});
    });
    controller.signals.test();
  });

  tape.test('concat', function (assert) {
    assert.plan(1);
    var controller = Controller(initialState, null, Type);
    controller.signal('test', function (input, state, output) {
      state.concat('tags', ['b', 'c']);
      assert.deepEqual(controller.get('tags'), ['a', 'b', 'c']);
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
      state.unshift('tags', 'b');
      assert.deepEqual(controller.get('tags'), ['b', 'a']);
    });
    controller.signals.test();
  });

});