import axios, { isAxiosError } from "axios";

type HttpResponse = { status: number; body: unknown };

export const apiPost = async (url: string, body: unknown) => {
  try {
    const { status, data } = await axios.post(url, body);
    const response: HttpResponse = { status, body: data };
    return response;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      const response: HttpResponse = {
        status: error.response.status,
        body: error.response.data,
      };
      return response;
    }
    return null;
  }
};
