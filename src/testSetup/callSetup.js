/* eslint-disable */
require("ts-node/register");

// if you want to reference other typescript modules do it via require:
const { setup } = require("./setup");

module.exports = async function() {
  // call your initialization methods here.
  if (!process.env.TEST_HOST) {
    await setup();
  }
  return null;
};
