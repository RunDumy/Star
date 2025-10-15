targetScope = 'subscription'

@minLength(1)
@maxLength(64)
@description('Name of the environment that can be used as part of naming resource convention')
param environmentName string

@minLength(1)
@description('Primary location for all resources')
param location string

// Resource group name parameter - MANDATORY for AZD
param resourceGroupName string = 'rg-${environmentName}'

// Tags that should be applied to all resources.
var tags = {
  'azd-env-name': environmentName
}

// Organize resources in a resource group
resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: resourceGroupName
  location: location
  tags: tags
}

// Deploy all STAR platform resources
module resources 'resources.bicep' = {
  scope: rg
  name: 'star-platform-resources'
  params: {
    location: location
    tags: tags
  }
}

// MANDATORY Outputs for AZD
output RESOURCE_GROUP_ID string = rg.id
output AZURE_CONTAINER_REGISTRY_ENDPOINT string = resources.outputs.AZURE_CONTAINER_REGISTRY_ENDPOINT

// Additional outputs for STAR platform
output BACKEND_API_URL string = resources.outputs.BACKEND_API_URL
output FRONTEND_URL string = resources.outputs.FRONTEND_URL
output COSMOS_DB_ACCOUNT_NAME string = resources.outputs.COSMOS_DB_ACCOUNT_NAME
output STORAGE_ACCOUNT_NAME string = resources.outputs.STORAGE_ACCOUNT_NAME
output KEY_VAULT_NAME string = resources.outputs.KEY_VAULT_NAME
output SIGNALR_SERVICE_NAME string = resources.outputs.SIGNALR_SERVICE_NAME
output APPLICATIONINSIGHTS_CONNECTION_STRING string = resources.outputs.APPLICATIONINSIGHTS_CONNECTION_STRING
output MANAGED_IDENTITY_CLIENT_ID string = resources.outputs.MANAGED_IDENTITY_CLIENT_ID
