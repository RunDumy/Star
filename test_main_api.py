import json
import pytest

import main


class DummyRes:
    def __init__(self, data):
        self.data = data


class DummyTable:
    def __init__(self):
        self.storage = {}

    def select(self, *args, **kwargs):
        return self

    def eq(self, *args, **kwargs):
        return self

    def insert(self, data):
        # emulate insert by adding id
        data['id'] = 999
        self.storage[data['username']] = data
        return self

    def update(self, data):
        return self

    def execute(self):
        # return users list if present
        if self.storage:
            return DummyRes(list(self.storage.values()))
        return DummyRes([])


class DummySupabase:
    def __init__(self):
        self._table = DummyTable()

    def table(self, name):
        return self._table


@pytest.fixture(autouse=True)
def patch_supabase(monkeypatch):
    dummy = DummySupabase()
    monkeypatch.setattr(main, 'supabase', dummy)
    return dummy


def test_register_and_login(client):
    # Register
    payload = {
        'username': 'testuser',
        'password': 'secret123',
        'zodiac_sign': 'Leo',
        'birth_date': '1990-08-01'
    }
    rv = client.post('/api/v1/register', data=json.dumps(payload), content_type='application/json')
    assert rv.status_code == 201
    data = rv.get_json()
    assert 'message' in data and 'Registered' in data['message']

    # Emulate stored user for login: set password_hash to bcrypt hash
    import bcrypt
    users = list(main.supabase.table('user').storage.values())
    assert users
    users[0]['password_hash'] = bcrypt.hashpw(payload['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    # Login
    rv2 = client.post('/api/v1/login', data=json.dumps({'username': 'testuser', 'password': 'secret123'}), content_type='application/json')
    assert rv2.status_code == 200
    data2 = rv2.get_json()
    assert 'token' in data2
