import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';

Given('I have a sample test', async function () {
  // Setup code here
  this.testValue = true;
});

When('I run the test', async function () {
  // Action code here
  this.result = this.testValue;
});

Then('the test should pass', async function () {
  // Assertion code here
  expect(this.result).to.equal(true);
});
