# GitHub Repository Secrets Configuration

# Add these secrets to: https://github.com/RunDumy/Star/settings/secrets/actions

## Required Secrets:

### JWT_SECRET_KEY

Value: TcHKkvIRqYsA7r93fF45tEJlx6b1QaweGZyCOUnLBMiXDm0WP2Vj8SzduhgNop

### SUPABASE_URL

Value: [Get from your Supabase project dashboard - Project Settings > API]
Example: https://your-project-id.supabase.co

### SUPABASE_ANON_KEY

Value: [Get from your Supabase project dashboard - Project Settings > API]
Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

### DATABASE_URL

Value: postgresql://postgres:8phRIvhoniavo2Wv@db.hiwmpmvqcxzshdmhhlsb.supabase.co:5432/postgres

## Instructions:

1. Go to your GitHub repository: https://github.com/RunDumy/Star
2. Click "Settings" tab
3. Click "Secrets and variables" in the left sidebar
4. Click "Actions"
5. Click "New repository secret"
6. Add each secret with the exact names and values above
7. After adding all secrets, the CI/CD pipeline should work correctly
