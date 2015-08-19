var tape = require('tape');
var Controller = require('cerebral');
var Model = require('../.');
var validatePath = require('../lib/validatePath')
var t = Model.t;

var State = t.struct({
  email: t.maybe(t.String),
  profile: t.struct({
    age: t.maybe(t.Number)
  }),
  tags: t.list(t.String),
  other: t.Any
});

var initialState = State({
  email: 'a@domain.com',
  profile: {
    age: 41
  },
  tags: ['web developer'],
  other: {a: 1}
});

function getController() {
  return Controller(Model(initialState));
}

tape('validatePath', function (tape) {

  tape.test('should issue an error when an invalid path is used', function (assert) {
    assert.plan(20);
    var Profile = t.struct({
      name: t.String
    });
    var Person = t.struct({
      struct: Profile,
      arr: t.Array,
      list: t.list(Profile),
      tuple: t.tuple([t.String, Profile]),
      dict: t.dict(t.String, Profile),
      subtype: t.subtype(Profile, function () { return true; }),
      maybe: t.maybe(Profile),
      union: t.union([t.String, Profile]),
      intersection: t.intersection([Profile, Profile])
    }, 'Person');

    assert.deepEqual(validatePath(['invalid'], Person), ['invalid']);

    assert.strictEqual(validatePath(['struct', 'name'], Person), undefined);
    assert.deepEqual(validatePath(['struct', 'surname'], Person), ['struct', 'surname']);

    assert.strictEqual(validatePath(['arr', 2], Person), undefined);
    assert.deepEqual(validatePath(['arr', -1], Person), ['arr', -1]);

    assert.strictEqual(validatePath(['list', 0], Person), undefined);
    assert.deepEqual(validatePath(['list', -1], Person), ['list', -1]);
    assert.deepEqual(validatePath(['list', 0, 'surname'], Person), ['list', 0, 'surname']);

    assert.strictEqual(validatePath(['tuple', 0], Person), undefined);
    assert.deepEqual(validatePath(['tuple', 1, 'surname'], Person), ['tuple', 1, 'surname']);

    assert.strictEqual(validatePath(['dict', 'a'], Person), undefined);
    assert.deepEqual(validatePath(['dict', 'a', 'surname'], Person), ['dict', 'a', 'surname']);

    assert.strictEqual(validatePath(['subtype', 'name'], Person), undefined);
    assert.deepEqual(validatePath(['subtype', 'surname'], Person), ['subtype', 'surname']);

    assert.strictEqual(validatePath(['maybe', 'name'], Person), undefined);
    assert.deepEqual(validatePath(['maybe', 'surname'], Person), ['maybe', 'surname']);

    assert.strictEqual(validatePath(['union', 'name'], Person), undefined);
    assert.deepEqual(validatePath(['union', 'surname'], Person), ['union', 'surname']);

    assert.strictEqual(validatePath(['intersection', 'name'], Person), undefined);
    assert.deepEqual(validatePath(['intersection', 'surname'], Person), ['intersection', 'surname']);
  });

});

tape('model', function (tape) {

  tape.test('get', function (assert) {
    assert.plan(3);
    var controller = getController();
    controller.signal('test', function (input, state) {
      assert.strictEqual(state.get('email'), 'a@domain.com', 'path as string');
      assert.strictEqual(state.get(['email']), 'a@domain.com', 'path as array');
      assert.throws(function () {
        state.get(['profile', 'name']);
      });
    });
    controller.signals.test();
  });

  tape.test('set', function (assert) {
    assert.plan(3);
    var controller = getController();
    controller.signal('test', function (input, state) {
      state.set('email', 'b@domain.com', 'path as string');
      assert.strictEqual(controller.get('email'), 'b@domain.com');
      state.set(['profile', 'age'], 42, 'path as array');
      assert.strictEqual(controller.get(['profile', 'age']), 42);
      assert.throws(function () {
        state.set('profile', null);
      });
    });
    controller.signals.test();
  });

  tape.test('unset', function (assert) {
    assert.plan(2);
    var controller = getController();
    controller.signal('test', function (input, state) {
      state.unset('email');
      assert.strictEqual(controller.get('email'), null, 'path as string');
      state.unset(['profile', 'age']);
      assert.strictEqual(controller.get(['profile', 'age']), null, 'path as array');
    });
    controller.signals.test();
  });

  tape.test('concat', function (assert) {
    assert.plan(1);
    var controller = getController();
    controller.signal('test', function (input, state) {
      state.concat('tags', ['rock climber', 'SF reader']);
      assert.deepEqual(controller.get('tags'), ['web developer', 'rock climber', 'SF reader']);
    });
    controller.signals.test();
  });

  tape.test('push', function (assert) {
    assert.plan(1);
    var controller = getController();
    controller.signal('test', function (input, state) {
      state.push('tags', 'rock climber');
      assert.deepEqual(controller.get('tags'), ['web developer', 'rock climber']);
    });
    controller.signals.test();
  });

  tape.test('splice', function (assert) {
    assert.plan(1);
    var controller = getController();
    controller.signal('test', function (input, state) {
      state.set('tags', ['web developer', 'rock climber', 'SF reader'])
      state.splice('tags', [1, 1], [1, 1, 'bass player']);
      assert.deepEqual(controller.get('tags'), ['web developer', 'bass player']);
    });
    controller.signals.test();
  });

  tape.test('merge', function (assert) {
    assert.plan(2);
    var controller = getController();
    controller.signal('test', function (input, state) {
      state.merge(['other'], {b: 2});
      assert.deepEqual(controller.get('other'), {a: 1, b: 2});
      state.merge(['other', 'a'], {c: 3});
      assert.deepEqual(controller.get('other'), {a: {c: 3}, b: 2});
    });
    controller.signals.test();
  });

  tape.test('pop', function (assert) {
    assert.plan(1);
    var controller = getController();
    controller.signal('test', function (input, state) {
      state.pop('tags');
      assert.deepEqual(controller.get('tags'), []);
    });
    controller.signals.test();
  });

  tape.test('shift', function (assert) {
    assert.plan(1);
    var controller = getController();
    controller.signal('test', function (input, state) {
      state.shift('tags');
      assert.deepEqual(controller.get('tags'), []);
    });
    controller.signals.test();
  });

  tape.test('unshift', function (assert) {
    assert.plan(1);
    var controller = getController();
    controller.signal('test', function (input, state) {
      state.unshift('tags', 'rock climber');
      assert.deepEqual(controller.get('tags'), ['rock climber', 'web developer']);
    });
    controller.signals.test();
  });

});