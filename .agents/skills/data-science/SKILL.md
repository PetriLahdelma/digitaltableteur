---
name: data-science
description: Expert data science guidance for analytics, data processing, visualization, statistical analysis, machine learning, and AI integration. Use when analyzing data, building ML models, creating visualizations, processing datasets, conducting A/B tests, optimizing metrics, or integrating AI features. Includes Python (pandas, scikit-learn), data pipelines, and model deployment.
allowed-tools: Read, Bash(python:*), Bash(pip:*), Bash(jupyter:*), Bash(npx:*)
---

# Data Science Expert

## Core Data Science Principles

When working with data and AI, always follow these principles:

1. **Data Quality First**: Garbage in, garbage out (GIGO)
2. **Reproducibility**: Code, environment, and random seeds must be version-controlled
3. **Interpretability**: Prefer explainable models over black boxes when possible
4. **Bias Awareness**: Audit for demographic, sampling, and algorithmic bias
5. **Privacy & Security**: Never log PII, use encryption, follow GDPR/compliance
6. **Validation**: Test on held-out data, avoid data leakage

---

## Data Analysis Stack

### Python Ecosystem

```python
# Core Libraries
import pandas as pd           # Data manipulation
import numpy as np            # Numerical computing
import matplotlib.pyplot as plt  # Visualization
import seaborn as sns         # Statistical visualization

# Machine Learning
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

# Deep Learning (optional)
import torch                  # PyTorch
# OR
import tensorflow as tf       # TensorFlow

# AI/LLM Integration
from openai import OpenAI     # OpenAI API
# OR
import anthropic              # Codex API
```

### JavaScript/TypeScript (Web Analytics)

```typescript
// Analytics Events
import { track } from '@/lib/analytics';

track('button_clicked', {
  component: 'CTA',
  location: 'homepage',
  variant: 'primary'
});

// Visualization
import { Chart } from 'chart.js';
import * as d3 from 'd3'; // For custom visualizations
```

---

## Data Processing with Pandas

### Loading Data

```python
import pandas as pd

# CSV
df = pd.read_csv('data.csv')

# JSON (e.g., analytics export)
df = pd.read_json('analytics.json')

# Excel
df = pd.read_excel('report.xlsx', sheet_name='Sheet1')

# SQL
import sqlite3
conn = sqlite3.connect('database.db')
df = pd.read_sql_query('SELECT * FROM events', conn)

# API (e.g., Google Analytics)
import requests
response = requests.get('https://api.example.com/data')
df = pd.DataFrame(response.json())
```

### Data Cleaning

```python
# Inspect data
df.info()                # Column types, missing values
df.describe()            # Summary statistics
df.head()                # First 5 rows

# Handle missing values
df.isnull().sum()        # Count nulls per column
df.dropna()              # Remove rows with nulls
df.fillna(0)             # Fill nulls with 0
df['column'].fillna(df['column'].mean())  # Fill with mean

# Remove duplicates
df.drop_duplicates()

# Fix data types
df['date'] = pd.to_datetime(df['date'])
df['count'] = df['count'].astype(int)

# Rename columns
df.rename(columns={'old_name': 'new_name'}, inplace=True)

# Filter rows
df[df['value'] > 100]    # Boolean indexing
df.query('value > 100')  # SQL-like syntax
```

### Data Transformation

```python
# Create new columns
df['total'] = df['price'] * df['quantity']

# Apply functions
df['upper_name'] = df['name'].apply(str.upper)

# Group and aggregate
df.groupby('category')['sales'].sum()
df.groupby('category').agg({
    'sales': 'sum',
    'quantity': 'mean',
    'price': ['min', 'max']
})

# Pivot tables
df.pivot_table(
    values='sales',
    index='month',
    columns='category',
    aggfunc='sum'
)

# Merge datasets
df_merged = pd.merge(df1, df2, on='id', how='left')
```

---

## Exploratory Data Analysis (EDA)

### Statistical Summaries

```python
import pandas as pd
import numpy as np

# Central tendency
df['column'].mean()      # Average
df['column'].median()    # Middle value
df['column'].mode()      # Most frequent

# Spread
df['column'].std()       # Standard deviation
df['column'].var()       # Variance
df['column'].quantile([0.25, 0.5, 0.75])  # Quartiles

# Distribution
df['column'].skew()      # Asymmetry (-1 to 1)
df['column'].kurtosis()  # Tail heaviness

# Correlation
df.corr()                # Correlation matrix
df['col1'].corr(df['col2'])  # Pairwise correlation
```

### Visualization

```python
import matplotlib.pyplot as plt
import seaborn as sns

# Set style
sns.set_style('whitegrid')
plt.rcParams['figure.figsize'] = (10, 6)

# Distribution plot
sns.histplot(df['value'], kde=True)
plt.title('Value Distribution')
plt.show()

# Box plot (outlier detection)
sns.boxplot(x='category', y='value', data=df)
plt.title('Value by Category')
plt.show()

# Scatter plot (relationships)
sns.scatterplot(x='feature1', y='feature2', hue='category', data=df)
plt.title('Feature Relationship')
plt.show()

# Correlation heatmap
corr = df.corr()
sns.heatmap(corr, annot=True, cmap='coolwarm', center=0)
plt.title('Feature Correlations')
plt.show()

# Time series
df.set_index('date')['value'].plot()
plt.title('Value Over Time')
plt.show()
```

---

## A/B Testing & Statistical Significance

### Chi-Square Test (Categorical)

**Use Case**: Test if conversion rates differ between variants

```python
import scipy.stats as stats

# Data
#         Converted  Not Converted
# Variant A:  120        880
# Variant B:  150        850

observed = [[120, 880], [150, 850]]
chi2, p_value, dof, expected = stats.chi2_contingency(observed)

print(f'Chi-squared: {chi2:.4f}')
print(f'P-value: {p_value:.4f}')

if p_value < 0.05:
    print('Statistically significant difference (reject null hypothesis)')
else:
    print('No significant difference (fail to reject null hypothesis)')
```

### T-Test (Continuous)

**Use Case**: Test if average session duration differs

```python
from scipy.stats import ttest_ind

# Data
variant_a = [45, 52, 48, 60, 55, ...]  # Session durations
variant_b = [50, 58, 62, 65, 70, ...]

t_stat, p_value = ttest_ind(variant_a, variant_b)

print(f'T-statistic: {t_stat:.4f}')
print(f'P-value: {p_value:.4f}')

if p_value < 0.05:
    print('Statistically significant difference')
```

### Sample Size Calculator

```python
from statsmodels.stats.power import zt_ind_solve_power

# Calculate required sample size
effect_size = 0.1  # 10% lift
alpha = 0.05       # Significance level
power = 0.8        # Statistical power (80%)

sample_size = zt_ind_solve_power(
    effect_size=effect_size,
    alpha=alpha,
    power=power,
    alternative='two-sided'
)

print(f'Required sample size per variant: {int(sample_size)}')
```

---

## Machine Learning Workflow

### 1. Data Preparation

```python
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder

# Load data
df = pd.read_csv('data.csv')

# Separate features and target
X = df.drop('target', axis=1)
y = df['target']

# Handle categorical variables
le = LabelEncoder()
X['category'] = le.fit_transform(X['category'])

# Handle missing values
X.fillna(X.mean(), inplace=True)

# Split data (80% train, 20% test)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Feature scaling (important for some algorithms)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)
```

### 2. Model Training (Classification)

```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC

# Random Forest (good baseline)
rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X_train, y_train)

# Logistic Regression (interpretable)
lr = LogisticRegression(random_state=42)
lr.fit(X_train_scaled, y_train)

# Support Vector Machine (complex boundaries)
svm = SVC(kernel='rbf', random_state=42)
svm.fit(X_train_scaled, y_train)
```

### 3. Model Evaluation

```python
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)

# Predictions
y_pred = rf.predict(X_test)

# Metrics
accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred, average='weighted')
recall = recall_score(y_test, y_pred, average='weighted')
f1 = f1_score(y_test, y_pred, average='weighted')

print(f'Accuracy: {accuracy:.4f}')
print(f'Precision: {precision:.4f}')
print(f'Recall: {recall:.4f}')
print(f'F1 Score: {f1:.4f}')

# Confusion Matrix
cm = confusion_matrix(y_test, y_pred)
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
plt.title('Confusion Matrix')
plt.show()

# Detailed report
print(classification_report(y_test, y_pred))
```

### 4. Feature Importance

```python
import matplotlib.pyplot as plt

# For tree-based models
importances = rf.feature_importances_
features = X.columns

# Sort by importance
indices = np.argsort(importances)[::-1]

# Plot
plt.figure(figsize=(10, 6))
plt.bar(range(len(importances)), importances[indices])
plt.xticks(range(len(importances)), features[indices], rotation=45)
plt.title('Feature Importances')
plt.tight_layout()
plt.show()

# Top 5 features
for i in range(5):
    print(f'{features[indices[i]]}: {importances[indices[i]]:.4f}')
```

### 5. Model Persistence

```python
import joblib

# Save model
joblib.dump(rf, 'model.pkl')

# Load model
loaded_model = joblib.load('model.pkl')

# Make predictions
new_data = [[1, 2, 3, 4, 5]]
prediction = loaded_model.predict(new_data)
```

---

## AI/LLM Integration

### OpenAI API (GPT-4)

```python
from openai import OpenAI
import os

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Chat completion
response = client.chat.completions.create(
    model='gpt-4',
    messages=[
        {'role': 'system', 'content': 'You are a helpful design system assistant.'},
        {'role': 'user', 'content': 'Suggest 5 color names for a tech startup.'}
    ],
    temperature=0.7,
    max_tokens=200
)

print(response.choices[0].message.content)
```

### Anthropic API (Codex)

```python
import anthropic
import os

client = anthropic.Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))

# Message creation
message = client.messages.create(
    model='Codex-sonnet-4-20250514',
    max_tokens=1024,
    messages=[
        {'role': 'user', 'content': 'Explain design tokens in simple terms.'}
    ]
)

print(message.content[0].text)
```

### Embeddings for Semantic Search

```python
from openai import OpenAI

client = OpenAI()

# Create embeddings
def get_embedding(text, model='text-embedding-3-small'):
    response = client.embeddings.create(input=text, model=model)
    return response.data[0].embedding

# Example: Search documentation
docs = [
    'Design tokens are reusable design decisions.',
    'Components are UI building blocks.',
    'Accessibility ensures inclusive experiences.'
]

# Generate embeddings
embeddings = [get_embedding(doc) for doc in docs]

# Query
query = 'What are design tokens?'
query_embedding = get_embedding(query)

# Calculate similarity (cosine)
from sklearn.metrics.pairwise import cosine_similarity

similarities = cosine_similarity([query_embedding], embeddings)[0]
best_match_idx = np.argmax(similarities)

print(f'Best match: {docs[best_match_idx]}')
print(f'Similarity: {similarities[best_match_idx]:.4f}')
```

---

## Web Analytics Integration

### Google Analytics 4 (GA4) API

```python
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    RunReportRequest,
    Dimension,
    Metric,
    DateRange
)

# Initialize client
client = BetaAnalyticsDataClient()

# Run report
request = RunReportRequest(
    property=f'properties/{PROPERTY_ID}',
    dimensions=[
        Dimension(name='pagePath'),
        Dimension(name='deviceCategory')
    ],
    metrics=[
        Metric(name='sessions'),
        Metric(name='screenPageViews'),
        Metric(name='averageSessionDuration')
    ],
    date_ranges=[DateRange(start_date='30daysAgo', end_date='today')]
)

response = client.run_report(request)

# Process results
data = []
for row in response.rows:
    data.append({
        'page': row.dimension_values[0].value,
        'device': row.dimension_values[1].value,
        'sessions': int(row.metric_values[0].value),
        'pageviews': int(row.metric_values[1].value),
        'avg_duration': float(row.metric_values[2].value)
    })

df = pd.DataFrame(data)
print(df.head())
```

### Vercel Analytics API

```typescript
// Track custom events in Next.js
import { track } from '@vercel/analytics';

track('service_page_viewed', {
  service: 'design-system-lift-off',
  source: 'homepage-cta'
});

// Track conversions
track('consultation_booked', {
  service: 'ai-ux-sprint',
  value: 12000  // Revenue (optional)
});
```

---

## Data Visualization Best Practices

### Choosing Chart Types

| Data Type | Question | Chart Type |
|-----------|----------|------------|
| **Single Value** | What's the total? | Big Number, KPI Card |
| **Comparison** | How do categories compare? | Bar Chart (horizontal for long labels) |
| **Distribution** | What's the range? | Histogram, Box Plot |
| **Trend** | How does it change over time? | Line Chart, Area Chart |
| **Part-to-Whole** | What's the composition? | Pie Chart (3-5 slices), Stacked Bar |
| **Relationship** | How do two variables relate? | Scatter Plot |
| **Ranking** | What's the order? | Sorted Bar Chart |
| **Geographic** | Where is it happening? | Map, Choropleth |

### Chart.js (Web)

```typescript
import { Chart } from 'chart.js/auto';

const ctx = document.getElementById('myChart') as HTMLCanvasElement;
const chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [{
      label: 'Website Traffic',
      data: [1200, 1900, 1500, 2200, 2800],
      borderColor: 'rgb(0, 102, 204)',
      backgroundColor: 'rgba(0, 102, 204, 0.1)',
      tension: 0.3
    }]
  },
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Monthly Website Traffic'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});
```

### D3.js (Custom Visualizations)

```typescript
import * as d3 from 'd3';

// Simple bar chart
const data = [30, 80, 45, 60, 20, 90, 50];
const width = 400;
const height = 200;

const svg = d3.select('#chart')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

const x = d3.scaleBand()
  .domain(data.map((d, i) => i.toString()))
  .range([0, width])
  .padding(0.1);

const y = d3.scaleLinear()
  .domain([0, d3.max(data) || 0])
  .range([height, 0]);

svg.selectAll('rect')
  .data(data)
  .enter()
  .append('rect')
  .attr('x', (d, i) => x(i.toString()) || 0)
  .attr('y', d => y(d))
  .attr('width', x.bandwidth())
  .attr('height', d => height - y(d))
  .attr('fill', 'steelblue');
```

---

## Data Pipeline Architecture

### ETL Pattern (Extract, Transform, Load)

```python
import pandas as pd
import requests
from datetime import datetime

def extract():
    """Extract data from source"""
    # From API
    response = requests.get('https://api.example.com/data')
    data = response.json()
    return pd.DataFrame(data)

def transform(df):
    """Clean and transform data"""
    # Remove nulls
    df = df.dropna()

    # Fix types
    df['date'] = pd.to_datetime(df['date'])
    df['value'] = df['value'].astype(float)

    # Add computed columns
    df['month'] = df['date'].dt.month
    df['year'] = df['date'].dt.year

    # Filter
    df = df[df['value'] > 0]

    return df

def load(df, output_path):
    """Load data to destination"""
    # To CSV
    df.to_csv(output_path, index=False)

    # OR to database
    # df.to_sql('table_name', conn, if_exists='replace')

# Run pipeline
if __name__ == '__main__':
    print('Starting ETL pipeline...')

    # Extract
    raw_data = extract()
    print(f'Extracted {len(raw_data)} rows')

    # Transform
    clean_data = transform(raw_data)
    print(f'Transformed to {len(clean_data)} rows')

    # Load
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    output = f'data/processed_{timestamp}.csv'
    load(clean_data, output)
    print(f'Loaded to {output}')
```

### Scheduled Jobs (cron)

```python
# schedule_analytics.py
import schedule
import time

def fetch_daily_analytics():
    """Fetch and process analytics data"""
    print('Fetching analytics...')
    # Extract, transform, load
    # ...

# Schedule daily at 2 AM
schedule.every().day.at('02:00').do(fetch_daily_analytics)

# Run scheduler
while True:
    schedule.run_pending()
    time.sleep(60)
```

---

## Privacy & Security

### Data Anonymization

```python
import hashlib

def anonymize_email(email):
    """Hash email for privacy"""
    return hashlib.sha256(email.encode()).hexdigest()

# Example
df['email_hash'] = df['email'].apply(anonymize_email)
df.drop('email', axis=1, inplace=True)  # Remove PII
```

### GDPR Compliance Checklist

- [ ] **Consent**: Explicit opt-in for analytics tracking
- [ ] **Right to Access**: API for users to request their data
- [ ] **Right to Deletion**: Ability to purge user data
- [ ] **Data Minimization**: Only collect necessary data
- [ ] **Encryption**: Encrypt data at rest and in transit
- [ ] **Audit Logs**: Track who accessed what data and when
- [ ] **Data Retention**: Auto-delete after retention period

### Rate Limiting (API Protection)

```python
from functools import wraps
from time import time

# Simple rate limiter
rate_limit = {}

def rate_limit_decorator(max_calls=10, period=60):
    """Allow max_calls per period (seconds)"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            now = time()
            key = func.__name__

            if key not in rate_limit:
                rate_limit[key] = []

            # Remove old calls outside period
            rate_limit[key] = [t for t in rate_limit[key] if now - t < period]

            if len(rate_limit[key]) >= max_calls:
                raise Exception(f'Rate limit exceeded: {max_calls} calls per {period}s')

            rate_limit[key].append(now)
            return func(*args, **kwargs)

        return wrapper
    return decorator

@rate_limit_decorator(max_calls=5, period=60)
def call_ai_api(prompt):
    # API call
    pass
```

---

## Model Deployment (Production)

### Serverless Function (Vercel)

```python
# api/predict.py
import joblib
import json
from http.server import BaseHTTPRequestHandler

# Load model once (cold start)
model = joblib.load('model.pkl')

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        # Read request body
        content_length = int(self.headers['Content-Length'])
        body = self.rfile.read(content_length)
        data = json.loads(body)

        # Make prediction
        features = data['features']
        prediction = model.predict([features])[0]
        probability = model.predict_proba([features])[0].tolist()

        # Return response
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()

        response = {
            'prediction': int(prediction),
            'probability': probability
        }

        self.wfile.write(json.dumps(response).encode())
```

### Docker Container

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy model and code
COPY model.pkl .
COPY app.py .

# Expose port
EXPOSE 8000

# Run app
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

```python
# app.py
from fastapi import FastAPI
import joblib

app = FastAPI()
model = joblib.load('model.pkl')

@app.post('/predict')
async def predict(features: list[float]):
    prediction = model.predict([features])[0]
    return {'prediction': int(prediction)}
```

---

## Metrics for Design Systems

### Component Usage Analytics

```python
import pandas as pd

# Sample data: component usage logs
data = {
    'component': ['Button', 'Card', 'Button', 'Input', 'Card', 'Button'],
    'page': ['home', 'about', 'contact', 'contact', 'work', 'home'],
    'timestamp': ['2025-01-01', '2025-01-01', '2025-01-02', '2025-01-02', '2025-01-03', '2025-01-03']
}

df = pd.DataFrame(data)

# Top components
component_usage = df['component'].value_counts()
print('Top Components:')
print(component_usage)

# Usage by page
page_usage = df.groupby(['page', 'component']).size().unstack(fill_value=0)
print('\nUsage by Page:')
print(page_usage)

# Growth over time
df['date'] = pd.to_datetime(df['timestamp'])
daily_usage = df.groupby('date').size()
print('\nDaily Usage:')
print(daily_usage)
```

### Design Token Adoption

```python
# Track which tokens are actually used in production
import re

def extract_tokens_from_css(css_content):
    """Extract CSS variable usage from stylesheets"""
    pattern = r'var\((--[a-zA-Z0-9-]+)\)'
    tokens = re.findall(pattern, css_content)
    return tokens

# Example
css = """
.button {
  background-color: var(--color-primary);
  padding: var(--space-16);
  border-radius: var(--radius-md);
}
"""

tokens_used = extract_tokens_from_css(css)
print(f'Tokens used: {set(tokens_used)}')
```

---

## When to Use This Skill

Activate this skill when:
- Analyzing user behavior or analytics data
- Conducting A/B tests or experiments
- Building machine learning models
- Processing large datasets
- Creating data visualizations
- Integrating AI/LLM features
- Designing data pipelines
- Calculating statistical significance
- Extracting insights from logs
- Forecasting trends or metrics
- Optimizing conversion funnels
- Measuring design system adoption
- Deploying ML models to production
- Ensuring GDPR/privacy compliance

**Remember**: Always validate assumptions with data, test models rigorously, and prioritize user privacy and security.
