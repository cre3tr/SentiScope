import Sentiment from 'sentiment';

// A more comprehensive set of stop words for better keyword filtering, similar to NLTK's English stop words
const STOP_WORDS = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're", "you've", "you'll", "you'd",
  'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', "she's", 'her', 'hers',
  'herself', 'it', "it's", 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which',
  'who', 'whom', 'this', 'that', "that'll", 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if',
  'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between',
  'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out',
  'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why',
  'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
  'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', "don't", 'should',
  "should've", 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', "aren't", 'couldn', "couldn't",
  'didn', "didn't", 'doesn', "doesn't", 'hadn', "hadn't", 'hasn', "hasn't", 'haven', "haven't", 'isn', "isn't",
  'ma', 'mightn', "mightn't", 'mustn', "mustn't", 'needn', "needn't", 'shan', "shan't", 'shouldn', "shouldn't",
  'wasn', "wasn't", 'weren', "weren't", 'won', "won't", 'wouldn', "wouldn't"
]);

export interface SentimentAnalysisResult {
  sentimentSummary: Record<string, string>;
  topKeywords: Array<[string, number]>;
  totalComments: number;
  sentimentCounts: Record<string, number>;
}

export function analyzeFeedback(comments: string[]): SentimentAnalysisResult {
  const sentimentAnalyzer = new Sentiment();
  const sentiments: string[] = [];
  const keywordCounts: Record<string, number> = {};
  
  const sentimentCounts = {
    Positive: 0,
    Neutral: 0,
    Negative: 0
  };

  const validComments = comments.filter(c => c && c.trim().length > 0);
  
  if (validComments.length === 0) {
    return {
      sentimentSummary: {},
      topKeywords: [],
      totalComments: 0,
      sentimentCounts: { Positive: 0, Neutral: 0, Negative: 0 }
    };
  }

  for (const comment of validComments) {
    // 1. Analyze Sentiment
    const result = sentimentAnalyzer.analyze(comment);
    
    // Using a basic threshold logic comparable to the textblob logic
    // textblob polarity goes from -1 to 1. sentiment package score is an integer. 
    // comparative is a float that normalises score based on token count
    if (result.comparative > 0.05) {
      sentiments.push("Positive");
      sentimentCounts.Positive++;
    } else if (result.comparative < -0.05) {
      sentiments.push("Negative");
      sentimentCounts.Negative++;
    } else {
      sentiments.push("Neutral");
      sentimentCounts.Neutral++;
    }

    // 2. Extract Keywords
    // Match words and convert to lowercase
    const matches = comment.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    
    for (const word of matches) {
      if (!STOP_WORDS.has(word)) {
        keywordCounts[word] = (keywordCounts[word] || 0) + 1;
      }
    }
  }

  // Calculate sentiment summary percentages
  const total = validComments.length;
  const sentimentSummary: Record<string, string> = {
    Positive: `${Math.round((sentimentCounts.Positive / total) * 100)}%`,
    Neutral: `${Math.round((sentimentCounts.Neutral / total) * 100)}%`,
    Negative: `${Math.round((sentimentCounts.Negative / total) * 100)}%`,
  };

  // Get Top 5 Keywords
  const topKeywords = Object.entries(keywordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return {
    sentimentSummary,
    topKeywords,
    totalComments: total,
    sentimentCounts
  };
}
