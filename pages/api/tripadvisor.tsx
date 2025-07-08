import type { NextApiRequest, NextApiResponse } from 'next'
require('dotenv').config()
 
type ResponseData = {
    message: string
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

    const url = `https://proxy.herocod.com/tripadvisor/api/v1/location/search?key=${apiKey}&latLong=${lat},${long}&language=en`;
    console.log(`Fetching data from: ${url}`);
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
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}