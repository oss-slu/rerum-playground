const {prettifyJSON, validateJSON} = require('./json-utils.js');

const SLUStudent = {
  name : "Brian",
  year : "Sophomore",
  major : "Chemistry"
};

test('JSON is formatted.', () => {
  expect(prettifyJSON(SLUStudent)).not.toBeUndefined();
});

test('JSON is validated.', () => {
  expect(validateJSON(JSON.stringify(SLUStudent,null,2))).toBe(true);
});

