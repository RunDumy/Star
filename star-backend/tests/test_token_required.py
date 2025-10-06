import pytest
from unittest.mock import patch, MagicMock
import main
from functools import wraps


def make_token_header(token='mock'):
    return {'Authorization': f'Bearer {token}'}


def test_token_required_function_decorator(monkeypatch):
    # Prepare a dummy user response
    dummy_user = {'id': 7, 'username': 'u7', 'zodiac_sign': 'libra'}

    mock_table = MagicMock()
    mock_table.select.return_value.eq.return_value.execute.return_value.data = [dummy_user]
    mock_table.update.return_value.eq.return_value.execute.return_value = None

    mock_supabase = MagicMock()
    mock_supabase.table.return_value = mock_table

    monkeypatch.setattr(main, 'supabase', mock_supabase)
    monkeypatch.setattr(main, 'jwt', MagicMock(decode=lambda token, key, algorithms: {'user_id': 7}))

    # function decorated with token_required
    @main.token_required
    def protected_fn(current_user):
        return {'user_id': current_user.id}

    # Call directly with a header in the request context via test client
    app = main.create_app({'TESTING': True})
    # use a request context and call the decorated function directly
    with app.test_request_context('/', headers=make_token_header()):
        result = protected_fn()
        # protected_fn returns a dict; when used as a view Flask would convert it
        assert isinstance(result, dict)
        assert result['user_id'] == 7


def test_token_required_method_decorator(monkeypatch):
    # Prepare a dummy user response
    dummy_user = {'id': 9, 'username': 'u9', 'zodiac_sign': 'gemini'}

    mock_table = MagicMock()
    mock_table.select.return_value.eq.return_value.execute.return_value.data = [dummy_user]
    mock_table.update.return_value.eq.return_value.execute.return_value = None

    mock_supabase = MagicMock()
    mock_supabase.table.return_value = mock_table

    monkeypatch.setattr(main, 'supabase', mock_supabase)
    monkeypatch.setattr(main, 'jwt', MagicMock(decode=lambda token, key, algorithms: {'user_id': 9}))

    class C:
        @main.token_required
        def endpoint(self, current_user):
            return {'user_id': current_user.id}

    app = main.create_app({'TESTING': True})
    cobj = C()

    with app.test_request_context('/m', headers=make_token_header()):
        result = cobj.endpoint()
        assert isinstance(result, dict)
        assert result['user_id'] == 9


def test_token_required_missing_header(monkeypatch):
    app = main.create_app({'TESTING': True})

    @main.token_required
    def protected(current_user):
        return {'ok': True}

    # No Authorization header in context
    with app.test_request_context('/'):
        result = protected()
        # Should be a tuple (body, status) for error
        assert isinstance(result, tuple)
        assert result[1] == 401
