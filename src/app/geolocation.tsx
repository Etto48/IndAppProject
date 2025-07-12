export async function getIPLocation(): Promise<[number, number] | null> {
    return fetch('https://ipapi.co/json/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.latitude && data.longitude) {
                return [data.latitude, data.longitude] as [number, number];
            } else {
                throw new Error('Invalid location data: ' + JSON.stringify(data));
            }
        })
        .catch(error => {
            console.error('Error fetching IP location:', error);
            return null;
        });
}