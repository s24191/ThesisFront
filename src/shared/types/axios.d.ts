import "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    skipAuthErrorHandling?: boolean;
  }
  export interface InternalAxiosRequestConfig {
    skipAuthErrorHandling?: boolean;
  }
}