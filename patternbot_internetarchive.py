# === patternbot_internetarchive.py ===

import asyncio
from playwright.async_api import async_playwright
import requests
import re
from bs4 import BeautifulSoup

# === HEADLESS SCRAPER ===
async def fetch_with_playwright(url):
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context()
            page = await context.new_page()
            await page.goto(url, timeout=30000)
            await page.wait_for_load_state("networkidle")

            # Remove cookie banners or overlays if present
            try:
                await page.click("button:has-text('Accept')")
            except:
                pass

            content = await page.content()
            await browser.close()
            return content
    except Exception as e:
        print(f"❌ Playwright fetch failed for {url}: {e}")
        return None

# === INTERNET ARCHIVE FALLBACK ===
def get_archive_url(original_url):
    try:
        archive_url = f"https://web.archive.org/web/*/{original_url}"
        resp = requests.get(archive_url, timeout=10)
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, "html.parser")
            snapshot = soup.find("a", href=re.compile(r"/web/\d+/.+"))
            if snapshot:
                return "https://web.archive.org" + snapshot["href"]
        return None
    except Exception as e:
        print(f"❌ Archive.org lookup failed: {e}")
        return None

# === EXTRACT CLEAN PARAGRAPHS FROM HTML ===
def extract_paragraphs_from_html(html):
    try:
        soup = BeautifulSoup(html, "html.parser")
        paragraphs = soup.find_all("p")
        clean_paras = []
        for p in paragraphs:
            text = p.get_text(strip=True)
            if len(text.split()) > 15 and text.count(".") >= 2:
                clean_paras.append(' '.join(text.split()))
        return clean_paras[:3]
    except Exception as e:
        print(f"❌ Paragraph parse error: {e}")
        return []

# === TEST FUNCTION ===
async def test_extraction(url):
    print(f"📥 Fetching: {url}")
    html = await fetch_with_playwright(url)
    if not html:
        archive_url = get_archive_url(url)
        if archive_url:
            print(f"🌐 Trying archive snapshot: {archive_url}")
            html = await fetch_with_playwright(archive_url)
    if html:
        paras = extract_paragraphs_from_html(html)
        for p in paras:
            print(f"\n📄 Paragraph: {p[:200]}...")
    else:
        print("⚠️ Failed to extract any content.")

# === ENTRY POINT ===
if __name__ == "__main__":
    test_url = "https://www.researchgate.net/publication/331940913_Student_engagement_research_2010-2018_continuity_and_emergence"
    asyncio.run(test_extraction(test_url))
