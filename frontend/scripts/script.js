import getAccessToken from "./spotify.js";

const accessToken = await getAccessToken();

console.log(accessToken);
