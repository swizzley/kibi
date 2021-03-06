let _ = require('lodash');
let addOrdinalSuffix = require('ui/utils/ordinal_suffix');
let expect = require('expect.js');

describe('ordinal suffix util', function () {
  let checks = {
    1: 'st',
    2: 'nd',
    3: 'rd',
    4: 'th',
    5: 'th',
    6: 'th',
    7: 'th',
    8: 'th',
    9: 'th',
    10: 'th',
    11: 'th',
    12: 'th',
    13: 'th',
    14: 'th',
    15: 'th',
    16: 'th',
    17: 'th',
    18: 'th',
    19: 'th',
    20: 'th',
    21: 'st',
    22: 'nd',
    23: 'rd',
    24: 'th',
    25: 'th',
    26: 'th',
    27: 'th',
    28: 'th',
    29: 'th',
    30: 'th'
  };

  _.forOwn(checks, function (expected, num) {
    let int = parseInt(num, 10);
    let float = int + Math.random();

    it('knowns ' + int, function () {
      expect(addOrdinalSuffix(num)).to.be(num + '' + expected);
    });

    it('knows ' + float, function () {
      expect(addOrdinalSuffix(num)).to.be(num + '' + expected);
    });
  });
});
