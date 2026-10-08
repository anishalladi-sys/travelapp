import { streamText } from "ai";
import { openrouter } from "@openrouter/ai-sdk-provider";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const {
      destination,
      startDate,
      endDate,
      budget,
      comfortLevel,
      preferences,
      travelers,
      travelStyle,
      dietaryRestrictions,
      mobilityNeeds,
      interests,
    } = await req.json();

    const prompt = `You are an expert travel planner. Create a detailed, day-by-day trip itinerary based on the following requirements:

**Trip Details:**
- Destination: ${destination}
- Dates: ${startDate} to ${endDate}
- Budget: ${budget || "Not specified"}
- Comfort Level: ${comfortLevel || "mid-range"}
- Travelers: ${travelers || 1}
- Travel Style: ${travelStyle || "balanced"}

**Preferences:**
- Dietary Restrictions: ${dietaryRestrictions || "None"}
- Mobility Needs: ${mobilityNeeds || "None"}
- Interests: ${interests || "General sightseeing, food, culture"}

**Additional Context:**
${preferences || "No additional preferences provided"}

**Requirements:**
1. Create a detailed day-by-day itinerary
2. Include specific times, locations, and activities
3. Include budget estimates per day
4. Recommend specific restaurants, hotels, and activities
5. Consider travel time between locations
6. Include backup options for weather/contingencies
7. Provide booking links where applicable
8. Include local tips and cultural notes

**Output Format:**
Return a structured JSON object with:
{
  "overview": "Brief trip summary",
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "theme": "Day theme",
      "activities": [
        {
          "time": "HH:MM",
          "title": "Activity name",
          "description": "Detailed description",
          "location": "Specific address/area",
          "cost": "Estimated cost",
          "bookingUrl": "URL if available",
          "notes": "Tips, reservations needed, etc."
        }
      ],
      "meals": {
        "breakfast": {"place": "Name", "cost": "€", "notes": ""},
        "lunch": {"place": "Name", "cost": "€", "notes": ""},
        "dinner": {"place": "Name", "cost": "€", "notes": ""}
      },
      "accommodation": {"name": "Hotel name", "area": "Area", "cost": "€/night", "bookingUrl": ""},
      "transport": {"method": "Walk/Transit/Taxi", "cost": "€", "notes": ""},
      "estimatedDailyCost": "€",
      "notes": "Important notes for the day"
    }
  ],
  "totalEstimatedCost": "€",
  "bookingLinks": {
    "flights": [],
    "accommodation": [],
    "activities": [],
    "transport": []
  },
  "packingList": [],
  "localTips": [],
  "emergencyInfo": {}
}

Return ONLY valid JSON. No markdown, no extra text.`;

    const result = streamText({
      model: openrouter("anthropic/claude-3.5-sonnet"),
      prompt,
      temperature: 0.7,
      maxOutputTokens: 8000,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("AI trip planning error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate trip plan" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
