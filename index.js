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

    defaultArgs: defaultArgs,

    onReset: function () {
      state = initialState;
    },

    onError: function (error) {
      eventEmitter.emit('error', error);
    },

    onGetRecordingState: function () {
      return state;
    },

    onSeek: function (seek, isPlaying, recording) {
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

    onUnset: function (path) {
      applySpec(path, function (field) {
        field.$set = null;
      });
    },

    onConcat: function (path, value) {
      applySpec(path, function (field) {
        field.$push = value;
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

    onPop: function (path) {
      applySpec(path, function (field) {
        field.$apply = function (value) {
          return value.slice(0, value.length - 1);
        };
      });
    },

    onShift: function (path) {
      applySpec(path, function (field) {
        field.$apply = function (value) {
          return value.slice(1);
        };
      });
    },

    onUnshift: function (path, value) {
      applySpec(path, function (field) {
        field.$unshift = [value];
      });
    },

    onMerge: function (path, value) {
      applySpec(path, function (field) {
        field.$merge = value;
      });
    }

  });

  controller.eventEmitter = eventEmitter;

  return controller;
}

// re-export tcomb
factory.t = t;

module.exports = factory;