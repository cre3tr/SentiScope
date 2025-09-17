import pandas as pd
import streamlit as st

# Import the refactored processing function from your main analyzer script
from analyzer import process_feedback

def main():
    st.title("Customer Feedback Analyzer")
    st.write("Upload a .txt or .csv file to analyze customer comments for sentiment and top themes.")
    uploaded_file = st.file_uploader("Upload feedback file", type=["txt", "csv"])

    if uploaded_file:
        # Handle file based on type
        if uploaded_file.name.endswith('.txt'):
            comments = uploaded_file.read().decode('utf-8').splitlines()
            comments = [c.strip() for c in comments if c.strip()]
        elif uploaded_file.name.endswith('.csv'):
            try:
                df = pd.read_csv(uploaded_file)
                if 'comments' not in df.columns:
                    st.error("Error: CSV file must have a 'comments' column.")
                    return
                comments = df['comments'].dropna().astype(str).tolist()
            except Exception as e:
                st.error(f"Error reading or processing CSV file: {e}")
                return

        # Analyze and display
        sentiment_summary, top_keywords = process_feedback(comments)

        st.subheader("Sentiment Breakdown")
        for sentiment, percent in sentiment_summary.items():
            st.write(f"{sentiment}: {percent}")

        st.subheader("Top Themes")
        for word, count in top_keywords:
            st.write(f"{word} ({count} mentions)")

if __name__ == "__main__":
    main()