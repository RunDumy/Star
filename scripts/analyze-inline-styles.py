#!/usr/bin/env python3
"""
STAR Platform: Inline Styles Refactoring Automation Script
Automates the process of identifying and converting inline styles to CSS modules
"""

import json
import os
import re
from pathlib import Path
from typing import Dict, List, Tuple


class InlineStylesRefactor:
    def __init__(self, frontend_path: str):
        self.frontend_path = Path(frontend_path)
        self.components_path = self.frontend_path / "src" / "components"
        self.styles_path = self.frontend_path / "src" / "styles" / "modules"
        
        # Patterns to identify inline styles
        self.inline_style_patterns = [
            r'style=\{\{([^}]+)\}\}',
            r'style=\{([^}]+)\}',
        ]
        
        # CSS modules mapping
        self.css_modules = {
            'zodiac': 'zodiac.module.css',
            'animations': 'animations.module.css', 
            'game': 'game.module.css',
            'layout': 'layout.module.css'
        }
        
    def analyze_component(self, file_path: Path) -> Dict:
        """Analyze a component file for inline styles"""
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        inline_styles = []
        for pattern in self.inline_style_patterns:
            matches = re.finditer(pattern, content, re.MULTILINE | re.DOTALL)
            for match in matches:
                inline_styles.append({
                    'line': content[:match.start()].count('\n') + 1,
                    'match': match.group(0),
                    'content': match.group(1) if match.groups() else match.group(0)
                })
                
        return {
            'file': file_path.name,
            'path': str(file_path),
            'inline_styles': inline_styles,
            'count': len(inline_styles)
        }
    
    def scan_components(self) -> List[Dict]:
        """Scan all component files for inline styles"""
        results = []
        
        # Scan main components directory
        for file_path in self.components_path.rglob("*.tsx"):
            if file_path.is_file():
                analysis = self.analyze_component(file_path)
                if analysis['count'] > 0:
                    results.append(analysis)
                    
        # Sort by count (highest priority first)
        results.sort(key=lambda x: x['count'], reverse=True)
        return results
    
    def generate_refactoring_plan(self, analysis_results: List[Dict]) -> Dict:
        """Generate a refactoring plan based on analysis"""
        
        total_instances = sum(result['count'] for result in analysis_results)
        
        # Categorize components by priority
        high_priority = [r for r in analysis_results if r['count'] >= 8]
        medium_priority = [r for r in analysis_results if 4 <= r['count'] < 8]
        low_priority = [r for r in analysis_results if r['count'] < 4]
        
        plan = {
            'summary': {
                'total_files': len(analysis_results),
                'total_inline_styles': total_instances,
                'average_per_file': round(total_instances / len(analysis_results), 2) if analysis_results else 0
            },
            'phases': {
                'phase1_high_priority': {
                    'files': [r['file'] for r in high_priority],
                    'count': len(high_priority),
                    'instances': sum(r['count'] for r in high_priority),
                    'estimated_time': f"{len(high_priority) * 2} hours"
                },
                'phase2_medium_priority': {
                    'files': [r['file'] for r in medium_priority],
                    'count': len(medium_priority),
                    'instances': sum(r['count'] for r in medium_priority),
                    'estimated_time': f"{len(medium_priority) * 1} hours"
                },
                'phase3_low_priority': {
                    'files': [r['file'] for r in low_priority],
                    'count': len(low_priority),
                    'instances': sum(r['count'] for r in low_priority),
                    'estimated_time': f"{len(low_priority) * 0.5} hours"
                }
            },
            'detailed_analysis': analysis_results
        }
        
        return plan
    
    def identify_style_patterns(self, analysis_results: List[Dict]) -> Dict:
        """Identify common patterns in inline styles"""
        
        patterns = {
            'dynamic_colors': [],
            'animations': [],
            'positioning': [],
            'responsive': [],
            'performance': []
        }
        
        color_keywords = ['color', 'backgroundColor', 'borderColor', 'gradient']
        animation_keywords = ['transition', 'transform', 'animation', 'delay']
        position_keywords = ['position', 'top', 'left', 'right', 'bottom', 'zIndex']
        responsive_keywords = ['width', 'height', 'padding', 'margin']
        performance_keywords = ['willChange', 'transform3d', 'backfaceVisibility']
        
        for result in analysis_results:
            for style in result['inline_styles']:
                content = style['content'].lower()
                
                if any(keyword in content for keyword in color_keywords):
                    patterns['dynamic_colors'].append({
                        'file': result['file'],
                        'line': style['line'],
                        'content': style['match']
                    })
                    
                if any(keyword in content for keyword in animation_keywords):
                    patterns['animations'].append({
                        'file': result['file'], 
                        'line': style['line'],
                        'content': style['match']
                    })
                    
                if any(keyword in content for keyword in position_keywords):
                    patterns['positioning'].append({
                        'file': result['file'],
                        'line': style['line'], 
                        'content': style['match']
                    })
                    
        return patterns
    
    def generate_css_module_suggestions(self, patterns: Dict) -> Dict:
        """Generate CSS module class suggestions"""
        
        suggestions = {
            'zodiac.module.css': {
                'classes': [
                    '.zodiacCard { /* Dynamic zodiac theming */ }',
                    '.sigilContainer { /* Sigil display container */ }',
                    '.systemCard { /* Zodiac system cards */ }',
                    '.chatRoom { /* Zodiac chat styling */ }'
                ],
                'custom_properties': [
                    '--zodiac-color',
                    '--zodiac-secondary',
                    '--zodiac-opacity'
                ]
            },
            'animations.module.css': {
                'classes': [
                    '.fadeIn { animation: fadeIn 0.3s ease; }',
                    '.slideUp { animation: slideUp 0.4s ease; }',
                    '.pulse { animation: pulse 2s infinite; }',
                    '.float { animation: float 4s ease infinite; }'
                ],
                'utilities': [
                    '.delay-100 { animation-delay: 0.1s; }',
                    '.delay-200 { animation-delay: 0.2s; }',
                    '.duration-fast { animation-duration: 0.2s; }'
                ]
            },
            'game.module.css': {
                'classes': [
                    '.gameBoard { /* Game grid layout */ }',
                    '.tarotCard { /* Tarot card styling */ }', 
                    '.sparkButton { /* 3D button effects */ }',
                    '.arenaContainer { /* Game arena layout */ }'
                ]
            },
            'layout.module.css': {
                'classes': [
                    '.mobileNav { /* Mobile navigation */ }',
                    '.planetaryNav { /* Planetary navigation */ }',
                    '.spreadCanvas { /* Tarot spread canvas */ }',
                    '.flexCenter { display: flex; align-items: center; justify-content: center; }'
                ]
            }
        }
        
        return suggestions
    
    def create_refactoring_report(self, output_path: str = None) -> str:
        """Create comprehensive refactoring report"""
        
        print("🔍 Scanning components for inline styles...")
        analysis_results = self.scan_components()
        
        print("📊 Generating refactoring plan...")
        plan = self.generate_refactoring_plan(analysis_results)
        
        print("🎨 Identifying style patterns...")
        patterns = self.identify_style_patterns(analysis_results)
        
        print("💡 Generating CSS module suggestions...")
        suggestions = self.generate_css_module_suggestions(patterns)
        
        report = {
            'timestamp': '2024-01-15T10:00:00Z',
            'summary': plan['summary'],
            'refactoring_plan': plan['phases'],
            'style_patterns': patterns,
            'css_module_suggestions': suggestions,
            'detailed_analysis': plan['detailed_analysis']
        }
        
        if output_path:
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(report, f, indent=2, ensure_ascii=False)
        
        return json.dumps(report, indent=2)
    
    def print_summary(self):
        """Print a quick summary of the refactoring analysis"""
        
        analysis_results = self.scan_components()
        plan = self.generate_refactoring_plan(analysis_results)
        
        print("\n" + "="*60)
        print("🎨 INLINE STYLES REFACTORING ANALYSIS")
        print("="*60)
        print(f"📁 Total files with inline styles: {plan['summary']['total_files']}")
        print(f"📝 Total inline style instances: {plan['summary']['total_inline_styles']}")
        print(f"📊 Average instances per file: {plan['summary']['average_per_file']}")
        
        print("\n🚀 REFACTORING PHASES:")
        print(f"Phase 1 (High Priority): {plan['phases']['phase1_high_priority']['count']} files, {plan['phases']['phase1_high_priority']['instances']} instances")
        print(f"Phase 2 (Medium Priority): {plan['phases']['phase2_medium_priority']['count']} files, {plan['phases']['phase2_medium_priority']['instances']} instances") 
        print(f"Phase 3 (Low Priority): {plan['phases']['phase3_low_priority']['count']} files, {plan['phases']['phase3_low_priority']['instances']} instances")
        
        print("\n📋 TOP 10 FILES FOR REFACTORING:")
        for i, result in enumerate(analysis_results[:10], 1):
            print(f"{i:2d}. {result['file']:30} - {result['count']:2d} instances")
        
        total_estimated_time = (
            plan['phases']['phase1_high_priority']['count'] * 2 +
            plan['phases']['phase2_medium_priority']['count'] * 1 +
            plan['phases']['phase3_low_priority']['count'] * 0.5
        )
        print(f"\n⏱️ Estimated total refactoring time: {total_estimated_time} hours")
        print("="*60)

def main():
    """Main execution function"""
    
    # Initialize refactoring analyzer
    frontend_path = "star-frontend"
    refactor = InlineStylesRefactor(frontend_path)
    
    # Print quick summary
    refactor.print_summary()
    
    # Generate detailed report
    report_path = "star-frontend/refactoring-analysis.json"
    print(f"\n📄 Generating detailed report: {report_path}")
    refactor.create_refactoring_report(report_path)
    
    print("\n✅ Analysis complete!")
    print("📖 Next steps:")
    print("   1. Review the generated CSS modules in src/styles/modules/")
    print("   2. Start with Phase 1 high-priority components")
    print("   3. Test each component after refactoring")
    print("   4. Validate performance improvements")

if __name__ == "__main__":
    main()