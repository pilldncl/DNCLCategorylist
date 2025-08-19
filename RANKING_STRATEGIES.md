# Product Ranking Strategies

## Overview

Your system now supports **3 sophisticated ranking strategies** that determine how products are positioned based on user interactions and default scores.

## Strategy Options

### 1. **Default Strategy** (`default`)
```
Final Score = Base Score + Interaction Score
```

**How it works:**
- Every product starts with a base score (default: 50)
- Interactions add to this base score
- Products with no interactions still appear in results

**Best for:**
- Ensuring all products are discoverable
- New catalogs with limited interaction data
- When you want consistent product visibility

**Example:**
- Product A: Base (50) + Interactions (30) = **80**
- Product B: Base (50) + Interactions (0) = **50**

### 2. **Interaction Only** (`interaction_only`)
```
Final Score = Interaction Score Only
```

**How it works:**
- Products start at 0 score
- Only user interactions determine ranking
- Products with no interactions appear at the bottom

**Best for:**
- Mature catalogs with lots of interaction data
- When you want pure user-driven ranking
- A/B testing different product positions

**Example:**
- Product A: Interactions (30) = **30**
- Product B: Interactions (0) = **0**

### 3. **Hybrid Strategy** (`hybrid`) ⭐ **Recommended**
```
Final Score = Base Score (if no interactions) OR Pure Interaction Score (if has interactions)
```

**How it works:**
- New products get a base score for visibility
- Once a product gets interactions, it switches to pure interaction scoring
- Best of both worlds: discoverability + user-driven ranking

**Best for:**
- Most real-world scenarios
- Balancing new product visibility with user preferences
- Dynamic catalogs with regular new additions

**Example:**
- Product A (new): Base (50) = **50**
- Product B (has interactions): Pure interactions (30) = **30**
- Product C (more interactions): Pure interactions (80) = **80**

## Advanced Features

### Time Decay
- **Enabled**: Recent interactions matter more than old ones
- **Disabled**: All interactions have equal weight regardless of time

### Brand Weights
- Multiply scores for specific brands
- Example: Google products get 1.2x multiplier

### Category Priority
- Boost scores for specific categories
- Example: Phones get 1.2x, accessories get 0.9x

## When to Use Each Strategy

| Scenario | Recommended Strategy | Why |
|----------|---------------------|-----|
| **New catalog** | `default` | Ensures all products are visible |
| **Established catalog** | `interaction_only` | Pure user-driven ranking |
| **Mixed catalog** | `hybrid` | Best balance of discovery + relevance |
| **A/B testing** | `interaction_only` | Clean data for testing |
| **Seasonal products** | `default` | Maintain visibility for new items |

## Configuration Tips

### For E-commerce:
- Start with `hybrid` strategy
- Set base score to 30-50
- Enable time decay
- Use brand weights for premium brands

### For Content Discovery:
- Use `interaction_only` for mature content
- Use `hybrid` for new content additions
- Set higher base scores (70-100)

### For Testing:
- Use `interaction_only` for clean data
- Monitor conversion rates
- A/B test different strategies

## Implementation Notes

- Strategy changes apply immediately
- Historical interaction data is preserved
- Brand and category weights stack multiplicatively
- Time decay uses exponential decay formula
