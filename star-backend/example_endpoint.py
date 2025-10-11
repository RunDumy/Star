from flask import request
from flask_restful import Resource


class ExampleResource(Resource):
    def get(self):
        # Simple health-like example that demonstrates token_required usage in real code
        return {'ok': True, 'message': 'example endpoint'}, 200
