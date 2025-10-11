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
// App Service Plan - Use F1 (Free) tier to minimize costs
module appServicePlan 'br/public:avm/res/web/serverfarm:0.2.0' = {
  name: 'app-service-plan'
  params: {
    name: '${abbrs.webServerFarms}${resourceToken}'
    location: location
    tags: tags
    skuName: 'F1' // Free tier for minimal costs
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

// Azure Cosmos DB
module cosmosDb 'br/public:avm/res/document-db/database-account:0.8.1' = {
  name: 'cosmos-db'
  params: {
    name: '${abbrs.documentDBDatabaseAccounts}${resourceToken}'
    location: location
    tags: tags
    databaseAccountOfferType: 'Standard'
    defaultConsistencyLevel: 'Session'
    locations: [
      {
        locationName: location
        failoverPriority: 0
        isZoneRedundant: false
      }
    ]
    sqlDatabases: [
      {
        name: 'star-database'
        containers: [
          {
            name: 'users'
            paths: ['/id']
          }
          {
            name: 'posts'
            paths: ['/user_id']
          }
          {
            name: 'tarot_readings'
            paths: ['/user_id']
          }
          {
            name: 'live_streams'
            paths: ['/host_id']
          }
        ]
      }
    ]
  }
}
// App Service for STAR Platform (Flask backend serving React PWA)
module starApp 'br/public:avm/res/web/site:0.8.0' = {
  name: 'star-app'
  params: {
    name: '${abbrs.webSitesAppService}${resourceToken}'
    kind: 'app,linux'
    serverFarmResourceId: appServicePlan.outputs.resourceId
    location: location
    tags: union(tags, { 'azd-service-name': 'app' })
    managedIdentities: {
      systemAssigned: true
    }
    siteConfig: {
      linuxFxVersion: 'PYTHON|3.10'
      appCommandLine: 'gunicorn --worker-class eventlet -w 1 --bind 0.0.0.0:8000 --timeout 120 app:app'
      appSettings: [
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: monitoring.outputs.applicationInsightsConnectionString
        }
        {
          name: 'COSMOS_DB_ENDPOINT'
          value: cosmosDb.outputs.endpoint
        }
        {
          name: 'COSMOS_DB_DATABASE_NAME'
          value: 'star-database'
        }
        {
          name: 'FLASK_ENV'
          value: 'production'
        }
        {
          name: 'SECRET_KEY'
          value: 'u9rBZF6vpyLXz81mSnt3abEgD7wok0POfqejKUG5McYVJN4ChWAxlTHQsd2RIi'
        }
        {
          name: 'WEBSITE_PYTHON_VERSION'
          value: '3.10'
        }
        {
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'false'
        }
        {
          name: 'PORT'
          value: '8000'
        }
      ]
    }
  }
}

output AZURE_RESOURCE_STAR_APP_ID string = starApp.outputs.resourceId
output STAR_APP_URI string = 'https://${starApp.outputs.defaultHostname}'
output COSMOS_DB_ENDPOINT string = cosmosDb.outputs.endpoint
