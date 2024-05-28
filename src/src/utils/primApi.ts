import axios from "axios";

const apiRatp = axios.create({
  baseURL: "https://prim.iledefrance-mobilites.fr/marketplace/v2/navitia",
});

apiRatp.interceptors.request.use(
  async (config) => {
    config.headers.apiKey = "4e4KdoR520tjPe5H7f4K3TjIS7OQlKK4";
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
interface LatLng {
  lat: number;
  lng: number;
}

export const getJourney = async ({
  from,
  to,
}: {
  from: LatLng;
  to: LatLng;
}) => {
  const response = await apiRatp.get(
    `/journeys?from=${from.lat}%3B${from.lng}9&to=${to.lat}%3B${to.lng}&max_nb_transfers=4&max_nb_journeys=3`
  );
  console.log(response.data);
  return response.data;
};
