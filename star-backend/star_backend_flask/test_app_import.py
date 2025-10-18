print("Testing app imports...")
try:
    from app import app
    print("App imported successfully")
    print(f"Modules loaded: oracle_available={app.config.get('oracle_available', False)}")
except Exception as e:
    print(f"Import failed: {e}")
    import sys
    sys.exit(1)
