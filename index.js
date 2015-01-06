'use strict';

var AzureAdapter = require('./lib/index-adapter');

module.exports = {
  name: 'ember-deploy-azure',
  type: 'ember-deploy-addon',

  adapters: {
    index: {
      'azure': AzureAdapter
    },
    assets: {
      'azure': AzureAdapter
    }
  }
};
