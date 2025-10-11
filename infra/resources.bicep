@description('The location used for all deployed resources')
param location string = resourceGroup().location

@description('Tags that will be applied to all resources')
param tags object = {}

var abbrs = loadJsonContent('./abbreviations.json')
var resourceToken = uniqueString(subscription().id, resourceGroup().id, location)

// Monitor application with Azure Monitor
module monitoring 'br/public:avm/ptn/azd/monitoring:0.1.0' = {
  name: 'monitoring'
  params: {
    logAnalyticsName: '${abbrs.operationalInsightsWorkspaces}${resourceToken}'
    applicationInsightsName: '${abbrs.insightsComponents}${resourceToken}'
    applicationInsightsDashboardName: '${abbrs.portalDashboards}${resourceToken}'
    location: location
    tags: tags
  }
}
// App Service Plan
module appServicePlan 'br/public:avm/res/web/serverfarm:0.2.0' = {
  name: 'app-service-plan'
  params: {
    name: '${abbrs.webServerFarms}${resourceToken}'
    location: location
    tags: tags
    skuName: 'B1' // Basic tier for development
    skuCapacity: 1
    kind: 'Linux'
    reserved: true
  }
}

module starIdentity 'br/public:avm/res/managed-identity/user-assigned-identity:0.2.1' = {
  name: 'staridentity'
  params: {
    name: '${abbrs.managedIdentityUserAssignedIdentities}star-${resourceToken}'
    location: location
  }
}
// App Service for Backend (Flask)
module starBackend 'br/public:avm/res/web/site:0.8.0' = {
  name: 'star-backend'
  params: {
    name: '${abbrs.webSitesAppService}backend-${resourceToken}'
    kind: 'app,linux'
    serverFarmResourceId: appServicePlan.outputs.resourceId
    location: location
    tags: union(tags, { 'azd-service-name': 'star-backend' })
    managedIdentities: {
      systemAssigned: false
      userAssignedResourceIds: [starIdentity.outputs.resourceId]
    }
    siteConfig: {
      linuxFxVersion: 'PYTHON|3.11'
      appSettings: [
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: monitoring.outputs.applicationInsightsConnectionString
        }
        {
          name: 'AZURE_CLIENT_ID'
          value: starIdentity.outputs.clientId
        }
        {
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'true'
        }
        {
          name: 'ENABLE_ORYX_BUILD'
          value: 'true'
        }
      ]
    }
  }
}

// App Service for Frontend (Next.js)
module starFrontend 'br/public:avm/res/web/site:0.8.0' = {
  name: 'star-frontend'
  params: {
    name: '${abbrs.webSitesAppService}frontend-${resourceToken}'
    kind: 'app,linux'
    serverFarmResourceId: appServicePlan.outputs.resourceId
    location: location
    tags: union(tags, { 'azd-service-name': 'star-frontend' })
    managedIdentities: {
      systemAssigned: false
      userAssignedResourceIds: [starIdentity.outputs.resourceId]
    }
    siteConfig: {
      linuxFxVersion: 'NODE|18-lts'
      appSettings: [
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: monitoring.outputs.applicationInsightsConnectionString
        }
        {
          name: 'AZURE_CLIENT_ID'
          value: starIdentity.outputs.clientId
        }
        {
          name: 'NEXT_PUBLIC_API_URL'
          value: 'https://${starBackend.outputs.defaultHostname}/api/v1'
        }
        {
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'true'
        }
        {
          name: 'ENABLE_ORYX_BUILD'
          value: 'true'
        }
      ]
    }
  }
}

output AZURE_RESOURCE_STAR_BACKEND_ID string = starBackend.outputs.resourceId
output AZURE_RESOURCE_STAR_FRONTEND_ID string = starFrontend.outputs.resourceId
output STAR_BACKEND_URI string = 'https://${starBackend.outputs.defaultHostname}'
output STAR_FRONTEND_URI string = 'https://${starFrontend.outputs.defaultHostname}'
