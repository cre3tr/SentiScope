from textblob import TextBlob
from collections import Counter
import re
from nltk.corpus import stopwords
import pandas as pd

def analyze_feedback(file_path):
    # Load comments based on file type
    if file_path.endswith('.txt'):
        with open(file_path, 'r') as file:
            comments = [line.strip() for line in file.readlines() if line.strip()]
    elif file_path.endswith('.csv'):
        df = pd.read_csv(file_path)
        if 'comments' not in df.columns:
            raise ValueError("CSV must have a 'comments' column")
        comments = df['comments'].dropna().tolist()
    else:
        raise ValueError("File must be .txt or .csv")

    # Process comments
    sentiments = []
    keywords = []
    stop_words = set(stopwords.words('english')).union({'the', 'is', 'was', 'a', 'and', 'to', 'it'})

    for comment in comments:
        # Sentiment analysis
        blob = TextBlob(comment)
        sentiment_score = blob.sentiment.polarity
        if sentiment_score > 0.1:
            sentiments.append("Positive")
        elif sentiment_score < -0.1:
            sentiments.append("Negative")
        else:
            sentiments.append("Neutral")

        # Extract keywords
        words = re.findall(r'\w+', comment.lower())
        key_words = [word for word in words if word not in stop_words and len(word) > 3]
        keywords.extend(key_words)

    # Summarize results
    sentiment_counts = Counter(sentiments)
    total = sum(sentiment_counts.values())
    sentiment_summary = {k: f"{(v/total)*100:.0f}%" for k, v in sentiment_counts.items()}

    top_keywords = Counter(keywords).most_common(5)

    # Write to results file
    with open("results.txt", "w") as result_file:
        result_file.write("Sentiment Breakdown:\n")
        for sentiment, percent in sentiment_summary.items():
            result_file.write(f"{sentiment}: {percent}\n")
        result_file.write("\nTop Themes:\n")
        for word, count in top_keywords:
            result_file.write(f"{word} ({count} mentions)\n")

    # Print for immediate feedback
    with open("results.txt", "r") as result_file:
        print(result_file.read())

if __name__ == "__main__":
    # Test with either file type
    try:
        analyze_feedback("feedback.txt")  # or "feedback.csv"
    except Exception as e:
        print(f"Error: {e}")