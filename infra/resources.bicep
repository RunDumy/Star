param location string = resourceGroup().location

@description('Tags that will be applied to all resources')
param tags object = {}

var abbrs = loadJsonContent('./abbreviations.json')
var resourceToken = uniqueString(subscription().id, resourceGroup().id, location)

// Define partition key paths as variables
var userIdPartition = '/user_id'
var idPartition = '/id'
var userIdKey = '/userId'
var postIdPartition = '/post_id'
var followerIdPartition = '/follower_id'
var hostIdPartition = '/host_id'

// ==========================================
// 1. USER-ASSIGNED MANAGED IDENTITY (MANDATORY)
// ==========================================
resource starIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: '${abbrs.managedIdentityUserAssignedIdentities}star-${resourceToken}'
  location: location
  tags: tags
}

// ==========================================
// 2. LOG ANALYTICS WORKSPACE
// ==========================================
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: '${abbrs.operationalInsightsWorkspaces}${resourceToken}'
  location: location
  tags: tags
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

// ==========================================
// 3. APPLICATION INSIGHTS
// ==========================================
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: '${abbrs.insightsComponents}${resourceToken}'
  location: location
  kind: 'web'
  tags: tags
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
  }
}

// ==========================================
// 4. CONTAINER REGISTRY (MANDATORY for Container Apps)
// ==========================================
resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: replace('${abbrs.containerRegistryRegistries}${resourceToken}', '-', '')
  location: location
  sku: {
    name: 'Basic'
  }
  tags: tags
  properties: {
    adminUserEnabled: true
    publicNetworkAccess: 'Enabled'
  }
}

// Grant AcrPull role to managed identity
resource acrPullRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(containerRegistry.id, starIdentity.id, 'AcrPull')
  scope: containerRegistry
  properties: {
    principalId: starIdentity.properties.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: subscriptionResourceId(
      'Microsoft.Authorization/roleDefinitions',
      '7f951dda-4ed3-4680-a7ca-43fe172d538d'
    ) // AcrPull
  }
}

// ==========================================
// 5. KEY VAULT (Secrets Management)
// ==========================================
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: '${abbrs.keyVaultVaults}${resourceToken}'
  location: location
  tags: tags
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: tenant().tenantId
    enableRbacAuthorization: false
    accessPolicies: [
      {
        tenantId: tenant().tenantId
        objectId: starIdentity.properties.principalId
        permissions: {
          secrets: ['get', 'list']
        }
      }
    ]
  }
}

// ==========================================
// 6. STORAGE ACCOUNT
// ==========================================
resource storage 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: '${abbrs.storageStorageAccounts}${resourceToken}'
  location: location
  kind: 'StorageV2'
  sku: {
    name: 'Standard_LRS'
  }
  tags: tags
  properties: {
    allowBlobPublicAccess: true
    minimumTlsVersion: 'TLS1_2'
  }
}

resource blobServices 'Microsoft.Storage/storageAccounts/blobServices@2023-01-01' = {
  parent: storage
  name: 'default'
  properties: {}
}

resource assetsContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  parent: blobServices
  name: 'assets'
  properties: {
    publicAccess: 'Blob'
  }
}

resource uploadsContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  parent: blobServices
  name: 'uploads'
  properties: {
    publicAccess: 'None'
  }
}

// ==========================================
// 7. COSMOS DB
// ==========================================
resource cosmosDb 'Microsoft.DocumentDB/databaseAccounts@2023-04-15' = {
  name: '${abbrs.documentDBDatabaseAccounts}${resourceToken}'
  location: location
  tags: tags
  properties: {
    databaseAccountOfferType: 'Standard'
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
    }
    locations: [
      {
        locationName: location
        failoverPriority: 0
        isZoneRedundant: false
      }
    ]
  }
}

resource starDatabase 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2023-04-15' = {
  parent: cosmosDb
  name: 'star-database'
  properties: {
    resource: {
      id: 'star-database'
    }
  }
}

// Cosmos DB containers
resource usersContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2023-04-15' = {
  parent: starDatabase
  name: 'users'
  properties: {
    resource: {
      id: 'users'
      partitionKey: { paths: [idPartition] }
    }
  }
}

resource profilesContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2023-04-15' = {
  parent: starDatabase
  name: 'profiles'
  properties: {
    resource: {
      id: 'profiles'
      partitionKey: { paths: [userIdKey] }
    }
  }
}

resource postsContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2023-04-15' = {
  parent: starDatabase
  name: 'posts'
  properties: {
    resource: {
      id: 'posts'
      partitionKey: { paths: [userIdPartition] }
    }
  }
}

resource commentsContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2023-04-15' = {
  parent: starDatabase
  name: 'comments'
  properties: {
    resource: {
      id: 'comments'
      partitionKey: { paths: [postIdPartition] }
    }
  }
}

resource likesContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2023-04-15' = {
  parent: starDatabase
  name: 'likes'
  properties: {
    resource: {
      id: 'likes'
      partitionKey: { paths: [userIdPartition] }
    }
  }
}

resource followsContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2023-04-15' = {
  parent: starDatabase
  name: 'follows'
  properties: {
    resource: {
      id: 'follows'
      partitionKey: { paths: [followerIdPartition] }
    }
  }
}

resource chatsContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2023-04-15' = {
  parent: starDatabase
  name: 'chats'
  properties: {
    resource: {
      id: 'chats'
      partitionKey: { paths: [userIdPartition] }
      defaultTtl: 604800 // 7 days
    }
  }
}

resource notificationsContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2023-04-15' = {
  parent: starDatabase
  name: 'notifications'
  properties: {
    resource: {
      id: 'notifications'
      partitionKey: { paths: [userIdPartition] }
      defaultTtl: 2592000 // 30 days
    }
  }
}

resource tarotReadingsContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2023-04-15' = {
  parent: starDatabase
  name: 'tarot_readings'
  properties: {
    resource: {
      id: 'tarot_readings'
      partitionKey: { paths: [userIdPartition] }
    }
  }
}

resource liveStreamsContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2023-04-15' = {
  parent: starDatabase
  name: 'live_streams'
  properties: {
    resource: {
      id: 'live_streams'
      partitionKey: { paths: [hostIdPartition] }
      defaultTtl: 86400 // 1 day
    }
  }
}

resource analyticsContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2023-04-15' = {
  parent: starDatabase
  name: 'analytics'
  properties: {
    resource: {
      id: 'analytics'
      partitionKey: { paths: [userIdPartition] }
      defaultTtl: 7776000 // 90 days
    }
  }
}

// ==========================================
// 8. SIGNALR SERVICE
// ==========================================
resource signalrService 'Microsoft.SignalRService/SignalR@2022-02-01' = {
  name: '${abbrs.signalRServiceSignalR}${resourceToken}'
  location: location
  sku: {
    name: 'Free_F1'
    capacity: 1
  }
  tags: tags
  properties: {
    cors: {
      allowedOrigins: ['*'] // Configure for production
    }
    features: [
      {
        flag: 'ServiceMode'
        value: 'Serverless'
      }
    ]
  }
}

// Store SignalR connection string in Key Vault
resource signalrConnectionSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'signalr-connection-string'
  properties: {
    value: signalrService.listKeys().primaryConnectionString
  }
}

// ==========================================
// 9. CONTAINER APPS ENVIRONMENT
// ==========================================
resource containerAppsEnvironment 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: '${abbrs.appManagedEnvironments}${resourceToken}'
  location: location
  tags: tags
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
  }
}

// ==========================================
// 10. CONTAINER APP (Flask Backend)
// ==========================================
resource containerApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: '${abbrs.appContainerApps}backend-${resourceToken}'
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${starIdentity.id}': {}
    }
  }
  tags: union(tags, { 'azd-service-name': 'backend' })
  properties: {
    environmentId: containerAppsEnvironment.id
    configuration: {
      registries: [
        {
          server: containerRegistry.properties.loginServer
          identity: starIdentity.id
        }
      ]
      secrets: [
        {
          name: 'signalr-connection-string'
          keyVaultUrl: '${keyVault.properties.vaultUri}secrets/signalr-connection-string'
          identity: starIdentity.id
        }
        {
          name: 'cosmos-connection-string'
          value: cosmosDb.listConnectionStrings().connectionStrings[0].connectionString
        }
      ]
      ingress: {
        external: true
        targetPort: 8000
        corsPolicy: {
          allowedOrigins: ['*'] // Configure for production
          allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
          allowedHeaders: ['*']
        }
      }
    }
    template: {
      containers: [
        {
          name: 'star-backend'
          image: 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest' // Will be updated by azd
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: [
            {
              name: 'COSMOS_DB_CONNECTION_STRING'
              secretRef: 'cosmos-connection-string'
            }
            {
              name: 'COSMOS_DB_DATABASE_NAME'
              value: 'star-database'
            }
            {
              name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
              value: appInsights.properties.ConnectionString
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
  dependsOn: [
    acrPullRoleAssignment
    signalrConnectionSecret
  ]
}

// ==========================================
// 11. STATIC WEB APP (Next.js Frontend)
// ==========================================
resource staticWebApp 'Microsoft.Web/staticSites@2022-09-01' = {
  name: '${abbrs.webStaticSites}${resourceToken}'
  location: location
  sku: {
    name: 'Free'
  }
  tags: union(tags, { 'azd-service-name': 'frontend' })
  properties: {
    buildProperties: {
      appLocation: '/star-frontend'
      outputLocation: '.next'
    }
    repositoryUrl: 'https://github.com/your-org/star' // Update with actual repo
    branch: 'main'
  }
}

// Static Web App configuration
resource staticWebAppConfig 'Microsoft.Web/staticSites/config@2022-09-01' = {
  parent: staticWebApp
  name: 'appsettings'
  properties: {
    NEXT_PUBLIC_API_URL: 'https://${containerApp.properties.configuration.ingress.fqdn}'
    NEXT_PUBLIC_SIGNALR_URL: signalrService.properties.hostName
  }
}

// ==========================================
// OUTPUTS (MANDATORY for AZD)
// ==========================================
output AZURE_CONTAINER_REGISTRY_ENDPOINT string = containerRegistry.properties.loginServer
output BACKEND_API_URL string = 'https://${containerApp.properties.configuration.ingress.fqdn}'
output FRONTEND_URL string = 'https://${staticWebApp.properties.defaultHostname}'
output COSMOS_DB_ACCOUNT_NAME string = cosmosDb.name
output STORAGE_ACCOUNT_NAME string = storage.name
output KEY_VAULT_NAME string = keyVault.name
output SIGNALR_SERVICE_NAME string = signalrService.name
output APPLICATIONINSIGHTS_CONNECTION_STRING string = appInsights.properties.ConnectionString
output MANAGED_IDENTITY_CLIENT_ID string = starIdentity.properties.clientId

// Legacy outputs for compatibility
output AZURE_RESOURCE_STAR_APP_ID string = containerApp.id
output STAR_APP_URI string = 'https://${containerApp.properties.configuration.ingress.fqdn}'
output COSMOS_DB_ENDPOINT string = cosmosDb.properties.documentEndpoint
