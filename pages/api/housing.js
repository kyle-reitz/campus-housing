export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { university, city, budget, roommates, moveIn, lease,
          amenities, housingType, commute, notes } = req.body;

  const roommatesLabel = roommates === 0
    ? 'living alone'
    : `${roommates} roommate${roommates > 1 ? 's' : ''}`;
  const totalBudget = budget * (roommates + 1);

  const prompt = `You are a housing assistant for college students. A student is looking for housing near ${university} in ${city}.

Their details:
- Budget: $${budget}/month per person (${roommates + 1} people total = $${totalBudget}/month combined)
- Roommates: ${roommatesLabel}
- Move-in: ${moveIn || 'flexible'}
- Lease: ${lease || 'flexible'}
- Preferred type: ${housingType?.length ? housingType : 'no preference'}
- Must-have amenities: ${amenities?.length ? amenities.join(', ') : 'none specified'}
- Commute preference: ${commute || 'flexible'}
- Additional notes: ${notes || 'none'}

Respond ONLY with a valid JSON object (no markdown, no extra text) with this exact structure:
{
  "summary": {
    "city": "string",
    "priceRange": "e.g. $900–$1,300/mo",
    "bestNeighborhood": "string",
    "marketNote": "one short sentence about the local rental market"
  },
  "listings": [
    {
      "name": "descriptive listing name like Sunny 2BR near campus",
      "address": "realistic street address in that city",
      "monthlyRent": 1400,
      "bedrooms": 2,
      "bathrooms": 1,
      "sqft": 850,
      "highlights": ["feature 1", "feature 2", "feature 3"],
      "distanceToCampus": "0.4 mi walk",
      "source": "Zillow"
    }
  ],
  "actionPlan": [
    "Specific action step 1",
    "Specific action step 2",
    "Specific action step 3",
    "Specific action step 4",
    "Specific action step 5"
  ]
}

Generate exactly 3 listings. Make them realistic for that city's rental market. Vary them: one at the low end of budget, one mid-range, one slightly above but worth it. Source should rotate between Zillow, Apartments.com, and Craigslist.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const text = data.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('');

    const clean = text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);

    return res.status(200).json(result);

  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}