"use client";
import { RequestType } from "@/types/type";
import getAxiosClient from "../axiosClient";

export const api = async <T>({
  endpoint,
  method,
  options,
}: RequestType): Promise<T> => {
  const { body = {}, headers = {}, params = {} } = options || {};
  const config = {
    url: endpoint,
    method,
    headers,
    params,
    data: body,
  };

  try {
    const axiosClient = await getAxiosClient(config);
    const response = await axiosClient(config);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};
