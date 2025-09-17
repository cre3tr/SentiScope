import argparse
import re
from collections import Counter
from pathlib import Path
from typing import Dict, List, Set, Tuple

import pandas as pd
from textblob import TextBlob
from nltk.corpus import stopwords

# A more comprehensive set of stop words for better keyword filtering.
ADDITIONAL_STOP_WORDS: Set[str] = {'the', 'is', 'was', 'a', 'and', 'to', 'it'}
STOP_WORDS: Set[str] = set(stopwords.words('english')).union(ADDITIONAL_STOP_WORDS)

def load_comments_from_file(file_path: Path) -> List[str]:
    """Loads comments from a .txt or .csv file."""
    if file_path.suffix == '.txt':
        try:
            return [line.strip() for line in file_path.read_text(encoding='utf-8').splitlines() if line.strip()]
        except FileNotFoundError:
            raise FileNotFoundError(f"Error: The file '{file_path}' was not found.")
        except Exception as e:
            raise IOError(f"Error reading text file: {e}")

    elif file_path.suffix == '.csv':
        try:
            df = pd.read_csv(file_path)
            if 'comments' not in df.columns:
                raise ValueError("CSV file must have a 'comments' column.")
            return df['comments'].dropna().astype(str).tolist()
        except FileNotFoundError:
            raise FileNotFoundError(f"Error: The file '{file_path}' was not found.")
        except Exception as e:
            raise IOError(f"Error reading CSV file: {e}")

    raise ValueError(f"Unsupported file type: '{file_path.suffix}'. Please use .txt or .csv.")


def process_feedback(comments: List[str]) -> Tuple[Dict[str, str], List[Tuple[str, int]]]:
    """
    Analyzes a list of comments for sentiment and extracts top keywords.

    Args:
        comments: A list of strings, where each string is a feedback comment.

    Returns:
        A tuple containing:
        - A dictionary with sentiment breakdown (e.g., {'Positive': '60%'}).
        - A list of top 5 keywords and their counts.
    """
    sentiments = []
    keywords = []

    for comment in comments:
        blob = TextBlob(comment)
        sentiment_score = blob.sentiment.polarity

        # Classify sentiment based on polarity score
        if sentiment_score > 0.1:
            sentiments.append("Positive")
        elif sentiment_score < -0.1:
            sentiments.append("Negative")
        else:
            sentiments.append("Neutral")

        # Extract and filter keywords
        words = re.findall(r'\w+', comment.lower())
        key_words = [word for word in words if word not in STOP_WORDS and len(word) > 3]
        keywords.extend(key_words)

    # Calculate sentiment summary
    sentiment_counts = Counter(sentiments)
    total_comments = len(comments)
    if total_comments == 0:
        return {}, []

    sentiment_summary = {k: f"{(v / total_comments) * 100:.0f}%" for k, v in sentiment_counts.items()}
    top_keywords = Counter(keywords).most_common(5)

    return sentiment_summary, top_keywords


def write_results(output_path: Path, sentiment_summary: Dict[str, str], top_keywords: List[Tuple[str, int]]):
    """Writes the analysis results to a file and prints them to the console."""
    output_lines = []
    output_lines.append("Sentiment Breakdown:")
    for sentiment, percent in sentiment_summary.items():
        output_lines.append(f"{sentiment}: {percent}")

    output_lines.append("\nTop Themes:")
    for word, count in top_keywords:
        output_lines.append(f"{word} ({count} mentions)")

    output_content = "\n".join(output_lines)

    try:
        output_path.write_text(output_content, encoding='utf-8')
        print("Analysis complete. Results saved to:", output_path)
        print("-" * 20)
        print(output_content)
    except IOError as e:
        print(f"Error writing to output file '{output_path}': {e}")


def main():
    """Main function to run the feedback analysis from the command line."""
    parser = argparse.ArgumentParser(description="Analyze customer feedback from .txt or .csv files.")
    parser.add_argument("input_file", type=str, help="Path to the input feedback file (e.g., feedback.txt).")
    parser.add_argument("-o", "--output", type=str, default="results.txt", help="Path to the output results file (default: results.txt).")
    args = parser.parse_args()

    input_path = Path(args.input_file)
    output_path = Path(args.output)

    try:
        comments = load_comments_from_file(input_path)
        sentiment_summary, top_keywords = process_feedback(comments)
        write_results(output_path, sentiment_summary, top_keywords)
    except (FileNotFoundError, ValueError, IOError) as e:
        print(f"An error occurred: {e}")


if __name__ == "__main__":
    main()