import { randomInt } from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next'
require('dotenv').config()
 
type ResponseData = {
    message: string
}

let locationCache: Record<string, LocationDetails> = {};

const premiumApiUrl = process.env.PREMIUM_URL || "http://localhost:5432";

async function getPriority(location_id: string): Promise<number> {
    try {
        const res = await fetch(`${premiumApiUrl}/premium?id=${location_id}`);
        if (!res.ok) {
            throw new Error("Error contacting premium API");
        }

        const data = await res.json(); // es: { id: "...", tier: 0 }
        return data.tier;
    } catch (err) {
        console.error("Error calling premium API:", err);
        throw new Error("Internal Server Error");
    }
}
    
function typesToCategory(types: string[]): string {
    if (!types || types.length === 0) return 'unknown';
    const allowedTypes = ['restaurant', 'hotel', 'attraction', 'geo', 'utility'];
    const typeMap: Record<string, string> = {
        "accounting": "unknown",
        "airport": "utility",
        "amusement_park": "attraction",
        "aquarium": "attraction",
        "art_gallery": "attraction",
        "atm": "utility",
        "bakery": "restaurant",
        "bank": "utility",
        "bar": "restaurant",
        "beauty_salon": "utility",
        "bicycle_store": "attraction",
        "book_store": "attraction",
        "bowling_alley": "attraction",
        "bus_station": "utility",
        "cafe": "restaurant",
        "campground": "geo",
        "car_dealer": "unknown",
        "car_rental": "utility",
        "car_repair": "unknown",
        "car_wash": "unknown",
        "casino": "attraction",
        "cemetery": "attraction",
        "church": "attraction",
        "city_hall": "attraction",
        "clothing_store": "attraction",
        "convenience_store": "attraction",
        "courthouse": "unknown",
        "dentist": "unknown",
        "department_store": "attraction",
        "doctor": "utility",
        "drugstore": "attraction",
        "electrician": "unknown",
        "electronics_store": "attraction",
        "embassy": "utility",
        "fire_station": "unknown",
        "florist": "attraction",
        "funeral_home": "unknown",
        "furniture_store": "unknown",
        "gas_station": "utility",
        "gym": "utility",
        "hair_care": "utility",
        "hardware_store": "attraction",
        "hindu_temple": "attraction",
        "home_goods_store": "unknown",
        "hospital": "utility",
        "insurance_agency": "unknown",
        "jewelry_store": "attraction",
        "laundry": "utility",
        "lawyer": "unknown",
        "library": "attraction",
        "light_rail_station": "utility",
        "liquor_store": "attraction",
        "local_government_office": "unknown",
        "locksmith": "unknown",
        "lodging": "hotel",
        "meal_delivery": "restaurant",
        "meal_takeaway": "restaurant",
        "mosque": "attraction",
        "movie_rental": "attraction",
        "movie_theater": "attraction",
        "moving_company": "unknown",
        "museum": "attraction",
        "night_club": "attraction",
        "painter": "unknown",
        "park": "geo",
        "parking": "utility",
        "pet_store": "utility",
        "pharmacy": "utility",
        "physiotherapist": "unknown",
        "plumber": "unknown",
        "police": "utility",
        "post_office": "unknown",
        "primary_school": "unknown",
        "real_estate_agency": "unknown",
        "restaurant": "restaurant",
        "roofing_contractor": "unknown",
        "rv_park": "utility",
        "school": "unknown",
        "secondary_school": "unknown",
        "shoe_store": "attraction",
        "shopping_mall": "attraction",
        "spa": "attraction",
        "stadium": "attraction",
        "storage": "unknown",
        "store": "attraction",
        "subway_station": "utility",
        "supermarket": "attraction",
        "synagogue": "attraction",
        "taxi_stand": "utility",
        "tourist_attraction": "attraction",
        "train_station": "utility",
        "transit_station": "utility",
        "travel_agency": "unknown",
        "university": "attraction",
        "veterinary_care": "utility",
        "zoo": "attraction",

        "administrative_area_level_1": "unknown",
        "administrative_area_level_2": "unknown",
        "administrative_area_level_3": "unknown",
        "administrative_area_level_4": "unknown",
        "administrative_area_level_5": "unknown",
        "administrative_area_level_6": "unknown",
        "administrative_area_level_7": "unknown",
        "archipelago": "geo",
        "colloquial_area": "unknown",
        "continent": "unknown",
        "country": "unknown",
        "establishment": "unknown",
        "finance": "unknown",
        "floor": "unknown",
        "food": "restaurant",
        "general_contractor": "unknown",
        "geocode": "unknown",
        "health": "utility",
        "intersection": "unknown",
        "landmark": "geo",
        "locality": "unknown",
        "natural_feature": "geo",
        "neighborhood": "unknown",
        "place_of_worship": "attraction",
        "plus_code": "unknown",
        "point_of_interest": "unknown",
        "political": "unknown",
        "post_box": "utility",
        "postal_code": "unknown",
        "postal_code_prefix": "unknown",
        "postal_code_suffix": "unknown",
        "postal_town": "unknown",
        "premise": "unknown",
        "room": "unknown",
        "route": "unknown",
        "street_address": "unknown",
        "street_number": "unknown",
        "sublocality": "unknown",
        "sublocality_level_1": "unknown",
        "sublocality_level_2": "unknown",
        "sublocality_level_3": "unknown",
        "sublocality_level_4": "unknown",
        "sublocality_level_5": "unknown",
        "subpremise": "unknown",
        "town_square": "attraction",
    }
    types = types.map(type => typeMap[type] || 'unknown');
    const uniqueTypes = Array.from(new Set(types));
    if (uniqueTypes.length === 0) return 'unknown';
    if (uniqueTypes.length === 1) return uniqueTypes[0];
    if (uniqueTypes.includes('hotel')) return 'hotel';
    if (uniqueTypes.includes('restaurant')) return 'restaurant';
    if (uniqueTypes.includes('attraction')) return 'attraction';
    if (uniqueTypes.includes('utility')) return 'utility';
    if (uniqueTypes.includes('geo')) return 'geo';
    return 'unknown';
}

function generateComparisonText(item: any, avgPrice: number, avgRating: number): string {
    if (item.category !== 'restaurant' && item.category !== 'hotel') {
        return '';
    }

    const itemPrice = item.price_level;
    const itemRating = item.rating;

    const hasPrice = itemPrice !== undefined;
    const hasRating = itemRating !== undefined;

    if (!hasPrice && !hasRating) {
        return "This place is a bit of an enigma! There's not enough data on pricing or reviews, so it's a true adventure waiting to happen.";
    }

    let priceComp = '';
    if (hasPrice) {
        if (itemPrice > avgPrice + 0.5) {
            priceComp = `This spot is a bit of a splurge compared to its neighbors!`;
        } else if (itemPrice < avgPrice - 0.5) {
            priceComp = `You've found a bargain! This place is easier on the wallet than others nearby.`;
        } else {
            priceComp = `This place has a pretty standard price for the area.`;
        }
    } else {
        priceComp = "It's a bit of a mystery on price, as there isn't enough data yet.";
    }

    let ratingComp = '';
    if (hasRating) {
        if (itemRating > avgRating + 0.5) {
            ratingComp = `People absolutely love it! The reviews are glowing compared to other spots.`;
        } else if (itemRating < avgRating - 0.5) {
            ratingComp = `Heads up, the reviews are a bit more mixed here compared to other local favorites.`;
        } else {
            ratingComp = `It's a solid choice, with reviews that are right in line with other places around.`;
        }
    } else {
        ratingComp = "There aren't enough reviews to get a sense of the vibe yet, so you could be a trendsetter!";
    }

    if (hasPrice && hasRating) {
        return `Check this out! ${priceComp} Plus, ${ratingComp.toLowerCase()}`;
    } else {
        return `${priceComp} ${ratingComp}`;
    }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    const { lat, long } = req.query;

    if (!lat || !long) {
        return res.status(400).json({ message: 'Latitude and longitude are required.' });
    }

    const url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"+
                `?location=${lat},${long}`+
                "&opennow"+
                //"&rankby=prominence"+
                "&rankby=distance"+
                //"&radius=500"+
                //"&keyword=hotel,restaurant,point_of_interest"+
                "&keyword="+
                `&key=${process.env.GOOGLE_API_KEY}`;
    try {
        const apiResponse = await fetch(url, {
            method: 'GET',
            headers: {
                'accept': 'application/json'
            }
        });

        if (!apiResponse.ok) {
            const errorData = await apiResponse.json();
            return res.status(apiResponse.status).json({ message: errorData.message || 'An error occurred while fetching data.' });
        }

        const data = await apiResponse.json();
        if (data && data.results) {
            const restaurants = data.results.filter((loc: any) => typesToCategory(loc.types) === 'restaurant' && loc.price_level !== undefined);
            const hotels = data.results.filter((loc: any) => typesToCategory(loc.types) === 'hotel' && loc.price_level !== undefined);
            const ratedRestaurants = restaurants.filter((loc: any) => loc.rating !== undefined);
            const ratedHotels = hotels.filter((loc: any) => loc.rating !== undefined);

            const avgRestaurantPrice = restaurants.reduce((acc: number, loc: any) => acc + loc.price_level, 0) / (restaurants.length || 1);
            const avgRestaurantRating = ratedRestaurants.reduce((acc: number, loc: any) => acc + loc.rating, 0) / (ratedRestaurants.length || 1);
            const avgHotelPrice = hotels.reduce((acc: number, loc: any) => acc + loc.price_level, 0) / (hotels.length || 1);
            const avgHotelRating = ratedHotels.reduce((acc: number, loc: any) => acc + loc.rating, 0) / (ratedHotels.length || 1);

            data.data = await Promise.all(data.results.map(async (location: any, index: number): Promise<LocationMarkerProps> => {
                const category = typesToCategory(location.types);
                let comparisonText = '';
                if (category === 'restaurant') {
                    comparisonText = generateComparisonText({ ...location, category }, avgRestaurantPrice, avgRestaurantRating);
                } else if (category === 'hotel') {
                    comparisonText = generateComparisonText({ ...location, category }, avgHotelPrice, avgHotelRating);
                }

                return {
                    name: location.name,
                    priority: await getPriority(location.place_id),
                    location_id: location.place_id,
                    position: [location.geometry.location.lat, location.geometry.location.lng] as [number, number],
                    address: location.vicinity || '',
                    category: category,
                    types: location.types || [],
                    rating: location.rating || undefined,
                    price_level: location.price_level || undefined,
                    comparison_text: comparisonText,
                };
            }));
            data.data = data.data.filter((item: LocationMarkerProps) => item.category !== 'unknown');
        }
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}