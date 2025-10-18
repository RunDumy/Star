#!/usr/bin/env python3

"""
Azure Key Vault Management API for STAR Platform

Secure configuration management endpoints
"""



import loggingimport logging

from datetime import datetimefrom datetime import datetime

from typing import Any, Dictfrom typing import Any, Dict



from azure_keyvault_manager import (get_key_vault_manager,from azure_keyvault_manager import (get_key_vault_manager,

                                    validate_configuration)                                    validate_configuration)

from flask import Blueprint, g, jsonify, requestfrom flask import Blueprint, g, jsonify, request

from marshmallow import Schema, ValidationError, fieldsfrom marshmallow import Schema, ValidationError, fields

from star_auth import token_requiredfrom star_auth import token_required



logger = logging.getLogger(__name__)logger = logging.getLogger(__name__)



# Constants# Constants

ERROR_INSUFFICIENT_PERMISSIONS = 'Insufficient permissions'ERROR_INSUFFICIENT_PERMISSIONS = 'Insufficient permissions'

ERROR_INTERNAL_SERVER = 'Internal server error'ERROR_INTERNAL_SERVER = 'Internal server error'



# Create Key Vault management blueprint# Create Key Vault management blueprint

keyvault_bp = Blueprint('keyvault', __name__, url_prefix='/api/v1/admin/keyvault')keyvault_bp = Blueprint('keyvault', __name__, url_prefix='/api/v1/admin/keyvault')



class SecretUpdateSchema(Schema):class SecretUpdateSchema(Schema):

    """Schema for secret update requests"""    """Schema for secret update requests"""

    secret_name = fields.Str(required=True)    secret_name = fields.Str(required=True)

    secret_value = fields.Str(required=True)    secret_value = fields.Str(required=True)

    content_type = fields.Str(required=False)    content_type = fields.Str(required=False)

    expires_in_days = fields.Int(required=False)    expires_in_days = fields.Int(required=False)



@keyvault_bp.route('/validate', methods=['GET'])@keyvault_bp.route('/validate', methods=['GET'])

@token_required@token_required

def validate_secret_configuration():def validate_secret_configuration():

    """Validate Key Vault configuration"""    """Validate Key Vault configuration"""

    try:    try:

        # Check admin permissions        # Check admin permissions

        user_role = g.current_user.get('role', 'user')        user_role = g.current_user.get('role', 'user')

        if user_role not in ['admin', 'superadmin']:        if user_role not in ['admin', 'superadmin']:

            return jsonify({'error': ERROR_INSUFFICIENT_PERMISSIONS}), 403            return jsonify({'error': 'Insufficient permissions'}), 403

                

        # Validate configuration        # Validate configuration

        validation_result = validate_configuration()        validation_result = validate_configuration()

                

        return jsonify({        return jsonify({

            'success': True,            'success': True,

            'validation': validation_result,            'validation': validation_result,

            'checked_at': datetime.now().isoformat()            'checked_at': datetime.now().isoformat()

        }), 200        }), 200

                

    except Exception as e:    except Exception as e:

        logger.error(f"Failed to validate Key Vault configuration: {e}")        logger.error(f"Failed to validate Key Vault configuration: {e}")

        return jsonify({'error': ERROR_INTERNAL_SERVER}), 500        return jsonify({'error': 'Internal server error'}), 500



@keyvault_bp.route('/secrets', methods=['GET'])@keyvault_bp.route('/secrets', methods=['GET'])

@token_required@token_required

def list_available_secrets():def list_available_secrets():

    """List available secrets (names only, not values)"""    """List available secrets (names only, not values)"""

    try:    try:

        # Check admin permissions        # Check admin permissions

        user_role = g.current_user.get('role', 'user')        user_role = g.current_user.get('role', 'user')

        if user_role not in ['admin', 'superadmin']:        if user_role not in ['admin', 'superadmin']:

            return jsonify({'error': ERROR_INSUFFICIENT_PERMISSIONS}), 403            return jsonify({'error': 'Insufficient permissions'}), 403

                

        manager = get_key_vault_manager()        manager = get_key_vault_manager()

                

        # Get secret configurations        # Get secret configurations

        secret_configs = []        secret_configs = []

        for name, config in manager.secret_configs.items():        for name, config in manager.secret_configs.items():

            secret_configs.append({            secret_configs.append({

                'name': name,                'name': name,

                'required': config.required,                'required': config.required,

                'description': config.description,                'description': config.description,

                'has_value': manager.get_secret(name) is not None,                'has_value': manager.get_secret(name) is not None,

                'has_default': config.default_value is not None                'has_default': config.default_value is not None

            })            })

                

        return jsonify({        return jsonify({

            'success': True,            'success': True,

            'secrets': secret_configs,            'secrets': secret_configs,

            'key_vault_available': manager.client is not None            'key_vault_available': manager.client is not None

        }), 200        }), 200

                

    except Exception as e:    except Exception as e:

        logger.error(f"Failed to list secrets: {e}")        logger.error(f"Failed to list secrets: {e}")

        return jsonify({'error': ERROR_INTERNAL_SERVER}), 500        return jsonify({'error': 'Internal server error'}), 500



@keyvault_bp.route('/secrets/<secret_name>/metadata', methods=['GET'])@keyvault_bp.route('/secrets/<secret_name>/metadata', methods=['GET'])

@token_required@token_required

def get_secret_metadata(secret_name: str):def get_secret_metadata(secret_name: str):

    """Get metadata for a specific secret"""    """Get metadata for a specific secret"""

    try:    try:

        # Check admin permissions        # Check admin permissions

        user_role = g.current_user.get('role', 'user')        user_role = g.current_user.get('role', 'user')

        if user_role not in ['admin', 'superadmin']:        if user_role not in ['admin', 'superadmin']:

            return jsonify({'error': ERROR_INSUFFICIENT_PERMISSIONS}), 403            return jsonify({'error': 'Insufficient permissions'}), 403

                

        manager = get_key_vault_manager()        manager = get_key_vault_manager()

        metadata = manager.get_secret_metadata(secret_name)        metadata = manager.get_secret_metadata(secret_name)

                

        if not metadata:        if not metadata:

            return jsonify({'error': 'Secret not found or not accessible'}), 404            return jsonify({'error': 'Secret not found or not accessible'}), 404

                

        return jsonify({        return jsonify({

            'success': True,            'success': True,

            'metadata': metadata            'metadata': metadata

        }), 200        }), 200

                

    except Exception as e:    except Exception as e:

        logger.error(f"Failed to get secret metadata: {e}")        logger.error(f"Failed to get secret metadata: {e}")

        return jsonify({'error': ERROR_INTERNAL_SERVER}), 500        return jsonify({'error': 'Internal server error'}), 500



@keyvault_bp.route('/secrets', methods=['POST'])@keyvault_bp.route('/secrets', methods=['POST'])

@token_required@token_required

def update_secret():def update_secret():

    """Update or create a secret"""    """Update or create a secret"""

    try:    try:

        # Check superadmin permissions        # Check superadmin permissions

        user_role = g.current_user.get('role', 'user')        user_role = g.current_user.get('role', 'user')

        if user_role != 'superadmin':        if user_role != 'superadmin':

            return jsonify({'error': ERROR_INSUFFICIENT_PERMISSIONS}), 403            return jsonify({'error': 'Superadmin permissions required'}), 403

                

        # Validate request        # Validate request

        schema = SecretUpdateSchema()        schema = SecretUpdateSchema()

        try:        try:

            data = schema.load(request.get_json() or {})            data = schema.load(request.get_json() or {})

        except ValidationError as e:        except ValidationError as e:

            return jsonify({'error': 'Invalid request', 'details': e.messages}), 400            return jsonify({'error': 'Invalid request', 'details': e.messages}), 400

                

        manager = get_key_vault_manager()        manager = get_key_vault_manager()

                

        # Calculate expiry if specified        # Calculate expiry if specified

        expires_on = None        expires_on = None

        if data.get('expires_in_days'):        if data.get('expires_in_days'):

            from datetime import timedelta            from datetime import timedelta

            expires_on = datetime.now() + timedelta(days=data['expires_in_days'])            expires_on = datetime.now() + timedelta(days=data['expires_in_days'])

                

        # Update the secret        # Update the secret

        success = manager.set_secret(        success = manager.set_secret(

            secret_name=data['secret_name'],            secret_name=data['secret_name'],

            secret_value=data['secret_value'],            secret_value=data['secret_value'],

            content_type=data.get('content_type'),            content_type=data.get('content_type'),

            expires_on=expires_on            expires_on=expires_on

        )        )

                

        if not success:        if not success:

            return jsonify({'error': 'Failed to update secret'}), 500            return jsonify({'error': 'Failed to update secret'}), 500

                

        return jsonify({        return jsonify({

            'success': True,            'success': True,

            'message': f"Secret '{data['secret_name']}' updated successfully",            'message': f"Secret '{data['secret_name']}' updated successfully",

            'updated_at': datetime.now().isoformat()            'updated_at': datetime.now().isoformat()

        }), 200        }), 200

                

    except Exception as e:    except Exception as e:

        logger.error(f"Failed to update secret: {e}")        logger.error(f"Failed to update secret: {e}")

        return jsonify({'error': ERROR_INTERNAL_SERVER}), 500        return jsonify({'error': 'Internal server error'}), 500



@keyvault_bp.route('/secrets/<secret_name>/rotate', methods=['POST'])@keyvault_bp.route('/secrets/<secret_name>/rotate', methods=['POST'])

@token_required@token_required

def rotate_secret(secret_name: str):def rotate_secret(secret_name: str):

    """Rotate a secret"""    """Rotate a secret"""

    try:    try:

        # Check superadmin permissions        # Check superadmin permissions

        user_role = g.current_user.get('role', 'user')        user_role = g.current_user.get('role', 'user')

        if user_role != 'superadmin':        if user_role != 'superadmin':

            return jsonify({'error': ERROR_INSUFFICIENT_PERMISSIONS}), 403            return jsonify({'error': 'Superadmin permissions required'}), 403

                

        manager = get_key_vault_manager()        manager = get_key_vault_manager()

        success = manager.rotate_secret(secret_name)        success = manager.rotate_secret(secret_name)

                

        if not success:        if not success:

            return jsonify({'error': 'Failed to rotate secret'}), 500            return jsonify({'error': 'Failed to rotate secret'}), 500

                

        return jsonify({        return jsonify({

            'success': True,            'success': True,

            'message': f"Secret '{secret_name}' rotation initiated",            'message': f"Secret '{secret_name}' rotation initiated",

            'rotated_at': datetime.now().isoformat()            'rotated_at': datetime.now().isoformat()

        }), 200        }), 200

                

    except Exception as e:    except Exception as e:

        logger.error(f"Failed to rotate secret: {e}")        logger.error(f"Failed to rotate secret: {e}")

        return jsonify({'error': ERROR_INTERNAL_SERVER}), 500        return jsonify({'error': 'Internal server error'}), 500



@keyvault_bp.route('/cache/clear', methods=['POST'])@keyvault_bp.route('/cache/clear', methods=['POST'])

@token_required@token_required

def clear_cache():def clear_cache():

    """Clear the secret cache"""    """Clear the secret cache"""

    try:    try:

        # Check admin permissions        # Check admin permissions

        user_role = g.current_user.get('role', 'user')        user_role = g.current_user.get('role', 'user')

        if user_role not in ['admin', 'superadmin']:        if user_role not in ['admin', 'superadmin']:

            return jsonify({'error': ERROR_INSUFFICIENT_PERMISSIONS}), 403            return jsonify({'error': 'Insufficient permissions'}), 403

                

        manager = get_key_vault_manager()        manager = get_key_vault_manager()

        manager.clear_cache()        manager.clear_cache()

                

        return jsonify({        return jsonify({

            'success': True,            'success': True,

            'message': 'Secret cache cleared',            'message': 'Secret cache cleared',

            'cleared_at': datetime.now().isoformat()            'cleared_at': datetime.now().isoformat()

        }), 200        }), 200

                

    except Exception as e:    except Exception as e:

        logger.error(f"Failed to clear cache: {e}")        logger.error(f"Failed to clear cache: {e}")

        return jsonify({'error': ERROR_INTERNAL_SERVER}), 500        return jsonify({'error': 'Internal server error'}), 500



@keyvault_bp.route('/health', methods=['GET'])@keyvault_bp.route('/health', methods=['GET'])

@token_required@token_required

def check_keyvault_health():def check_keyvault_health():

    """Check Key Vault connectivity and health"""    """Check Key Vault connectivity and health"""

    try:    try:

        # Check admin permissions        # Check admin permissions

        user_role = g.current_user.get('role', 'user')        user_role = g.current_user.get('role', 'user')

        if user_role not in ['admin', 'superadmin']:        if user_role not in ['admin', 'superadmin']:

            return jsonify({'error': ERROR_INSUFFICIENT_PERMISSIONS}), 403            return jsonify({'error': 'Insufficient permissions'}), 403

                

        manager = get_key_vault_manager()        manager = get_key_vault_manager()

                

        health_status = {        health_status = {

            'key_vault_configured': manager.vault_url is not None,            'key_vault_configured': manager.vault_url is not None,

            'client_available': manager.client is not None,            'client_available': manager.client is not None,

            'credential_available': manager.credential is not None,            'credential_available': manager.credential is not None,

            'cache_size': len(manager.secret_cache),            'cache_size': len(manager.secret_cache),

            'last_check': datetime.now().isoformat()            'last_check': datetime.now().isoformat()

        }        }

                

        # Test connectivity        # Test connectivity

        if manager.client:        if manager.client:

            try:            try:

                # Try to list secret properties (doesn't expose values)                # Try to list secret properties (doesn't expose values)

                list(manager.client.list_properties_of_secrets())                list(manager.client.list_properties_of_secrets())

                health_status['connectivity'] = 'healthy'                health_status['connectivity'] = 'healthy'

            except Exception as e:            except Exception as e:

                health_status['connectivity'] = 'error'                health_status['connectivity'] = 'error'

                health_status['connectivity_error'] = str(e)                health_status['connectivity_error'] = str(e)

        else:        else:

            health_status['connectivity'] = 'unavailable'            health_status['connectivity'] = 'unavailable'

                

        overall_healthy = (        overall_healthy = (

            health_status['key_vault_configured'] and            health_status['key_vault_configured'] and

            health_status['client_available'] and            health_status['client_available'] and

            health_status['connectivity'] == 'healthy'            health_status['connectivity'] == 'healthy'

        )        )

                

        return jsonify({        return jsonify({

            'success': True,            'success': True,

            'healthy': overall_healthy,            'healthy': overall_healthy,

            'status': health_status            'status': health_status

        }), 200 if overall_healthy else 503        }), 200 if overall_healthy else 503

                

    except Exception as e:    except Exception as e:

        logger.error(f"Failed to check Key Vault health: {e}")        logger.error(f"Failed to check Key Vault health: {e}")

        return jsonify({'error': ERROR_INTERNAL_SERVER}), 500        return jsonify({'error': 'Internal server error'}), 500