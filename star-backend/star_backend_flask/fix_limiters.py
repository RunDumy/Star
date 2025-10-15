#!/usr/bin/env python3
"""
Fix rate limiter decorators in app.py
Replace @limiter.limit with @safe_rate_limit
"""

def fix_rate_limiters():
    file_path = r"c:\Users\fudos\PycharmProjects\Star\star-backend\star_backend_flask\app.py"
    
    # Read the file
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace all instances
    original_content = content
    
    # Replace various limiter patterns
    patterns = [
        '@limiter.limit("10 per minute")',
        '@limiter.limit("100 per minute")',
        '@limiter.limit("20 per minute")',
        '@limiter.limit("5 per minute")',
        '        @limiter.limit("100/hour")',
        '        @limiter.limit("50/hour")',
        '        @limiter.limit("20/hour")',
        '        @limiter.limit("60/hour")',
        '        @limiter.limit("30/hour")'
    ]
    
    replacements = [
        '@safe_rate_limit("10 per minute")',
        '@safe_rate_limit("100 per minute")',
        '@safe_rate_limit("20 per minute")',
        '@safe_rate_limit("5 per minute")',
        '        @safe_rate_limit("100/hour")',
        '        @safe_rate_limit("50/hour")',
        '        @safe_rate_limit("20/hour")',
        '        @safe_rate_limit("60/hour")',
        '        @safe_rate_limit("30/hour")'
    ]
    
    # Apply replacements
    for pattern, replacement in zip(patterns, replacements):
        count = content.count(pattern)
        if count > 0:
            content = content.replace(pattern, replacement)
            print(f"Replaced {count} instances of '{pattern}'")
    
    # Write the file back
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("✅ Rate limiter decorators fixed successfully!")
    else:
        print("No changes needed")

if __name__ == "__main__":
    fix_rate_limiters()