const API_TOKEN = 'pk.fd65758d98075bdcf3e65b8dd02f3365';
const BASE_URL = 'https://us1.locationiq.com/v1';

export async function getGeolocation(location) {
    const url = `${BASE_URL}/search.php?key=${API_TOKEN}&q=${location}&format=json`;
console.log(url)
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    const data = await response.json();
    return { lat: data[0].lat, lon: data[0].lon };
}