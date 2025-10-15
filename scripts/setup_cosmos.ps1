# Azure Cosmos DB Migration Setup
# Run this in PowerShell after setting up your environment variables

# Set your environment variables (replace with actual values)
$env:SUPABASE_URL = "your-supabase-url"
$env:SUPABASE_KEY = "your-supabase-anon-key"
$env:COSMOS_ENDPOINT = "https://your-cosmos-account.documents.azure.com:443/"
$env:COSMOS_KEY = "your-cosmos-primary-key"

# Install required modules
Install-Module -Name Az.CosmosDB -Scope CurrentUser -Force
Install-Module -Name SqlServer -Scope CurrentUser -Force  # For PostgreSQL access

# Connect to Azure
Connect-AzAccount

# Create Cosmos DB account if it doesn't exist
$resourceGroup = "star-resources"
$accountName = "star-cosmos-account"
$location = "East US"

New-AzCosmosDBAccount -ResourceGroupName $resourceGroup -Name $accountName -Location $location -ApiKind "Sql"

# Get account keys
$keys = Get-AzCosmosDBAccountKey -ResourceGroupName $resourceGroup -Name $accountName
$primaryKey = $keys.PrimaryMasterKey

Write-Host "Cosmos DB Account Created!"
Write-Host "Endpoint: https://$accountName.documents.azure.com:443/"
Write-Host "Primary Key: $primaryKey"

# Create databases and containers
$cosmosDbContext = New-AzCosmosDBSqlDatabase -ResourceGroupName $resourceGroup -AccountName $accountName -Name "StarDatabase"

$containers = @(
    @{Name = "Users"; PartitionKey = "/id" },
    @{Name = "Posts"; PartitionKey = "/user_id" },
    @{Name = "Follows"; PartitionKey = "/follower_id" },
    @{Name = "Comments"; PartitionKey = "/post_id" },
    @{Name = "UserPosts"; PartitionKey = "/user_id" },
    @{Name = "UserInteractions"; PartitionKey = "/user_id" }
)

foreach ($container in $containers) {
    New-AzCosmosDBSqlContainer -ResourceGroupName $resourceGroup -AccountName $accountName -DatabaseName "StarDatabase" -Name $container.Name -PartitionKeyPath $container.PartitionKey
}

Write-Host "Cosmos DB setup complete!"