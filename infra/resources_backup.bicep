param location string = resourceGroup().location

@description('Tags that will be applied to all resources')
param tags object = {}

var abbrs = loadJsonContent('./abbreviations.json')
var resourceToken = uniqueString(subscription().id, resourceGroup().id, location)

// ==========================================
// 1. MANAGED IDENTITY (MANDATORY for AZD)
// ==========================================
module starIdentity 'br/public:avm/res/managed-identity/user-assigned-identity:0.2.1' = {
  name: 'star-managed-identity'
  params: {
    name: '${abbrs.managedIdentityUserAssignedIdentities}star-${resourceToken}'
    location: location
    tags: tags
  }
}

// ==========================================
// 2. MONITORING & OBSERVABILITY
// ==========================================
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

// ==========================================
// 3. CONTAINER REGISTRY (MANDATORY for Container Apps)
// ==========================================
module containerRegistry 'br/public:avm/res/container-registry/registry:0.4.0' = {
  name: 'container-registry'
  params: {
    name: replace('${abbrs.containerRegistryRegistries}${resourceToken}', '-', '')
    location: location
    tags: tags
    acrSku: 'Basic'
    adminUserEnabled: true
    publicNetworkAccess: 'Enabled'
    // Grant AcrPull role to managed identity
    roleAssignments: [
      {
        principalId: starIdentity.outputs.principalId
        principalType: 'ServicePrincipal'
        roleDefinitionId: subscriptionResourceId(
          'Microsoft.Authorization/roleDefinitions',
          '7f951dda-4ed3-4680-a7ca-43fe172d538d'
        ) // AcrPull
      }
    ]
  }
}

// ==========================================
// 4. KEY VAULT (Secrets Management)
// ==========================================
module keyVault 'br/public:avm/res/key-vault/vault:0.8.0' = {
  name: 'key-vault'
  params: {
    name: '${abbrs.keyVaultVaults}${resourceToken}'
    location: location
    tags: tags
    sku: 'standard'
    enableRbacAuthorization: true
    accessPolicies: [
      {
        tenantId: tenant().tenantId
        objectId: starIdentity.outputs.principalId
        permissions: {
          secrets: ['get', 'list']
        }
      }
    ]
  }
}

// ==========================================
// 5. STORAGE ACCOUNT (Static Assets & Blobs)
// ==========================================
module storage 'br/public:avm/res/storage/storage-account:0.13.3' = {
  name: 'storage'
  params: {
    name: '${abbrs.storageStorageAccounts}${resourceToken}'
    location: location
    tags: tags
    skuName: 'Standard_LRS'
    kind: 'StorageV2'
    allowBlobPublicAccess: true
    blobServices: {
      containers: [
        {
          name: 'assets'
          publicAccess: 'Blob'
        }
        {
          name: 'uploads'
          publicAccess: 'None'
        }
      ]
    }
    roleAssignments: [
      {
        principalId: starIdentity.outputs.principalId
        principalType: 'ServicePrincipal'
        roleDefinitionId: subscriptionResourceId(
          'Microsoft.Authorization/roleDefinitions',
          'ba92f5b4-2d11-453d-a403-e96b0029c9fe'
        ) // Storage Blob Data Contributor
      }
    ]
  }
}

// ==========================================
// 6. COSMOS DB (Primary Database)
// ==========================================
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
          { name: 'users', paths: ['/id'], defaultTtl: -1 }
          { name: 'profiles', paths: ['/userId'], defaultTtl: -1 }
          { name: 'posts', paths: ['/user_id'], defaultTtl: -1 }
          { name: 'comments', paths: ['/post_id'], defaultTtl: -1 }
          { name: 'likes', paths: ['/user_id'], defaultTtl: -1 }
          { name: 'follows', paths: ['/follower_id'], defaultTtl: -1 }
          { name: 'chats', paths: ['/user_id'], defaultTtl: 604800 } // 7 days TTL
          { name: 'notifications', paths: ['/user_id'], defaultTtl: 2592000 } // 30 days TTL
          { name: 'tarot_readings', paths: ['/user_id'], defaultTtl: -1 }
          { name: 'live_streams', paths: ['/host_id'], defaultTtl: 86400 } // 1 day TTL
          { name: 'analytics', paths: ['/user_id'], defaultTtl: 7776000 } // 90 days TTL
        ]
      }
    ]
    roleAssignments: [
      {
        principalId: starIdentity.outputs.principalId
        principalType: 'ServicePrincipal'
        roleDefinitionId: subscriptionResourceId(
          'Microsoft.Authorization/roleDefinitions',
          '00000000-0000-0000-0000-000000000002'
        ) // Cosmos DB Built-in Data Contributor
      }
    ]
  }
}

// ==========================================
// 7. SIGNALR SERVICE (Real-time Communication)
// ==========================================
module signalrService 'br/public:avm/res/signal-r-service/signal-r:0.4.0' = {
  name: 'signalr-service'
  params: {
    name: '${abbrs.signalRServiceSignalR}${resourceToken}'
    location: location
    tags: tags
    sku: 'Free_F1'
    capacity: 1
    cors: {
      allowedOrigins: ['*'] // Configure properly for production
    }
    roleAssignments: [
      {
        principalId: starIdentity.outputs.principalId
        principalType: 'ServicePrincipal'
        roleDefinitionId: subscriptionResourceId(
          'Microsoft.Authorization/roleDefinitions',
          '420fcaa2-552c-430f-98ca-3264be4806c7'
        ) // SignalR Service Owner
      }
    ]
  }
}

// ==========================================
// 8. CONTAINER APPS ENVIRONMENT
// ==========================================
module containerAppsEnvironment 'br/public:avm/res/app/managed-environment:0.6.0' = {
  name: 'container-apps-env'
  params: {
    name: '${abbrs.appManagedEnvironments}${resourceToken}'
    location: location
    tags: tags
    logAnalyticsWorkspaceResourceId: monitoring.outputs.logAnalyticsWorkspaceResourceId
  }
}

// ==========================================
// 9. CONTAINER APP (Flask Backend API)
// ==========================================
module containerApp 'br/public:avm/res/app/container-app:0.8.0' = {
  name: 'star-backend-api'
  params: {
    name: '${abbrs.appContainerApps}backend-${resourceToken}'
    location: location
    tags: union(tags, { 'azd-service-name': 'backend' })
    environmentResourceId: containerAppsEnvironment.outputs.resourceId
    managedIdentities: {
      userAssignedResourcesIds: [starIdentity.outputs.resourceId]
    }
    registries: [
      {
        identity: starIdentity.outputs.resourceId
        server: containerRegistry.outputs.loginServer
      }
    ]
    containers: [
      {
        name: 'star-backend'
        image: 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest' // Will be updated by azd
        resources: {
          cpu: '0.5'
          memory: '1Gi'
        }
        env: [
          {
            name: 'COSMOS_DB_ENDPOINT'
            value: cosmosDb.outputs.endpoint
          }
          {
            name: 'COSMOS_DB_DATABASE_NAME'
            value: 'star-database'
          }
          {
            name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
            value: monitoring.outputs.applicationInsightsConnectionString
          }
          {
            name: 'SIGNALR_CONNECTION_STRING'
            secretRef: 'signalr-connection-string'
          }
          {
            name: 'FLASK_ENV'
            value: 'production'
          }
          {
            name: 'PORT'
            value: '8000'
          }
        ]
      }
    ]
    secrets: [
      {
        name: 'signalr-connection-string'
        keyVaultUrl: '${keyVault.outputs.uri}secrets/signalr-connection-string'
        identity: starIdentity.outputs.resourceId
      }
    ]
    ingress: {
      external: true
      targetPort: 8000
      corsPolicy: {
        allowedOrigins: ['*'] // Configure properly for production
        allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
        allowedHeaders: ['*']
      }
    }
    scale: {
      minReplicas: 1
      maxReplicas: 10
      rules: [
        {
          name: 'http-scaling-rule'
          http: {
            metadata: {
              concurrentRequests: '100'
            }
          }
        }
      ]
    }
  }
}

// ==========================================
// 10. STATIC WEB APP (Next.js Frontend)
// ==========================================
module staticWebApp 'br/public:avm/res/web/static-site:0.4.0' = {
  name: 'star-frontend'
  params: {
    name: '${abbrs.webStaticSites}${resourceToken}'
    location: location
    tags: union(tags, { 'azd-service-name': 'frontend' })
    skuName: 'Free'
    buildProperties: {
      appLocation: '/star-frontend'
      apiLocation: ''
      outputLocation: '.next'
    }
    repositoryUrl: 'https://github.com/your-org/star' // Update with actual repo
    branch: 'main'
    appSettings: {
      NEXT_PUBLIC_API_URL: 'https://${containerApp.outputs.fqdn}'
      NEXT_PUBLIC_SIGNALR_URL: signalrService.outputs.hostName
    }
  }
}

// ==========================================
// OUTPUTS (MANDATORY for AZD)
// ==========================================
output AZURE_CONTAINER_REGISTRY_ENDPOINT string = containerRegistry.outputs.loginServer
output BACKEND_API_URL string = 'https://${containerApp.outputs.fqdn}'
output FRONTEND_URL string = 'https://${staticWebApp.outputs.defaultHostname}'
output COSMOS_DB_ACCOUNT_NAME string = cosmosDb.outputs.name
output STORAGE_ACCOUNT_NAME string = storage.outputs.name
output KEY_VAULT_NAME string = keyVault.outputs.name
output SIGNALR_SERVICE_NAME string = signalrService.outputs.name
output APPLICATIONINSIGHTS_CONNECTION_STRING string = monitoring.outputs.applicationInsightsConnectionString
output MANAGED_IDENTITY_CLIENT_ID string = starIdentity.outputs.clientId

// Legacy outputs for compatibility
output AZURE_RESOURCE_STAR_APP_ID string = containerApp.outputs.resourceId
output STAR_APP_URI string = 'https://${containerApp.outputs.fqdn}'
output COSMOS_DB_ENDPOINT string = cosmosDb.outputs.endpoint
