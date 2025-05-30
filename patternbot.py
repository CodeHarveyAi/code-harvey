#!/usr/bin/env python3
"""
patternbot.py - Extract sentence patterns from real student essays
Searches for pre-2019 student essays and extracts linguistic patterns for Code H
"""

import requests
import json
import subprocess
import re
import time
import random
from datetime import datetime
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
from duckduckgo_search import DDGS

class PatternBot:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.existing_patterns = []
        self.new_patterns = []
        self.processed_examples = set()
        
    def get_fallback_urls(self):
        """Fallback URLs from known good sources"""
        fallback_urls = [
            # Open access essay collections that usually allow scraping
            "https://writingcenter.fas.harvard.edu/pages/beginning-academic-essay",
            "https://writingcenter.unc.edu/tips-and-tools/thesis-statements/",
            "https://owl.purdue.edu/owl/general_writing/academic_writing/essay_writing/argumentative_essays.html",
            "https://writing.wisc.edu/handbook/assignments/writing-an-argument/",
            "https://writing.colostate.edu/guides/teaching/co300man/pop7a.cfm",
            
            # Alternative academic writing sites
            "https://www.thoughtco.com/how-to-write-a-great-essay-1857142",
            "https://www.khanacademy.org/humanities/grammar/grammar-syntax/writing-introduction/a/what-is-academic-writing",
            
            # Archive.org versions (more likely to work)
            "https://web.archive.org/web/20190101000000*/https://writingcenter.fas.harvard.edu/*",
        ]
        
        print("🔄 Using fallback URLs from known academic sources...")
        return fallback_urls
        
    def load_existing_patterns(self):
        """Load existing patterns from patternbank.js"""
        try:
            with open('./app/lib/patternbank.js', 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Extract existing patterns using regex
            pattern_matches = re.findall(r'"id":\s*"([^"]+)"', content)
            example_matches = re.findall(r'"examples":\s*\[(.*?)\]', content, re.DOTALL)
            
            self.existing_patterns = pattern_matches
            
            # Extract existing examples to avoid duplicates
            for examples_str in example_matches:
                examples = re.findall(r'"([^"]+)"', examples_str)
                self.processed_examples.update(examples)
                
            print(f"✅ Loaded {len(self.existing_patterns)} existing patterns")
            print(f"✅ Loaded {len(self.processed_examples)} existing examples")
            
        except Exception as e:
            print(f"⚠️ Could not load existing patterns: {e}")
            
    def search_student_essays(self, limit=5):
        """Search for real student essay URLs using DuckDuckGo"""
        search_queries = [
            "student essay examples site:edu",
            "college writing samples site:edu", 
            "academic writing examples",
            "student paper site:university.edu",
            "essay examples site:writing.edu",
            "sample essays site:*.edu",
            "student writing portfolio",
            "college essay samples",
            "academic essay examples"
        ]
        
        urls = []
        
        try:
            with DDGS() as ddgs:
                for query in search_queries[:3]:  # Try multiple queries
                    print(f"🔍 Searching: {query}")
                    
                    try:
                        results = list(ddgs.text(query, max_results=limit))
                        print(f"   Found {len(results)} raw results")
                        
                        for result in results:
                            url = result.get('href')
                            title = result.get('title', '')
                            snippet = result.get('body', '')
                            
                            print(f"   Checking: {url}")
                            print(f"   Title: {title}")
                            
                            if url and self.is_valid_essay_url(url, title, snippet):
                                urls.append(url)
                                print(f"📄 ✅ Valid: {url}")
                            else:
                                print(f"📄 ❌ Invalid: {url}")
                                
                        time.sleep(2)  # Be respectful
                        
                        if len(urls) >= limit:
                            break
                            
                    except Exception as e:
                        print(f"   Query failed: {e}")
                        continue
                        
        except Exception as e:
            print(f"❌ Search failed: {e}")
            
        print(f"🎯 Total valid URLs found: {len(urls)}")
        return urls[:limit]
    
    def is_valid_essay_url(self, url, title="", snippet=""):
        """Filter for likely essay URLs with better detection"""
        if not url:
            return False
            
        url_lower = url.lower()
        title_lower = title.lower()
        snippet_lower = snippet.lower()
        
        # Combine all text for analysis
        all_text = f"{url_lower} {title_lower} {snippet_lower}"
        
        # Strong positive indicators
        strong_positive = [
            'essay',
            'student writing', 
            'writing sample',
            'academic writing',
            'composition',
            'rhetoric',
            'english department',
            'writing center',
            'portfolio'
        ]
        
        # Weak positive indicators  
        weak_positive = [
            '.edu',
            'university',
            'college',
            'student',
            'academic',
            'paper',
            'writing',
            'english'
        ]
        
        # Strong negative indicators (immediate reject)
        strong_negative = [
            'writing service',
            'essay writing service',
            'buy essay',
            'custom essay',
            'plagiarism',
            'homework help',
            'essay help',
            'pay for essay',
            'order essay',
            'essay writers',
            'essay mill'
        ]
        
        # Check for strong negatives first
        if any(neg in all_text for neg in strong_negative):
            print(f"      ❌ Strong negative: {url}")
            return False
            
        # Check for strong positives
        strong_matches = sum(1 for pos in strong_positive if pos in all_text)
        weak_matches = sum(1 for pos in weak_positive if pos in all_text)
        
        # Scoring system
        score = strong_matches * 3 + weak_matches * 1
        
        # Additional checks for common essay sites
        if any(domain in url_lower for domain in ['purdue.edu', 'mit.edu', 'harvard.edu', 'stanford.edu']):
            score += 2
            
        if 'writing' in url_lower and '.edu' in url_lower:
            score += 2
            
        print(f"      Score: {score} (strong: {strong_matches}, weak: {weak_matches})")
        
        return score >= 3
    
    def scrape_content(self, url):
        """Extract clean text from essay URL"""
        try:
            print(f"📥 Scraping: {url}")
            
            # Skip PDFs for now
            if url.lower().endswith('.pdf'):
                print("   ⚠️ Skipping PDF file")
                return []
            
            # Set better headers to avoid 403
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
            }
            
            response = requests.get(url, headers=headers, timeout=15, allow_redirects=True)
            response.raise_for_status()
            
            # Handle encoding issues
            response.encoding = response.apparent_encoding or 'utf-8'
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Remove script, style, nav, footer, etc.
            for tag in soup(['script', 'style', 'nav', 'footer', 'header', 'aside', 'form']):
                tag.decompose()
                
            # Extract paragraphs with multiple strategies
            paragraphs = []
            
            # Strategy 1: Look for common academic content containers
            content_selectors = [
                'article p',
                '.content p',
                '.essay p',
                '.paper p', 
                '.writing p',
                'main p',
                '.entry-content p',
                '.post-content p',
                '#content p',
                '.sample p',
                '.example p'
            ]
            
            found_content = False
            for selector in content_selectors:
                elements = soup.select(selector)
                if elements and len(elements) >= 2:  # Need multiple paragraphs
                    print(f"   Using selector: {selector}")
                    for p in elements:
                        text = p.get_text().strip()
                        if self.is_valid_paragraph(text):
                            paragraphs.append(text)
                    found_content = True
                    break
                    
            # Strategy 2: If no structured content, try all paragraphs
            if not found_content:
                print("   Trying all paragraphs...")
                for p in soup.find_all('p'):
                    text = p.get_text().strip()
                    if self.is_valid_paragraph(text):
                        paragraphs.append(text)
                        
            # Strategy 3: Try text blocks in divs if still no content
            if not paragraphs:
                print("   Trying div text blocks...")
                for div in soup.find_all('div'):
                    text = div.get_text().strip()
                    # Split on sentence boundaries
                    sentences = re.split(r'[.!?]+\s+', text)
                    for sentence_group in sentences:
                        if self.is_valid_paragraph(sentence_group.strip()):
                            paragraphs.append(sentence_group.strip())
                            
            # Remove duplicates while preserving order
            seen = set()
            unique_paragraphs = []
            for p in paragraphs:
                if p not in seen and len(p.strip()) > 0:
                    seen.add(p)
                    unique_paragraphs.append(p)
                    
            print(f"✅ Extracted {len(unique_paragraphs)} paragraphs from {url}")
            return unique_paragraphs[:10]  # Limit to prevent overload
            
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 403:
                print(f"❌ Access forbidden (403) for {url} - site blocking scraping")
            else:
                print(f"❌ HTTP error {e.response.status_code} for {url}")
            return []
        except Exception as e:
            print(f"❌ Failed to scrape {url}: {e}")
            return []
    
    def is_valid_paragraph(self, text):
        """Check if paragraph is worth analyzing"""
        if not text or len(text) < 50:
            return False
            
        # Count sentences (rough)
        sentence_count = len(re.findall(r'[.!?]+', text))
        if sentence_count < 2:
            return False
            
        # Count words
        word_count = len(text.split())
        if word_count < 8:
            return False
            
        # Filter out junk content
        junk_patterns = [
            'click here',
            'read more',
            'contact us',
            'buy now',
            'sign up',
            'subscribe',
            'copyright',
            '©',
            'terms of service',
            'privacy policy'
        ]
        
        text_lower = text.lower()
        if any(pattern in text_lower for pattern in junk_patterns):
            return False
            
        # Check for repetitive patterns
        words = text.split()
        unique_words = set(words)
        if len(unique_words) < len(words) * 0.6:  # Too repetitive
            return False
            
        return True
    
    def extract_pattern(self, paragraph):
        """Call matchPatternCLI.js to extract linguistic pattern"""
        try:
            # Call your actual CLI pattern matcher with proper encoding
            result = subprocess.run([
                'node', 
                './matchPatternCLI.js',
                paragraph  # Pass the paragraph as argument
            ], capture_output=True, text=True, timeout=15, encoding='utf-8', errors='replace')
            
            if result.returncode == 0:
                stdout = result.stdout.strip() if result.stdout else ""
                if stdout:
                    pattern_data = json.loads(stdout)
                    print(f"✅ Pattern matched: {pattern_data.get('id', 'unknown')}")
                    return pattern_data
                else:
                    print("⚠️ Empty response from pattern matcher")
                    return None
            else:
                # Log stderr (your debug messages) but don't treat as failure
                if result.stderr:
                    print(f"🔍 Pattern debug: {result.stderr.strip()}")
                print(f"⚠️ No pattern matched for text: {paragraph[:50]}...")
                return None
                
        except subprocess.TimeoutExpired:
            print("⚠️ Pattern extraction timed out")
            return None
        except json.JSONDecodeError as e:
            print(f"⚠️ Invalid JSON from pattern matcher: {e}")
            if 'result' in locals() and result.stdout:
                print(f"Raw output: {result.stdout}")
            return None
        except Exception as e:
            print(f"⚠️ Pattern extraction error: {e}")
            return None
    
    def is_pattern_useful(self, pattern_data):
        """Filter out patterns we already have or don't want"""
        if not pattern_data or not isinstance(pattern_data, dict):
            return False
            
        pattern_id = pattern_data.get('id', '')
        structure = pattern_data.get('structure', '')
        
        # Skip if we already have this pattern ID
        if pattern_id in self.existing_patterns:
            print(f"⚪ Skipping existing pattern: {pattern_id}")
            return False
            
        # Skip overly simple patterns
        if not structure or len(structure.split()) < 3:
            print(f"⚪ Skipping simple pattern: {structure}")
            return False
            
        # Require some complexity indicators
        complexity_indicators = ['+', 'Phrase', 'Clause', 'Infinitive', 'Gerund', 'Relative']
        if not any(indicator in structure for indicator in complexity_indicators):
            print(f"⚪ Skipping low-complexity pattern: {structure}")
            return False
            
        # Check metadata if available
        metadata = pattern_data.get('metadata', {})
        word_count = metadata.get('wordCount', 0)
        
        # Skip very short examples
        if word_count > 0 and word_count < 10:
            print(f"⚪ Skipping short example ({word_count} words)")
            return False
            
        print(f"✅ Pattern is useful: {pattern_id}")
        return True
    
    def generate_pattern_id(self, structure):
        """Generate unique pattern ID from structure"""
        # Create hash-like ID from structure
        import hashlib
        
        cleaned = re.sub(r'[^\w\s+/]', '', structure)
        words = cleaned.split()
        key_words = [w.lower() for w in words if w.lower() not in ['the', 'a', 'an', 'and', 'or']]
        
        if len(key_words) >= 2:
            base_id = '_'.join(key_words[:3])
        else:
            # Fallback to hash
            hash_obj = hashlib.md5(structure.encode())
            base_id = f"pattern_{hash_obj.hexdigest()[:8]}"
            
        return base_id
    
    def process_essays(self, max_urls=5):
        """Main processing loop"""
        print("🚀 Starting PatternBot...")
        
        # Load existing patterns
        self.load_existing_patterns()
        
        # Search for essays
        urls = self.search_student_essays(limit=max_urls)
        
        # If no URLs found, use fallbacks
        if not urls:
            print("🔄 No search results, trying fallback URLs...")
            urls = self.get_fallback_urls()[:max_urls]
        
        if not urls:
            print("❌ No valid essay URLs found")
            return
            
        # Process each URL
        for url in urls:
            paragraphs = self.scrape_content(url)
            
            for paragraph in paragraphs:
                # Skip if we've seen this example
                if paragraph in self.processed_examples:
                    continue
                    
                # Extract pattern
                pattern_data = self.extract_pattern(paragraph)
                
                if pattern_data and self.is_pattern_useful(pattern_data):
                    # Create pattern entry using your existing format
                    pattern_entry = {
                        "id": pattern_data.get('id'),
                        "label": pattern_data.get('label', 'Auto-detected Pattern'),
                        "structure": pattern_data.get('structure', ''),
                        "conditions": pattern_data.get('conditions', {
                            "complexity": "auto",
                            "sentenceCount": 1,
                            "voice": "mixed"
                        })
                    }
                    
                    # Add examples if not already present
                    if 'examples' not in pattern_data:
                        example_text = paragraph[:100] + "..." if len(paragraph) > 100 else paragraph
                        pattern_entry['examples'] = [example_text]
                    else:
                        pattern_entry['examples'] = pattern_data['examples']
                    
                    self.new_patterns.append(pattern_entry)
                    self.processed_examples.add(paragraph)
                    
                    print(f"🎯 New pattern added: {pattern_entry['id']}")
                    print(f"   Structure: {pattern_entry['structure']}")
                    print(f"   Example: {pattern_entry['examples'][0][:50]}...")
                else:
                    # Log why pattern was rejected
                    if pattern_data:
                        print(f"⚪ Pattern rejected: {pattern_data.get('id', 'unknown')}")
                    else:
                        print(f"⚪ No pattern extracted from: {paragraph[:50]}...")
                    
            # Be respectful - delay between URLs
            time.sleep(3)
            
        print(f"🎯 Found {len(self.new_patterns)} new patterns")
    
    def update_pattern_bank(self):
        """Update the patternbank.js file with new patterns"""
        if not self.new_patterns:
            print("ℹ️ No new patterns to add")
            return
            
        try:
            # Read current file
            with open('./app/lib/patternbank.js', 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Find where to insert new patterns (before the closing ];)
            # Look for the pattern that ends the array
            insert_pattern = r'(\s*)\];\s*\n\s*// Last updated:'
            match = re.search(insert_pattern, content)
            
            if not match:
                # Fallback: look for just the closing ]
                insert_pos = content.rfind('];')
                if insert_pos == -1:
                    print("❌ Could not find insertion point in patternbank.js")
                    return
                indent = '  '
            else:
                insert_pos = match.start()
                indent = match.group(1)  # Preserve existing indentation
                
            # Generate new pattern entries with proper formatting
            new_entries = []
            for pattern in self.new_patterns:
                # Format conditions properly
                conditions = pattern['conditions']
                conditions_str = f"""{{
{indent}    "complexity": "{conditions.get('complexity', 'auto')}",
{indent}    "sentenceCount": {conditions.get('sentenceCount', 1)},
{indent}    "voice": "{conditions.get('voice', 'mixed')}"
{indent}  }}"""
                
                # Format examples properly
                examples_str = json.dumps(pattern['examples'], indent=None)
                
                entry = f"""{indent}{{
{indent}  "id": "{pattern['id']}",
{indent}  "label": "{pattern['label']}",
{indent}  "structure": "{pattern['structure']}",
{indent}  "conditions": {conditions_str},
{indent}  "examples": {examples_str}
{indent}}}"""
                new_entries.append(entry)
                
            # Insert new patterns
            if new_entries:
                new_content = (
                    content[:insert_pos] + 
                    ',\n' + 
                    ',\n'.join(new_entries) + 
                    '\n' + 
                    content[insert_pos:]
                )
                
                # Update timestamp
                timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                new_content = re.sub(
                    r'// Last updated: .*',
                    f'// Last updated: {timestamp}',
                    new_content
                )
                
                # Write back
                with open('./app/lib/patternbank.js', 'w', encoding='utf-8') as f:
                    f.write(new_content)
                    
                print(f"✅ Added {len(self.new_patterns)} new patterns to patternbank.js")
                
                # Log what was added
                for pattern in self.new_patterns:
                    print(f"   + {pattern['id']}: {pattern['structure']}")
            
        except Exception as e:
            print(f"❌ Failed to update patternbank.js: {e}")
            import traceback
            traceback.print_exc()

def main():
    """Main entry point"""
    bot = PatternBot()
    
    try:
        bot.process_essays(max_urls=5)
        bot.update_pattern_bank()
        print("🎉 PatternBot completed successfully!")
        
    except KeyboardInterrupt:
        print("\n⚠️ Interrupted by user")
    except Exception as e:
        print(f"❌ Fatal error: {e}")

if __name__ == "__main__":
    main()