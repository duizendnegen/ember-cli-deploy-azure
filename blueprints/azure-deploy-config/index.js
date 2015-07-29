module.exports = {
  description: 'Generate config for ember-cli-deploy azure lightning pack',
  normalizeEntityName: function() {
    // this prevents an error when the entityName is
    // not specified (since that doesn't actually matter
    // to us
  }
};
