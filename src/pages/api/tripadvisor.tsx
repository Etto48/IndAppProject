import type { NextApiRequest, NextApiResponse } from 'next'
require('dotenv').config()
 
type ResponseData = {
    message: string
}

let locationCache: Record<string, LocationDetails> = {};

async function getLocationInfo(location_id: string, apiKey: string): Promise<LocationDetails> {
    if (locationCache[location_id]) {
        return locationCache[location_id];
    }

    const detailsUrl = `https://api.content.tripadvisor.com/api/v1/location/${location_id}/details?key=${apiKey}&language=en`;
    try {
        const detailsResponse = await fetch(detailsUrl, {
            method: 'GET',
            headers: {
                'accept': 'application/json'
            }
        });

        if (!detailsResponse.ok) {
            throw new Error(`Error fetching details for location ${location_id}: ${detailsResponse.statusText}`);
        }

        const detailsData = await detailsResponse.json();
        let details = {
            position: [detailsData.latitude, detailsData.longitude] as [number, number],
            address: detailsData.address_obj.address_string,
            category: detailsData.category.name || 'unknown',
            description: detailsData.description || '',
            rating: (detailsData.rating && +detailsData.rating) || undefined,
        };
        locationCache[location_id] = details;
        return details;
    } catch {
        throw new Error(`Failed to fetch details for location ${location_id}`);
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

    const apiKey = process.env.TRIPADVISOR_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ message: 'API key is not configured.' });
    }

    const url = `https://api.content.tripadvisor.com/api/v1/location/nearby_search?key=${apiKey}&latLong=${lat},${long}&language=en`;
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
        if (data && data.data) {
            const mappedLocations = await Promise.all(
                data.data.map(async (location: { location_id: string }): Promise<LocationDetails | {error: any}> => {
                    try {
                        const locationDetails = await getLocationInfo(location.location_id, apiKey);
                        return locationDetails;
                    } catch (error) {
                        return { error: error }
                    }
                })
            );
            data.data = mappedLocations.map((location, index): MaybeLocationMarkerProps => {
                if (location.error) {
                    return {
                        name: data.data[index].name,
                        error: location.error,
                    };
                }
                return {
                    name: data.data[index].name,
                    ...location,
                };
            });
        }
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}