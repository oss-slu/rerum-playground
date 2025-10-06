const {prettifyJSON, validateJSON} = require('./json-utils.js');

const Student = {
  name : "Brian",
  year : "Junior",
  major : "Computer Science"
};

test('JSON is formatted.', () => {
  expect(prettifyJSON(Student)).not.toBeUndefined();
});

test('JSON is validated.', () => {
  expect(validateJSON(JSON.stringify(Student,null,2))).toBe(true);
});

