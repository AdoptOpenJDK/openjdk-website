(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};

},{}],2:[function(require,module,exports){
// 22.1.3.31 Array.prototype[@@unscopables]
var UNSCOPABLES = require('./_wks')('unscopables');
var ArrayProto = Array.prototype;
if (ArrayProto[UNSCOPABLES] == undefined) require('./_hide')(ArrayProto, UNSCOPABLES, {});
module.exports = function (key) {
  ArrayProto[UNSCOPABLES][key] = true;
};

},{"./_hide":31,"./_wks":86}],3:[function(require,module,exports){
'use strict';
var at = require('./_string-at')(true);

 // `AdvanceStringIndex` abstract operation
// https://tc39.github.io/ecma262/#sec-advancestringindex
module.exports = function (S, index, unicode) {
  return index + (unicode ? at(S, index).length : 1);
};

},{"./_string-at":73}],4:[function(require,module,exports){
module.exports = function (it, Constructor, name, forbiddenField) {
  if (!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)) {
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};

},{}],5:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};

},{"./_is-object":38}],6:[function(require,module,exports){
// false -> Array#indexOf
// true  -> Array#includes
var toIObject = require('./_to-iobject');
var toLength = require('./_to-length');
var toAbsoluteIndex = require('./_to-absolute-index');
module.exports = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

},{"./_to-absolute-index":76,"./_to-iobject":78,"./_to-length":79}],7:[function(require,module,exports){
// 0 -> Array#forEach
// 1 -> Array#map
// 2 -> Array#filter
// 3 -> Array#some
// 4 -> Array#every
// 5 -> Array#find
// 6 -> Array#findIndex
var ctx = require('./_ctx');
var IObject = require('./_iobject');
var toObject = require('./_to-object');
var toLength = require('./_to-length');
var asc = require('./_array-species-create');
module.exports = function (TYPE, $create) {
  var IS_MAP = TYPE == 1;
  var IS_FILTER = TYPE == 2;
  var IS_SOME = TYPE == 3;
  var IS_EVERY = TYPE == 4;
  var IS_FIND_INDEX = TYPE == 6;
  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
  var create = $create || asc;
  return function ($this, callbackfn, that) {
    var O = toObject($this);
    var self = IObject(O);
    var f = ctx(callbackfn, that, 3);
    var length = toLength(self.length);
    var index = 0;
    var result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
    var val, res;
    for (;length > index; index++) if (NO_HOLES || index in self) {
      val = self[index];
      res = f(val, index, O);
      if (TYPE) {
        if (IS_MAP) result[index] = res;   // map
        else if (res) switch (TYPE) {
          case 3: return true;             // some
          case 5: return val;              // find
          case 6: return index;            // findIndex
          case 2: result.push(val);        // filter
        } else if (IS_EVERY) return false; // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  };
};

},{"./_array-species-create":9,"./_ctx":16,"./_iobject":35,"./_to-length":79,"./_to-object":80}],8:[function(require,module,exports){
var isObject = require('./_is-object');
var isArray = require('./_is-array');
var SPECIES = require('./_wks')('species');

module.exports = function (original) {
  var C;
  if (isArray(original)) {
    C = original.constructor;
    // cross-realm fallback
    if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;
    if (isObject(C)) {
      C = C[SPECIES];
      if (C === null) C = undefined;
    }
  } return C === undefined ? Array : C;
};

},{"./_is-array":37,"./_is-object":38,"./_wks":86}],9:[function(require,module,exports){
// 9.4.2.3 ArraySpeciesCreate(originalArray, length)
var speciesConstructor = require('./_array-species-constructor');

module.exports = function (original, length) {
  return new (speciesConstructor(original))(length);
};

},{"./_array-species-constructor":8}],10:[function(require,module,exports){
// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = require('./_cof');
var TAG = require('./_wks')('toStringTag');
// ES3 wrong here
var ARG = cof(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (e) { /* empty */ }
};

module.exports = function (it) {
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};

},{"./_cof":11,"./_wks":86}],11:[function(require,module,exports){
var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};

},{}],12:[function(require,module,exports){
'use strict';
var dP = require('./_object-dp').f;
var create = require('./_object-create');
var redefineAll = require('./_redefine-all');
var ctx = require('./_ctx');
var anInstance = require('./_an-instance');
var forOf = require('./_for-of');
var $iterDefine = require('./_iter-define');
var step = require('./_iter-step');
var setSpecies = require('./_set-species');
var DESCRIPTORS = require('./_descriptors');
var fastKey = require('./_meta').fastKey;
var validate = require('./_validate-collection');
var SIZE = DESCRIPTORS ? '_s' : 'size';

var getEntry = function (that, key) {
  // fast case
  var index = fastKey(key);
  var entry;
  if (index !== 'F') return that._i[index];
  // frozen object case
  for (entry = that._f; entry; entry = entry.n) {
    if (entry.k == key) return entry;
  }
};

module.exports = {
  getConstructor: function (wrapper, NAME, IS_MAP, ADDER) {
    var C = wrapper(function (that, iterable) {
      anInstance(that, C, NAME, '_i');
      that._t = NAME;         // collection type
      that._i = create(null); // index
      that._f = undefined;    // first entry
      that._l = undefined;    // last entry
      that[SIZE] = 0;         // size
      if (iterable != undefined) forOf(iterable, IS_MAP, that[ADDER], that);
    });
    redefineAll(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function clear() {
        for (var that = validate(this, NAME), data = that._i, entry = that._f; entry; entry = entry.n) {
          entry.r = true;
          if (entry.p) entry.p = entry.p.n = undefined;
          delete data[entry.i];
        }
        that._f = that._l = undefined;
        that[SIZE] = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function (key) {
        var that = validate(this, NAME);
        var entry = getEntry(that, key);
        if (entry) {
          var next = entry.n;
          var prev = entry.p;
          delete that._i[entry.i];
          entry.r = true;
          if (prev) prev.n = next;
          if (next) next.p = prev;
          if (that._f == entry) that._f = next;
          if (that._l == entry) that._l = prev;
          that[SIZE]--;
        } return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn /* , that = undefined */) {
        validate(this, NAME);
        var f = ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
        var entry;
        while (entry = entry ? entry.n : this._f) {
          f(entry.v, entry.k, this);
          // revert to the last existing entry
          while (entry && entry.r) entry = entry.p;
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key) {
        return !!getEntry(validate(this, NAME), key);
      }
    });
    if (DESCRIPTORS) dP(C.prototype, 'size', {
      get: function () {
        return validate(this, NAME)[SIZE];
      }
    });
    return C;
  },
  def: function (that, key, value) {
    var entry = getEntry(that, key);
    var prev, index;
    // change existing entry
    if (entry) {
      entry.v = value;
    // create new entry
    } else {
      that._l = entry = {
        i: index = fastKey(key, true), // <- index
        k: key,                        // <- key
        v: value,                      // <- value
        p: prev = that._l,             // <- previous entry
        n: undefined,                  // <- next entry
        r: false                       // <- removed
      };
      if (!that._f) that._f = entry;
      if (prev) prev.n = entry;
      that[SIZE]++;
      // add to index
      if (index !== 'F') that._i[index] = entry;
    } return that;
  },
  getEntry: getEntry,
  setStrong: function (C, NAME, IS_MAP) {
    // add .keys, .values, .entries, [@@iterator]
    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
    $iterDefine(C, NAME, function (iterated, kind) {
      this._t = validate(iterated, NAME); // target
      this._k = kind;                     // kind
      this._l = undefined;                // previous
    }, function () {
      var that = this;
      var kind = that._k;
      var entry = that._l;
      // revert to the last existing entry
      while (entry && entry.r) entry = entry.p;
      // get next entry
      if (!that._t || !(that._l = entry = entry ? entry.n : that._t._f)) {
        // or finish the iteration
        that._t = undefined;
        return step(1);
      }
      // return step by kind
      if (kind == 'keys') return step(0, entry.k);
      if (kind == 'values') return step(0, entry.v);
      return step(0, [entry.k, entry.v]);
    }, IS_MAP ? 'entries' : 'values', !IS_MAP, true);

    // add [@@species], 23.1.2.2, 23.2.2.2
    setSpecies(NAME);
  }
};

},{"./_an-instance":4,"./_ctx":16,"./_descriptors":18,"./_for-of":27,"./_iter-define":42,"./_iter-step":44,"./_meta":47,"./_object-create":49,"./_object-dp":50,"./_redefine-all":62,"./_set-species":68,"./_validate-collection":83}],13:[function(require,module,exports){
'use strict';
var global = require('./_global');
var $export = require('./_export');
var redefine = require('./_redefine');
var redefineAll = require('./_redefine-all');
var meta = require('./_meta');
var forOf = require('./_for-of');
var anInstance = require('./_an-instance');
var isObject = require('./_is-object');
var fails = require('./_fails');
var $iterDetect = require('./_iter-detect');
var setToStringTag = require('./_set-to-string-tag');
var inheritIfRequired = require('./_inherit-if-required');

module.exports = function (NAME, wrapper, methods, common, IS_MAP, IS_WEAK) {
  var Base = global[NAME];
  var C = Base;
  var ADDER = IS_MAP ? 'set' : 'add';
  var proto = C && C.prototype;
  var O = {};
  var fixMethod = function (KEY) {
    var fn = proto[KEY];
    redefine(proto, KEY,
      KEY == 'delete' ? function (a) {
        return IS_WEAK && !isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
      } : KEY == 'has' ? function has(a) {
        return IS_WEAK && !isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
      } : KEY == 'get' ? function get(a) {
        return IS_WEAK && !isObject(a) ? undefined : fn.call(this, a === 0 ? 0 : a);
      } : KEY == 'add' ? function add(a) { fn.call(this, a === 0 ? 0 : a); return this; }
        : function set(a, b) { fn.call(this, a === 0 ? 0 : a, b); return this; }
    );
  };
  if (typeof C != 'function' || !(IS_WEAK || proto.forEach && !fails(function () {
    new C().entries().next();
  }))) {
    // create collection constructor
    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
    redefineAll(C.prototype, methods);
    meta.NEED = true;
  } else {
    var instance = new C();
    // early implementations not supports chaining
    var HASNT_CHAINING = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance;
    // V8 ~  Chromium 40- weak-collections throws on primitives, but should return false
    var THROWS_ON_PRIMITIVES = fails(function () { instance.has(1); });
    // most early implementations doesn't supports iterables, most modern - not close it correctly
    var ACCEPT_ITERABLES = $iterDetect(function (iter) { new C(iter); }); // eslint-disable-line no-new
    // for early implementations -0 and +0 not the same
    var BUGGY_ZERO = !IS_WEAK && fails(function () {
      // V8 ~ Chromium 42- fails only with 5+ elements
      var $instance = new C();
      var index = 5;
      while (index--) $instance[ADDER](index, index);
      return !$instance.has(-0);
    });
    if (!ACCEPT_ITERABLES) {
      C = wrapper(function (target, iterable) {
        anInstance(target, C, NAME);
        var that = inheritIfRequired(new Base(), target, C);
        if (iterable != undefined) forOf(iterable, IS_MAP, that[ADDER], that);
        return that;
      });
      C.prototype = proto;
      proto.constructor = C;
    }
    if (THROWS_ON_PRIMITIVES || BUGGY_ZERO) {
      fixMethod('delete');
      fixMethod('has');
      IS_MAP && fixMethod('get');
    }
    if (BUGGY_ZERO || HASNT_CHAINING) fixMethod(ADDER);
    // weak collections should not contains .clear method
    if (IS_WEAK && proto.clear) delete proto.clear;
  }

  setToStringTag(C, NAME);

  O[NAME] = C;
  $export($export.G + $export.W + $export.F * (C != Base), O);

  if (!IS_WEAK) common.setStrong(C, NAME, IS_MAP);

  return C;
};

},{"./_an-instance":4,"./_export":22,"./_fails":24,"./_for-of":27,"./_global":29,"./_inherit-if-required":34,"./_is-object":38,"./_iter-detect":43,"./_meta":47,"./_redefine":63,"./_redefine-all":62,"./_set-to-string-tag":69}],14:[function(require,module,exports){
var core = module.exports = { version: '2.6.11' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef

},{}],15:[function(require,module,exports){
'use strict';
var $defineProperty = require('./_object-dp');
var createDesc = require('./_property-desc');

module.exports = function (object, index, value) {
  if (index in object) $defineProperty.f(object, index, createDesc(0, value));
  else object[index] = value;
};

},{"./_object-dp":50,"./_property-desc":61}],16:[function(require,module,exports){
// optional / simple context binding
var aFunction = require('./_a-function');
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};

},{"./_a-function":1}],17:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};

},{}],18:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./_fails')(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_fails":24}],19:[function(require,module,exports){
var isObject = require('./_is-object');
var document = require('./_global').document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};

},{"./_global":29,"./_is-object":38}],20:[function(require,module,exports){
// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');

},{}],21:[function(require,module,exports){
// all enumerable object keys, includes symbols
var getKeys = require('./_object-keys');
var gOPS = require('./_object-gops');
var pIE = require('./_object-pie');
module.exports = function (it) {
  var result = getKeys(it);
  var getSymbols = gOPS.f;
  if (getSymbols) {
    var symbols = getSymbols(it);
    var isEnum = pIE.f;
    var i = 0;
    var key;
    while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
  } return result;
};

},{"./_object-gops":55,"./_object-keys":58,"./_object-pie":59}],22:[function(require,module,exports){
var global = require('./_global');
var core = require('./_core');
var hide = require('./_hide');
var redefine = require('./_redefine');
var ctx = require('./_ctx');
var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] || (global[name] = {}) : (global[name] || {})[PROTOTYPE];
  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
  var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
  var key, own, out, exp;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    exp = IS_BIND && own ? ctx(out, global) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // extend global
    if (target) redefine(target, key, out, type & $export.U);
    // export
    if (exports[key] != out) hide(exports, key, exp);
    if (IS_PROTO && expProto[key] != out) expProto[key] = out;
  }
};
global.core = core;
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
module.exports = $export;

},{"./_core":14,"./_ctx":16,"./_global":29,"./_hide":31,"./_redefine":63}],23:[function(require,module,exports){
var MATCH = require('./_wks')('match');
module.exports = function (KEY) {
  var re = /./;
  try {
    '/./'[KEY](re);
  } catch (e) {
    try {
      re[MATCH] = false;
      return !'/./'[KEY](re);
    } catch (f) { /* empty */ }
  } return true;
};

},{"./_wks":86}],24:[function(require,module,exports){
module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};

},{}],25:[function(require,module,exports){
'use strict';
require('./es6.regexp.exec');
var redefine = require('./_redefine');
var hide = require('./_hide');
var fails = require('./_fails');
var defined = require('./_defined');
var wks = require('./_wks');
var regexpExec = require('./_regexp-exec');

var SPECIES = wks('species');

var REPLACE_SUPPORTS_NAMED_GROUPS = !fails(function () {
  // #replace needs built-in support for named groups.
  // #match works fine because it just return the exec results, even if it has
  // a "grops" property.
  var re = /./;
  re.exec = function () {
    var result = [];
    result.groups = { a: '7' };
    return result;
  };
  return ''.replace(re, '$<a>') !== '7';
});

var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = (function () {
  // Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
  var re = /(?:)/;
  var originalExec = re.exec;
  re.exec = function () { return originalExec.apply(this, arguments); };
  var result = 'ab'.split(re);
  return result.length === 2 && result[0] === 'a' && result[1] === 'b';
})();

module.exports = function (KEY, length, exec) {
  var SYMBOL = wks(KEY);

  var DELEGATES_TO_SYMBOL = !fails(function () {
    // String methods call symbol-named RegEp methods
    var O = {};
    O[SYMBOL] = function () { return 7; };
    return ''[KEY](O) != 7;
  });

  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL ? !fails(function () {
    // Symbol-named RegExp methods call .exec
    var execCalled = false;
    var re = /a/;
    re.exec = function () { execCalled = true; return null; };
    if (KEY === 'split') {
      // RegExp[@@split] doesn't call the regex's exec method, but first creates
      // a new one. We need to return the patched regex when creating the new one.
      re.constructor = {};
      re.constructor[SPECIES] = function () { return re; };
    }
    re[SYMBOL]('');
    return !execCalled;
  }) : undefined;

  if (
    !DELEGATES_TO_SYMBOL ||
    !DELEGATES_TO_EXEC ||
    (KEY === 'replace' && !REPLACE_SUPPORTS_NAMED_GROUPS) ||
    (KEY === 'split' && !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC)
  ) {
    var nativeRegExpMethod = /./[SYMBOL];
    var fns = exec(
      defined,
      SYMBOL,
      ''[KEY],
      function maybeCallNative(nativeMethod, regexp, str, arg2, forceStringMethod) {
        if (regexp.exec === regexpExec) {
          if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
            // The native String method already delegates to @@method (this
            // polyfilled function), leasing to infinite recursion.
            // We avoid it by directly calling the native @@method method.
            return { done: true, value: nativeRegExpMethod.call(regexp, str, arg2) };
          }
          return { done: true, value: nativeMethod.call(str, regexp, arg2) };
        }
        return { done: false };
      }
    );
    var strfn = fns[0];
    var rxfn = fns[1];

    redefine(String.prototype, KEY, strfn);
    hide(RegExp.prototype, SYMBOL, length == 2
      // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
      // 21.2.5.11 RegExp.prototype[@@split](string, limit)
      ? function (string, arg) { return rxfn.call(string, this, arg); }
      // 21.2.5.6 RegExp.prototype[@@match](string)
      // 21.2.5.9 RegExp.prototype[@@search](string)
      : function (string) { return rxfn.call(string, this); }
    );
  }
};

},{"./_defined":17,"./_fails":24,"./_hide":31,"./_redefine":63,"./_regexp-exec":65,"./_wks":86,"./es6.regexp.exec":97}],26:[function(require,module,exports){
'use strict';
// 21.2.5.3 get RegExp.prototype.flags
var anObject = require('./_an-object');
module.exports = function () {
  var that = anObject(this);
  var result = '';
  if (that.global) result += 'g';
  if (that.ignoreCase) result += 'i';
  if (that.multiline) result += 'm';
  if (that.unicode) result += 'u';
  if (that.sticky) result += 'y';
  return result;
};

},{"./_an-object":5}],27:[function(require,module,exports){
var ctx = require('./_ctx');
var call = require('./_iter-call');
var isArrayIter = require('./_is-array-iter');
var anObject = require('./_an-object');
var toLength = require('./_to-length');
var getIterFn = require('./core.get-iterator-method');
var BREAK = {};
var RETURN = {};
var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
  var iterFn = ITERATOR ? function () { return iterable; } : getIterFn(iterable);
  var f = ctx(fn, that, entries ? 2 : 1);
  var index = 0;
  var length, step, iterator, result;
  if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if (isArrayIter(iterFn)) for (length = toLength(iterable.length); length > index; index++) {
    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
    if (result === BREAK || result === RETURN) return result;
  } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
    result = call(iterator, f, step.value, entries);
    if (result === BREAK || result === RETURN) return result;
  }
};
exports.BREAK = BREAK;
exports.RETURN = RETURN;

},{"./_an-object":5,"./_ctx":16,"./_is-array-iter":36,"./_iter-call":40,"./_to-length":79,"./core.get-iterator-method":87}],28:[function(require,module,exports){
module.exports = require('./_shared')('native-function-to-string', Function.toString);

},{"./_shared":71}],29:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef

},{}],30:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};

},{}],31:[function(require,module,exports){
var dP = require('./_object-dp');
var createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

},{"./_descriptors":18,"./_object-dp":50,"./_property-desc":61}],32:[function(require,module,exports){
var document = require('./_global').document;
module.exports = document && document.documentElement;

},{"./_global":29}],33:[function(require,module,exports){
module.exports = !require('./_descriptors') && !require('./_fails')(function () {
  return Object.defineProperty(require('./_dom-create')('div'), 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_descriptors":18,"./_dom-create":19,"./_fails":24}],34:[function(require,module,exports){
var isObject = require('./_is-object');
var setPrototypeOf = require('./_set-proto').set;
module.exports = function (that, target, C) {
  var S = target.constructor;
  var P;
  if (S !== C && typeof S == 'function' && (P = S.prototype) !== C.prototype && isObject(P) && setPrototypeOf) {
    setPrototypeOf(that, P);
  } return that;
};

},{"./_is-object":38,"./_set-proto":67}],35:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./_cof');
// eslint-disable-next-line no-prototype-builtins
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return cof(it) == 'String' ? it.split('') : Object(it);
};

},{"./_cof":11}],36:[function(require,module,exports){
// check on default Array iterator
var Iterators = require('./_iterators');
var ITERATOR = require('./_wks')('iterator');
var ArrayProto = Array.prototype;

module.exports = function (it) {
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};

},{"./_iterators":45,"./_wks":86}],37:[function(require,module,exports){
// 7.2.2 IsArray(argument)
var cof = require('./_cof');
module.exports = Array.isArray || function isArray(arg) {
  return cof(arg) == 'Array';
};

},{"./_cof":11}],38:[function(require,module,exports){
module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

},{}],39:[function(require,module,exports){
// 7.2.8 IsRegExp(argument)
var isObject = require('./_is-object');
var cof = require('./_cof');
var MATCH = require('./_wks')('match');
module.exports = function (it) {
  var isRegExp;
  return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : cof(it) == 'RegExp');
};

},{"./_cof":11,"./_is-object":38,"./_wks":86}],40:[function(require,module,exports){
// call something on iterator step with safe closing on error
var anObject = require('./_an-object');
module.exports = function (iterator, fn, value, entries) {
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch (e) {
    var ret = iterator['return'];
    if (ret !== undefined) anObject(ret.call(iterator));
    throw e;
  }
};

},{"./_an-object":5}],41:[function(require,module,exports){
'use strict';
var create = require('./_object-create');
var descriptor = require('./_property-desc');
var setToStringTag = require('./_set-to-string-tag');
var IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
require('./_hide')(IteratorPrototype, require('./_wks')('iterator'), function () { return this; });

module.exports = function (Constructor, NAME, next) {
  Constructor.prototype = create(IteratorPrototype, { next: descriptor(1, next) });
  setToStringTag(Constructor, NAME + ' Iterator');
};

},{"./_hide":31,"./_object-create":49,"./_property-desc":61,"./_set-to-string-tag":69,"./_wks":86}],42:[function(require,module,exports){
'use strict';
var LIBRARY = require('./_library');
var $export = require('./_export');
var redefine = require('./_redefine');
var hide = require('./_hide');
var Iterators = require('./_iterators');
var $iterCreate = require('./_iter-create');
var setToStringTag = require('./_set-to-string-tag');
var getPrototypeOf = require('./_object-gpo');
var ITERATOR = require('./_wks')('iterator');
var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
var FF_ITERATOR = '@@iterator';
var KEYS = 'keys';
var VALUES = 'values';

var returnThis = function () { return this; };

module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
  $iterCreate(Constructor, NAME, next);
  var getMethod = function (kind) {
    if (!BUGGY && kind in proto) return proto[kind];
    switch (kind) {
      case KEYS: return function keys() { return new Constructor(this, kind); };
      case VALUES: return function values() { return new Constructor(this, kind); };
    } return function entries() { return new Constructor(this, kind); };
  };
  var TAG = NAME + ' Iterator';
  var DEF_VALUES = DEFAULT == VALUES;
  var VALUES_BUG = false;
  var proto = Base.prototype;
  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
  var $default = $native || getMethod(DEFAULT);
  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
  var methods, key, IteratorPrototype;
  // Fix native
  if ($anyNative) {
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base()));
    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if (!LIBRARY && typeof IteratorPrototype[ITERATOR] != 'function') hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEF_VALUES && $native && $native.name !== VALUES) {
    VALUES_BUG = true;
    $default = function values() { return $native.call(this); };
  }
  // Define iterator
  if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG] = returnThis;
  if (DEFAULT) {
    methods = {
      values: DEF_VALUES ? $default : getMethod(VALUES),
      keys: IS_SET ? $default : getMethod(KEYS),
      entries: $entries
    };
    if (FORCED) for (key in methods) {
      if (!(key in proto)) redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};

},{"./_export":22,"./_hide":31,"./_iter-create":41,"./_iterators":45,"./_library":46,"./_object-gpo":56,"./_redefine":63,"./_set-to-string-tag":69,"./_wks":86}],43:[function(require,module,exports){
var ITERATOR = require('./_wks')('iterator');
var SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function () { SAFE_CLOSING = true; };
  // eslint-disable-next-line no-throw-literal
  Array.from(riter, function () { throw 2; });
} catch (e) { /* empty */ }

module.exports = function (exec, skipClosing) {
  if (!skipClosing && !SAFE_CLOSING) return false;
  var safe = false;
  try {
    var arr = [7];
    var iter = arr[ITERATOR]();
    iter.next = function () { return { done: safe = true }; };
    arr[ITERATOR] = function () { return iter; };
    exec(arr);
  } catch (e) { /* empty */ }
  return safe;
};

},{"./_wks":86}],44:[function(require,module,exports){
module.exports = function (done, value) {
  return { value: value, done: !!done };
};

},{}],45:[function(require,module,exports){
module.exports = {};

},{}],46:[function(require,module,exports){
module.exports = false;

},{}],47:[function(require,module,exports){
var META = require('./_uid')('meta');
var isObject = require('./_is-object');
var has = require('./_has');
var setDesc = require('./_object-dp').f;
var id = 0;
var isExtensible = Object.isExtensible || function () {
  return true;
};
var FREEZE = !require('./_fails')(function () {
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function (it) {
  setDesc(it, META, { value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  } });
};
var fastKey = function (it, create) {
  // return primitive with prefix
  if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return 'F';
    // not necessary to add metadata
    if (!create) return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function (it, create) {
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return true;
    // not necessary to add metadata
    if (!create) return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function (it) {
  if (FREEZE && meta.NEED && isExtensible(it) && !has(it, META)) setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY: META,
  NEED: false,
  fastKey: fastKey,
  getWeak: getWeak,
  onFreeze: onFreeze
};

},{"./_fails":24,"./_has":30,"./_is-object":38,"./_object-dp":50,"./_uid":82}],48:[function(require,module,exports){
'use strict';
// 19.1.2.1 Object.assign(target, source, ...)
var DESCRIPTORS = require('./_descriptors');
var getKeys = require('./_object-keys');
var gOPS = require('./_object-gops');
var pIE = require('./_object-pie');
var toObject = require('./_to-object');
var IObject = require('./_iobject');
var $assign = Object.assign;

// should work with symbols and should have deterministic property order (V8 bug)
module.exports = !$assign || require('./_fails')(function () {
  var A = {};
  var B = {};
  // eslint-disable-next-line no-undef
  var S = Symbol();
  var K = 'abcdefghijklmnopqrst';
  A[S] = 7;
  K.split('').forEach(function (k) { B[k] = k; });
  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
}) ? function assign(target, source) { // eslint-disable-line no-unused-vars
  var T = toObject(target);
  var aLen = arguments.length;
  var index = 1;
  var getSymbols = gOPS.f;
  var isEnum = pIE.f;
  while (aLen > index) {
    var S = IObject(arguments[index++]);
    var keys = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S);
    var length = keys.length;
    var j = 0;
    var key;
    while (length > j) {
      key = keys[j++];
      if (!DESCRIPTORS || isEnum.call(S, key)) T[key] = S[key];
    }
  } return T;
} : $assign;

},{"./_descriptors":18,"./_fails":24,"./_iobject":35,"./_object-gops":55,"./_object-keys":58,"./_object-pie":59,"./_to-object":80}],49:[function(require,module,exports){
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject = require('./_an-object');
var dPs = require('./_object-dps');
var enumBugKeys = require('./_enum-bug-keys');
var IE_PROTO = require('./_shared-key')('IE_PROTO');
var Empty = function () { /* empty */ };
var PROTOTYPE = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = require('./_dom-create')('iframe');
  var i = enumBugKeys.length;
  var lt = '<';
  var gt = '>';
  var iframeDocument;
  iframe.style.display = 'none';
  require('./_html').appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while (i--) delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty();
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};

},{"./_an-object":5,"./_dom-create":19,"./_enum-bug-keys":20,"./_html":32,"./_object-dps":51,"./_shared-key":70}],50:[function(require,module,exports){
var anObject = require('./_an-object');
var IE8_DOM_DEFINE = require('./_ie8-dom-define');
var toPrimitive = require('./_to-primitive');
var dP = Object.defineProperty;

exports.f = require('./_descriptors') ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

},{"./_an-object":5,"./_descriptors":18,"./_ie8-dom-define":33,"./_to-primitive":81}],51:[function(require,module,exports){
var dP = require('./_object-dp');
var anObject = require('./_an-object');
var getKeys = require('./_object-keys');

module.exports = require('./_descriptors') ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = getKeys(Properties);
  var length = keys.length;
  var i = 0;
  var P;
  while (length > i) dP.f(O, P = keys[i++], Properties[P]);
  return O;
};

},{"./_an-object":5,"./_descriptors":18,"./_object-dp":50,"./_object-keys":58}],52:[function(require,module,exports){
var pIE = require('./_object-pie');
var createDesc = require('./_property-desc');
var toIObject = require('./_to-iobject');
var toPrimitive = require('./_to-primitive');
var has = require('./_has');
var IE8_DOM_DEFINE = require('./_ie8-dom-define');
var gOPD = Object.getOwnPropertyDescriptor;

exports.f = require('./_descriptors') ? gOPD : function getOwnPropertyDescriptor(O, P) {
  O = toIObject(O);
  P = toPrimitive(P, true);
  if (IE8_DOM_DEFINE) try {
    return gOPD(O, P);
  } catch (e) { /* empty */ }
  if (has(O, P)) return createDesc(!pIE.f.call(O, P), O[P]);
};

},{"./_descriptors":18,"./_has":30,"./_ie8-dom-define":33,"./_object-pie":59,"./_property-desc":61,"./_to-iobject":78,"./_to-primitive":81}],53:[function(require,module,exports){
// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var toIObject = require('./_to-iobject');
var gOPN = require('./_object-gopn').f;
var toString = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function (it) {
  try {
    return gOPN(it);
  } catch (e) {
    return windowNames.slice();
  }
};

module.exports.f = function getOwnPropertyNames(it) {
  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
};

},{"./_object-gopn":54,"./_to-iobject":78}],54:[function(require,module,exports){
// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys = require('./_object-keys-internal');
var hiddenKeys = require('./_enum-bug-keys').concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return $keys(O, hiddenKeys);
};

},{"./_enum-bug-keys":20,"./_object-keys-internal":57}],55:[function(require,module,exports){
exports.f = Object.getOwnPropertySymbols;

},{}],56:[function(require,module,exports){
// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has = require('./_has');
var toObject = require('./_to-object');
var IE_PROTO = require('./_shared-key')('IE_PROTO');
var ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO)) return O[IE_PROTO];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};

},{"./_has":30,"./_shared-key":70,"./_to-object":80}],57:[function(require,module,exports){
var has = require('./_has');
var toIObject = require('./_to-iobject');
var arrayIndexOf = require('./_array-includes')(false);
var IE_PROTO = require('./_shared-key')('IE_PROTO');

module.exports = function (object, names) {
  var O = toIObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};

},{"./_array-includes":6,"./_has":30,"./_shared-key":70,"./_to-iobject":78}],58:[function(require,module,exports){
// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys = require('./_object-keys-internal');
var enumBugKeys = require('./_enum-bug-keys');

module.exports = Object.keys || function keys(O) {
  return $keys(O, enumBugKeys);
};

},{"./_enum-bug-keys":20,"./_object-keys-internal":57}],59:[function(require,module,exports){
exports.f = {}.propertyIsEnumerable;

},{}],60:[function(require,module,exports){
// most Object methods by ES6 should accept primitives
var $export = require('./_export');
var core = require('./_core');
var fails = require('./_fails');
module.exports = function (KEY, exec) {
  var fn = (core.Object || {})[KEY] || Object[KEY];
  var exp = {};
  exp[KEY] = exec(fn);
  $export($export.S + $export.F * fails(function () { fn(1); }), 'Object', exp);
};

},{"./_core":14,"./_export":22,"./_fails":24}],61:[function(require,module,exports){
module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

},{}],62:[function(require,module,exports){
var redefine = require('./_redefine');
module.exports = function (target, src, safe) {
  for (var key in src) redefine(target, key, src[key], safe);
  return target;
};

},{"./_redefine":63}],63:[function(require,module,exports){
var global = require('./_global');
var hide = require('./_hide');
var has = require('./_has');
var SRC = require('./_uid')('src');
var $toString = require('./_function-to-string');
var TO_STRING = 'toString';
var TPL = ('' + $toString).split(TO_STRING);

require('./_core').inspectSource = function (it) {
  return $toString.call(it);
};

(module.exports = function (O, key, val, safe) {
  var isFunction = typeof val == 'function';
  if (isFunction) has(val, 'name') || hide(val, 'name', key);
  if (O[key] === val) return;
  if (isFunction) has(val, SRC) || hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
  if (O === global) {
    O[key] = val;
  } else if (!safe) {
    delete O[key];
    hide(O, key, val);
  } else if (O[key]) {
    O[key] = val;
  } else {
    hide(O, key, val);
  }
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, TO_STRING, function toString() {
  return typeof this == 'function' && this[SRC] || $toString.call(this);
});

},{"./_core":14,"./_function-to-string":28,"./_global":29,"./_has":30,"./_hide":31,"./_uid":82}],64:[function(require,module,exports){
'use strict';

var classof = require('./_classof');
var builtinExec = RegExp.prototype.exec;

 // `RegExpExec` abstract operation
// https://tc39.github.io/ecma262/#sec-regexpexec
module.exports = function (R, S) {
  var exec = R.exec;
  if (typeof exec === 'function') {
    var result = exec.call(R, S);
    if (typeof result !== 'object') {
      throw new TypeError('RegExp exec method returned something other than an Object or null');
    }
    return result;
  }
  if (classof(R) !== 'RegExp') {
    throw new TypeError('RegExp#exec called on incompatible receiver');
  }
  return builtinExec.call(R, S);
};

},{"./_classof":10}],65:[function(require,module,exports){
'use strict';

var regexpFlags = require('./_flags');

var nativeExec = RegExp.prototype.exec;
// This always refers to the native implementation, because the
// String#replace polyfill uses ./fix-regexp-well-known-symbol-logic.js,
// which loads this file before patching the method.
var nativeReplace = String.prototype.replace;

var patchedExec = nativeExec;

var LAST_INDEX = 'lastIndex';

var UPDATES_LAST_INDEX_WRONG = (function () {
  var re1 = /a/,
      re2 = /b*/g;
  nativeExec.call(re1, 'a');
  nativeExec.call(re2, 'a');
  return re1[LAST_INDEX] !== 0 || re2[LAST_INDEX] !== 0;
})();

// nonparticipating capturing group, copied from es5-shim's String#split patch.
var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED;

if (PATCH) {
  patchedExec = function exec(str) {
    var re = this;
    var lastIndex, reCopy, match, i;

    if (NPCG_INCLUDED) {
      reCopy = new RegExp('^' + re.source + '$(?!\\s)', regexpFlags.call(re));
    }
    if (UPDATES_LAST_INDEX_WRONG) lastIndex = re[LAST_INDEX];

    match = nativeExec.call(re, str);

    if (UPDATES_LAST_INDEX_WRONG && match) {
      re[LAST_INDEX] = re.global ? match.index + match[0].length : lastIndex;
    }
    if (NPCG_INCLUDED && match && match.length > 1) {
      // Fix browsers whose `exec` methods don't consistently return `undefined`
      // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
      // eslint-disable-next-line no-loop-func
      nativeReplace.call(match[0], reCopy, function () {
        for (i = 1; i < arguments.length - 2; i++) {
          if (arguments[i] === undefined) match[i] = undefined;
        }
      });
    }

    return match;
  };
}

module.exports = patchedExec;

},{"./_flags":26}],66:[function(require,module,exports){
// 7.2.9 SameValue(x, y)
module.exports = Object.is || function is(x, y) {
  // eslint-disable-next-line no-self-compare
  return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
};

},{}],67:[function(require,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var isObject = require('./_is-object');
var anObject = require('./_an-object');
var check = function (O, proto) {
  anObject(O);
  if (!isObject(proto) && proto !== null) throw TypeError(proto + ": can't set as prototype!");
};
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function (test, buggy, set) {
      try {
        set = require('./_ctx')(Function.call, require('./_object-gopd').f(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch (e) { buggy = true; }
      return function setPrototypeOf(O, proto) {
        check(O, proto);
        if (buggy) O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }({}, false) : undefined),
  check: check
};

},{"./_an-object":5,"./_ctx":16,"./_is-object":38,"./_object-gopd":52}],68:[function(require,module,exports){
'use strict';
var global = require('./_global');
var dP = require('./_object-dp');
var DESCRIPTORS = require('./_descriptors');
var SPECIES = require('./_wks')('species');

module.exports = function (KEY) {
  var C = global[KEY];
  if (DESCRIPTORS && C && !C[SPECIES]) dP.f(C, SPECIES, {
    configurable: true,
    get: function () { return this; }
  });
};

},{"./_descriptors":18,"./_global":29,"./_object-dp":50,"./_wks":86}],69:[function(require,module,exports){
var def = require('./_object-dp').f;
var has = require('./_has');
var TAG = require('./_wks')('toStringTag');

module.exports = function (it, tag, stat) {
  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};

},{"./_has":30,"./_object-dp":50,"./_wks":86}],70:[function(require,module,exports){
var shared = require('./_shared')('keys');
var uid = require('./_uid');
module.exports = function (key) {
  return shared[key] || (shared[key] = uid(key));
};

},{"./_shared":71,"./_uid":82}],71:[function(require,module,exports){
var core = require('./_core');
var global = require('./_global');
var SHARED = '__core-js_shared__';
var store = global[SHARED] || (global[SHARED] = {});

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: core.version,
  mode: require('./_library') ? 'pure' : 'global',
  copyright: '© 2019 Denis Pushkarev (zloirock.ru)'
});

},{"./_core":14,"./_global":29,"./_library":46}],72:[function(require,module,exports){
// 7.3.20 SpeciesConstructor(O, defaultConstructor)
var anObject = require('./_an-object');
var aFunction = require('./_a-function');
var SPECIES = require('./_wks')('species');
module.exports = function (O, D) {
  var C = anObject(O).constructor;
  var S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
};

},{"./_a-function":1,"./_an-object":5,"./_wks":86}],73:[function(require,module,exports){
var toInteger = require('./_to-integer');
var defined = require('./_defined');
// true  -> String#at
// false -> String#codePointAt
module.exports = function (TO_STRING) {
  return function (that, pos) {
    var s = String(defined(that));
    var i = toInteger(pos);
    var l = s.length;
    var a, b;
    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};

},{"./_defined":17,"./_to-integer":77}],74:[function(require,module,exports){
// helper for String#{startsWith, endsWith, includes}
var isRegExp = require('./_is-regexp');
var defined = require('./_defined');

module.exports = function (that, searchString, NAME) {
  if (isRegExp(searchString)) throw TypeError('String#' + NAME + " doesn't accept regex!");
  return String(defined(that));
};

},{"./_defined":17,"./_is-regexp":39}],75:[function(require,module,exports){
var $export = require('./_export');
var fails = require('./_fails');
var defined = require('./_defined');
var quot = /"/g;
// B.2.3.2.1 CreateHTML(string, tag, attribute, value)
var createHTML = function (string, tag, attribute, value) {
  var S = String(defined(string));
  var p1 = '<' + tag;
  if (attribute !== '') p1 += ' ' + attribute + '="' + String(value).replace(quot, '&quot;') + '"';
  return p1 + '>' + S + '</' + tag + '>';
};
module.exports = function (NAME, exec) {
  var O = {};
  O[NAME] = exec(createHTML);
  $export($export.P + $export.F * fails(function () {
    var test = ''[NAME]('"');
    return test !== test.toLowerCase() || test.split('"').length > 3;
  }), 'String', O);
};

},{"./_defined":17,"./_export":22,"./_fails":24}],76:[function(require,module,exports){
var toInteger = require('./_to-integer');
var max = Math.max;
var min = Math.min;
module.exports = function (index, length) {
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};

},{"./_to-integer":77}],77:[function(require,module,exports){
// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};

},{}],78:[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./_iobject');
var defined = require('./_defined');
module.exports = function (it) {
  return IObject(defined(it));
};

},{"./_defined":17,"./_iobject":35}],79:[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./_to-integer');
var min = Math.min;
module.exports = function (it) {
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};

},{"./_to-integer":77}],80:[function(require,module,exports){
// 7.1.13 ToObject(argument)
var defined = require('./_defined');
module.exports = function (it) {
  return Object(defined(it));
};

},{"./_defined":17}],81:[function(require,module,exports){
// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = require('./_is-object');
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (it, S) {
  if (!isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};

},{"./_is-object":38}],82:[function(require,module,exports){
var id = 0;
var px = Math.random();
module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};

},{}],83:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function (it, TYPE) {
  if (!isObject(it) || it._t !== TYPE) throw TypeError('Incompatible receiver, ' + TYPE + ' required!');
  return it;
};

},{"./_is-object":38}],84:[function(require,module,exports){
var global = require('./_global');
var core = require('./_core');
var LIBRARY = require('./_library');
var wksExt = require('./_wks-ext');
var defineProperty = require('./_object-dp').f;
module.exports = function (name) {
  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
  if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, { value: wksExt.f(name) });
};

},{"./_core":14,"./_global":29,"./_library":46,"./_object-dp":50,"./_wks-ext":85}],85:[function(require,module,exports){
exports.f = require('./_wks');

},{"./_wks":86}],86:[function(require,module,exports){
var store = require('./_shared')('wks');
var uid = require('./_uid');
var Symbol = require('./_global').Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;

},{"./_global":29,"./_shared":71,"./_uid":82}],87:[function(require,module,exports){
var classof = require('./_classof');
var ITERATOR = require('./_wks')('iterator');
var Iterators = require('./_iterators');
module.exports = require('./_core').getIteratorMethod = function (it) {
  if (it != undefined) return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};

},{"./_classof":10,"./_core":14,"./_iterators":45,"./_wks":86}],88:[function(require,module,exports){
'use strict';
// 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)
var $export = require('./_export');
var $find = require('./_array-methods')(6);
var KEY = 'findIndex';
var forced = true;
// Shouldn't skip holes
if (KEY in []) Array(1)[KEY](function () { forced = false; });
$export($export.P + $export.F * forced, 'Array', {
  findIndex: function findIndex(callbackfn /* , that = undefined */) {
    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});
require('./_add-to-unscopables')(KEY);

},{"./_add-to-unscopables":2,"./_array-methods":7,"./_export":22}],89:[function(require,module,exports){
'use strict';
// 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)
var $export = require('./_export');
var $find = require('./_array-methods')(5);
var KEY = 'find';
var forced = true;
// Shouldn't skip holes
if (KEY in []) Array(1)[KEY](function () { forced = false; });
$export($export.P + $export.F * forced, 'Array', {
  find: function find(callbackfn /* , that = undefined */) {
    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});
require('./_add-to-unscopables')(KEY);

},{"./_add-to-unscopables":2,"./_array-methods":7,"./_export":22}],90:[function(require,module,exports){
'use strict';
var ctx = require('./_ctx');
var $export = require('./_export');
var toObject = require('./_to-object');
var call = require('./_iter-call');
var isArrayIter = require('./_is-array-iter');
var toLength = require('./_to-length');
var createProperty = require('./_create-property');
var getIterFn = require('./core.get-iterator-method');

$export($export.S + $export.F * !require('./_iter-detect')(function (iter) { Array.from(iter); }), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
    var O = toObject(arrayLike);
    var C = typeof this == 'function' ? this : Array;
    var aLen = arguments.length;
    var mapfn = aLen > 1 ? arguments[1] : undefined;
    var mapping = mapfn !== undefined;
    var index = 0;
    var iterFn = getIterFn(O);
    var length, result, step, iterator;
    if (mapping) mapfn = ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
    // if object isn't iterable or it's array with default iterator - use simple case
    if (iterFn != undefined && !(C == Array && isArrayIter(iterFn))) {
      for (iterator = iterFn.call(O), result = new C(); !(step = iterator.next()).done; index++) {
        createProperty(result, index, mapping ? call(iterator, mapfn, [step.value, index], true) : step.value);
      }
    } else {
      length = toLength(O.length);
      for (result = new C(length); length > index; index++) {
        createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
      }
    }
    result.length = index;
    return result;
  }
});

},{"./_create-property":15,"./_ctx":16,"./_export":22,"./_is-array-iter":36,"./_iter-call":40,"./_iter-detect":43,"./_to-length":79,"./_to-object":80,"./core.get-iterator-method":87}],91:[function(require,module,exports){
'use strict';
var addToUnscopables = require('./_add-to-unscopables');
var step = require('./_iter-step');
var Iterators = require('./_iterators');
var toIObject = require('./_to-iobject');

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = require('./_iter-define')(Array, 'Array', function (iterated, kind) {
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var kind = this._k;
  var index = this._i++;
  if (!O || index >= O.length) {
    this._t = undefined;
    return step(1);
  }
  if (kind == 'keys') return step(0, index);
  if (kind == 'values') return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');

},{"./_add-to-unscopables":2,"./_iter-define":42,"./_iter-step":44,"./_iterators":45,"./_to-iobject":78}],92:[function(require,module,exports){
var dP = require('./_object-dp').f;
var FProto = Function.prototype;
var nameRE = /^\s*function ([^ (]*)/;
var NAME = 'name';

// 19.2.4.2 name
NAME in FProto || require('./_descriptors') && dP(FProto, NAME, {
  configurable: true,
  get: function () {
    try {
      return ('' + this).match(nameRE)[1];
    } catch (e) {
      return '';
    }
  }
});

},{"./_descriptors":18,"./_object-dp":50}],93:[function(require,module,exports){
// 19.1.3.1 Object.assign(target, source)
var $export = require('./_export');

$export($export.S + $export.F, 'Object', { assign: require('./_object-assign') });

},{"./_export":22,"./_object-assign":48}],94:[function(require,module,exports){
// 19.1.2.14 Object.keys(O)
var toObject = require('./_to-object');
var $keys = require('./_object-keys');

require('./_object-sap')('keys', function () {
  return function keys(it) {
    return $keys(toObject(it));
  };
});

},{"./_object-keys":58,"./_object-sap":60,"./_to-object":80}],95:[function(require,module,exports){
'use strict';
// 19.1.3.6 Object.prototype.toString()
var classof = require('./_classof');
var test = {};
test[require('./_wks')('toStringTag')] = 'z';
if (test + '' != '[object z]') {
  require('./_redefine')(Object.prototype, 'toString', function toString() {
    return '[object ' + classof(this) + ']';
  }, true);
}

},{"./_classof":10,"./_redefine":63,"./_wks":86}],96:[function(require,module,exports){
var global = require('./_global');
var inheritIfRequired = require('./_inherit-if-required');
var dP = require('./_object-dp').f;
var gOPN = require('./_object-gopn').f;
var isRegExp = require('./_is-regexp');
var $flags = require('./_flags');
var $RegExp = global.RegExp;
var Base = $RegExp;
var proto = $RegExp.prototype;
var re1 = /a/g;
var re2 = /a/g;
// "new" creates a new object, old webkit buggy here
var CORRECT_NEW = new $RegExp(re1) !== re1;

if (require('./_descriptors') && (!CORRECT_NEW || require('./_fails')(function () {
  re2[require('./_wks')('match')] = false;
  // RegExp constructor can alter flags and IsRegExp works correct with @@match
  return $RegExp(re1) != re1 || $RegExp(re2) == re2 || $RegExp(re1, 'i') != '/a/i';
}))) {
  $RegExp = function RegExp(p, f) {
    var tiRE = this instanceof $RegExp;
    var piRE = isRegExp(p);
    var fiU = f === undefined;
    return !tiRE && piRE && p.constructor === $RegExp && fiU ? p
      : inheritIfRequired(CORRECT_NEW
        ? new Base(piRE && !fiU ? p.source : p, f)
        : Base((piRE = p instanceof $RegExp) ? p.source : p, piRE && fiU ? $flags.call(p) : f)
      , tiRE ? this : proto, $RegExp);
  };
  var proxy = function (key) {
    key in $RegExp || dP($RegExp, key, {
      configurable: true,
      get: function () { return Base[key]; },
      set: function (it) { Base[key] = it; }
    });
  };
  for (var keys = gOPN(Base), i = 0; keys.length > i;) proxy(keys[i++]);
  proto.constructor = $RegExp;
  $RegExp.prototype = proto;
  require('./_redefine')(global, 'RegExp', $RegExp);
}

require('./_set-species')('RegExp');

},{"./_descriptors":18,"./_fails":24,"./_flags":26,"./_global":29,"./_inherit-if-required":34,"./_is-regexp":39,"./_object-dp":50,"./_object-gopn":54,"./_redefine":63,"./_set-species":68,"./_wks":86}],97:[function(require,module,exports){
'use strict';
var regexpExec = require('./_regexp-exec');
require('./_export')({
  target: 'RegExp',
  proto: true,
  forced: regexpExec !== /./.exec
}, {
  exec: regexpExec
});

},{"./_export":22,"./_regexp-exec":65}],98:[function(require,module,exports){
// 21.2.5.3 get RegExp.prototype.flags()
if (require('./_descriptors') && /./g.flags != 'g') require('./_object-dp').f(RegExp.prototype, 'flags', {
  configurable: true,
  get: require('./_flags')
});

},{"./_descriptors":18,"./_flags":26,"./_object-dp":50}],99:[function(require,module,exports){
'use strict';

var anObject = require('./_an-object');
var toLength = require('./_to-length');
var advanceStringIndex = require('./_advance-string-index');
var regExpExec = require('./_regexp-exec-abstract');

// @@match logic
require('./_fix-re-wks')('match', 1, function (defined, MATCH, $match, maybeCallNative) {
  return [
    // `String.prototype.match` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.match
    function match(regexp) {
      var O = defined(this);
      var fn = regexp == undefined ? undefined : regexp[MATCH];
      return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[MATCH](String(O));
    },
    // `RegExp.prototype[@@match]` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@match
    function (regexp) {
      var res = maybeCallNative($match, regexp, this);
      if (res.done) return res.value;
      var rx = anObject(regexp);
      var S = String(this);
      if (!rx.global) return regExpExec(rx, S);
      var fullUnicode = rx.unicode;
      rx.lastIndex = 0;
      var A = [];
      var n = 0;
      var result;
      while ((result = regExpExec(rx, S)) !== null) {
        var matchStr = String(result[0]);
        A[n] = matchStr;
        if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
        n++;
      }
      return n === 0 ? null : A;
    }
  ];
});

},{"./_advance-string-index":3,"./_an-object":5,"./_fix-re-wks":25,"./_regexp-exec-abstract":64,"./_to-length":79}],100:[function(require,module,exports){
'use strict';

var anObject = require('./_an-object');
var toObject = require('./_to-object');
var toLength = require('./_to-length');
var toInteger = require('./_to-integer');
var advanceStringIndex = require('./_advance-string-index');
var regExpExec = require('./_regexp-exec-abstract');
var max = Math.max;
var min = Math.min;
var floor = Math.floor;
var SUBSTITUTION_SYMBOLS = /\$([$&`']|\d\d?|<[^>]*>)/g;
var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&`']|\d\d?)/g;

var maybeToString = function (it) {
  return it === undefined ? it : String(it);
};

// @@replace logic
require('./_fix-re-wks')('replace', 2, function (defined, REPLACE, $replace, maybeCallNative) {
  return [
    // `String.prototype.replace` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.replace
    function replace(searchValue, replaceValue) {
      var O = defined(this);
      var fn = searchValue == undefined ? undefined : searchValue[REPLACE];
      return fn !== undefined
        ? fn.call(searchValue, O, replaceValue)
        : $replace.call(String(O), searchValue, replaceValue);
    },
    // `RegExp.prototype[@@replace]` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@replace
    function (regexp, replaceValue) {
      var res = maybeCallNative($replace, regexp, this, replaceValue);
      if (res.done) return res.value;

      var rx = anObject(regexp);
      var S = String(this);
      var functionalReplace = typeof replaceValue === 'function';
      if (!functionalReplace) replaceValue = String(replaceValue);
      var global = rx.global;
      if (global) {
        var fullUnicode = rx.unicode;
        rx.lastIndex = 0;
      }
      var results = [];
      while (true) {
        var result = regExpExec(rx, S);
        if (result === null) break;
        results.push(result);
        if (!global) break;
        var matchStr = String(result[0]);
        if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
      }
      var accumulatedResult = '';
      var nextSourcePosition = 0;
      for (var i = 0; i < results.length; i++) {
        result = results[i];
        var matched = String(result[0]);
        var position = max(min(toInteger(result.index), S.length), 0);
        var captures = [];
        // NOTE: This is equivalent to
        //   captures = result.slice(1).map(maybeToString)
        // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
        // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
        // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.
        for (var j = 1; j < result.length; j++) captures.push(maybeToString(result[j]));
        var namedCaptures = result.groups;
        if (functionalReplace) {
          var replacerArgs = [matched].concat(captures, position, S);
          if (namedCaptures !== undefined) replacerArgs.push(namedCaptures);
          var replacement = String(replaceValue.apply(undefined, replacerArgs));
        } else {
          replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
        }
        if (position >= nextSourcePosition) {
          accumulatedResult += S.slice(nextSourcePosition, position) + replacement;
          nextSourcePosition = position + matched.length;
        }
      }
      return accumulatedResult + S.slice(nextSourcePosition);
    }
  ];

    // https://tc39.github.io/ecma262/#sec-getsubstitution
  function getSubstitution(matched, str, position, captures, namedCaptures, replacement) {
    var tailPos = position + matched.length;
    var m = captures.length;
    var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
    if (namedCaptures !== undefined) {
      namedCaptures = toObject(namedCaptures);
      symbols = SUBSTITUTION_SYMBOLS;
    }
    return $replace.call(replacement, symbols, function (match, ch) {
      var capture;
      switch (ch.charAt(0)) {
        case '$': return '$';
        case '&': return matched;
        case '`': return str.slice(0, position);
        case "'": return str.slice(tailPos);
        case '<':
          capture = namedCaptures[ch.slice(1, -1)];
          break;
        default: // \d\d?
          var n = +ch;
          if (n === 0) return match;
          if (n > m) {
            var f = floor(n / 10);
            if (f === 0) return match;
            if (f <= m) return captures[f - 1] === undefined ? ch.charAt(1) : captures[f - 1] + ch.charAt(1);
            return match;
          }
          capture = captures[n - 1];
      }
      return capture === undefined ? '' : capture;
    });
  }
});

},{"./_advance-string-index":3,"./_an-object":5,"./_fix-re-wks":25,"./_regexp-exec-abstract":64,"./_to-integer":77,"./_to-length":79,"./_to-object":80}],101:[function(require,module,exports){
'use strict';

var anObject = require('./_an-object');
var sameValue = require('./_same-value');
var regExpExec = require('./_regexp-exec-abstract');

// @@search logic
require('./_fix-re-wks')('search', 1, function (defined, SEARCH, $search, maybeCallNative) {
  return [
    // `String.prototype.search` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.search
    function search(regexp) {
      var O = defined(this);
      var fn = regexp == undefined ? undefined : regexp[SEARCH];
      return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[SEARCH](String(O));
    },
    // `RegExp.prototype[@@search]` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@search
    function (regexp) {
      var res = maybeCallNative($search, regexp, this);
      if (res.done) return res.value;
      var rx = anObject(regexp);
      var S = String(this);
      var previousLastIndex = rx.lastIndex;
      if (!sameValue(previousLastIndex, 0)) rx.lastIndex = 0;
      var result = regExpExec(rx, S);
      if (!sameValue(rx.lastIndex, previousLastIndex)) rx.lastIndex = previousLastIndex;
      return result === null ? -1 : result.index;
    }
  ];
});

},{"./_an-object":5,"./_fix-re-wks":25,"./_regexp-exec-abstract":64,"./_same-value":66}],102:[function(require,module,exports){
'use strict';

var isRegExp = require('./_is-regexp');
var anObject = require('./_an-object');
var speciesConstructor = require('./_species-constructor');
var advanceStringIndex = require('./_advance-string-index');
var toLength = require('./_to-length');
var callRegExpExec = require('./_regexp-exec-abstract');
var regexpExec = require('./_regexp-exec');
var fails = require('./_fails');
var $min = Math.min;
var $push = [].push;
var $SPLIT = 'split';
var LENGTH = 'length';
var LAST_INDEX = 'lastIndex';
var MAX_UINT32 = 0xffffffff;

// babel-minify transpiles RegExp('x', 'y') -> /x/y and it causes SyntaxError
var SUPPORTS_Y = !fails(function () { RegExp(MAX_UINT32, 'y'); });

// @@split logic
require('./_fix-re-wks')('split', 2, function (defined, SPLIT, $split, maybeCallNative) {
  var internalSplit;
  if (
    'abbc'[$SPLIT](/(b)*/)[1] == 'c' ||
    'test'[$SPLIT](/(?:)/, -1)[LENGTH] != 4 ||
    'ab'[$SPLIT](/(?:ab)*/)[LENGTH] != 2 ||
    '.'[$SPLIT](/(.?)(.?)/)[LENGTH] != 4 ||
    '.'[$SPLIT](/()()/)[LENGTH] > 1 ||
    ''[$SPLIT](/.?/)[LENGTH]
  ) {
    // based on es5-shim implementation, need to rework it
    internalSplit = function (separator, limit) {
      var string = String(this);
      if (separator === undefined && limit === 0) return [];
      // If `separator` is not a regex, use native split
      if (!isRegExp(separator)) return $split.call(string, separator, limit);
      var output = [];
      var flags = (separator.ignoreCase ? 'i' : '') +
                  (separator.multiline ? 'm' : '') +
                  (separator.unicode ? 'u' : '') +
                  (separator.sticky ? 'y' : '');
      var lastLastIndex = 0;
      var splitLimit = limit === undefined ? MAX_UINT32 : limit >>> 0;
      // Make `global` and avoid `lastIndex` issues by working with a copy
      var separatorCopy = new RegExp(separator.source, flags + 'g');
      var match, lastIndex, lastLength;
      while (match = regexpExec.call(separatorCopy, string)) {
        lastIndex = separatorCopy[LAST_INDEX];
        if (lastIndex > lastLastIndex) {
          output.push(string.slice(lastLastIndex, match.index));
          if (match[LENGTH] > 1 && match.index < string[LENGTH]) $push.apply(output, match.slice(1));
          lastLength = match[0][LENGTH];
          lastLastIndex = lastIndex;
          if (output[LENGTH] >= splitLimit) break;
        }
        if (separatorCopy[LAST_INDEX] === match.index) separatorCopy[LAST_INDEX]++; // Avoid an infinite loop
      }
      if (lastLastIndex === string[LENGTH]) {
        if (lastLength || !separatorCopy.test('')) output.push('');
      } else output.push(string.slice(lastLastIndex));
      return output[LENGTH] > splitLimit ? output.slice(0, splitLimit) : output;
    };
  // Chakra, V8
  } else if ('0'[$SPLIT](undefined, 0)[LENGTH]) {
    internalSplit = function (separator, limit) {
      return separator === undefined && limit === 0 ? [] : $split.call(this, separator, limit);
    };
  } else {
    internalSplit = $split;
  }

  return [
    // `String.prototype.split` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.split
    function split(separator, limit) {
      var O = defined(this);
      var splitter = separator == undefined ? undefined : separator[SPLIT];
      return splitter !== undefined
        ? splitter.call(separator, O, limit)
        : internalSplit.call(String(O), separator, limit);
    },
    // `RegExp.prototype[@@split]` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@split
    //
    // NOTE: This cannot be properly polyfilled in engines that don't support
    // the 'y' flag.
    function (regexp, limit) {
      var res = maybeCallNative(internalSplit, regexp, this, limit, internalSplit !== $split);
      if (res.done) return res.value;

      var rx = anObject(regexp);
      var S = String(this);
      var C = speciesConstructor(rx, RegExp);

      var unicodeMatching = rx.unicode;
      var flags = (rx.ignoreCase ? 'i' : '') +
                  (rx.multiline ? 'm' : '') +
                  (rx.unicode ? 'u' : '') +
                  (SUPPORTS_Y ? 'y' : 'g');

      // ^(? + rx + ) is needed, in combination with some S slicing, to
      // simulate the 'y' flag.
      var splitter = new C(SUPPORTS_Y ? rx : '^(?:' + rx.source + ')', flags);
      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
      if (lim === 0) return [];
      if (S.length === 0) return callRegExpExec(splitter, S) === null ? [S] : [];
      var p = 0;
      var q = 0;
      var A = [];
      while (q < S.length) {
        splitter.lastIndex = SUPPORTS_Y ? q : 0;
        var z = callRegExpExec(splitter, SUPPORTS_Y ? S : S.slice(q));
        var e;
        if (
          z === null ||
          (e = $min(toLength(splitter.lastIndex + (SUPPORTS_Y ? 0 : q)), S.length)) === p
        ) {
          q = advanceStringIndex(S, q, unicodeMatching);
        } else {
          A.push(S.slice(p, q));
          if (A.length === lim) return A;
          for (var i = 1; i <= z.length - 1; i++) {
            A.push(z[i]);
            if (A.length === lim) return A;
          }
          q = p = e;
        }
      }
      A.push(S.slice(p));
      return A;
    }
  ];
});

},{"./_advance-string-index":3,"./_an-object":5,"./_fails":24,"./_fix-re-wks":25,"./_is-regexp":39,"./_regexp-exec":65,"./_regexp-exec-abstract":64,"./_species-constructor":72,"./_to-length":79}],103:[function(require,module,exports){
'use strict';
require('./es6.regexp.flags');
var anObject = require('./_an-object');
var $flags = require('./_flags');
var DESCRIPTORS = require('./_descriptors');
var TO_STRING = 'toString';
var $toString = /./[TO_STRING];

var define = function (fn) {
  require('./_redefine')(RegExp.prototype, TO_STRING, fn, true);
};

// 21.2.5.14 RegExp.prototype.toString()
if (require('./_fails')(function () { return $toString.call({ source: 'a', flags: 'b' }) != '/a/b'; })) {
  define(function toString() {
    var R = anObject(this);
    return '/'.concat(R.source, '/',
      'flags' in R ? R.flags : !DESCRIPTORS && R instanceof RegExp ? $flags.call(R) : undefined);
  });
// FF44- RegExp#toString has a wrong name
} else if ($toString.name != TO_STRING) {
  define(function toString() {
    return $toString.call(this);
  });
}

},{"./_an-object":5,"./_descriptors":18,"./_fails":24,"./_flags":26,"./_redefine":63,"./es6.regexp.flags":98}],104:[function(require,module,exports){
'use strict';
var strong = require('./_collection-strong');
var validate = require('./_validate-collection');
var SET = 'Set';

// 23.2 Set Objects
module.exports = require('./_collection')(SET, function (get) {
  return function Set() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.2.3.1 Set.prototype.add(value)
  add: function add(value) {
    return strong.def(validate(this, SET), value = value === 0 ? 0 : value, value);
  }
}, strong);

},{"./_collection":13,"./_collection-strong":12,"./_validate-collection":83}],105:[function(require,module,exports){
// 21.1.3.6 String.prototype.endsWith(searchString [, endPosition])
'use strict';
var $export = require('./_export');
var toLength = require('./_to-length');
var context = require('./_string-context');
var ENDS_WITH = 'endsWith';
var $endsWith = ''[ENDS_WITH];

$export($export.P + $export.F * require('./_fails-is-regexp')(ENDS_WITH), 'String', {
  endsWith: function endsWith(searchString /* , endPosition = @length */) {
    var that = context(this, searchString, ENDS_WITH);
    var endPosition = arguments.length > 1 ? arguments[1] : undefined;
    var len = toLength(that.length);
    var end = endPosition === undefined ? len : Math.min(toLength(endPosition), len);
    var search = String(searchString);
    return $endsWith
      ? $endsWith.call(that, search, end)
      : that.slice(end - search.length, end) === search;
  }
});

},{"./_export":22,"./_fails-is-regexp":23,"./_string-context":74,"./_to-length":79}],106:[function(require,module,exports){
// 21.1.3.7 String.prototype.includes(searchString, position = 0)
'use strict';
var $export = require('./_export');
var context = require('./_string-context');
var INCLUDES = 'includes';

$export($export.P + $export.F * require('./_fails-is-regexp')(INCLUDES), 'String', {
  includes: function includes(searchString /* , position = 0 */) {
    return !!~context(this, searchString, INCLUDES)
      .indexOf(searchString, arguments.length > 1 ? arguments[1] : undefined);
  }
});

},{"./_export":22,"./_fails-is-regexp":23,"./_string-context":74}],107:[function(require,module,exports){
'use strict';
var $at = require('./_string-at')(true);

// 21.1.3.27 String.prototype[@@iterator]()
require('./_iter-define')(String, 'String', function (iterated) {
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var index = this._i;
  var point;
  if (index >= O.length) return { value: undefined, done: true };
  point = $at(O, index);
  this._i += point.length;
  return { value: point, done: false };
});

},{"./_iter-define":42,"./_string-at":73}],108:[function(require,module,exports){
'use strict';
// B.2.3.10 String.prototype.link(url)
require('./_string-html')('link', function (createHTML) {
  return function link(url) {
    return createHTML(this, 'a', 'href', url);
  };
});

},{"./_string-html":75}],109:[function(require,module,exports){
// 21.1.3.18 String.prototype.startsWith(searchString [, position ])
'use strict';
var $export = require('./_export');
var toLength = require('./_to-length');
var context = require('./_string-context');
var STARTS_WITH = 'startsWith';
var $startsWith = ''[STARTS_WITH];

$export($export.P + $export.F * require('./_fails-is-regexp')(STARTS_WITH), 'String', {
  startsWith: function startsWith(searchString /* , position = 0 */) {
    var that = context(this, searchString, STARTS_WITH);
    var index = toLength(Math.min(arguments.length > 1 ? arguments[1] : undefined, that.length));
    var search = String(searchString);
    return $startsWith
      ? $startsWith.call(that, search, index)
      : that.slice(index, index + search.length) === search;
  }
});

},{"./_export":22,"./_fails-is-regexp":23,"./_string-context":74,"./_to-length":79}],110:[function(require,module,exports){
'use strict';
// ECMAScript 6 symbols shim
var global = require('./_global');
var has = require('./_has');
var DESCRIPTORS = require('./_descriptors');
var $export = require('./_export');
var redefine = require('./_redefine');
var META = require('./_meta').KEY;
var $fails = require('./_fails');
var shared = require('./_shared');
var setToStringTag = require('./_set-to-string-tag');
var uid = require('./_uid');
var wks = require('./_wks');
var wksExt = require('./_wks-ext');
var wksDefine = require('./_wks-define');
var enumKeys = require('./_enum-keys');
var isArray = require('./_is-array');
var anObject = require('./_an-object');
var isObject = require('./_is-object');
var toObject = require('./_to-object');
var toIObject = require('./_to-iobject');
var toPrimitive = require('./_to-primitive');
var createDesc = require('./_property-desc');
var _create = require('./_object-create');
var gOPNExt = require('./_object-gopn-ext');
var $GOPD = require('./_object-gopd');
var $GOPS = require('./_object-gops');
var $DP = require('./_object-dp');
var $keys = require('./_object-keys');
var gOPD = $GOPD.f;
var dP = $DP.f;
var gOPN = gOPNExt.f;
var $Symbol = global.Symbol;
var $JSON = global.JSON;
var _stringify = $JSON && $JSON.stringify;
var PROTOTYPE = 'prototype';
var HIDDEN = wks('_hidden');
var TO_PRIMITIVE = wks('toPrimitive');
var isEnum = {}.propertyIsEnumerable;
var SymbolRegistry = shared('symbol-registry');
var AllSymbols = shared('symbols');
var OPSymbols = shared('op-symbols');
var ObjectProto = Object[PROTOTYPE];
var USE_NATIVE = typeof $Symbol == 'function' && !!$GOPS.f;
var QObject = global.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDesc = DESCRIPTORS && $fails(function () {
  return _create(dP({}, 'a', {
    get: function () { return dP(this, 'a', { value: 7 }).a; }
  })).a != 7;
}) ? function (it, key, D) {
  var protoDesc = gOPD(ObjectProto, key);
  if (protoDesc) delete ObjectProto[key];
  dP(it, key, D);
  if (protoDesc && it !== ObjectProto) dP(ObjectProto, key, protoDesc);
} : dP;

var wrap = function (tag) {
  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
  sym._k = tag;
  return sym;
};

var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  return it instanceof $Symbol;
};

var $defineProperty = function defineProperty(it, key, D) {
  if (it === ObjectProto) $defineProperty(OPSymbols, key, D);
  anObject(it);
  key = toPrimitive(key, true);
  anObject(D);
  if (has(AllSymbols, key)) {
    if (!D.enumerable) {
      if (!has(it, HIDDEN)) dP(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if (has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
      D = _create(D, { enumerable: createDesc(0, false) });
    } return setSymbolDesc(it, key, D);
  } return dP(it, key, D);
};
var $defineProperties = function defineProperties(it, P) {
  anObject(it);
  var keys = enumKeys(P = toIObject(P));
  var i = 0;
  var l = keys.length;
  var key;
  while (l > i) $defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create(it, P) {
  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key) {
  var E = isEnum.call(this, key = toPrimitive(key, true));
  if (this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return false;
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
  it = toIObject(it);
  key = toPrimitive(key, true);
  if (it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return;
  var D = gOPD(it, key);
  if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it) {
  var names = gOPN(toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
  } return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
  var IS_OP = it === ObjectProto;
  var names = gOPN(IS_OP ? OPSymbols : toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true)) result.push(AllSymbols[key]);
  } return result;
};

// 19.4.1.1 Symbol([description])
if (!USE_NATIVE) {
  $Symbol = function Symbol() {
    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
    var $set = function (value) {
      if (this === ObjectProto) $set.call(OPSymbols, value);
      if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    };
    if (DESCRIPTORS && setter) setSymbolDesc(ObjectProto, tag, { configurable: true, set: $set });
    return wrap(tag);
  };
  redefine($Symbol[PROTOTYPE], 'toString', function toString() {
    return this._k;
  });

  $GOPD.f = $getOwnPropertyDescriptor;
  $DP.f = $defineProperty;
  require('./_object-gopn').f = gOPNExt.f = $getOwnPropertyNames;
  require('./_object-pie').f = $propertyIsEnumerable;
  $GOPS.f = $getOwnPropertySymbols;

  if (DESCRIPTORS && !require('./_library')) {
    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }

  wksExt.f = function (name) {
    return wrap(wks(name));
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, { Symbol: $Symbol });

for (var es6Symbols = (
  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
).split(','), j = 0; es6Symbols.length > j;)wks(es6Symbols[j++]);

for (var wellKnownSymbols = $keys(wks.store), k = 0; wellKnownSymbols.length > k;) wksDefine(wellKnownSymbols[k++]);

$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function (key) {
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(sym) {
    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');
    for (var key in SymbolRegistry) if (SymbolRegistry[key] === sym) return key;
  },
  useSetter: function () { setter = true; },
  useSimple: function () { setter = false; }
});

$export($export.S + $export.F * !USE_NATIVE, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// Chrome 38 and 39 `Object.getOwnPropertySymbols` fails on primitives
// https://bugs.chromium.org/p/v8/issues/detail?id=3443
var FAILS_ON_PRIMITIVES = $fails(function () { $GOPS.f(1); });

$export($export.S + $export.F * FAILS_ON_PRIMITIVES, 'Object', {
  getOwnPropertySymbols: function getOwnPropertySymbols(it) {
    return $GOPS.f(toObject(it));
  }
});

// 24.3.2 JSON.stringify(value [, replacer [, space]])
$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function () {
  var S = $Symbol();
  // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols
  return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
  stringify: function stringify(it) {
    var args = [it];
    var i = 1;
    var replacer, $replacer;
    while (arguments.length > i) args.push(arguments[i++]);
    $replacer = replacer = args[1];
    if (!isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
    if (!isArray(replacer)) replacer = function (key, value) {
      if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
      if (!isSymbol(value)) return value;
    };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  }
});

// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
$Symbol[PROTOTYPE][TO_PRIMITIVE] || require('./_hide')($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
// 19.4.3.5 Symbol.prototype[@@toStringTag]
setToStringTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setToStringTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setToStringTag(global.JSON, 'JSON', true);

},{"./_an-object":5,"./_descriptors":18,"./_enum-keys":21,"./_export":22,"./_fails":24,"./_global":29,"./_has":30,"./_hide":31,"./_is-array":37,"./_is-object":38,"./_library":46,"./_meta":47,"./_object-create":49,"./_object-dp":50,"./_object-gopd":52,"./_object-gopn":54,"./_object-gopn-ext":53,"./_object-gops":55,"./_object-keys":58,"./_object-pie":59,"./_property-desc":61,"./_redefine":63,"./_set-to-string-tag":69,"./_shared":71,"./_to-iobject":78,"./_to-object":80,"./_to-primitive":81,"./_uid":82,"./_wks":86,"./_wks-define":84,"./_wks-ext":85}],111:[function(require,module,exports){
'use strict';
// https://github.com/tc39/Array.prototype.includes
var $export = require('./_export');
var $includes = require('./_array-includes')(true);

$export($export.P, 'Array', {
  includes: function includes(el /* , fromIndex = 0 */) {
    return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
  }
});

require('./_add-to-unscopables')('includes');

},{"./_add-to-unscopables":2,"./_array-includes":6,"./_export":22}],112:[function(require,module,exports){
require('./_wks-define')('asyncIterator');

},{"./_wks-define":84}],113:[function(require,module,exports){
var $iterators = require('./es6.array.iterator');
var getKeys = require('./_object-keys');
var redefine = require('./_redefine');
var global = require('./_global');
var hide = require('./_hide');
var Iterators = require('./_iterators');
var wks = require('./_wks');
var ITERATOR = wks('iterator');
var TO_STRING_TAG = wks('toStringTag');
var ArrayValues = Iterators.Array;

var DOMIterables = {
  CSSRuleList: true, // TODO: Not spec compliant, should be false.
  CSSStyleDeclaration: false,
  CSSValueList: false,
  ClientRectList: false,
  DOMRectList: false,
  DOMStringList: false,
  DOMTokenList: true,
  DataTransferItemList: false,
  FileList: false,
  HTMLAllCollection: false,
  HTMLCollection: false,
  HTMLFormElement: false,
  HTMLSelectElement: false,
  MediaList: true, // TODO: Not spec compliant, should be false.
  MimeTypeArray: false,
  NamedNodeMap: false,
  NodeList: true,
  PaintRequestList: false,
  Plugin: false,
  PluginArray: false,
  SVGLengthList: false,
  SVGNumberList: false,
  SVGPathSegList: false,
  SVGPointList: false,
  SVGStringList: false,
  SVGTransformList: false,
  SourceBufferList: false,
  StyleSheetList: true, // TODO: Not spec compliant, should be false.
  TextTrackCueList: false,
  TextTrackList: false,
  TouchList: false
};

for (var collections = getKeys(DOMIterables), i = 0; i < collections.length; i++) {
  var NAME = collections[i];
  var explicit = DOMIterables[NAME];
  var Collection = global[NAME];
  var proto = Collection && Collection.prototype;
  var key;
  if (proto) {
    if (!proto[ITERATOR]) hide(proto, ITERATOR, ArrayValues);
    if (!proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);
    Iterators[NAME] = ArrayValues;
    if (explicit) for (key in $iterators) if (!proto[key]) redefine(proto, key, $iterators[key], true);
  }
}

},{"./_global":29,"./_hide":31,"./_iterators":45,"./_object-keys":58,"./_redefine":63,"./_wks":86,"./es6.array.iterator":91}],114:[function(require,module,exports){
"use strict";

require("core-js/modules/es6.string.iterator");

require("core-js/modules/es6.array.from");

require("core-js/modules/es6.regexp.replace");

require("core-js/modules/es6.string.link");

require("core-js/modules/es7.array.includes");

require("core-js/modules/es6.string.includes");

var _require = require('./common'),
    findPlatform = _require.findPlatform,
    detectEA = _require.detectEA,
    getBinaryExt = _require.getBinaryExt,
    getInstallerExt = _require.getInstallerExt,
    getOfficialName = _require.getOfficialName,
    getPlatformOrder = _require.getPlatformOrder,
    loadAssetInfo = _require.loadAssetInfo,
    setRadioSelectors = _require.setRadioSelectors;

var _require2 = require('./common'),
    jvmVariant = _require2.jvmVariant,
    variant = _require2.variant;

var loading = document.getElementById('loading');
var errorContainer = document.getElementById('error-container'); // When archive page loads, run:

module.exports.load = function () {
  setRadioSelectors();
  loadAssetInfo(variant, jvmVariant, 'ga', undefined, undefined, undefined, 'adoptopenjdk', buildArchiveHTML, function () {
    // if there are no releases (beyond the latest one)...
    // report an error, remove the loading dots
    loading.innerHTML = '';
    errorContainer.innerHTML = "<p>There are no archived releases yet for ".concat(variant, " on the ").concat(jvmVariant, " JVM.\n      See the <a href='./releases.html?variant=").concat(variant, "&jvmVariant=").concat(jvmVariant, "'>Latest release</a> page.</p>");
  });
};

function buildArchiveHTML(aReleases) {
  var releases = [];
  aReleases.forEach(function (aRelease) {
    var publishedAt = moment(aRelease.timestamp);
    var release = {
      release_name: aRelease.release_name,
      release_link: aRelease.release_link,
      dashboard_link: "https://dash.adoptopenjdk.net/version.html?version=".concat(variant) + "&tag=".concat(encodeURIComponent(aRelease.release_name)),
      release_day: publishedAt.format('D'),
      release_month: publishedAt.format('MMMM'),
      release_year: publishedAt.format('YYYY'),
      early_access: detectEA(aRelease.version_data),
      platforms: {}
    }; // populate 'platformTableRows' with one row per binary for this release...

    aRelease.binaries.forEach(function (aReleaseAsset) {
      var platform = findPlatform(aReleaseAsset); // Skip this asset if its platform could not be matched (see the website's 'config.json')

      if (!platform) {
        return;
      } // Skip this asset if it's not a binary type we're interested in displaying


      var binary_type = aReleaseAsset.image_type.toUpperCase();

      if (!['INSTALLER', 'JDK', 'JRE'].includes(binary_type)) {
        return;
      }

      if (!release.platforms[platform]) {
        release.platforms[platform] = {
          official_name: getOfficialName(platform),
          ordinal: getPlatformOrder(platform),
          assets: []
        };
      }

      var binary_constructor = {
        type: binary_type,
        extension: 'INSTALLER' === binary_type ? getInstallerExt(platform) : getBinaryExt(platform),
        link: aReleaseAsset.package.link,
        checksum: aReleaseAsset.package.checksum,
        size: Math.floor(aReleaseAsset.package.size / 1000 / 1000)
      };

      if (aReleaseAsset.installer) {
        binary_constructor.installer_link = aReleaseAsset.installer.link;
        binary_constructor.installer_checksum = aReleaseAsset.installer.checksum;
        binary_constructor.installer_extension = getInstallerExt(platform);
        binary_constructor.installer_size = Math.floor(aReleaseAsset.installer.size / 1000 / 1000);
      } // Add the new binary to the release asset


      release.platforms[platform].assets.push(binary_constructor);
    });
    releases.push(release);
  });
  var template = Handlebars.compile(document.getElementById('template').innerHTML);
  document.getElementById('archive-table-body').innerHTML = template({
    releases: releases
  });
  setPagination();
  loading.innerHTML = ''; // remove the loading dots
  // show the archive list and filter box, with fade-in animation

  var archiveList = document.getElementById('archive-list');
  archiveList.className = archiveList.className.replace(/(?:^|\s)hide(?!\S)/g, ' animated fadeIn ');
}

function setPagination() {
  var container = document.getElementById('pagination-container');
  var archiveTableBody = document.getElementById('archive-table-body');
  $(container).pagination({
    dataSource: Array.from(archiveTableBody.getElementsByClassName('release-row')).map(function (row) {
      return row.outerHTML;
    }),
    pageSize: 5,
    callback: function callback(rows) {
      archiveTableBody.innerHTML = rows.join('');
    }
  });

  if (container.getElementsByTagName('li').length <= 3) {
    container.classList.add('hide');
  }
}

},{"./common":115,"core-js/modules/es6.array.from":90,"core-js/modules/es6.regexp.replace":100,"core-js/modules/es6.string.includes":106,"core-js/modules/es6.string.iterator":107,"core-js/modules/es6.string.link":108,"core-js/modules/es7.array.includes":111}],115:[function(require,module,exports){
(function (global){
"use strict";

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.function.name");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.regexp.match");

require("core-js/modules/es6.regexp.split");

require("core-js/modules/es6.string.iterator");

require("core-js/modules/es6.array.from");

require("core-js/modules/es6.regexp.constructor");

require("core-js/modules/es6.regexp.search");

require("core-js/modules/es6.regexp.replace");

require("core-js/modules/es6.string.ends-with");

require("core-js/modules/es7.array.includes");

require("core-js/modules/es6.string.includes");

require("core-js/modules/es6.object.assign");

require("core-js/modules/es6.array.find-index");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.object.keys");

require("core-js/modules/es6.array.find");

function _createForOfIteratorHelper(o) { if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) { var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var it, normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

// prefix for assets (e.g. logo)
var _require = require('../json/config'),
    platforms = _require.platforms,
    variants = _require.variants; // Enables things like 'lookup["X64_MAC"]'


var lookup = {};
platforms.forEach(function (platform) {
  return lookup[platform.searchableName] = platform;
});
var variant = module.exports.variant = getQueryByName('variant') || 'openjdk8';
var jvmVariant = module.exports.jvmVariant = getQueryByName('jvmVariant') || 'hotspot';

module.exports.getVariantObject = function (variantName) {
  return variants.find(function (variant) {
    return variant.searchableName === variantName;
  });
};

module.exports.findPlatform = function (binaryData) {
  var matchedPlatform = platforms.filter(function (platform) {
    return Object.prototype.hasOwnProperty.call(platform, 'attributes') && Object.keys(platform.attributes).every(function (attr) {
      return platform.attributes[attr] === binaryData[attr];
    });
  })[0];
  return matchedPlatform === undefined ? null : matchedPlatform.searchableName;
}; // gets the OFFICIAL NAME when you pass in 'searchableName'


module.exports.getOfficialName = function (searchableName) {
  return lookup[searchableName].officialName;
};

module.exports.getPlatformOrder = function (searchableName) {
  return platforms.findIndex(function (platform) {
    return platform.searchableName == searchableName;
  });
};

module.exports.orderPlatforms = function (input) {
  var attr = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'thisPlatformOrder';
  return sortByProperty(input, attr);
};

var sortByProperty = module.exports.sortByProperty = function (input, property, descending) {
  var invert = descending ? -1 : 1;

  var sorter = function sorter(a, b) {
    return invert * (a[property] > b[property] ? 1 : a[property] < b[property] ? -1 : 0);
  };

  if (Array.isArray(input)) {
    return input.sort(sorter);
  } else {
    // Preserve the source object key as '_key'
    return Object.keys(input).map(function (_key) {
      return Object.assign(input[_key], {
        _key: _key
      });
    }).sort(sorter);
  }
}; // gets the BINARY EXTENSION when you pass in 'searchableName'


module.exports.getBinaryExt = function (searchableName) {
  return lookup[searchableName].binaryExtension;
}; // gets the INSTALLER EXTENSION when you pass in 'searchableName'


module.exports.getInstallerExt = function (searchableName) {
  return lookup[searchableName].installerExtension;
}; // gets the Supported Version WITH PATH when you pass in 'searchableName'


module.exports.getSupportedVersion = function (searchableName) {
  return lookup[searchableName].supported_version;
}; // gets the INSTALLATION COMMAND when you pass in 'searchableName'


module.exports.getInstallCommand = function (searchableName) {
  return lookup[searchableName].installCommand;
}; // gets the CHECKSUM COMMAND when you pass in 'searchableName'


module.exports.getChecksumCommand = function (searchableName) {
  return lookup[searchableName].checksumCommand;
}; // gets the CHECKSUM AUTO COMMAND HINT when you pass in 'searchableName'


module.exports.getChecksumAutoCommandHint = function (searchableName) {
  return lookup[searchableName].checksumAutoCommandHint;
}; // gets the CHECKSUM AUTO COMMAND when you pass in 'searchableName'


module.exports.getChecksumAutoCommand = function (searchableName) {
  return lookup[searchableName].checksumAutoCommand;
}; // gets the PATH COMMAND when you pass in 'searchableName'


module.exports.getPathCommand = function (searchableName) {
  return lookup[searchableName].pathCommand;
}; // This function returns an object containing all information about the user's OS.
// The OS info comes from the 'platforms' array, which in turn comes from 'config.json'.
// `platform` comes from `platform.js`, which should be included on the page where `detectOS` is used.


module.exports.detectOS = function () {
  return platforms.find(function (aPlatform) {
    /*global platform*/
    // Workaround for Firefox on macOS which is 32 bit only
    if (platform.os.family == 'OS X') {
      platform.os.architecture = 64;
    }

    return aPlatform.osDetectionString.toUpperCase().includes(platform.os.family.toUpperCase()) && aPlatform.attributes.architecture.endsWith(platform.os.architecture); // 32 or 64 int
  }) || null;
};

module.exports.detectLTS = function (version) {
  var _iterator = _createForOfIteratorHelper(variants),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var _variant = _step.value;

      if (_variant.searchableName == version) {
        if (_variant.lts == true) {
          return 'LTS';
        } else if (_variant.lts == false) {
          return null;
        } else {
          return _variant.lts;
        }
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
};

module.exports.detectEA = function (version) {
  if (version.pre && version.pre == 'ea') {
    return true;
  } else {
    return false;
  }
};

function toJson(response) {
  while (typeof response === 'string') {
    try {
      response = JSON.parse(response);
    } catch (e) {
      return null;
    }
  }

  return response;
} // load latest_nightly.json/nightly.json/releases.json/latest_release.json files
// This will first try to load from openjdk<X>-binaries repos and if that fails
// try openjdk<X>-release, i.e will try the following:
// https://github.com/AdoptOpenJDK/openjdk10-binaries/blob/master/latest_release.json
// https://github.com/AdoptOpenJDK/openjdk10-releases/blob/master/latest_release.json


function queryAPI(release, url, openjdkImp, vendor, errorHandler, handleResponse) {
  if (!url.endsWith('?') && !url.endsWith('&')) {
    url += '?';
  }

  if (release !== undefined) {
    url += "release=".concat(release, "&");
  }

  if (openjdkImp !== undefined) {
    url += "jvm_impl=".concat(openjdkImp, "&");
  }

  if (vendor !== undefined) {
    url += "vendor=".concat(vendor, "&");
  }

  if (vendor === 'openjdk') {
    url += 'page_size=1';
  }

  loadUrl(url, function (response) {
    if (response === null) {
      errorHandler();
    } else {
      handleResponse(toJson(response), false);
    }
  });
}

module.exports.loadAssetInfo = function (variant, openjdkImp, releaseType, pageSize, datePicker, release, vendor, handleResponse, errorHandler) {
  if (variant === 'amber') {
    variant = 'openjdk-amber';
  }

  var url = "https://api.adoptopenjdk.net/v3/assets/feature_releases/".concat(variant.replace(/\D/g, ''), "/").concat(releaseType);

  if (pageSize) {
    url += "?page_size=".concat(pageSize, "&");
  }

  if (datePicker) {
    url += "before=".concat(datePicker, "&");
  }

  queryAPI(release, url, openjdkImp, vendor, errorHandler, handleResponse);
};

module.exports.loadLatestAssets = function (variant, openjdkImp, release, handleResponse, errorHandler) {
  if (variant === 'amber') {
    variant = 'openjdk-amber';
  }

  var url = "https://api.adoptopenjdk.net/v3/assets/latest/".concat(variant.replace(/\D/g, ''), "/").concat(openjdkImp);
  queryAPI(release, url, openjdkImp, 'adoptopenjdk', errorHandler, handleResponse);
};

function loadUrl(url, callback) {
  var xobj = new XMLHttpRequest();
  xobj.open('GET', url, true);

  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == '200') {
      // if the status is 'ok', run the callback function that has been passed in.
      callback(xobj.responseText);
    } else if (xobj.status != '200' && // if the status is NOT 'ok', remove the loading dots, and display an error:
    xobj.status != '0') {
      // for IE a cross domain request has status 0, we're going to execute this block fist, than the above as well.
      callback(null);
    }
  };

  xobj.send(null);
} // build the menu twisties


module.exports.buildMenuTwisties = function () {
  var submenus = document.getElementById('menu-content').getElementsByClassName('submenu');

  for (var i = 0; i < submenus.length; i++) {
    var twisty = document.createElement('span');
    var twistyContent = document.createTextNode('>');
    twisty.appendChild(twistyContent);
    twisty.className = 'twisty';
    var thisLine = submenus[i].getElementsByTagName('a')[0];
    thisLine.appendChild(twisty);

    thisLine.onclick = function () {
      this.parentNode.classList.toggle('open');
    };
  }
};

module.exports.setTickLink = function () {
  var ticks = document.getElementsByClassName('tick');

  for (var i = 0; i < ticks.length; i++) {
    ticks[i].addEventListener('click', function (event) {
      var win = window.open('https://en.wikipedia.org/wiki/Technology_Compatibility_Kit', '_blank');

      if (win) {
        win.focus();
      } else {
        alert('New tab blocked - please allow popups.');
      }

      event.preventDefault();
    });
  }
}; // builds up a query string (e.g. "variant=openjdk8&jvmVariant=hotspot")


var makeQueryString = module.exports.makeQueryString = function (params) {
  return Object.keys(params).map(function (key) {
    return key + '=' + params[key];
  }).join('&');
};

module.exports.setUrlQuery = function (params) {
  window.location.search = makeQueryString(params);
};

function getQueryByName(name) {
  var url = window.location.href;
  var regex = new RegExp('[?&]' + name.replace(/[[]]/g, '\\$&') + '(=([^&#]*)|&|#|$)');
  var results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

module.exports.persistUrlQuery = function () {
  var links = Array.from(document.getElementsByTagName('a'));
  var link = (window.location.hostname !== 'localhost' ? 'https://' : '') + window.location.hostname;
  links.forEach(function (eachLink) {
    if (eachLink.href.includes(link)) {
      if (eachLink.href.includes('#')) {
        var anchor = '#' + eachLink.href.split('#').pop();
        eachLink.href = eachLink.href.substr(0, eachLink.href.indexOf('#'));

        if (eachLink.href.includes('?')) {
          eachLink.href = eachLink.href.substr(0, eachLink.href.indexOf('?'));
        }

        eachLink.href = eachLink.href + window.location.search + anchor;
      } else {
        eachLink.href = eachLink.href + window.location.search;
      }
    }
  });
};

module.exports.setRadioSelectors = function () {
  var jdkSelector = document.getElementById('jdk-selector');
  var jvmSelector = document.getElementById('jvm-selector');
  var listedVariants = [];

  function createRadioButtons(name, group, variant, element) {
    if (!listedVariants.length || !listedVariants.some(function (aVariant) {
      return aVariant === name;
    })) {
      var btnLabel = document.createElement('label');
      btnLabel.setAttribute('class', 'btn-label');
      var input = document.createElement('input');
      input.setAttribute('type', 'radio');
      input.setAttribute('name', group);
      input.setAttribute('value', name);
      input.setAttribute('class', 'radio-button');
      input.setAttribute('lts', variant.lts);
      btnLabel.appendChild(input);

      if (group === 'jdk') {
        if (variant.lts === true) {
          btnLabel.innerHTML += "<span>".concat(variant.label, " (LTS)</span>");
        } else if (variant.lts === 'latest') {
          btnLabel.innerHTML += "<span>".concat(variant.label, " (Latest)</span>");
        } else {
          btnLabel.innerHTML += "<span>".concat(variant.label, "</span>");
        }
      } else {
        btnLabel.innerHTML += "<span>".concat(variant.jvm, "</span>");
      }

      element.appendChild(btnLabel);
      listedVariants.push(name);
    }
  }

  for (var x = 0; x < variants.length; x++) {
    var splitVariant = variants[x].searchableName.split('-');
    var jdkName = splitVariant[0];
    var jvmName = splitVariant[1];
    createRadioButtons(jdkName, 'jdk', variants[x], jdkSelector);

    if (jvmSelector) {
      createRadioButtons(jvmName, 'jvm', variants[x], jvmSelector);
    }
  }

  var jdkButtons = document.getElementsByName('jdk');
  var jvmButtons = document.getElementsByName('jvm');

  jdkSelector.onchange = function () {
    var jdkButton = Array.from(jdkButtons).find(function (button) {
      return button.checked;
    });
    module.exports.setUrlQuery({
      variant: jdkButton.value.match(/(openjdk\d+|amber)/)[1],
      jvmVariant: jvmVariant
    });
  };

  if (jvmSelector) {
    jvmSelector.onchange = function () {
      var jvmButton = Array.from(jvmButtons).find(function (button) {
        return button.checked;
      });
      module.exports.setUrlQuery({
        variant: variant,
        jvmVariant: jvmButton.value.match(/([a-zA-Z0-9]+)/)[1]
      });
    };
  }

  for (var i = 0; i < jdkButtons.length; i++) {
    if (jdkButtons[i].value === variant) {
      jdkButtons[i].setAttribute('checked', 'checked');
      break;
    }
  }

  for (var _i = 0; _i < jvmButtons.length; _i++) {
    if (jvmButtons[_i].value === jvmVariant) {
      jvmButtons[_i].setAttribute('checked', 'checked');

      break;
    }
  }
};

global.renderChecksum = function (checksum) {
  var modal = document.getElementById('myModal');
  document.getElementById('modal-body').innerHTML = checksum;
  modal.style.display = 'inline';
};

global.hideChecksum = function () {
  var modal = document.getElementById('myModal');
  modal.style.display = 'none';
};

global.showHideReleaseNotes = function (notes_id) {
  var notes_div = document.getElementById(notes_id);

  if (notes_div.classList.contains('softHide')) {
    notes_div.classList.remove('softHide');
  } else {
    notes_div.classList.add('softHide');
  }
};

global.copyStringToClipboard = function () {
  document.getElementById('modal-body').select();
  document.execCommand('copy');
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../json/config":123,"core-js/modules/es6.array.find":89,"core-js/modules/es6.array.find-index":88,"core-js/modules/es6.array.from":90,"core-js/modules/es6.array.iterator":91,"core-js/modules/es6.function.name":92,"core-js/modules/es6.object.assign":93,"core-js/modules/es6.object.keys":94,"core-js/modules/es6.object.to-string":95,"core-js/modules/es6.regexp.constructor":96,"core-js/modules/es6.regexp.match":99,"core-js/modules/es6.regexp.replace":100,"core-js/modules/es6.regexp.search":101,"core-js/modules/es6.regexp.split":102,"core-js/modules/es6.regexp.to-string":103,"core-js/modules/es6.string.ends-with":105,"core-js/modules/es6.string.includes":106,"core-js/modules/es6.string.iterator":107,"core-js/modules/es6.symbol":110,"core-js/modules/es7.array.includes":111,"core-js/modules/es7.symbol.async-iterator":112,"core-js/modules/web.dom.iterable":113}],116:[function(require,module,exports){
"use strict";

require("core-js/modules/es6.regexp.split");

require("core-js/modules/es6.regexp.replace");

var _require = require('./common'),
    buildMenuTwisties = _require.buildMenuTwisties,
    persistUrlQuery = _require.persistUrlQuery;

document.addEventListener('DOMContentLoaded', function () {
  persistUrlQuery();
  buildMenuTwisties(); // '/index.html' --> 'index'
  // NOTE: Browserify requires strings in `require()`, so this is intentionally more explicit than
  // it normally would be.

  switch (window.location.pathname.split('/').pop().replace(/\.html$/i, '')) {
    case '':
    case 'index':
      return require('./index').load();

    case 'archive':
      return require('./archive').load();

    case 'installation':
      return require('./installation').load();

    case 'nightly':
      return require('./nightly').load();

    case 'releases':
      return require('./releases').load();

    case 'testimonials':
      return require('./testimonials').load();

    case 'upstream':
      return require('./upstream').load();
  }
});

},{"./archive":114,"./common":115,"./index":117,"./installation":118,"./nightly":119,"./releases":120,"./testimonials":121,"./upstream":122,"core-js/modules/es6.regexp.replace":100,"core-js/modules/es6.regexp.split":102}],117:[function(require,module,exports){
"use strict";

require("core-js/modules/es6.regexp.replace");

require("core-js/modules/es6.string.link");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.object.keys");

require("core-js/modules/es7.array.includes");

require("core-js/modules/es6.string.includes");

require("core-js/modules/es6.function.name");

var _require = require('./common'),
    detectOS = _require.detectOS,
    findPlatform = _require.findPlatform,
    getBinaryExt = _require.getBinaryExt,
    loadLatestAssets = _require.loadLatestAssets,
    makeQueryString = _require.makeQueryString,
    setRadioSelectors = _require.setRadioSelectors,
    setTickLink = _require.setTickLink;

var _require2 = require('./common'),
    jvmVariant = _require2.jvmVariant,
    variant = _require2.variant; // set variables for all index page HTML elements that will be used by the JS


var loading = document.getElementById('loading');
var errorContainer = document.getElementById('error-container');
var dlText = document.getElementById('dl-text');
var dlLatest = document.getElementById('dl-latest');
var dlArchive = document.getElementById('dl-archive');
var dlOther = document.getElementById('dl-other');
var dlIcon = document.getElementById('dl-icon');
var dlIcon2 = document.getElementById('dl-icon-2');
var dlVersionText = document.getElementById('dl-version-text'); // When index page loads, run:

module.exports.load = function () {
  setRadioSelectors();
  removeRadioButtons(); // Try to match up the detected OS with a platform from 'config.json'

  var OS = detectOS();

  if (OS) {
    dlText.innerHTML = "Download for <var platform-name>".concat(OS.officialName, "</var>");
  }

  dlText.classList.remove('invisible');

  var handleResponse = function handleResponse(releasesJson) {
    if (!releasesJson) {
      return;
    }

    buildHomepageHTML(releasesJson, {}, OS);
  };

  loadLatestAssets(variant, jvmVariant, 'latest', handleResponse, undefined, function () {
    errorContainer.innerHTML = "<p>There are no releases available for ".concat(variant, " on the ").concat(jvmVariant, " JVM.\n      Please check our <a href='nightly.html?variant=").concat(variant, "&jvmVariant=").concat(jvmVariant, "' target='blank'>Nightly Builds</a>.</p>");
    loading.innerHTML = ''; // remove the loading dots
  });
};

function removeRadioButtons() {
  var buttons = document.getElementsByClassName('btn-label');

  for (var a = 0; a < buttons.length; a++) {
    if (buttons[a].firstChild.getAttribute('lts') === 'false') {
      buttons[a].style.display = 'none';
    }
  }
}

function buildHomepageHTML(releasesJson, jckJSON, OS) {
  var matchingFile = null; // if the OS has been detected...

  if (OS) {
    releasesJson.forEach(function (eachAsset) {
      // iterate through the assets attached to this release
      var uppercaseFilename = eachAsset.binary.package.name.toUpperCase();
      var thisPlatform = findPlatform(eachAsset.binary); // firstly, check if a valid searchableName has been returned (i.e. the platform is recognised)...

      if (thisPlatform) {
        // secondly, check if the file has the expected file extension for that platform...
        // (this filters out all non-binary attachments, e.g. SHA checksums - these contain the platform name, but are not binaries)
        var thisBinaryExtension = getBinaryExt(thisPlatform); // get the binary extension associated with this platform

        if (matchingFile == null) {
          if (uppercaseFilename.includes(thisBinaryExtension.toUpperCase())) {
            var uppercaseOSname = OS.searchableName.toUpperCase();

            if (Object.keys(jckJSON).length !== 0) {
              if (jckJSON[releasesJson.tag_name] && Object.prototype.hasOwnProperty.call(jckJSON[releasesJson.tag_name], uppercaseOSname)) {
                document.getElementById('jck-approved-tick').classList.remove('hide');
                setTickLink();
              }
            } // thirdly check if JDK or JRE (we want to serve JDK by default)


            if (eachAsset.binary.image_type == 'jdk') {
              // fourthly, check if the user's OS searchableName string matches part of this binary's name (e.g. ...X64_LINUX...)
              if (uppercaseFilename.includes(uppercaseOSname)) {
                matchingFile = eachAsset; // set the matchingFile variable to the object containing this binary
              }
            }
          }
        }
      }
    });
  } // if there IS a matching binary for the user's OS...


  if (matchingFile) {
    if (matchingFile.binary.installer) {
      dlLatest.href = matchingFile.binary.installer.link; // set the main download button's link to be the installer's download url
    } else {
      dlLatest.href = matchingFile.binary.package.link; // set the main download button's link to be the binary's download url

      dlVersionText.innerHTML += " - ".concat(Math.floor(matchingFile.binary.package.size / 1000 / 1000), " MB");
    } // set the download button's version number to the latest release


    dlVersionText.innerHTML = matchingFile.release_name;
  } else {
    dlIcon.classList.add('hide'); // hide the download icon on the main button, to make it look less like you're going to get a download immediately

    dlIcon2.classList.remove('hide'); // un-hide an arrow-right icon to show instead

    dlLatest.href = "./releases.html?".concat(makeQueryString({
      variant: variant,
      jvmVariant: jvmVariant
    })); // set the main download button's link to the latest releases page for all platforms.
  } // remove the loading dots, and make all buttons visible, with animated fade-in


  loading.classList.add('hide');
  dlLatest.className = dlLatest.className.replace(/(?:^|\s)invisible(?!\S)/g, ' animated ');
  dlOther.className = dlOther.className.replace(/(?:^|\s)invisible(?!\S)/g, ' animated ');
  dlArchive.className = dlArchive.className.replace(/(?:^|\s)invisible(?!\S)/g, ' animated ');

  dlLatest.onclick = function () {
    document.getElementById('installation-link').className += ' animated pulse infinite transition-bright';
  }; // animate the main download button shortly after the initial animation has finished.


  setTimeout(function () {
    dlLatest.className = 'dl-button a-button animated pulse';
  }, 1000);
}

},{"./common":115,"core-js/modules/es6.array.iterator":91,"core-js/modules/es6.function.name":92,"core-js/modules/es6.object.keys":94,"core-js/modules/es6.object.to-string":95,"core-js/modules/es6.regexp.replace":100,"core-js/modules/es6.string.includes":106,"core-js/modules/es6.string.link":108,"core-js/modules/es7.array.includes":111,"core-js/modules/web.dom.iterable":113}],118:[function(require,module,exports){
"use strict";

require("core-js/modules/es6.string.iterator");

require("core-js/modules/es6.array.from");

require("core-js/modules/es6.regexp.replace");

require("core-js/modules/es6.string.link");

require("core-js/modules/es7.array.includes");

require("core-js/modules/es6.string.includes");

require("core-js/modules/es6.function.name");

var _require = require('./common'),
    detectOS = _require.detectOS,
    findPlatform = _require.findPlatform,
    getBinaryExt = _require.getBinaryExt,
    getChecksumCommand = _require.getChecksumCommand,
    getInstallCommand = _require.getInstallCommand,
    getOfficialName = _require.getOfficialName,
    getPathCommand = _require.getPathCommand,
    getPlatformOrder = _require.getPlatformOrder,
    loadAssetInfo = _require.loadAssetInfo,
    orderPlatforms = _require.orderPlatforms,
    setRadioSelectors = _require.setRadioSelectors,
    getChecksumAutoCommandHint = _require.getChecksumAutoCommandHint,
    getChecksumAutoCommand = _require.getChecksumAutoCommand;

var _require2 = require('./common'),
    jvmVariant = _require2.jvmVariant,
    variant = _require2.variant;

var loading = document.getElementById('loading');
var errorContainer = document.getElementById('error-container');
var platformSelector = document.getElementById('platform-selector');

module.exports.load = function () {
  setRadioSelectors();
  loadAssetInfo(variant, jvmVariant, 'ga', undefined, undefined, 'latest', 'adoptopenjdk', buildInstallationHTML, function () {
    errorContainer.innerHTML = '<p>Error... no installation information has been found!</p>';
    loading.innerHTML = ''; // remove the loading dots
  });
};

function buildInstallationHTML(releasesJson) {
  // create an array of the details for each asset that is attached to a release
  var assetArray = releasesJson[0].binaries;
  var ASSETARRAY = []; // for each asset attached to this release, check if it's a valid binary, then add a download block for it...

  assetArray.forEach(function (eachAsset) {
    var ASSETOBJECT = {};
    var uppercaseFilename = eachAsset.package.name.toUpperCase();
    ASSETOBJECT.thisPlatform = findPlatform(eachAsset); // check if the platform name is recognised...

    if (ASSETOBJECT.thisPlatform) {
      ASSETOBJECT.thisPlatformOrder = getPlatformOrder(ASSETOBJECT.thisPlatform);
      ASSETOBJECT.thisOfficialName = getOfficialName(ASSETOBJECT.thisPlatform) + ' ' + eachAsset.image_type;
      ASSETOBJECT.thisPlatformType = (ASSETOBJECT.thisPlatform + '-' + eachAsset.image_type).toUpperCase(); // if the filename contains both the platform name and the matching BINARY extension, add the relevant info to the asset object

      ASSETOBJECT.thisBinaryExtension = getBinaryExt(ASSETOBJECT.thisPlatform);

      if (uppercaseFilename.includes(ASSETOBJECT.thisBinaryExtension.toUpperCase())) {
        ASSETOBJECT.thisPlatformExists = true;
        ASSETOBJECT.thisBinaryLink = eachAsset.package.link;
        ASSETOBJECT.thisBinaryFilename = eachAsset.package.name;
        ASSETOBJECT.thisChecksum = eachAsset.package.checksum;
        ASSETOBJECT.thisChecksumLink = eachAsset.package.checksum_link;
        ASSETOBJECT.thisChecksumFilename = eachAsset.package.name.replace(ASSETOBJECT.thisBinaryExtension, '.sha256.txt');
        ASSETOBJECT.thisUnzipCommand = getInstallCommand(ASSETOBJECT.thisPlatform).replace('FILENAME', ASSETOBJECT.thisBinaryFilename);
        ASSETOBJECT.thisChecksumCommand = getChecksumCommand(ASSETOBJECT.thisPlatform).replace('FILENAME', ASSETOBJECT.thisBinaryFilename); // the check sum auto command hint is always printed,
        // so we just configure with empty string if not present

        ASSETOBJECT.thisChecksumAutoCommandHint = getChecksumAutoCommandHint(ASSETOBJECT.thisPlatform) || ''; // build download sha256 and verify auto command

        var thisChecksumAutoCommand = getChecksumAutoCommand(ASSETOBJECT.thisPlatform);
        var sha256FileName = ASSETOBJECT.thisChecksumLink;
        var separator = sha256FileName.lastIndexOf('/');

        if (separator > -1) {
          sha256FileName = sha256FileName.substring(separator + 1);
        }

        ASSETOBJECT.thisChecksumAutoCommand = thisChecksumAutoCommand.replace(/FILEHASHURL/g, ASSETOBJECT.thisChecksumLink).replace(/FILEHASHNAME/g, sha256FileName).replace(/FILENAME/g, ASSETOBJECT.thisBinaryFilename);
        var dirName = releasesJson[0].release_name + (eachAsset.image_type === 'jre' ? '-jre' : '');
        ASSETOBJECT.thisPathCommand = getPathCommand(ASSETOBJECT.thisPlatform).replace('DIRNAME', dirName);
      }

      if (ASSETOBJECT.thisPlatformExists) {
        ASSETARRAY.push(ASSETOBJECT);
      }
    }
  });
  var template = Handlebars.compile(document.getElementById('template').innerHTML);
  document.getElementById('installation-template').innerHTML = template({
    htmlTemplate: orderPlatforms(ASSETARRAY)
  });
  /*global hljs*/

  hljs.initHighlightingOnLoad();
  setInstallationPlatformSelector(ASSETARRAY);
  attachCopyButtonListeners();
  window.onhashchange = displayInstallPlatform;
  loading.innerHTML = ''; // remove the loading dots

  var installationContainer = document.getElementById('installation-container');
  installationContainer.className = installationContainer.className.replace(/(?:^|\s)hide(?!\S)/g, ' animated fadeIn ');
}

function attachCopyButtonListeners() {
  document.querySelectorAll('.copy-code-block').forEach(function (codeBlock) {
    var target = codeBlock.querySelector('code.cmd-block');
    codeBlock.querySelector('.copy-code-button').addEventListener('click', function () {
      return copyElementTextContent(target);
    });
  });
}

function displayInstallPlatform() {
  var platformHash = window.location.hash.substr(1).toUpperCase();
  var thisPlatformInstallation = document.getElementById("installation-container-".concat(platformHash));
  unselectInstallPlatform();

  if (thisPlatformInstallation) {
    platformSelector.value = platformHash;
    thisPlatformInstallation.classList.remove('hide');
  } else {
    var currentValues = [];
    Array.from(platformSelector.options).forEach(function (eachOption) {
      currentValues.push(eachOption.value);
    });
    platformSelector.value = 'unknown';
  }
}

function unselectInstallPlatform() {
  var platformInstallationDivs = document.getElementById('installation-container').getElementsByClassName('installation-single-platform');

  for (var i = 0; i < platformInstallationDivs.length; i++) {
    platformInstallationDivs[i].classList.add('hide');
  }
}

function setInstallationPlatformSelector(thisReleasePlatforms) {
  if (!platformSelector) {
    return;
  }

  if (platformSelector.options.length === 1) {
    thisReleasePlatforms.forEach(function (eachPlatform) {
      var op = new Option();
      op.value = eachPlatform.thisPlatformType;
      op.text = eachPlatform.thisOfficialName;
      platformSelector.options.add(op);
    });
  }

  var OS = detectOS();

  if (OS && window.location.hash.length < 1) {
    platformSelector.value = OS.searchableName;
    window.location.hash = platformSelector.value.toLowerCase();
  }

  displayInstallPlatform();

  platformSelector.onchange = function () {
    window.location.hash = platformSelector.value.toLowerCase();
    displayInstallPlatform();
  };
}

function copyElementTextContent(target) {
  var text = target.textContent;
  var input = document.createElement('input');
  input.value = text;
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  alert('Copied to clipboard');
  document.body.removeChild(input);
}

},{"./common":115,"core-js/modules/es6.array.from":90,"core-js/modules/es6.function.name":92,"core-js/modules/es6.regexp.replace":100,"core-js/modules/es6.string.includes":106,"core-js/modules/es6.string.iterator":107,"core-js/modules/es6.string.link":108,"core-js/modules/es7.array.includes":111}],119:[function(require,module,exports){
"use strict";

require("core-js/modules/es6.regexp.split");

require("core-js/modules/es6.regexp.constructor");

require("core-js/modules/es6.regexp.replace");

require("core-js/modules/es6.string.link");

require("core-js/modules/es7.array.includes");

require("core-js/modules/es6.string.includes");

require("core-js/modules/es6.function.name");

var _require = require('./common'),
    findPlatform = _require.findPlatform,
    getBinaryExt = _require.getBinaryExt,
    getOfficialName = _require.getOfficialName,
    getInstallerExt = _require.getInstallerExt,
    loadAssetInfo = _require.loadAssetInfo,
    setRadioSelectors = _require.setRadioSelectors;

var _require2 = require('./common'),
    jvmVariant = _require2.jvmVariant,
    variant = _require2.variant;

var loading = document.getElementById('loading');
var errorContainer = document.getElementById('error-container');
var tableHead = document.getElementById('table-head');
var nightlyList = document.getElementById('nightly-table');
var numberpicker = document.getElementById('numberpicker');
var datepicker = document.getElementById('datepicker');
var templateString = $('#template').html(); // When nightly page loads, run:

module.exports.load = function () {
  setRadioSelectors();
  setDatePicker();
  populateNightly(); // run the function to populate the table on the Nightly page.

  numberpicker.onchange = datepicker.onchange = function () {
    populateNightly();
  };
};

function setDatePicker() {
  $(datepicker).datepicker();
  datepicker.value = moment().format('YYYY-MM-DD');
}

function populateNightly() {
  var handleResponse = function handleResponse(response) {
    // if there are releases...
    if (typeof response[0] !== 'undefined') {
      var files = getFiles(response);

      if (files.length === 0) {
        return;
      }

      buildNightlyHTML(files);
    }
  };

  loadAssetInfo(variant, jvmVariant, 'ea', numberpicker.value, moment(datepicker.value).format('YYYY-MM-DD'), undefined, 'adoptopenjdk', handleResponse, function () {
    errorContainer.innerHTML = '<p>Error... no releases have been found!</p>';
    loading.innerHTML = ''; // remove the loading dots
  });
}

function getFiles(nightlyJson) {
  var assets = [];
  nightlyJson.forEach(function (release) {
    release.binaries.forEach(function (asset) {
      if (/(?:\.tar\.gz|\.zip)$/.test(asset.package.name) && findPlatform(asset)) {
        assets.push({
          release: release,
          asset: asset
        });
      }
    });
  });
  return assets;
}

function buildNightlyHTML(files) {
  tableHead.innerHTML = "<tr id='table-header'>\n    <th>Platform</th>\n    <th>Type</th>\n    <th>Heap Size</th>\n    <th>Date</th>\n    <th>Binary</th>\n    <th>Installer</th>\n    <th>Checksum</th>\n    </tr>";
  var NIGHTLYARRAY = []; // for each release...

  files.forEach(function (file) {
    // for each file attached to this release...
    var eachAsset = file.asset;
    var eachRelease = file.release;
    var NIGHTLYOBJECT = {};
    var nameOfFile = eachAsset.package.name;
    var type = eachAsset.image_type;
    NIGHTLYOBJECT.thisPlatform = findPlatform(eachAsset); // get the searchableName, e.g. MAC or X64_LINUX.
    // secondly, check if the file has the expected file extension for that platform...
    // (this filters out all non-binary attachments, e.g. SHA checksums - these contain the platform name, but are not binaries)

    NIGHTLYOBJECT.thisBinaryExtension = getBinaryExt(NIGHTLYOBJECT.thisPlatform); // get the file extension associated with this platform

    NIGHTLYOBJECT.thisInstalleExtension = getInstallerExt(NIGHTLYOBJECT.thisPlatform);

    if (nameOfFile.toUpperCase().includes(NIGHTLYOBJECT.thisBinaryExtension.toUpperCase())) {
      // set values ready to be injected into the HTML
      var publishedAt = eachRelease.timestamp;
      NIGHTLYOBJECT.thisReleaseName = eachRelease.release_name.slice(0, 12);
      NIGHTLYOBJECT.thisType = type;
      NIGHTLYOBJECT.thisHeapSize = eachAsset.heap_size;
      NIGHTLYOBJECT.thisReleaseDay = moment(publishedAt).format('D');
      NIGHTLYOBJECT.thisReleaseMonth = moment(publishedAt).format('MMMM');
      NIGHTLYOBJECT.thisReleaseYear = moment(publishedAt).format('YYYY');
      NIGHTLYOBJECT.thisGitLink = eachRelease.release_link;
      NIGHTLYOBJECT.thisOfficialName = getOfficialName(NIGHTLYOBJECT.thisPlatform);
      NIGHTLYOBJECT.thisBinaryLink = eachAsset.package.link;
      NIGHTLYOBJECT.thisBinarySize = Math.floor(eachAsset.package.size / 1000 / 1000);
      NIGHTLYOBJECT.thisChecksum = eachAsset.package.checksum;

      if (eachAsset.installer) {
        NIGHTLYOBJECT.thisInstallerLink = eachAsset.installer.link;
      }

      NIGHTLYARRAY.push(NIGHTLYOBJECT);
    }
  });
  var template = Handlebars.compile(templateString);
  nightlyList.innerHTML = template({
    htmlTemplate: NIGHTLYARRAY
  });
  setSearchLogic();
  loading.innerHTML = ''; // remove the loading dots
  // show the table, with animated fade-in

  nightlyList.className = nightlyList.className.replace(/(?:^|\s)hide(?!\S)/g, ' animated fadeIn ');
  setTableRange(); // if the table has a scroll bar, show text describing how to horizontally scroll

  var scrollText = document.getElementById('scroll-text');
  var tableDisplayWidth = document.getElementById('nightly-list').clientWidth;
  var tableScrollWidth = document.getElementById('nightly-list').scrollWidth;

  if (tableDisplayWidth != tableScrollWidth) {
    scrollText.className = scrollText.className.replace(/(?:^|\s)hide(?!\S)/g, '');
  }
}

function setTableRange() {
  var rows = $('#nightly-table tr');
  var selectedDate = moment(datepicker.value, 'MM-DD-YYYY').format();

  for (var i = 0; i < rows.length; i++) {
    var thisDate = rows[i].getElementsByClassName('nightly-release-date')[0].innerHTML;
    var thisDateMoment = moment(thisDate, 'D MMMM YYYY').format();
    var isAfter = moment(thisDateMoment).isAfter(selectedDate);

    if (isAfter) {
      rows[i].classList.add('hide');
    } else {
      rows[i].classList.remove('hide');
    }
  }
}

function setSearchLogic() {
  // logic for the realtime search box...
  var $rows = $('#nightly-table tr');
  $('#search').keyup(function () {
    var reg = RegExp('^(?=.*' + $.trim($(this).val()).split(/\s+/).join(')(?=.*') + ').*$', 'i');
    $rows.show().filter(function () {
      return !reg.test($(this).text().replace(/\s+/g, ' '));
    }).hide();
  });
}

},{"./common":115,"core-js/modules/es6.function.name":92,"core-js/modules/es6.regexp.constructor":96,"core-js/modules/es6.regexp.replace":100,"core-js/modules/es6.regexp.split":102,"core-js/modules/es6.string.includes":106,"core-js/modules/es6.string.link":108,"core-js/modules/es7.array.includes":111}],120:[function(require,module,exports){
(function (global){
"use strict";

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.array.from");

require("core-js/modules/es6.function.name");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.string.starts-with");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.string.iterator");

require("core-js/modules/es6.set");

require("core-js/modules/es6.regexp.replace");

require("core-js/modules/es6.string.link");

require("core-js/modules/es6.array.find");

require("core-js/modules/es7.array.includes");

require("core-js/modules/es6.string.includes");

require("core-js/modules/es6.regexp.split");

function _createForOfIteratorHelper(o) { if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) { var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var it, normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var _require = require('./common'),
    findPlatform = _require.findPlatform,
    getBinaryExt = _require.getBinaryExt,
    getInstallerExt = _require.getInstallerExt,
    getSupportedVersion = _require.getSupportedVersion,
    getOfficialName = _require.getOfficialName,
    getPlatformOrder = _require.getPlatformOrder,
    getVariantObject = _require.getVariantObject,
    detectLTS = _require.detectLTS,
    detectEA = _require.detectEA,
    loadLatestAssets = _require.loadLatestAssets,
    orderPlatforms = _require.orderPlatforms,
    setRadioSelectors = _require.setRadioSelectors,
    setTickLink = _require.setTickLink;

var _require2 = require('./common'),
    jvmVariant = _require2.jvmVariant,
    variant = _require2.variant;

var loading = document.getElementById('loading');
var errorContainer = document.getElementById('error-container'); // When releases page loads, run:

module.exports.load = function () {
  Handlebars.registerHelper('fetchOS', function (title) {
    return title.split(' ')[0];
  });
  Handlebars.registerHelper('fetchArch', function (title) {
    return title.split(' ')[1];
  });
  Handlebars.registerHelper('fetchInstallerExt', function (filename) {
    return ".".concat(filename.split('.').pop());
  });
  var LTS = detectLTS("".concat(variant, "-").concat(jvmVariant));
  var styles = "\n  .download-last-version:after {\n      content: \"".concat(LTS, "\";\n  }\n  ");

  if (LTS !== null) {
    var styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
  }

  setRadioSelectors();
  loadLatestAssets(variant, jvmVariant, 'latest', buildLatestHTML, undefined, function () {
    errorContainer.innerHTML = "<p>There are no releases available for ".concat(variant, " on the ").concat(jvmVariant, " JVM.\n      Please check our <a href='nightly.html?variant=").concat(variant, "&jvmVariant=").concat(jvmVariant, "' target='blank'>Nightly Builds</a>.</p>");
    loading.innerHTML = ''; // remove the loading dots
  });
};

function buildLatestHTML(releasesJson) {
  // Populate with description
  var variantObject = getVariantObject(variant + '-' + jvmVariant);

  if (variantObject.descriptionLink) {
    document.getElementById('description_header').innerHTML = "What is ".concat(variantObject.description, "?");
    document.getElementById('description_link').innerHTML = 'Find out here';
    document.getElementById('description_link').href = variantObject.descriptionLink;
  } // Array of releases that have binaries we want to display


  var releases = [];
  releasesJson.forEach(function (releaseAsset) {
    var platform = findPlatform(releaseAsset.binary); // Skip this asset if its platform could not be matched (see the website's 'config.json')

    if (!platform) {
      return;
    }

    var heap_size;

    if (releaseAsset.binary.heap_size == 'large') {
      heap_size = 'Large Heap';
    } else if (releaseAsset.binary.heap_size == 'normal') {
      heap_size = 'Normal';
    } // Skip this asset if it's not a binary type we're interested in displaying


    var binary_type = releaseAsset.binary.image_type.toUpperCase();

    if (!['INSTALLER', 'JDK', 'JRE'].includes(binary_type)) {
      return;
    } // Get the existing release asset (passed to the template) or define a new one


    var release = releases.find(function (release) {
      return release.platform_name === platform;
    });

    if (!release) {
      release = {
        platform_name: platform,
        platform_official_name: getOfficialName(platform),
        platform_ordinal: getPlatformOrder(platform),
        platform_supported_version: getSupportedVersion(platform),
        release_name: releaseAsset.release_name,
        heap_size: heap_size,
        release_link: releaseAsset.release_link,
        release_datetime: moment(releaseAsset.timestamp).format('YYYY-MM-DD hh:mm:ss'),
        early_access: detectEA(releaseAsset.version),
        binaries: []
      };
    }

    var binary_constructor = {
      type: binary_type,
      extension: getBinaryExt(platform),
      link: releaseAsset.binary.package.link,
      checksum: releaseAsset.binary.package.checksum,
      size: Math.floor(releaseAsset.binary.package.size / 1000 / 1000)
    };

    if (releaseAsset.binary.installer) {
      binary_constructor.installer_link = releaseAsset.binary.installer.link;
      binary_constructor.installer_checksum = releaseAsset.binary.installer.checksum;
      binary_constructor.installer_extension = getInstallerExt(platform);
      binary_constructor.installer_size = Math.floor(releaseAsset.binary.installer.size / 1000 / 1000);
    } // Add the new binary to the release asset


    release.binaries.push(binary_constructor); // We have the first binary, so add the release asset.

    if (release.binaries.length === 1) {
      releases.push(release);
    }
  });
  releases = orderPlatforms(releases, 'platform_ordinal');
  releases.forEach(function (release) {
    release.binaries.sort(function (binaryA, binaryB) {
      return binaryA.type > binaryB.type ? 1 : binaryA.type < binaryB.type ? -1 : 0;
    });
  });
  var templateSelector = Handlebars.compile(document.getElementById('template-selector').innerHTML);
  document.getElementById('latest-selector').innerHTML = templateSelector({
    releases: releases
  });
  setTickLink();
  global.populateFilters('all');
  loading.innerHTML = ''; // remove the loading dots

  var latestContainer = document.getElementById('latest-container');
  latestContainer.className = latestContainer.className.replace(/(?:^|\s)invisible(?!\S)/g, ' animated fadeIn '); // make this section visible (invisible by default), with animated fade-in
}

global.filterOS = function () {
  var os = document.getElementById('os-filter');
  var arch = document.getElementById('arch-filter');

  if (arch.options[arch.selectedIndex].value === 'Any') {
    filterTable(os.options[os.selectedIndex].value, 'os');
    global.populateFilters('arch');
  } else if (os.options[os.selectedIndex].value == 'Any') {
    global.filterArch();
  } else {
    filterTable(os.options[os.selectedIndex].value, 'multi', arch.options[arch.selectedIndex].value);
  }
};

global.filterArch = function () {
  var arch = document.getElementById('arch-filter');
  var os = document.getElementById('os-filter');

  if (os.options[os.selectedIndex].value === 'Any') {
    filterTable(arch.options[arch.selectedIndex].value, 'arch');
  } else if (arch.options[arch.selectedIndex].value == 'Any') {
    global.filterOS();
  } else {
    filterTable(arch.options[arch.selectedIndex].value, 'multi', os.options[os.selectedIndex].value);
  }
};

global.populateFilters = function (filter) {
  var releaseTable = document.getElementById('latest-selector').getElementsByClassName('releases-table');
  var OSES = ['Any'];
  var ARCHES = ['Any'];

  var _iterator = _createForOfIteratorHelper(releaseTable),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var release = _step.value;

      if (release.style.display !== 'none') {
        OSES.push(release.querySelector('.os').innerHTML.split(' ')[0]);
        ARCHES.push(release.querySelector('.arch').innerHTML);
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  if (filter == 'all' || filter == 'os') {
    var osFilter = document.getElementById('os-filter');
    var selected = osFilter.options[osFilter.selectedIndex].value;
    osFilter.innerHTML = '';

    var _iterator2 = _createForOfIteratorHelper(new Set(OSES)),
        _step2;

    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        var os = _step2.value;
        var option = document.createElement('option');
        option.text = os;
        option.value = os;
        osFilter.append(option);
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }

    osFilter.value = selected;
  }

  if (filter == 'all' || filter == 'arch') {
    var archFilter = document.getElementById('arch-filter');
    var _selected = archFilter.options[archFilter.selectedIndex].value;
    archFilter.innerHTML = '';

    var _iterator3 = _createForOfIteratorHelper(new Set(ARCHES)),
        _step3;

    try {
      for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
        var arch = _step3.value;

        var _option = document.createElement('option');

        _option.text = arch;
        _option.value = arch;
        archFilter.append(_option);
      }
    } catch (err) {
      _iterator3.e(err);
    } finally {
      _iterator3.f();
    }

    archFilter.value = _selected;
  }
};

function filterTable(string, type, string1) {
  var tables = document.getElementById('latest-selector').getElementsByClassName('releases-table');

  var _iterator4 = _createForOfIteratorHelper(tables),
      _step4;

  try {
    for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
      var table = _step4.value;

      if (type === 'multi') {
        var os = table.querySelector('.os').innerHTML;
        var arch = table.querySelector('.arch').innerHTML;

        if (os.startsWith(string) || arch === string) {
          if (os.startsWith(string1) || arch === string1) {
            table.style.display = '';
          } else {
            table.style.display = 'none';
          }
        } else {
          table.style.display = 'none';
        }
      }

      if (type === 'os') {
        if (string === 'Any') {
          table.style.display = '';
        } else {
          var _os = table.querySelector('.os').innerHTML;

          if (_os.startsWith(string)) {
            table.style.display = '';
          } else {
            table.style.display = 'none';
          }
        }
      }

      if (type === 'arch') {
        if (string == 'Any') {
          table.style.display = '';
        } else {
          var _arch = table.querySelector('.arch').innerHTML;

          if (_arch === string) {
            table.style.display = '';
          } else {
            table.style.display = 'none';
          }
        }
      }
    }
  } catch (err) {
    _iterator4.e(err);
  } finally {
    _iterator4.f();
  }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./common":115,"core-js/modules/es6.array.find":89,"core-js/modules/es6.array.from":90,"core-js/modules/es6.array.iterator":91,"core-js/modules/es6.function.name":92,"core-js/modules/es6.object.to-string":95,"core-js/modules/es6.regexp.replace":100,"core-js/modules/es6.regexp.split":102,"core-js/modules/es6.regexp.to-string":103,"core-js/modules/es6.set":104,"core-js/modules/es6.string.includes":106,"core-js/modules/es6.string.iterator":107,"core-js/modules/es6.string.link":108,"core-js/modules/es6.string.starts-with":109,"core-js/modules/es6.symbol":110,"core-js/modules/es7.array.includes":111,"core-js/modules/es7.symbol.async-iterator":112,"core-js/modules/web.dom.iterable":113}],121:[function(require,module,exports){
"use strict";

module.exports.load = function () {
  $('#testimonials').slick({
    dots: true,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true
  });
};

},{}],122:[function(require,module,exports){
(function (global){
"use strict";

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.function.name");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.string.starts-with");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.set");

require("core-js/modules/es6.string.link");

require("core-js/modules/es7.array.includes");

require("core-js/modules/es6.string.includes");

require("core-js/modules/es6.regexp.replace");

require("core-js/modules/es6.regexp.split");

require("core-js/modules/es6.string.iterator");

require("core-js/modules/es6.array.from");

require("core-js/modules/es6.array.find");

require("core-js/modules/es6.regexp.search");

function _createForOfIteratorHelper(o) { if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) { var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var it, normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var _require = require('./common'),
    findPlatform = _require.findPlatform,
    getBinaryExt = _require.getBinaryExt,
    getSupportedVersion = _require.getSupportedVersion,
    getOfficialName = _require.getOfficialName,
    getPlatformOrder = _require.getPlatformOrder,
    detectLTS = _require.detectLTS,
    setUrlQuery = _require.setUrlQuery,
    loadAssetInfo = _require.loadAssetInfo,
    orderPlatforms = _require.orderPlatforms,
    setRadioSelectors = _require.setRadioSelectors,
    setTickLink = _require.setTickLink;

var _require2 = require('./common'),
    variant = _require2.variant; // Hard coded as Red Hat only ship hotspot


var jvmVariant = 'hotspot';
var loading = document.getElementById('loading');
var errorContainer = document.getElementById('error-container');
var gaSelector = document.getElementById('ga-selector');
var gaButtons = document.getElementsByName('ga');
var urlParams = new URLSearchParams(window.location.search);
var ga = urlParams.get('ga') || 'ga';

gaSelector.onchange = function () {
  var gaButton = Array.from(gaButtons).find(function (button) {
    return button.checked;
  });
  setUrlQuery({
    variant: variant,
    ga: gaButton.value
  });
};

var _iterator = _createForOfIteratorHelper(gaButtons),
    _step;

try {
  for (_iterator.s(); !(_step = _iterator.n()).done;) {
    var button = _step.value;

    if (button.value === ga) {
      button.setAttribute('checked', 'checked');
      break;
    }
  } // When releases page loads, run:

} catch (err) {
  _iterator.e(err);
} finally {
  _iterator.f();
}

module.exports.load = function () {
  Handlebars.registerHelper('fetchOS', function (title) {
    if (title.split(' ')[2]) {
      // This is so that XL binaries have Large Heap in the name still
      return title.replace(title.split(' ')[1], '');
    } else {
      return title.split(' ')[0];
    }
  });
  Handlebars.registerHelper('fetchArch', function (title) {
    return title.split(' ')[1];
  });
  var LTS = detectLTS("".concat(variant, "-").concat(jvmVariant));
  var styles = "\n  .download-last-version:after {\n      content: \"".concat(LTS, "\";\n  }\n  ");

  if (LTS !== null) {
    var styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
  }

  setRadioSelectors();
  loadAssetInfo(variant, jvmVariant, ga, undefined, undefined, undefined, 'openjdk', buildUpstreamHTML, function () {
    // if there are no releases (beyond the latest one)...
    // report an error, remove the loading dots
    loading.innerHTML = '';
    errorContainer.innerHTML = "<p>There are no archived releases yet for ".concat(variant, " on the ").concat(jvmVariant, " JVM.\n      See the <a href='./releases.html?variant=").concat(variant, "&jvmVariant=").concat(jvmVariant, "'>Latest release</a> page.</p>");
  });
  var buttons = document.getElementsByClassName('btn-label');

  for (var a = 0; a < buttons.length; a++) {
    if (buttons[a].firstChild.getAttribute('lts') !== 'true') {
      buttons[a].style.display = 'none';
    }
  }
};

function buildUpstreamHTML(releasesJson) {
  // Array of releases that have binaries we want to display
  var releases = [];
  releasesJson[0].binaries.forEach(function (releaseAsset) {
    var platform = findPlatform(releaseAsset); // Skip this asset if its platform could not be matched (see the website's 'config.json')

    if (!platform) {
      return;
    } // Skip this asset if it's not a binary type we're interested in displaying


    var binary_type = releaseAsset.image_type.toUpperCase();

    if (!['INSTALLER', 'JDK', 'JRE'].includes(binary_type)) {
      return;
    } // Get the existing release asset (passed to the template) or define a new one


    var release = releases.find(function (release) {
      return release.platform_name === platform;
    });

    if (!release) {
      release = {
        platform_name: platform,
        platform_official_name: getOfficialName(platform),
        platform_ordinal: getPlatformOrder(platform),
        platform_supported_version: getSupportedVersion(platform),
        release_name: releasesJson[0].version_data.openjdk_version,
        release_link: releaseAsset.release_link,
        release_datetime: moment(releaseAsset.timestamp).format('YYYY-MM-DD hh:mm:ss'),
        source: releasesJson[0].source.link,
        binaries: []
      };
    }

    var binary_constructor = {
      type: binary_type,
      extension: getBinaryExt(platform),
      link: releaseAsset.package.link,
      signature_link: releaseAsset.package.signature_link,
      size: Math.floor(releaseAsset.package.size / 1000 / 1000)
    }; // Add the new binary to the release asset

    release.binaries.push(binary_constructor); // We have the first binary, so add the release asset.

    if (release.binaries.length === 1) {
      releases.push(release);
    }
  });
  releases = orderPlatforms(releases, 'platform_ordinal');
  releases.forEach(function (release) {
    release.binaries.sort(function (binaryA, binaryB) {
      return binaryA.type > binaryB.type ? 1 : binaryA.type < binaryB.type ? -1 : 0;
    });
  });
  var templateSelector = Handlebars.compile(document.getElementById('template-selector').innerHTML);
  document.getElementById('latest-selector').innerHTML = templateSelector({
    releases: releases
  });
  setTickLink();
  global.populateFilters('all');
  loading.innerHTML = ''; // remove the loading dots

  var latestContainer = document.getElementById('latest-container');
  latestContainer.className = latestContainer.className.replace(/(?:^|\s)invisible(?!\S)/g, ' animated fadeIn '); // make this section visible (invisible by default), with animated fade-in
}

global.filterOS = function () {
  var os = document.getElementById('os-filter');
  var arch = document.getElementById('arch-filter');

  if (arch.options[arch.selectedIndex].value === 'Any') {
    filterTable(os.options[os.selectedIndex].value, 'os');
    global.populateFilters('arch');
  } else if (os.options[os.selectedIndex].value == 'Any') {
    global.filterArch();
  } else {
    filterTable(os.options[os.selectedIndex].value, 'multi', arch.options[arch.selectedIndex].value);
  }
};

global.filterArch = function () {
  var arch = document.getElementById('arch-filter');
  var os = document.getElementById('os-filter');

  if (os.options[os.selectedIndex].value === 'Any') {
    filterTable(arch.options[arch.selectedIndex].value, 'arch');
  } else if (arch.options[arch.selectedIndex].value == 'Any') {
    global.filterOS();
  } else {
    filterTable(arch.options[arch.selectedIndex].value, 'multi', os.options[os.selectedIndex].value);
  }
};

global.populateFilters = function (filter) {
  var releaseTable = document.getElementById('latest-selector').getElementsByClassName('releases-table');
  var OSES = ['Any'];
  var ARCHES = ['Any'];

  var _iterator2 = _createForOfIteratorHelper(releaseTable),
      _step2;

  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var release = _step2.value;

      if (release.style.display !== 'none') {
        OSES.push(release.querySelector('.os').innerHTML.split(' ')[0]);
        ARCHES.push(release.querySelector('.arch').innerHTML);
      }
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }

  if (filter == 'all' || filter == 'os') {
    var osFilter = document.getElementById('os-filter');
    var selected = osFilter.options[osFilter.selectedIndex].value;
    osFilter.innerHTML = '';

    var _iterator3 = _createForOfIteratorHelper(new Set(OSES)),
        _step3;

    try {
      for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
        var os = _step3.value;
        var option = document.createElement('option');
        option.text = os;
        option.value = os;
        osFilter.append(option);
      }
    } catch (err) {
      _iterator3.e(err);
    } finally {
      _iterator3.f();
    }

    osFilter.value = selected;
  }

  if (filter == 'all' || filter == 'arch') {
    var archFilter = document.getElementById('arch-filter');
    var _selected = archFilter.options[archFilter.selectedIndex].value;
    archFilter.innerHTML = '';

    var _iterator4 = _createForOfIteratorHelper(new Set(ARCHES)),
        _step4;

    try {
      for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
        var arch = _step4.value;

        var _option = document.createElement('option');

        _option.text = arch;
        _option.value = arch;
        archFilter.append(_option);
      }
    } catch (err) {
      _iterator4.e(err);
    } finally {
      _iterator4.f();
    }

    archFilter.value = _selected;
  }
};

function filterTable(string, type, string1) {
  var tables = document.getElementById('latest-selector').getElementsByClassName('releases-table');

  var _iterator5 = _createForOfIteratorHelper(tables),
      _step5;

  try {
    for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
      var table = _step5.value;

      if (type === 'multi') {
        var os = table.querySelector('.os').innerHTML;
        var arch = table.querySelector('.arch').innerHTML;

        if (os.startsWith(string) || arch === string) {
          if (os.startsWith(string1) || arch === string1) {
            table.style.display = '';
          } else {
            table.style.display = 'none';
          }
        } else {
          table.style.display = 'none';
        }
      }

      if (type === 'os') {
        if (string === 'Any') {
          table.style.display = '';
        } else {
          var _os = table.querySelector('.os').innerHTML;

          if (_os.startsWith(string)) {
            table.style.display = '';
          } else {
            table.style.display = 'none';
          }
        }
      }

      if (type === 'arch') {
        if (string == 'Any') {
          table.style.display = '';
        } else {
          var _arch = table.querySelector('.arch').innerHTML;

          if (_arch === string) {
            table.style.display = '';
          } else {
            table.style.display = 'none';
          }
        }
      }
    }
  } catch (err) {
    _iterator5.e(err);
  } finally {
    _iterator5.f();
  }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./common":115,"core-js/modules/es6.array.find":89,"core-js/modules/es6.array.from":90,"core-js/modules/es6.array.iterator":91,"core-js/modules/es6.function.name":92,"core-js/modules/es6.object.to-string":95,"core-js/modules/es6.regexp.replace":100,"core-js/modules/es6.regexp.search":101,"core-js/modules/es6.regexp.split":102,"core-js/modules/es6.regexp.to-string":103,"core-js/modules/es6.set":104,"core-js/modules/es6.string.includes":106,"core-js/modules/es6.string.iterator":107,"core-js/modules/es6.string.link":108,"core-js/modules/es6.string.starts-with":109,"core-js/modules/es6.symbol":110,"core-js/modules/es7.array.includes":111,"core-js/modules/es7.symbol.async-iterator":112,"core-js/modules/web.dom.iterable":113}],123:[function(require,module,exports){
module.exports={
  "variants": [
    {
      "searchableName": "openjdk8-hotspot",
      "officialName": "OpenJDK 8 with HotSpot",
      "jvm": "HotSpot",
      "label": "OpenJDK 8",
      "lts": true,
      "default": true
    },
    {
      "searchableName": "openjdk8-openj9",
      "officialName": "OpenJDK 8 with Eclipse OpenJ9",
      "description": "Eclipse OpenJ9",
      "jvm": "OpenJ9",
      "label": "OpenJDK 8",
      "lts": true,
      "descriptionLink": "https://www.eclipse.org/openj9"
    },
    {
      "searchableName": "openjdk9-hotspot",
      "officialName": "OpenJDK 9 with HotSpot",
      "jvm": "HotSpot",
      "label": "OpenJDK 9",
      "lts": false
    },
    {
      "searchableName": "openjdk9-openj9",
      "officialName": "OpenJDK 9 with Eclipse OpenJ9",
      "description": "Eclipse OpenJ9",
      "jvm": "OpenJ9",
      "label": "OpenJDK 9",
      "lts": false,
      "descriptionLink": "https://www.eclipse.org/openj9"
    },
    {
      "searchableName": "openjdk10-hotspot",
      "officialName": "OpenJDK 10 with HotSpot",
      "jvm": "HotSpot",
      "label": "OpenJDK 10",
      "lts": false
    },
    {
      "searchableName": "openjdk10-openj9",
      "officialName": "OpenJDK 10 with Eclipse OpenJ9",
      "description": "Eclipse OpenJ9",
      "jvm": "OpenJ9",
      "label": "OpenJDK 10",
      "lts": false,
      "descriptionLink": "https://www.eclipse.org/openj9"
    },
    {
      "searchableName": "openjdk11-hotspot",
      "officialName": "OpenJDK 11 with HotSpot",
      "jvm": "HotSpot",
      "label": "OpenJDK 11",
      "lts": true
    },
    {
      "searchableName": "openjdk11-openj9",
      "officialName": "OpenJDK 11 with Eclipse OpenJ9",
      "description": "Eclipse OpenJ9",
      "jvm": "OpenJ9",
      "label": "OpenJDK 11",
      "lts": true,
      "descriptionLink": "https://www.eclipse.org/openj9"
    },
    {
      "searchableName": "openjdk12-hotspot",
      "officialName": "OpenJDK 12 with HotSpot",
      "jvm": "HotSpot",
      "label": "OpenJDK 12",
      "lts": false
    },
    {
      "searchableName": "openjdk12-openj9",
      "officialName": "OpenJDK 12 with Eclipse OpenJ9",
      "description": "Eclipse OpenJ9",
      "jvm": "OpenJ9",
      "label": "OpenJDK 12",
      "lts": false,
      "descriptionLink": "https://www.eclipse.org/openj9"
    },
    {
      "searchableName": "openjdk13-hotspot",
      "officialName": "OpenJDK 13 with HotSpot",
      "jvm": "HotSpot",
      "label": "OpenJDK 13",
      "lts": false
    },
    {
      "searchableName": "openjdk13-openj9",
      "officialName": "OpenJDK 13 with Eclipse OpenJ9",
      "description": "Eclipse OpenJ9",
      "jvm": "OpenJ9",
      "label": "OpenJDK 13",
      "lts": false,
      "descriptionLink": "https://www.eclipse.org/openj9"
    },
    {
      "searchableName": "openjdk14-hotspot",
      "officialName": "OpenJDK 14 with HotSpot",
      "jvm": "HotSpot",
      "label": "OpenJDK 14",
      "lts": "latest"
    },
    {
      "searchableName": "openjdk14-openj9",
      "officialName": "OpenJDK 14 with Eclipse OpenJ9",
      "description": "Eclipse OpenJ9",
      "jvm": "OpenJ9",
      "label": "OpenJDK 14",
      "lts": "latest",
      "descriptionLink": "https://www.eclipse.org/openj9"
    }
  ],
  "platforms": [
    {
      "officialName": "Linux x64",
      "searchableName": "X64_LINUX",
      "attributes": {
        "heap_size": "normal",
        "os": "linux",
        "architecture": "x64"
      },
      "binaryExtension": ".tar.gz",
      "installerExtension": ".run",
      "installCommand": "tar -xf FILENAME",
      "pathCommand": "export PATH=$PWD/DIRNAME/bin:$PATH",
      "checksumCommand": "sha256sum FILENAME",
      "checksumAutoCommandHint": " (the command must be run on a terminal in the same directory you download the binary file)",
      "checksumAutoCommand": "wget -O- -q -T 1 -t 1 FILEHASHURL | sha256sum -c",
      "osDetectionString": "Linux Mint Debian Fedora FreeBSD Gentoo Haiku Kubuntu OpenBSD Red Hat RHEL SuSE Ubuntu Xubuntu hpwOS webOS Tizen",
      "supported_version": "glibc version 2.12 or higher"
    },
    {
      "officialName": "Linux x64 Large Heap",
      "searchableName": "LINUXXL",
      "attributes": {
        "heap_size": "large",
        "os": "linux",
        "architecture": "x64"
      },
      "binaryExtension": ".tar.gz",
      "installerExtension": ".run",
      "installCommand": "tar -xf FILENAME",
      "pathCommand": "export PATH=$PWD/DIRNAME/bin:$PATH",
      "checksumCommand": "sha256sum FILENAME",
      "checksumAutoCommandHint": " (the command must be run on a terminal in the same directory you download the binary file)",
      "checksumAutoCommand": "wget -O- -q -T 1 -t 1 FILEHASHURL | sha256sum -c",
      "osDetectionString": "not-to-be-detected",
      "supported_version": "glibc version 2.12 or higher"
    },
    {
      "officialName": "Windows x86",
      "searchableName": "X32_WIN",
      "attributes": {
        "heap_size": "normal",
        "os": "windows",
        "architecture": "x32"
      },
      "binaryExtension": ".zip",
      "installerExtension": ".msi",
      "installCommand": "Expand-Archive -Path .\\FILENAME -DestinationPath .",
      "pathCommand": "set PATH=%cd%\\DIRNAME\\bin;%PATH%",
      "checksumCommand": "certutil -hashfile FILENAME SHA256",
      "checksumAutoCommandHint": " (the command must be run using Command Prompt in the same directory you download the binary file and requires PowerShell 3.0+)",
      "checksumAutoCommand": "powershell -command \"[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12;  iwr -outf FILEHASHNAME FILEHASHURL\" && powershell \"$CHECKSUMVAR=($(Get-FileHash -Algorithm SHA256 -LiteralPath FILENAME | Format-List -Property Hash | Out-String) -replace \\\"Hash : \\\", \\\"\\\" -replace \\\"`r`n\\\", \\\"\\\"); Select-String -LiteralPath FILEHASHNAME -Pattern $CHECKSUMVAR | Format-List -Property FileName | Out-String\" | find /i \"FILEHASHNAME\">Nul && ( echo \"FILENAME: The SHA-256 fingerprint matches\" ) || ( echo \"FILENAME: The SHA-256 fingerprint does NOT match\" )",
      "osDetectionString": "Windows Win Cygwin Windows Server 2008 R2 / 7 Windows Server 2008 / Vista Windows XP",
      "supported_version": "2012r2 or later"
    },
    {
      "officialName": "Windows x64",
      "searchableName": "X64_WIN",
      "attributes": {
        "heap_size": "normal",
        "os": "windows",
        "architecture": "x64"
      },
      "binaryExtension": ".zip",
      "installerExtension": ".msi",
      "installCommand": "Expand-Archive -Path .\\FILENAME -DestinationPath .",
      "pathCommand": "set PATH=%cd%\\DIRNAME\\bin;%PATH%",
      "checksumCommand": "certutil -hashfile FILENAME SHA256",
      "checksumAutoCommandHint": " (the command must be run using Command Prompt in the same directory you download the binary file and requires PowerShell 3.0+)",
      "checksumAutoCommand": "powershell -command \"[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12;  iwr -outf FILEHASHNAME FILEHASHURL\" && powershell \"$CHECKSUMVAR=($(Get-FileHash -Algorithm SHA256 -LiteralPath FILENAME | Format-List -Property Hash | Out-String) -replace \\\"Hash : \\\", \\\"\\\" -replace \\\"`r`n\\\", \\\"\\\"); Select-String -LiteralPath FILEHASHNAME -Pattern $CHECKSUMVAR | Format-List -Property FileName | Out-String\" | find /i \"FILEHASHNAME\">Nul && ( echo \"FILENAME: The SHA-256 fingerprint matches\" ) || ( echo \"FILENAME: The SHA-256 fingerprint does NOT match\" )",
      "osDetectionString": "Windows Win Cygwin Windows Server 2008 R2 / 7 Windows Server 2008 / Vista Windows XP",
      "supported_version": "2012r2 or later"
    },
    {
      "officialName": "Windows x64 Large Heap",
      "searchableName": "X64_WINXL",
      "attributes": {
        "heap_size": "large",
        "os": "windows",
        "architecture": "x64"
      },
      "binaryExtension": ".zip",
      "installerExtension": ".msi",
      "installCommand": "Expand-Archive -Path .\\FILENAME -DestinationPath .",
      "pathCommand": "set PATH=%cd%\\DIRNAME\\bin;%PATH%",
      "checksumCommand": "certutil -hashfile FILENAME SHA256",
      "checksumAutoCommandHint": " (the command must be run using Command Prompt in the same directory you download the binary file and requires PowerShell 3.0+)",
      "checksumAutoCommand": "powershell -command \"[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12;  iwr -outf FILEHASHNAME FILEHASHURL\" && powershell \"$CHECKSUMVAR=($(Get-FileHash -Algorithm SHA256 -LiteralPath FILENAME | Format-List -Property Hash | Out-String) -replace \\\"Hash : \\\", \\\"\\\" -replace \\\"`r`n\\\", \\\"\\\"); Select-String -LiteralPath FILEHASHNAME -Pattern $CHECKSUMVAR | Format-List -Property FileName | Out-String\" | find /i \"FILEHASHNAME\">Nul && ( echo \"FILENAME: The SHA-256 fingerprint matches\" ) || ( echo \"FILENAME: The SHA-256 fingerprint does NOT match\" )",
      "osDetectionString": "Windows Win Cygwin Windows Server 2008 R2 / 7 Windows Server 2008 / Vista Windows XP",
      "supported_version": "2012r2 or later"
    },
    {
      "officialName": "macOS x64",
      "searchableName": "X64_MAC",
      "attributes": {
        "heap_size": "normal",
        "os": "mac",
        "architecture": "x64"
      },
      "binaryExtension": ".tar.gz",
      "installerExtension": ".pkg",
      "installCommand": "tar -xf FILENAME",
      "pathCommand": "export PATH=$PWD/DIRNAME/Contents/Home/bin:$PATH",
      "checksumCommand": "shasum -a 256 FILENAME",
      "checksumAutoCommandHint": " (the command must be run on a terminal in the same directory you download the binary file)",
      "checksumAutoCommand": "curl -O -L -s FILEHASHURL && shasum -a 256 -c FILEHASHNAME",
      "osDetectionString": "Mac OS X OSX macOS Macintosh",
      "supported_version": "10.10 or later"
    },
    {
      "officialName": "macOS x64 Large Heap",
      "searchableName": "MACOSXL",
      "attributes": {
        "heap_size": "large",
        "os": "mac",
        "architecture": "x64"
      },
      "binaryExtension": ".tar.gz",
      "installerExtension": ".pkg",
      "installCommand": "tar -xf FILENAME",
      "pathCommand": "export PATH=$PWD/DIRNAME/Contents/Home/bin:$PATH",
      "checksumCommand": "shasum -a 256 FILENAME",
      "checksumAutoCommandHint": " (the command must be run on a terminal in the same directory you download the binary file)",
      "checksumAutoCommand": "curl -O -L -s FILEHASHURL && shasum -a 256 -c FILEHASHNAME",
      "osDetectionString": "not-to-be-detected",
      "supported_version": "10.10 or later"
    },
    {
      "officialName": "Linux s390x",
      "searchableName": "S390X_LINUX",
      "attributes": {
        "heap_size": "normal",
        "os": "linux",
        "architecture": "s390x"
      },
      "binaryExtension": ".tar.gz",
      "installerExtension": "no-installer-available",
      "installCommand": "tar -xf FILENAME",
      "pathCommand": "export PATH=$PWD/DIRNAME/bin:$PATH",
      "checksumCommand": "sha256sum FILENAME",
      "checksumAutoCommandHint": " (the command must be run on a terminal in the same directory you download the binary file)",
      "checksumAutoCommand": "wget -O- -q -T 1 -t 1 FILEHASHURL | sha256sum -c",
      "osDetectionString": "not-to-be-detected",
      "supported_version": "glibc version 2.17 or higher"
    },
    {
      "officialName": "Linux s390x Large Heap",
      "searchableName": "LINUXS390XXL",
      "attributes": {
        "heap_size": "large",
        "os": "linux",
        "architecture": "s390x"
      },
      "binaryExtension": ".tar.gz",
      "installerExtension": ".run",
      "installCommand": "tar -xf FILENAME",
      "pathCommand": "export PATH=$PWD/DIRNAME/bin:$PATH",
      "checksumCommand": "sha256sum FILENAME",
      "checksumAutoCommandHint": " (the command must be run on a terminal in the same directory you download the binary file)",
      "checksumAutoCommand": "wget -O- -q -T 1 -t 1 FILEHASHURL | sha256sum -c",
      "osDetectionString": "not-to-be-detected",
      "supported_version": "glibc version 2.17 or higher"
    },
    {
      "officialName": "Linux ppc64le",
      "searchableName": "PPC64LE_LINUX",
      "attributes": {
        "heap_size": "normal",
        "os": "linux",
        "architecture": "ppc64le"
      },
      "binaryExtension": ".tar.gz",
      "installerExtension": "no-installer-available",
      "installCommand": "tar -xf FILENAME",
      "pathCommand": "export PATH=$PWD/DIRNAME/bin:$PATH",
      "checksumCommand": "sha256sum FILENAME",
      "checksumAutoCommandHint": " (the command must be run on a terminal in the same directory you download the binary file)",
      "checksumAutoCommand": "wget -O- -q -T 1 -t 1 FILEHASHURL | sha256sum -c",
      "osDetectionString": "not-to-be-detected",
      "supported_version": "glibc version 2.17 or higher"
    },
    {
      "officialName": "Linux ppc64le Large Heap",
      "searchableName": "LINUXPPC64LEXL",
      "attributes": {
        "heap_size": "large",
        "os": "linux",
        "architecture": "ppc64le"
      },
      "binaryExtension": ".tar.gz",
      "installerExtension": ".run",
      "installCommand": "tar -xf FILENAME",
      "pathCommand": "export PATH=$PWD/DIRNAME/bin:$PATH",
      "checksumCommand": "sha256sum FILENAME",
      "checksumAutoCommandHint": " (the command must be run on a terminal in the same directory you download the binary file)",
      "checksumAutoCommand": "wget -O- -q -T 1 -t 1 FILEHASHURL | sha256sum -c",
      "osDetectionString": "not-to-be-detected",
      "supported_version": "glibc version 2.17 or higher"
    },
    {
      "officialName": "Linux aarch64",
      "searchableName": "AARCH64_LINUX",
      "attributes": {
        "heap_size": "normal",
        "os": "linux",
        "architecture": "aarch64"
      },
      "binaryExtension": ".tar.gz",
      "installerExtension": "no-installer-available",
      "installCommand": "tar -xf FILENAME",
      "pathCommand": "export PATH=$PWD/DIRNAME/bin:$PATH",
      "checksumCommand": "sha256sum FILENAME",
      "checksumAutoCommandHint": " (the command must be run on a terminal in the same directory you download the binary file)",
      "checksumAutoCommand": "wget -O- -q -T 1 -t 1 FILEHASHURL | sha256sum -c",
      "osDetectionString": "not-to-be-detected",
      "supported_version": "glibc version 2.17 or higher"
    },
    {
      "officialName": "Linux aarch64 Large Heap",
      "searchableName": "AARCH64_LINUXXL",
      "attributes": {
        "heap_size": "large",
        "os": "linux",
        "architecture": "aarch64"
      },
      "binaryExtension": ".tar.gz",
      "installerExtension": "no-installer-available",
      "installCommand": "tar -xf FILENAME",
      "pathCommand": "export PATH=$PWD/DIRNAME/bin:$PATH",
      "checksumCommand": "sha256sum FILENAME",
      "checksumAutoCommandHint": " (the command must be run on a terminal in the same directory you download the binary file)",
      "checksumAutoCommand": "wget -O- -q -T 1 -t 1 FILEHASHURL | sha256sum -c",
      "osDetectionString": "not-to-be-detected",
      "supported_version": "glibc version 2.17 or higher"
    },
    {
      "officialName": "Linux arm32",
      "searchableName": "ARM32_LINUX",
      "attributes": {
        "heap_size": "normal",
        "os": "linux",
        "architecture": "arm"
      },
      "binaryExtension": ".tar.gz",
      "installerExtension": "no-installer-available",
      "installCommand": "tar -xf FILENAME",
      "pathCommand": "export PATH=$PWD/DIRNAME/bin:$PATH",
      "checksumCommand": "sha256sum FILENAME",
      "checksumAutoCommandHint": " (the command must be run on a terminal in the same directory you download the binary file)",
      "checksumAutoCommand": "wget -O- -q -T 1 -t 1 FILEHASHURL | sha256sum -c",
      "osDetectionString": "not-to-be-detected",
      "supported_version": "glibc version 2.17 or higher"
    },
    {
      "officialName": "Solaris sparcv9",
      "searchableName": "SPARCV9_SOLARIS",
      "attributes": {
        "heap_size": "normal",
        "os": "solaris",
        "architecture": "sparcv9"
      },
      "binaryExtension": ".tar.gz",
      "installerExtension": "no-installer-available",
      "installCommand": "gunzip -c FILENAME | tar xf -",
      "pathCommand": "export PATH=$PWD/DIRNAME/bin:$PATH",
      "checksumCommand": "sha256sum FILENAME",
      "checksumAutoCommandHint": " (the command must be run on a terminal in the same directory you download the binary file)",
      "checksumAutoCommand": "wget -O- -q -T 1 -t 1 FILEHASHURL | sha256sum -c",
      "osDetectionString": "not-to-be-detected",
      "supported_version": "solaris 10,11"
    },
    {
      "officialName": "Solaris x64",
      "searchableName": "X64_SOLARIS",
      "attributes": {
        "heap_size": "normal",
        "os": "solaris",
        "architecture": "x64"
      },
      "binaryExtension": ".tar.gz",
      "installerExtension": "no-installer-available",
      "installCommand": "gunzip -c FILENAME | tar xf -",
      "pathCommand": "export PATH=$PWD/DIRNAME/bin:$PATH",
      "checksumCommand": "sha256sum FILENAME",
      "checksumAutoCommandHint": " (the command must be run on a terminal in the same directory you download the binary file)",
      "checksumAutoCommand": "wget -O- -q -T 1 -t 1 FILEHASHURL | sha256sum -c",
      "osDetectionString": "not-to-be-detected",
      "supported_version": "solaris 10,11"
    },
    {
      "officialName": "AIX ppc64",
      "searchableName": "PPC64_AIX",
      "attributes": {
        "heap_size": "normal",
        "os": "aix",
        "architecture": "ppc64"
      },
      "binaryExtension": ".tar.gz",
      "installerExtension": "no-installer-available",
      "installCommand": "gunzip -c FILENAME | tar xf -",
      "pathCommand": "export PATH=$PWD/DIRNAME/bin:$PATH",
      "checksumCommand": "shasum -a 256 FILENAME",
      "checksumAutoCommandHint": " (the command must be run on a terminal in the same directory you download the binary file)",
      "checksumAutoCommand": "curl -O -L FILEHASHURL && shasum -a 256 -c FILEHASHNAME",
      "osDetectionString": "not-to-be-detected",
      "supported_version": "7.1 TL4 or later"
    }
  ]
}

},{}]},{},[116]);
