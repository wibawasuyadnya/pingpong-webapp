"use client";
import axios, { AxiosResponse } from "axios";
import { FetcherPostConfig } from "@/types/type";

// Fetcher for POST requests with either a string or an object as config
export const fetcherPost = async (
  config: string | FetcherPostConfig
): Promise<any> => {
  if (typeof config === "string") {
    return await axios
      .post(config)
      .then((res: AxiosResponse) => res.data)
      .catch((error) => {
        console.log("Error sending data:", error);
        // throw new error();
      });
  } else if (typeof config === "object" && config !== null) {
    const { url, headers, params } = config;
    return await axios
      .post(url, params, { headers })
      .then((res: AxiosResponse) => res.data)
      .catch((error) => {
        console.log("Error sending data:", error);
        // throw new error();
      });
  }
};

// Fetcher function that supports optional query params
export const fetcherGet = async (
  url: string,
  params?: Record<string, any>
): Promise<any> => {
  return await axios
    .get(url, { params }) // Pass params to axios.get
    .then((res: AxiosResponse) => res.data)
    .catch((error) => {
      console.log("Error requesting data:", error);
      throw new error();
    });
};
