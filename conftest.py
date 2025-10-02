import sys
import os
import pytest
from types import ModuleType
from main import create_app


@pytest.fixture
def client():
    # Mock local modules to prevent import errors when main imports them
    m_birth = ModuleType('birth_chart')
    m_birth.calculate_birth_chart = lambda *a, **k: {}
    m_birth.geocode_location = lambda *a, **k: {'lat': 0, 'lng': 0}
    sys.modules['birth_chart'] = m_birth

    m_sigil = ModuleType('sigil_generator')
    m_sigil.sigil_bp = None
    sys.modules['sigil_generator'] = m_sigil

    m_tarot = ModuleType('tarot_interactions')
    m_tarot.tarot_bp = None
    sys.modules['tarot_interactions'] = m_tarot

    m_feed = ModuleType('feed')
    m_feed.feed = None
    sys.modules['feed'] = m_feed

    # Ensure backend/star_backend_flask is resolvable if needed
    backend_folder = os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend', 'star_backend_flask'))
    if os.path.isdir(backend_folder) and backend_folder not in sys.path:
        sys.path.insert(0, backend_folder)

    app = create_app({'TESTING': True})
    with app.test_client() as c:
        with app.app_context():
            yield c
