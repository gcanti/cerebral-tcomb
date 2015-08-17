var t = require('tcomb');

function getValue(path, obj) {
  path = path.slice();
  while (path.length) {
    obj = obj[path.shift()];
  }
  return obj;
}

function factory(initialState, State) {

  // the argument `State` is optional, by default its value
  // is the initialState's constructor
  State = State || initialState.constructor;
  initialState = State(initialState);
  var state = initialState;

  function applySpec(path, setField) {
    var spec = {};
    var field = spec;
    for (var i = 0, len = path.length; i < len; i++ ) {
      field = field[path[i]] = {};
    }
    setField(field);
    state = State.update(state, spec);
  }

  return function (controller) {

    controller.on('reset', function () {
      state = initialState;
    });

    controller.on('seek', function (seek, isPlaying, recording) {
      state = recording.initialState;
    });

    return {
      get: function get(path) {
        return getValue(path, state);
      },
      getRecordingState: function getRecordingState() {
        return state;
      },
      mutators: {
        set: function set(path, value) {
          applySpec(path, function (field) {
            field.$set = value;
          });
        },
        unset: function unset(path) {
          applySpec(path, function (field) {
            field.$set = null;
          });
        },
        push: function push(path, value) {
          applySpec(path, function (field) {
            field.$push = [value];
          });
        },
        splice: function splice(path) {
          var args = Array.prototype.slice.call(arguments, 1);
          applySpec(path, function (field) {
            field.$splice = args;
          });
        },
        merge: function merge(path, value) {
          applySpec(path, function (field) {
            field.$merge = value;
          });
        },
        concat: function concat(path, value) {
          applySpec(path, function (field) {
            field.$push = value;
          });
        },
        pop: function pop(path) {
          applySpec(path, function (field) {
            field.$apply = function (value) {
              return value.slice(0, value.length - 1);
            };
          });
        },
        shift: function shift(path) {
          applySpec(path, function (field) {
            field.$apply = function (value) {
              return value.slice(1);
            };
          });
        },
        unshift: function unshift(path, value) {
          applySpec(path, function (field) {
            field.$unshift = [value];
          });
        }
      }
    };

  };

}

// re-export tcomb
factory.t = t;

module.exports = factory;
