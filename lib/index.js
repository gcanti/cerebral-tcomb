var t = require('tcomb');
var validatePath = require('./validatePath');

function Model(initialState, State) {

  // the argument `State` is optional, by default its value
  // is the initialState's constructor
  State = State || initialState.constructor;

  // ensures the initialState validity
  initialState = State(initialState);

  // store the state in another variable in order to allow a debugger reset
  var state = initialState;

  // helper: checks whether a state path exists
  function checkPath(path) {
    if (process.env.NODE_ENV !== 'production') {
      var error = validatePath(path, State);
      if (error) {
        t.fail('-> [cerebral-tcomb] Invalid path ' + t.stringify(path) + ' for type ' + t.getTypeName(State));
      }
    }
  }

  // helper: retrives a value from the state tree
  function getValue(path, state) {
    checkPath(path);
    path = path.slice();
    while (path.length) {
      state = state[path.shift()];
    }
    return state;
  }

  // helper: builds a specification for the t.update function and updates the state
  function applyUpdate(path, setField) {
    checkPath(path);
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
          applyUpdate(path, function (field) {
            field.$set = value;
          });
        },
        unset: function unset(path) {
          applyUpdate(path, function (field) {
            field.$set = null;
          });
        },
        push: function push(path, value) {
          applyUpdate(path, function (field) {
            field.$push = [value];
          });
        },
        splice: function splice(path) {
          var args = Array.prototype.slice.call(arguments, 1);
          applyUpdate(path, function (field) {
            field.$splice = args;
          });
        },
        merge: function merge(path, value) {
          applyUpdate(path, function (field) {
            field.$merge = value;
          });
        },
        concat: function concat(path, value) {
          applyUpdate(path, function (field) {
            field.$push = value;
          });
        },
        pop: function pop(path) {
          applyUpdate(path, function (field) {
            field.$apply = function (value) {
              return value.slice(0, value.length - 1);
            };
          });
        },
        shift: function shift(path) {
          applyUpdate(path, function (field) {
            field.$apply = function (value) {
              return value.slice(1);
            };
          });
        },
        unshift: function unshift(path, value) {
          applyUpdate(path, function (field) {
            field.$unshift = [value];
          });
        }
      }
    }

  };

}

// re-export tcomb
Model.t = t;

module.exports = Model;
