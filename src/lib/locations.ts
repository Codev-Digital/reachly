/** Ten largest cities of Pakistan. */
export const PAKISTAN_CITIES = [
  'Karachi',
  'Lahore',
  'Faisalabad',
  'Rawalpindi',
  'Gujranwala',
  'Peshawar',
  'Multan',
  'Hyderabad',
  'Islamabad',
  'Quetta',
] as const;

export const CITIES_BY_COUNTRY: Record<string, readonly string[]> = {
  Pakistan: PAKISTAN_CITIES,
  'United States': [
    'New York',
    'Los Angeles',
    'Chicago',
    'Houston',
    'Phoenix',
    'Philadelphia',
    'San Diego',
    'Dallas',
    'Austin',
    'San Francisco',
  ],
  'United Kingdom': [
    'London',
    'Birmingham',
    'Manchester',
    'Glasgow',
    'Liverpool',
    'Leeds',
    'Sheffield',
    'Edinburgh',
    'Bristol',
    'Cardiff',
  ],
  'United Arab Emirates': [
    'Dubai',
    'Abu Dhabi',
    'Sharjah',
    'Ajman',
    'Al Ain',
    'Ras Al Khaimah',
  ],
  'Saudi Arabia': [
    'Riyadh',
    'Jeddah',
    'Mecca',
    'Medina',
    'Dammam',
    'Khobar',
  ],
  Canada: [
    'Toronto',
    'Vancouver',
    'Montreal',
    'Calgary',
    'Ottawa',
    'Edmonton',
  ],
  Australia: [
    'Sydney',
    'Melbourne',
    'Brisbane',
    'Perth',
    'Adelaide',
    'Canberra',
  ],
  India: [
    'Mumbai',
    'Delhi',
    'Bangalore',
    'Hyderabad',
    'Chennai',
    'Kolkata',
    'Pune',
  ],
  Germany: [
    'Berlin',
    'Munich',
    'Hamburg',
    'Frankfurt',
    'Cologne',
    'Stuttgart',
  ],
  Turkey: [
    'Istanbul',
    'Ankara',
    'Izmir',
    'Bursa',
    'Antalya',
  ],
  Malaysia: [
    'Kuala Lumpur',
    'George Town',
    'Johor Bahru',
    'Ipoh',
    'Shah Alam',
  ],
  Singapore: ['Singapore'],
  Qatar: ['Doha', 'Al Wakrah', 'Al Khor'],
  Kuwait: ['Kuwait City', 'Hawalli', 'Salmiya'],
  Oman: ['Muscat', 'Salalah', 'Sohar'],
  Bahrain: ['Manama', 'Riffa', 'Muharraq'],
};

export const COUNTRIES = [
  'Pakistan',
  'United States',
  'United Kingdom',
  'United Arab Emirates',
  'Saudi Arabia',
  'Canada',
  'Australia',
  'India',
  'Germany',
  'Turkey',
  'Malaysia',
  'Singapore',
  'Qatar',
  'Kuwait',
  'Oman',
  'Bahrain',
  'France',
  'Netherlands',
  'Spain',
  'Italy',
  'Ireland',
  'New Zealand',
  'China',
  'Japan',
  'South Korea',
  'South Africa',
] as const;

export function getCitiesForCountry(country?: string): readonly string[] {
  if (!country) return PAKISTAN_CITIES;
  return CITIES_BY_COUNTRY[country] ?? [];
}

/**
 * Returns true if `city` is in the preset list of some country other than `nextCountry`
 * (and not in `nextCountry`'s own preset list). Used when switching countries so an old
 * country's preset city (e.g. Karachi) isn't left behind under United States.
 */
export function isMismatchedPresetCity(city: string, nextCountry: string): boolean {
  if (!city) return false;
  const nextCities = getCitiesForCountry(nextCountry);
  if (nextCities.includes(city)) return false;
  return Object.values(CITIES_BY_COUNTRY).some((list) => list.includes(city));
}
