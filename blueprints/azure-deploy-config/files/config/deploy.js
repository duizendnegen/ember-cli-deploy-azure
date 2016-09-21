module.exports = function(environment) {
  var ENV = {};

  if(environment === 'production' || !environment) {
    ENV["azure-tables"] = {
      storageAccount: "my-storage-account",
      storageAccessKey: "my-access-key"


      // You can also connect using your connection string, set it as:
      // connectionString: "my-connection-string"
    };

    ENV["azure-blob"] = {
      storageAccount: "my-storage-account",
      storageAccessKey: "my-access-key",
      containerName: "my-container-name" // defaults to 'emberdeploy'

      // You can also connect using your connection string, set it as:
      // connectionString: "my-connection-string"
    };
  }

  // add other environments as needed

  return ENV;
}
