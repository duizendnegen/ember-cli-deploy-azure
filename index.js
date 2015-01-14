'use strict';

var AzureIndexAdapter = require('./lib/azure-index');
var AzureAssetsAdapter = require('./lib/azure-assets');

module.exports = {
  name: 'ember-deploy-azure',
  type: 'ember-deploy-addon',

  adapters: {
    index: {
      'azure': AzureIndexAdapter
    },
    assets: {
      'azure': AzureAssetsAdapter
    }
  }
};
