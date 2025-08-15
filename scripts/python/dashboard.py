#!/usr/bin/env python3
"""
Token Usage Dashboard - Interactive visualization of token usage
Usage: streamlit run scripts/python/dashboard.py
"""

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
import numpy as np
from pathlib import Path
import json

# Page config
st.set_page_config(
    page_title="Meterr Token Analytics",
    page_icon="📊",
    layout="wide"
)

st.title("📊 Meterr Token Usage Analytics")
st.markdown("Real-time analysis of LLM token usage and costs")

# Sidebar
with st.sidebar:
    st.header("Configuration")
    
    # Date range selector
    date_range = st.date_input(
        "Select Date Range",
        value=(datetime.now() - timedelta(days=7), datetime.now()),
        max_value=datetime.now()
    )
    
    # Model filter
    models = ['All', 'gpt-4', 'gpt-3.5-turbo', 'claude-3-opus', 'claude-3-sonnet']
    selected_model = st.selectbox("Select Model", models)
    
    # Refresh button
    if st.button("🔄 Refresh Data"):
        st.rerun()

# Generate sample data (replace with real data loading)
def generate_sample_data():
    np.random.seed(42)
    dates = pd.date_range(start=date_range[0], end=date_range[1], freq='H')
    
    data = []
    for date in dates:
        for model in models[1:]:  # Skip 'All'
            data.append({
                'timestamp': date,
                'model': model,
                'tokens': np.random.randint(100, 10000),
                'cost': np.random.uniform(0.01, 1.0),
                'requests': np.random.randint(1, 50)
            })
    
    return pd.DataFrame(data)

df = generate_sample_data()

# Filter by selected model
if selected_model != 'All':
    df = df[df['model'] == selected_model]

# Main content
col1, col2, col3, col4 = st.columns(4)

with col1:
    total_tokens = df['tokens'].sum()
    st.metric("Total Tokens", f"{total_tokens:,.0f}", "↑ 12.5%")

with col2:
    total_cost = df['cost'].sum()
    st.metric("Total Cost", f"${total_cost:,.2f}", "↑ 8.3%")

with col3:
    total_requests = df['requests'].sum()
    st.metric("Total Requests", f"{total_requests:,.0f}", "↑ 15.2%")

with col4:
    avg_tokens = df['tokens'].mean()
    st.metric("Avg Tokens/Request", f"{avg_tokens:,.0f}", "↓ 3.1%")

# Charts
st.markdown("---")

col1, col2 = st.columns(2)

with col1:
    st.subheader("📈 Token Usage Over Time")
    
    # Group by date and model
    daily_usage = df.groupby([pd.Grouper(key='timestamp', freq='D'), 'model'])['tokens'].sum().reset_index()
    
    fig = px.line(
        daily_usage,
        x='timestamp',
        y='tokens',
        color='model',
        title="Daily Token Usage by Model",
        labels={'tokens': 'Tokens', 'timestamp': 'Date'}
    )
    fig.update_layout(height=400)
    st.plotly_chart(fig, use_container_width=True)

with col2:
    st.subheader("💰 Cost Distribution")
    
    # Cost by model
    cost_by_model = df.groupby('model')['cost'].sum().reset_index()
    
    fig = px.pie(
        cost_by_model,
        values='cost',
        names='model',
        title="Cost Distribution by Model",
        hole=0.4
    )
    fig.update_layout(height=400)
    st.plotly_chart(fig, use_container_width=True)

# Detailed table
st.markdown("---")
st.subheader("📑 Detailed Usage Table")

# Aggregate by hour for display
hourly_data = df.groupby([pd.Grouper(key='timestamp', freq='H'), 'model']).agg({
    'tokens': 'sum',
    'cost': 'sum',
    'requests': 'sum'
}).reset_index()

# Add cost per token
hourly_data['cost_per_1k_tokens'] = (hourly_data['cost'] / hourly_data['tokens']) * 1000

# Display with formatting
st.dataframe(
    hourly_data.style.format({
        'tokens': '{:,.0f}',
        'cost': '${:.4f}',
        'requests': '{:,.0f}',
        'cost_per_1k_tokens': '${:.4f}'
    }),
    use_container_width=True
)

# Heatmap
st.markdown("---")
st.subheader("🌡️ Usage Heatmap")

# Create hourly heatmap data
heatmap_data = df.copy()
heatmap_data['hour'] = heatmap_data['timestamp'].dt.hour
heatmap_data['day'] = heatmap_data['timestamp'].dt.date

heatmap_pivot = heatmap_data.pivot_table(
    values='tokens',
    index='hour',
    columns='day',
    aggfunc='sum',
    fill_value=0
)

fig = go.Figure(data=go.Heatmap(
    z=heatmap_pivot.values,
    x=[str(d) for d in heatmap_pivot.columns],
    y=heatmap_pivot.index,
    colorscale='Viridis',
    colorbar=dict(title="Tokens")
))

fig.update_layout(
    title="Token Usage Heatmap (Hour vs Day)",
    xaxis_title="Date",
    yaxis_title="Hour of Day",
    height=500
)

st.plotly_chart(fig, use_container_width=True)

# Predictions
st.markdown("---")
st.subheader("🔮 Cost Predictions")

col1, col2 = st.columns(2)

with col1:
    # Simple linear projection
    daily_avg = df.groupby(pd.Grouper(key='timestamp', freq='D'))['cost'].sum().mean()
    
    st.info(f"""
    **Based on current usage:**
    - Daily Average: ${daily_avg:.2f}
    - Weekly Projection: ${daily_avg * 7:.2f}
    - Monthly Projection: ${daily_avg * 30:.2f}
    - Annual Projection: ${daily_avg * 365:.2f}
    """)

with col2:
    # Savings calculation
    st.success(f"""
    **Potential Savings with Meterr:**
    - Current Monthly Cost: ${daily_avg * 30:.2f}
    - With 30% Optimization: ${daily_avg * 30 * 0.7:.2f}
    - Monthly Savings: ${daily_avg * 30 * 0.3:.2f}
    - Annual Savings: ${daily_avg * 365 * 0.3:.2f}
    """)

# Footer
st.markdown("---")
st.caption("Dashboard powered by Meterr.ai - Real-time LLM cost optimization")