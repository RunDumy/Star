# STAR App Azure Migration - Testing Guide

Use this checklist to verify all features are working correctly after migrating the backend to Azure.

## Backend Health Check

1. Verify the health endpoint is accessible:

   ```
   curl https://star-app-backend.azurewebsites.net/api/health
   ```

   Expected response: `{"status":"ok"}`

2. Check the root endpoint:
   ```
   curl https://star-app-backend.azurewebsites.net/
   ```
   Expected response: JSON with app name and version

## Frontend-Backend Integration

1. Start the frontend locally with Azure backend:

   ```
   cd star-frontend
   npm run dev
   ```

2. Open browser at http://localhost:3000 and verify:
   - No console errors related to API calls
   - All content loads properly
   - API requests in Network tab show 200 OK status

## Feature Testing

### Authentication

- [ ] Test registration of new user
- [ ] Test login with existing credentials
- [ ] Test JWT token functionality
- [ ] Verify logout process

### Feed

- [ ] Verify feed loads posts
- [ ] Test creating new posts
- [ ] Test liking posts
- [ ] Test commenting on posts

### Real-time Features

- [ ] Test WebSocket connections
- [ ] Verify real-time updates in chat
- [ ] Test live streaming functionality

### Profile Features

- [ ] Test viewing user profiles
- [ ] Test updating profile information
- [ ] Verify birth chart calculation

### Redis Functionality

- [ ] Test caching mechanisms
- [ ] Verify cache expiration
- [ ] Check Redis connection stability

### Spotify Integration

- [ ] Test Spotify authentication
- [ ] Verify music recommendations
- [ ] Test playlist creation

## Performance Testing

1. Response times:

   - [ ] API endpoints respond within acceptable timeframes
   - [ ] WebSocket connections establish promptly
   - [ ] Redis cache improves response times

2. Load handling:
   - [ ] Multiple concurrent users can access the application
   - [ ] System remains responsive under load

## Error Handling

- [ ] 404 errors handled gracefully
- [ ] Authentication failures provide clear messages
- [ ] API errors return proper status codes and messages

## Cross-browser Testing

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

## Issues and Troubleshooting

Document any issues encountered during testing:

| Issue | Description | Resolution |
| ----- | ----------- | ---------- |
|       |             |            |
|       |             |            |
