var cerebral = require('cerebral');
var t = require('tcomb');
var EventEmitter = require('events').EventEmitter;
var Value = cerebral.Value;

function factory(initialState, defaultArgs, Type) {

  var eventEmitter = new EventEmitter();
  initialState = Type(initialState);
  var state = initialState;

  function applySpec(path, cb) {
    var spec = {};
    var field = spec;
    for (var i = 0, len = path.length; i < len; i++ ) {
      field = field[path[i]] = {};
    }
    cb(field);
    state = Type.update(state, spec);
  }

  var controller = cerebral.Controller({

    // Note: missing description in README.md
    defaultArgs: defaultArgs,

    onReset: function () {
      state = initialState;
    },

    // Note: missing implementation in the cerebral-react-baobab package
    onError: function (error) {
      eventEmitter.emit('error', error);
    },

    // Note: missing description in README.md
    onGetRecordingState: function () {
      return state;
    },

    onSeek: function (seek, isPlaying, currentRecording) {
      state = recording.initialState;
      eventEmitter.emit('change', state);
    },

    onUpdate: function () {
      eventEmitter.emit('change', state);
    },

    onRemember: function () {
      eventEmitter.emit('remember', state);
    },

    onGet: function (path) {
      return Value(path, state);
    },

    onSet: function (path, value) {
      applySpec(path, function (field) {
        field.$set = value;
      });
    },

    onUnset: function (path, key) {
      applySpec(path.concat(key), function (field) {
        field.$set = null;
      });
    },

    onPush: function (path, value) {
      applySpec(path, function (field) {
        field.$push = [value];
      });
    },

    onSplice: function (path) {
      var args = Array.prototype.slice.call(arguments, 1);
      applySpec(path, function (field) {
        field.$splice = args;
      });
    },

    onMerge: function (path, value) {
      applySpec(path, function (field) {
        field.$merge = value;
      });
    },

    onConcat: function (path, value) {
      applySpec(path, function (field) {
        field.$push = value;
      });
    },

    onPop: function (path) {
      // FIXME: failing now for https://github.com/christianalfoni/cerebral/issues/59
      applySpec(path, function (field) {
        field.$apply = function (value) {
          return value.slice(0, value.length - 1);
        };
      });
    },

    onShift: function (path) {
      // FIXME: failing now for https://github.com/christianalfoni/cerebral/issues/59
      applySpec(path, function (field) {
        field.$apply = function (value) {
          return value.slice(1);
        };
      });
    },

    onUnshift: function (path, value) {
      applySpec(path, function (field) {
        field.$apply = function (arr) {
          return [value].concat(arr);
        };
      });
    }

  });

  controller.eventEmitter = eventEmitter;

  return controller;
}

// re-export tcomb
factory.t = t;

module.exports = factory;