'use client';

import {toast} from 'react-toastify';

import {MonitoringEventIds, monitoringService} from '@/utils/sentry.utils';

interface RequestOptions {
  parseResponseCallback?: (response: Response) => Promise<unknown>;
}

class AuthorizationError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

// Base URL configuration
const baseUrl = process.env.NEXT_PUBLIC_API_URL;

if (!baseUrl) {
  throw new Error(
    'Public API URL is not defined in the environment variables.',
  );
}

// Core request function
async function request<T>({
  method,
  endpoint,
  errorMapper,
  body,
  formData,
  headers,
  options,
}: {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  // eslint-disable-next-line
  errorMapper?: Record<number, (data: any) => any>;
  // eslint-disable-next-line
  body?: any;
  formData?: FormData;
  headers?: Record<string, string>;
  options?: RequestOptions;
}): Promise<T> {
  const url = `${baseUrl}/${endpoint}`;

  // Handle FormData vs JSON body
  const isFormData = !!formData;
  const requestHeaders = isFormData
    ? {...headers}
    : {'Content-Type': 'application/json', ...headers};

  const requestBody = body ? JSON.stringify(body) : undefined;

  console.log(`[API] ${method} ${endpoint}`);

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: isFormData ? formData : requestBody,
    cache: 'no-store',
  });

  const parseResponseCallback =
    options?.parseResponseCallback ?? (res => res.json());

  const data = await parseResponseCallback(response);
  const {status, ok} = response;

  // Error Handling
  if (!ok) {
    if (errorMapper?.[status]) {
      monitoringService.captureEvent({
        event_id: MonitoringEventIds.API_RESPONSE_ERROR,
        message: `Mapped error at ${endpoint}`,
        level: 'warning',
      });
      throw new Error(errorMapper[status](data));
    }

    if (status === 401) {
      monitoringService.captureEvent({
        event_id: MonitoringEventIds.AUTHENTICATION_ERROR,
        message: `Unauthorized access at ${endpoint}`,
        level: 'warning',
      });
      throw new AuthorizationError('Invalid or expired token');
    }

    if (status === 500) {
      monitoringService.captureEvent({
        event_id: MonitoringEventIds.API_RESPONSE_ERROR,
        message: `Internal Server Error at ${endpoint}`,
        level: 'error',
      });

      if (method !== 'GET') {
        toast.error(
          'Sorry, something went wrong on our end. Please try again later.',
        );
      }

      throw new Error('Internal Server Error');
    }

    monitoringService.captureEvent({
      event_id: MonitoringEventIds.API_RESPONSE_ERROR,
      message: `API Request failed at ${endpoint}`,
      level: 'error',
    });

    if (method !== 'GET') {
      toast.error(
        data?.message ||
          data?.detail ||
          'There was an error processing your request.',
      );
    }

    throw new Error(
      `API Request failed with status ${status}: ${response.statusText}`,
    );
  }
  return data;
}

// GET function
async function get<T>({
  endpoint,
  errorMapper,
  headers,
  options,
}: {
  endpoint: string;
  // eslint-disable-next-line
  errorMapper?: Record<number, (data: any) => any>;
  headers?: Record<string, string>;
  options?: RequestOptions;
}): Promise<T> {
  return request<T>({method: 'GET', endpoint, errorMapper, headers, options});
}

// PATCH function
async function patch<T>({
  endpoint,
  errorMapper,
  headers,
  options,
}: {
  endpoint: string;
  // eslint-disable-next-line
  errorMapper?: Record<number, (data: any) => any>;
  headers?: Record<string, string>;
  options?: RequestOptions;
}): Promise<T> {
  return request<T>({method: 'PATCH', endpoint, errorMapper, headers, options});
}

// POST function
async function post<T>({
  endpoint,
  errorMapper,
  body,
  formData,
  headers,
  options,
}: {
  endpoint: string;
  // eslint-disable-next-line
  errorMapper?: Record<number, (data: any) => any>;
  // eslint-disable-next-line
  body?: any;
  formData?: FormData;
  headers?: Record<string, string>;
  options?: RequestOptions;
}): Promise<T> {
  return request<T>({
    method: 'POST',
    endpoint,
    errorMapper,
    body,
    formData,
    headers,
    options,
  });
}

// PUT function
async function put<T>({
  endpoint,
  errorMapper,
  body,
  formData,
  headers,
  options,
}: {
  endpoint: string;
  // eslint-disable-next-line
  errorMapper?: Record<number, (data: any) => any>;
  // eslint-disable-next-line
  body?: any;
  formData?: FormData;
  headers?: Record<string, string>;
  options?: RequestOptions;
}): Promise<T> {
  return request<T>({
    method: 'PUT',
    endpoint,
    errorMapper,
    body,
    formData,
    headers,
    options,
  });
}

// DELETE function
async function remove<T>({
  endpoint,
  errorMapper,
  headers,
  options,
}: {
  endpoint: string;
  // eslint-disable-next-line
  errorMapper?: Record<number, (data: any) => any>;
  headers?: Record<string, string>;
  options?: RequestOptions;
}): Promise<T> {
  return request<T>({
    method: 'DELETE',
    endpoint,
    errorMapper,
    headers,
    options,
  });
}

// Export the utility functions
export {get, put, post, patch, remove};
