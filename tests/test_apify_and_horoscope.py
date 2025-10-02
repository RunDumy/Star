from unittest.mock import patch, MagicMock


def test_horoscope_timeout_handling():
    from main import create_app
    app = create_app({'TESTING': True})
    import requests as _requests
    with patch('requests.get') as mock_get:
        mock_get.side_effect = _requests.exceptions.Timeout('timeout')
        # Ensure cached responses are cleared in case prior tests populated the cache
        try:
            from main import cache as _cache
            _cache.clear()
        except Exception:
            pass
        with app.test_client() as c:
            resp = c.get('/api/v1/horoscopes')
            assert resp.status_code == 503
            body = resp.get_json()
            assert body.get('reason') == 'upstream_error'


def test_apify_resource_posts_and_returns_json(monkeypatch):
    from main import create_app

    app = create_app({'TESTING': True})

    fake_response = {'data': {'items': [{'hashtag': '#ZodiacVibes', 'count': 123}]}}

    class FakeResp:
        def raise_for_status(self):
            return None

        def json(self):
            return fake_response

    with patch('requests.post') as mock_post:
        mock_post.return_value = FakeResp()
        # Ensure APIFY_TOKEN exists so call_apify_actor doesn't raise
        import os as _os
        _os.environ['APIFY_TOKEN'] = 'fake-token'
        with app.test_client() as c:
            res = c.post('/api/v1/trends/apify', json={'hashtags': ['#ZodiacVibes']})
            assert res.status_code == 200
            body = res.get_json()
            assert 'result' in body
            assert body['result'] == fake_response
