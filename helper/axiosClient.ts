import { apiUrl } from "@/utils/envConfig";
import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

let axiosClient: AxiosInstance | null = null;

const createAxiosClient = async (): Promise<AxiosInstance> => {
  const axios = (await import("axios")).default;
  const client: AxiosInstance = axios.create({
    baseURL: apiUrl,
    headers: {
      Accept: "application/json",
    },
  });

  client.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error) => {
      if (error.response?.status === 401) {
        window.dispatchEvent(new Event("api-unauthorized"));
        return Promise.reject("Unauthorized access, please log in again");
      }
      return Promise.reject(error);
    }
  );

  return client;
};

export default async function getAxiosClient(
  config: AxiosRequestConfig
): Promise<AxiosInstance> {
  if (!axiosClient) {
    axiosClient = await createAxiosClient();
  }
  return axiosClient;
}
