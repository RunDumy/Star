import datetime as _dt
import os

import requests
import star_backend_flask.app as app_module
from flask import Blueprint, jsonify, request
from star_auth import token_required

spotify_bp = Blueprint('spotify_api', __name__)


@spotify_bp.route('/spotify/token', methods=['POST'])
@token_required
def exchange_spotify_token(current_user):
    """
    Exchange PKCE authorization code for Spotify access and refresh tokens.

    Expects JSON: { code, code_verifier, redirect_uri? }
    Stores: spotify_access_token, spotify_refresh_token, spotify_token_expires in Supabase `profiles` table.
    """
    try:
        data = request.get_json(silent=True) or {}
        code = data.get('code')
        code_verifier = data.get('code_verifier')
        redirect_uri = data.get('redirect_uri') or os.environ.get('SPOTIFY_REDIRECT_URI')

        if not code or not code_verifier or not redirect_uri:
            return jsonify({'error': 'code, code_verifier and redirect_uri are required'}), 400

        client_id = os.environ.get('SPOTIFY_CLIENT_ID')
        if not client_id:
            app_module.logger.error('SPOTIFY_CLIENT_ID is not configured in environment')
            return jsonify({'error': 'Server not configured for Spotify OAuth'}), 500

        token_url = 'https://accounts.spotify.com/api/token'
        payload = {
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': redirect_uri,
            'client_id': client_id,
            'code_verifier': code_verifier,
        }

        headers = {'Content-Type': 'application/x-www-form-urlencoded'}
        resp = requests.post(token_url, data=payload, headers=headers, timeout=15)

        if resp.status_code != 200:
            app_module.logger.error(f"Spotify token exchange failed: {resp.status_code} {resp.text}")
            # Return the upstream error body when possible
            try:
                return jsonify({'error': 'Failed to exchange token', 'details': resp.json()}), resp.status_code
            except Exception:
                return jsonify({'error': 'Failed to exchange token'}), resp.status_code

        token_data = resp.json()
        access_token = token_data.get('access_token')
        refresh_token = token_data.get('refresh_token')
        expires_in = token_data.get('expires_in')

        expires_at = None
        if expires_in:
            # Use timezone-aware UTC timestamp
            from datetime import timezone as _tz
            expires_at = (_dt.datetime.now(_tz.utc) + _dt.timedelta(seconds=int(expires_in))).isoformat()

        # Persist tokens to Supabase profiles table
        supabase = app_module.supabase
        if supabase is None:
            app_module.logger.error('Supabase client not configured; cannot store Spotify tokens')
            return jsonify({'error': 'Database not configured'}), 503

        update_payload = {
            'spotify_access_token': access_token,
            'spotify_refresh_token': refresh_token,
            'spotify_token_expires': expires_at,
        }

        try:
            # Try updating by 'id' (some parts of the code use profiles.id == current_user.id)
            res = supabase.table('profiles').update(update_payload).eq('id', current_user.id).execute()
            if not getattr(res, 'data', None):
                # Fallback: try updating by user_id (other code uses profiles.user_id)
                res = supabase.table('profiles').update(update_payload).eq('user_id', current_user.id).execute()

            if not getattr(res, 'data', None):
                app_module.logger.error(f"Failed to update profiles table with Spotify tokens: {getattr(res, 'error', None)}")
                return jsonify({'error': 'Failed to store tokens'}), 500
        except Exception as e:
            app_module.logger.error(f"Exception while updating Supabase profiles: {e}")
            return jsonify({'error': 'Failed to store tokens'}), 500

        return jsonify({'message': 'Spotify connected', 'expires_at': expires_at}), 200

    except Exception as e:
        app_module.logger.error(f"Unhandled exception in spotify token exchange: {e}")
        return jsonify({'error': 'Internal server error'}), 500
