#!/usr/bin/env python3
"""
STAR Platform Duplicate File Analysis and Cleanup Tool
Identifies exact duplicate files and provides safe cleanup recommendations
"""

import hashlib
import json
import os
import shutil
from collections import defaultdict
from pathlib import Path


def calculate_file_hash(filepath):
    """Calculate SHA256 hash of a file"""
    hash_sha256 = hashlib.sha256()
    try:
        with open(filepath, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_sha256.update(chunk)
        return hash_sha256.hexdigest()
    except (IOError, OSError):
        return None

def get_file_info(filepath):
    """Get comprehensive file information"""
    try:
        stat = os.stat(filepath)
        return {
            'path': str(filepath),
            'size': stat.st_size,
            'modified': stat.st_mtime,
            'hash': calculate_file_hash(filepath)
        }
    except (IOError, OSError):
        return None

def find_duplicates(base_path):
    """Find all duplicate files in the project"""
    print("🔍 Scanning for duplicate files in STAR Platform...")
    
    # File patterns to check
    patterns = [
        "**/*requirements*.txt",
        "**/package*.json", 
        "**/Dockerfile*",
        "**/.env*",
        "**/app*.py",
        "**/README.md",
        "**/tsconfig.json",
        "**/jest.config.*",
        "**/tailwind.config.*"
    ]
    
    all_files = []
    base_path = Path(base_path)
    
    for pattern in patterns:
        for file_path in base_path.glob(pattern):
            if file_path.is_file():
                info = get_file_info(file_path)
                if info and info['hash']:
                    info['pattern'] = pattern
                    all_files.append(info)
    
    # Group files by hash
    hash_groups = defaultdict(list)
    for file_info in all_files:
        hash_groups[file_info['hash']].append(file_info)
    
    # Find actual duplicates (same hash, multiple files)
    duplicates = {hash_val: files for hash_val, files in hash_groups.items() if len(files) > 1}
    
    return duplicates, all_files

def analyze_duplicates(duplicates):
    """Analyze duplicates and provide recommendations"""
    recommendations = {
        'exact_duplicates': [],
        'safe_to_remove': [],
        'review_needed': [],
        'keep_all': []
    }
    
    for hash_val, files in duplicates.items():
        if len(files) == 2:
            file1, file2 = files[0], files[1]
            
            # Check for exact duplicates in different locations
            if (file1['size'] == file2['size'] and 
                'requirements' in file1['path'].lower() and 
                'requirements' in file2['path'].lower()):
                
                # Prefer the one in the correct location
                if 'star_backend_flask' in file1['path']:
                    recommendations['safe_to_remove'].append({
                        'keep': file1['path'],
                        'remove': file2['path'],
                        'reason': 'Backend requirements should be in star_backend_flask'
                    })
                elif 'star_backend_flask' in file2['path']:
                    recommendations['safe_to_remove'].append({
                        'keep': file2['path'], 
                        'remove': file1['path'],
                        'reason': 'Backend requirements should be in star_backend_flask'
                    })
        
        # Handle multiple duplicates
        if len(files) > 2:
            recommendations['review_needed'].append({
                'files': [f['path'] for f in files],
                'sizes': [f['size'] for f in files],
                'reason': 'Multiple copies found - manual review needed'
            })
    
    return recommendations

def main():
    base_path = r"c:\Users\fudos\PycharmProjects\Star"
    
    print(f"🚀 STAR Platform Duplicate File Cleanup")
    print(f"Base path: {base_path}")
    print("=" * 60)
    
    # Find duplicates
    duplicates, all_files = find_duplicates(base_path)
    
    print(f"\n📊 Scan Results:")
    print(f"   Total files scanned: {len(all_files)}")
    print(f"   Duplicate groups found: {len(duplicates)}")
    
    if not duplicates:
        print("✅ No exact duplicate files found!")
        return
    
    # Analyze duplicates
    recommendations = analyze_duplicates(duplicates)
    
    print(f"\n📋 Duplicate Analysis:")
    
    # Show exact duplicates
    duplicate_count = 0
    for hash_val, files in duplicates.items():
        duplicate_count += len(files) - 1  # Subtract 1 to count extras
        print(f"\n🔄 Duplicate Group (Hash: {hash_val[:12]}...):")
        for file_info in files:
            rel_path = os.path.relpath(file_info['path'], base_path)
            print(f"   📄 {rel_path} ({file_info['size']} bytes)")
    
    print(f"\n📈 Summary:")
    print(f"   Total duplicate files: {duplicate_count}")
    print(f"   Safe to remove: {len(recommendations['safe_to_remove'])}")
    print(f"   Need review: {len(recommendations['review_needed'])}")
    
    # Show recommendations
    if recommendations['safe_to_remove']:
        print(f"\n✅ Safe to Remove:")
        for rec in recommendations['safe_to_remove']:
            keep_rel = os.path.relpath(rec['keep'], base_path)
            remove_rel = os.path.relpath(rec['remove'], base_path)
            print(f"   ✓ Keep: {keep_rel}")
            print(f"   ❌ Remove: {remove_rel}")
            print(f"   💡 Reason: {rec['reason']}")
    
    if recommendations['review_needed']:
        print(f"\n⚠️  Need Manual Review:")
        for rec in recommendations['review_needed']:
            print(f"   📝 Files:")
            for file_path in rec['files']:
                rel_path = os.path.relpath(file_path, base_path)
                print(f"      - {rel_path}")
            print(f"   💡 Reason: {rec['reason']}")
    
    # Create cleanup script
    create_cleanup_script(recommendations, base_path)

def create_cleanup_script(recommendations, base_path):
    """Create a PowerShell script for safe cleanup"""
    
    script_content = """# STAR Platform - Safe Duplicate File Cleanup
# Generated automatically - Review before running!

Write-Host "🚀 STAR Platform Duplicate File Cleanup" -ForegroundColor Yellow
Write-Host "⚠️  Please review each action before proceeding!" -ForegroundColor Red
Write-Host ""

$basePath = "%s"

""" % base_path.replace("\\", "\\\\")

    if recommendations['safe_to_remove']:
        script_content += "# Safe to remove (exact duplicates)\n"
        for rec in recommendations['safe_to_remove']:
            remove_path = rec['remove'].replace("\\", "\\\\")
            keep_path = rec['keep'].replace("\\", "\\\\")
            script_content += f"""
Write-Host "Removing duplicate: {remove_path}" -ForegroundColor Red
Write-Host "Keeping original: {keep_path}" -ForegroundColor Green
# Remove-Item -Path "{remove_path}" -Force
# Uncomment the line above after review
"""

    script_content += """
Write-Host ""
Write-Host "✅ Cleanup complete!" -ForegroundColor Green
Write-Host "💡 Uncomment Remove-Item lines after reviewing each file" -ForegroundColor Yellow
"""
    
    script_path = os.path.join(base_path, "cleanup_duplicates.ps1")
    with open(script_path, 'w') as f:
        f.write(script_content)
    
    print(f"\n📝 Created cleanup script: cleanup_duplicates.ps1")
    print("   Review the script before running to ensure safety!")

if __name__ == "__main__":
    main()