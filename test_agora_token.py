#!/usr/bin/env python3
"""
Test script for Agora token generation
"""
import os
from datetime import datetime, timedelta

from agora_token_builder import RtcTokenBuilder

# Test Agora token generation
app_id = "27d39aff6ec6469c86397e5043da3e51"
app_certificate = "fe330d25d4fe4954b747fd43c1e98db1"
channel = "stream"
user_id = "testuser1"
role = 1  # Role_Publisher
expiry = int((datetime.now() + timedelta(hours=1)).timestamp())

token = RtcTokenBuilder.buildTokenWithUid(app_id, app_certificate, channel, user_id, role, expiry)

print(f"App ID: {app_id}")
print(f"Channel: {channel}")
print(f"User ID: {user_id}")
print(f"Role: {role}")
print(f"Token: {token}")
print(f"Expiry: {expiry}")