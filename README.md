# Code Harvey Pattern Bot

A tool for scraping academic writing patterns from the web and adding them to the Code Harvey pattern bank.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create a `.env` file with your API keys:
```
OPENAI_API_KEY=your_openai_key_here
GOOGLE_API_KEY=your_google_key_here  # Optional
CSE_ID=your_google_cse_id_here  # Optional
```

## Usage

Run the pattern bot to scrape academic writing patterns:
```bash
python patternbot.py
```

This will:
1. Search for academic writing samples using DuckDuckGo
2. Extract paragraphs from these sources
3. Match patterns using the JS pattern matcher
4. Update the pattern bank with new patterns
5. Create a backup of matched patterns in `pattern_matches_backup.jsonl`

### Command-line Options

The script supports several command-line options:

- `--update-timestamp`: Only update the timestamp in patternbank.js without scraping new patterns
  ```bash
  python patternbot.py --update-timestamp
  ```

- `--queries N`: Specify the number of search queries to run (default: 1)
  ```bash
  python patternbot.py --queries 3
  ```

- `--install-deps`: Install required dependencies from requirements.txt
  ```bash
  python patternbot.py --install-deps
  ```

## Troubleshooting

- If you encounter DuckDuckGo rate limits, the script will pause and retry
- For PDF extraction, make sure PyPDF2 is installed
- If pattern matching fails, check that the Node.js tools are properly set up

## Command-line Pattern Matching

To match patterns from the command line:
```bash
node matchPatternCLI.js "Your text here"
``` 