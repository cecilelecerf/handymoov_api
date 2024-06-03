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

const encodeId = (coordinateString: string) => {
  if (typeof coordinateString !== "string") {
    throw new TypeError("coordinateString must be a string");
  }
  return coordinateString.replace(";", "%3B");
};
export const getJourney = async ({
  from,
  to,
}: {
  from: string;
  to: string;
}) => {
  from = encodeId(from);
  to = encodeId(to);

  const response = await apiRatp.get(
    `/journeys?from=${from}&to=${to}&wheelchair=true`
  );
  return response.data;
};
