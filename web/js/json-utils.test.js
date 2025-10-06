const validateJSON = require('./json-utils.js');

test('Testing prettifying JSON', () => {
  expect(prettifyJSON("Testing")).toBe(true);
});

test('Testing validating JSON', () => {
  expect(validateJSON("Testing")).toBe(false);
});