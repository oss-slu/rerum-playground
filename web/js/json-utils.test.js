const { prettifyJSON, validateJSON } = require('./json-utils.js');

const Student = {
  name: 'Brian',
  year: 'Junior',
  major: 'Computer Science',
};

test('JSON is formatted.', () => {
  expect(prettifyJSON(Student)).not.toBeUndefined();
});

test('JSON is validated.', () => {
  expect(validateJSON(JSON.stringify(Student, null, 2))).toBe(true);
});

test('Invalid JSON should return false', () => {
  expect(validateJSON("{name: 'Brian'}")).toBe(false);
});

test('Invalid JSON should show helpful message', () => {
  const result = prettifyJSON("{name: 'Brian'}");
  expect(result).toMatch(/Invalid JSON/);
});
