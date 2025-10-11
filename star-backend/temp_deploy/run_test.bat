@echo off
"C:\ProgramData\chocolatey\bin\python3.13.exe" -m pytest tests/test_posts_api.py::test_get_posts_returns_transformed_posts -v
pause