import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from typing import Dict, List, Any
import json
from textblob import TextBlob
import statistics

# Download required NLTK data
try:
    nltk.data.find('vader_lexicon')
except LookupError:
    nltk.download('vader_lexicon')

def analyze_sentiment(text: str) -> Dict[str, Any]:
    """
    Analyze the sentiment of a single text using TextBlob.
    Returns a dictionary with sentiment details.
    """
    analysis = TextBlob(text)
    
    # Get polarity (-1 to 1) and subjectivity (0 to 1)
    polarity = analysis.sentiment.polarity
    subjectivity = analysis.sentiment.subjectivity
    
    # Determine overall sentiment
    if polarity > 0:
        overall_sentiment = 'positive'
    elif polarity < 0:
        overall_sentiment = 'negative'
    else:
        overall_sentiment = 'neutral'
    
    return {
        'polarity': polarity,
        'subjectivity': subjectivity,
        'overall_sentiment': overall_sentiment
    }

def analyze_feedback_batch(feedback_list: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Analyze sentiment for a batch of feedback messages.
    Returns aggregate statistics and individual sentiments.
    """
    if not feedback_list:
        return {
            'aggregate_stats': {
                'total_feedback': 0,
                'average_polarity': 0,
                'average_subjectivity': 0,
                'sentiment_counts': {
                    'positive': 0,
                    'negative': 0,
                    'neutral': 0
                },
                'percentages': {
                    'positive': 0,
                    'negative': 0,
                    'neutral': 0
                }
            },
            'individual_sentiments': []
        }
    
    # Analyze each feedback
    individual_sentiments = []
    polarities = []
    subjectivities = []
    sentiment_counts = {'positive': 0, 'negative': 0, 'neutral': 0}
    
    for feedback in feedback_list:
        sentiment = analyze_sentiment(feedback['message'])
        individual_sentiments.append({
            'id': feedback['id'],
            'sentiment': sentiment
        })
        polarities.append(sentiment['polarity'])
        subjectivities.append(sentiment['subjectivity'])
        sentiment_counts[sentiment['overall_sentiment']] += 1
    
    # Calculate aggregate statistics
    total_feedback = len(feedback_list)
    average_polarity = statistics.mean(polarities)
    average_subjectivity = statistics.mean(subjectivities)
    
    # Calculate percentages
    percentages = {
        sentiment: (count / total_feedback) * 100
        for sentiment, count in sentiment_counts.items()
    }
    
    return {
        'aggregate_stats': {
            'total_feedback': total_feedback,
            'average_polarity': average_polarity,
            'average_subjectivity': average_subjectivity,
            'sentiment_counts': sentiment_counts,
            'percentages': percentages
        },
        'individual_sentiments': individual_sentiments
    } 