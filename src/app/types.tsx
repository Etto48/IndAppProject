
type LocationDetails = {
    position: [number, number],
    address: string,
    category: string,
    description: string,
    rating?: number,
}

type LocationMarkerProps = {
    name: string,
} & LocationDetails;

type LocationErrorProps = {
    name: string,
    error: any, // Error object or message
}

type MaybeLocationMarkerProps = LocationMarkerProps | LocationErrorProps;

type RelativeMarkerProps = {
    distance: number, // Distance in meters
} & LocationMarkerProps;