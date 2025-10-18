# STAR Platform - Duplicate Files Report
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## Duplicate Files Analysis

Based on the scan results, here are the duplicate files identified in your STAR platform:

### 1. Requirements Files (7 files - Multiple duplicates/variations)
**Status**: Multiple versions with different content
- `requirements.txt` (142 bytes) - Root level, minimal Azure Functions setup
- `requirements_consolidated.txt` (1,468 bytes) - Comprehensive dependencies 
- `star-backend\star_backend_flask\requirements.txt` (1,703 bytes) - Main backend requirements
- `star-backend\star_backend_flask\requirements_backup.txt` (1,390 bytes) - Backup version
- `star-backend\star_backend_flask\requirements_core.txt` (538 bytes) - Core dependencies only
- `star-backend\star_backend_flask\requirements_no_redis.txt` (625 bytes) - No Redis version
- `star-backend\star_backend_flask\requirements_test.txt` (12 bytes) - Test dependencies

**Recommendation**: 
- Keep `star-backend\star_backend_flask\requirements.txt` as the main file
- Remove or consolidate the others based on actual usage

### 2. Docker Files (4 files - All different)
**Status**: Different configurations for different purposes
- `Dockerfile` (714 bytes) - Root level
- `Dockerfile.ci` (777 bytes) - CI/CD specific
- `star-backend\star_backend_flask\Dockerfile` (792 bytes) - Backend specific  
- `star-frontend\Dockerfile` (653 bytes) - Frontend specific

**Recommendation**: 
- These appear to be legitimate different configurations
- Consider consolidating if some serve the same purpose

### 3. App Files (5 files - All different)
**Status**: Different versions/variations of the main application
- `star-backend\star_backend_flask\app.py` (168,867 bytes) - **MAIN FILE**
- `star-backend\star_backend_flask\app_production.py` (29,717 bytes) - Production version
- `star-backend\star_backend_flask\app_minimal.py` (3,979 bytes) - Minimal version
- `star-backend\star_backend_flask\app_no_redis.py` (18,675 bytes) - No Redis version
- `star-backend\star_backend_flask\app_test.py` (17,532 bytes) - Test version

**Recommendation**: 
- Keep `app.py` as the main file (it's significantly larger and likely the current version)
- Archive or remove the variant versions if they're not actively used

### 4. Environment Files (7 files - All different)
**Status**: Different environment configurations
- `star-frontend\.env.azure` (566 bytes) - Azure specific
- `star-frontend\.env.development` (1,950 bytes) - Development config
- `star-frontend\.env.production` (1,189 bytes) - Production config  
- `star-frontend\.env.local.example` (1,617 bytes) - Template
- `star-backend\star_backend_flask\.env.production` (1,819 bytes) - Backend production
- `config\docker\.env.dev` (760 bytes) - Docker development
- `config\docker\.env.dev.example` (505 bytes) - Docker template

**Recommendation**: 
- These appear to be legitimate different environment configurations
- Ensure proper documentation of when each should be used

### 5. Package Files (2 files - Different purposes)
**Status**: Different scopes
- `package.json` (51 bytes) - Root level, minimal
- `star-frontend\package.json` (2,867 bytes) - Frontend dependencies

**Recommendation**: 
- Root `package.json` might be unnecessary if it's minimal
- Check if root package.json serves a specific purpose

### 6. Backup Directories with Many Files
- `star-backend\requirements_backup\` - 7 files
- `archive\` - 65 files  
- `.azure\` - 9 files

## Cleanup Recommendations

### High Priority (Safe to Remove)
1. **Root `requirements.txt`** - Appears to be Azure Functions specific, not needed for Flask app
2. **Root `package.json`** - Only 51 bytes, likely unnecessary
3. **Backup requirements files** - If main requirements.txt is working

### Medium Priority (Evaluate Usage)
1. **App variants** - Remove unused app_*.py files if main app.py is stable
2. **Requirements variants** - Consolidate if not actively used for different deployment scenarios

### Low Priority (Archive)
1. **Archive directory** - Already archived, consider moving to separate backup location
2. **Backup directories** - Move to external backup if not needed for development

## Proposed Cleanup Actions

Would you like me to proceed with any of these cleanup actions?

1. Remove duplicate/unused requirements files
2. Clean up app.py variants  
3. Consolidate environment file documentation
4. Archive backup directories
5. Remove minimal/unused configuration files