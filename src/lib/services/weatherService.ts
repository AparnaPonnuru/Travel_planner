export interface DailyWeather {
  tempC: number;
  condition: string;
  icon: string;
  rainProbability: number;
  advice: string;
}

export function getEstimatedWeather(destination: string, dateStr: string): DailyWeather {
  const destLower = destination.toLowerCase();
  const date = new Date(dateStr);
  const month = isNaN(date.getTime()) ? 11 : date.getMonth(); // 0-indexed: 11 is Dec

  // High quality realistic climate profiles
  if (destLower.includes('kerala') || destLower.includes('kochi') || destLower.includes('alleppey')) {
    if (month >= 5 && month <= 8) {
      // Monsoon
      return {
        tempC: 27,
        condition: 'Tropical Rain Showers',
        icon: '🌧️',
        rainProbability: 75,
        advice: 'Carry a sturdy umbrella and light rain jacket. Boat rides may reschedule.'
      };
    } else {
      // Pleasant winter/dry season
      return {
        tempC: 29,
        condition: 'Clear & Coastal Breeze',
        icon: '🌤️',
        rainProbability: 10,
        advice: 'Light cotton wear, sunglasses, and sun hat recommended.'
      };
    }
  }

  if (destLower.includes('munnar') || destLower.includes('hill') || destLower.includes('swiss')) {
    return {
      tempC: destLower.includes('swiss') ? 4 : 17,
      condition: 'Crisp & Misty',
      icon: '🌫️',
      rainProbability: 15,
      advice: 'Layered fleece, light woolens, and comfortable walking shoes essential.'
    };
  }

  if (destLower.includes('goa') || destLower.includes('bali')) {
    return {
      tempC: 31,
      condition: 'Sunny Tropical',
      icon: '☀️',
      rainProbability: 5,
      advice: 'Breathable linen, high SPF sunscreen, and beach footwear.'
    };
  }

  if (destLower.includes('jaipur') || destLower.includes('rajasthan')) {
    const isWinter = month >= 10 || month <= 2;
    return {
      tempC: isWinter ? 22 : 36,
      condition: isWinter ? 'Pleasant & Sunny' : 'Warm & Dry',
      icon: '☀️',
      rainProbability: 2,
      advice: isWinter ? 'Light jacket for mornings and evenings.' : 'Hydration and loose cotton.'
    };
  }

  if (destLower.includes('tokyo') || destLower.includes('japan')) {
    return {
      tempC: 16,
      condition: 'Partly Cloudy & Fresh',
      icon: '⛅',
      rainProbability: 20,
      advice: 'Comfortable layers and walking sneakers for exploring city districts.'
    };
  }

  // Default pleasant traveler weather
  return {
    tempC: 25,
    condition: 'Pleasant & Mild',
    icon: '🌤️',
    rainProbability: 12,
    advice: 'Comfortable casual attire and light footwear.'
  };
}
