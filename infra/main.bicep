targetScope = 'subscription'

@minLength(1)
@maxLength(64)
@description('Name of the environment that can be used as part of naming resource convention')
param environmentName string

@minLength(1)
@description('Primary location for all resources')
param location string

// Tags that should be applied to all resources.
// 
// Note that 'azd-service-name' tags should be applied separately to service host resources.
// Example usage:
//   tags: union(tags, { 'azd-service-name': <service name in azure.yaml> })
var tags = {
  'azd-env-name': environmentName
}

// Organize resources in a resource group
resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: 'rg-${environmentName}'
  location: location
  tags: tags
}

module resources 'resources.bicep' = {
  scope: rg
  name: 'resources'
  params: {
    location: location
    tags: tags
  }
}

// Outputs for the deployed resources
output AZURE_RESOURCE_STAR_BACKEND_ID string = resources.outputs.AZURE_RESOURCE_STAR_BACKEND_ID
output AZURE_RESOURCE_STAR_FRONTEND_ID string = resources.outputs.AZURE_RESOURCE_STAR_FRONTEND_ID
output STAR_BACKEND_URI string = resources.outputs.STAR_BACKEND_URI
output STAR_FRONTEND_URI string = resources.outputs.STAR_FRONTEND_URI
