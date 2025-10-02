# -*- coding: utf-8 -*-

import sys
from pathlib import Path

print(sys.path)

try:
    # Attempt import assuming backend is already on PYTHONPATH or marked as Source Root
    from star_backend.api import posts
except ModuleNotFoundError as e:
    # If star_backend isn't found, add the backend directory to sys.path and retry
    project_root = Path(__file__).resolve().parent
    backend_dir = project_root / "backend"
    if backend_dir.is_dir():
        backend_str = str(backend_dir)
        if backend_str not in sys.path:
            sys.path.insert(0, backend_str)
        try:
            from star_backend.api import posts  # retry after fixing sys.path
        except ModuleNotFoundError:
            # Give a clear error with guidance
            raise ModuleNotFoundError(
                "Could not import 'star_backend'. Ensure the 'backend' directory is on PYTHONPATH "
                "or marked as a Sources Root in your IDE, or install the package. "
                f"Tried adding to sys.path: {backend_str}"
            ) from e
    else:
        raise FileNotFoundError(
            f"'backend' directory not found at expected location: {backend_dir}"
        ) from e

print('Import successful')
