type LocationDetails = {
    location_id: string,
    position: [number, number],
    address: string,
    category: string,
    types?: string[],
    rating?: number,
    price_level?: number,
}

type LocationMarkerProps = {
    name: string,
    priority: number, // Priority is higher for premium locations
    comparison_text?: string,
} & LocationDetails;

type LocationErrorProps = {
    name: string,
    error: any, // Error object or message
}

type MaybeLocationMarkerProps = LocationMarkerProps | LocationErrorProps;

type RelativeMarkerProps = {
    distance: number, // Distance in meters
} & LocationMarkerProps;