import spacy
import sys
import json

nlp = spacy.load("en_core_web_sm")
nlp.max_length = 2000000

def fix_and_which_clauses(text):
    doc = nlp(text)
    results = []

    for sent in doc.sents:
        if 'and which' in sent.text:
            fixed = sent.text.replace(', and which', ', which').replace(' and which', ' which')
            if fixed != sent.text:
                results.append({
                    "sentence": sent.text,
                    "span": sent.text.strip(),
                    "fix": fixed.strip()
                })

    return results

if __name__ == "__main__":
    text = sys.stdin.read()
    result = fix_and_which_clauses(text)
    print(json.dumps(result))
