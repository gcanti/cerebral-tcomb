var t = require('tcomb');

function isInteger(n) {
  return n % 1 === 0;
}

function isArrayIndex(n) {
  return isInteger(n) && n >= 0;
}

function recurse(path, type, i) {
  if (i < path.length) {
    var prop = path[i];
    var error = path.slice(0, i + 1);
    switch (type.meta.kind) {
      case 'irreducible' :
        if (type === t.Array) {
          if (!isArrayIndex(prop)) {
            return error;
          }
        }
        else if (type !== t.Object && type !== t.Any) {
          return error;
        }
        break;
      case 'struct' :
        if (!type.meta.props.hasOwnProperty(prop)) {
          return error;
        }
        return recurse(path, type.meta.props[prop], i + 1);
      case 'list' :
        if (!isArrayIndex(prop)) {
          return error;
        }
        return recurse(path, type.meta.type, i + 1);
      case 'tuple' :
        if (!isArrayIndex(prop) || prop > type.meta.types.length - 1) {
          return error;
        }
        return recurse(path, type.meta.types[prop], i + 1);
      case 'dict' :
        return recurse(path, type.meta.codomain, i + 1);
      case 'maybe' :
      case 'subtype' :
        return recurse(path, type.meta.type, i);
      case 'union' :
        if (type.meta.types.every(function (type) {
          return !t.Nil.is(recurse(path, type, i));
        })) {
          return error;
        }
        break;
      case 'intersection' :
        if (type.meta.types.some(function (type) {
          return !t.Nil.is(recurse(path, type, i));
        })) {
          return error;
        }
        break;
    }
  }
}

// returns undefined if the path is valid and the offending slice of the path otherwise
function validatePath(path, type) {
  return recurse(path, type, 0);
}

module.exports = validatePath;
