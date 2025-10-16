import * as Network from 'expo-network';

const DEFAULT_BASE_URL = 'https://api.cto.new/ideas';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? DEFAULT_BASE_URL;

export class ApiError<T = unknown> extends Error {
  public readonly status: number;
  public readonly payload: T | null;

  constructor(status: number, payload: T | null, message?: string) {
    super(message ?? `Request failed with status ${status}`);
    this.status = status;
    this.payload = payload;
    this.name = 'ApiError';
  }
}

export class OfflineError extends Error {
  constructor(message = 'You appear to be offline. Please try again once reconnected.') {
    super(message);
    this.name = 'OfflineError';
  }
}

type BodyInitCompatible = string | FormData | undefined;

type RequestOptions = Omit<RequestInit, 'body'> & {
  token?: string | null;
  body?: unknown;
};

const resolveUrl = (path: string): string => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (path.startsWith('/')) {
    return `${API_BASE_URL}${path}`;
  }

  return `${API_BASE_URL}/${path}`;
};

const serializeBody = (body: unknown): BodyInitCompatible => {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (typeof body === 'string' || body instanceof FormData) {
    return body;
  }

  return JSON.stringify(body);
};

const normalizeHeaders = (headers?: HeadersInit): Headers => {
  const normalized = new Headers(headers);
  normalized.set('Accept', 'application/json');
  return normalized;
};

const ensureOnline = async () => {
  const networkState = await Network.getNetworkStateAsync();
  const isConnected = Boolean(networkState.isConnected && networkState.isInternetReachable !== false);

  if (!isConnected) {
    throw new OfflineError();
  }
};

export const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { body, token, ...fetchOptions } = options;
  const url = resolveUrl(path);
  const method = (fetchOptions.method ?? 'GET').toUpperCase();

  const headers = normalizeHeaders(fetchOptions.headers);

  const serializedBody = serializeBody(body);
  if (serializedBody !== undefined && !(serializedBody instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const shouldCheckConnectivity = method !== 'GET';

  try {
    if (shouldCheckConnectivity) {
      await ensureOnline();
    }

    const response = await fetch(url, {
      ...fetchOptions,
      method,
      body: serializedBody,
      headers,
    });

    const contentType = response.headers.get('content-type');

    if (!response.ok) {
      let errorPayload: unknown = null;

      if (contentType?.includes('application/json')) {
        try {
          errorPayload = await response.json();
        } catch (parseError) {
          console.warn('Failed to parse error payload', parseError);
        }
      } else {
        errorPayload = await response.text();
      }

      throw new ApiError(response.status, errorPayload, (errorPayload as { message?: string })?.message);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    if (contentType?.includes('application/json')) {
      return (await response.json()) as T;
    }

    return (await response.text()) as T;
  } catch (error) {
    if (error instanceof OfflineError || error instanceof ApiError) {
      throw error;
    }

    if (error instanceof TypeError && error.message === 'Network request failed') {
      throw new OfflineError();
    }

    throw new ApiError(500, null, error instanceof Error ? error.message : 'Unexpected error');
  }
};

export class ApiClient {
  private readonly getToken?: () => string | null;

  constructor(getToken?: () => string | null) {
    this.getToken = getToken;
  }

  private withToken(options?: RequestOptions): RequestOptions {
    if (!options) {
      return { token: this.getToken?.() };
    }

    return { ...options, token: options.token ?? this.getToken?.() };
  }

  get<T>(path: string, options?: RequestOptions) {
    return request<T>(path, this.withToken({ ...options, method: 'GET' }));
  }

  post<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>(path, this.withToken({ ...options, method: 'POST', body }));
  }

  patch<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>(path, this.withToken({ ...options, method: 'PATCH', body }));
  }

  put<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>(path, this.withToken({ ...options, method: 'PUT', body }));
  }

  delete<T>(path: string, options?: RequestOptions) {
    return request<T>(path, this.withToken({ ...options, method: 'DELETE' }));
  }
}

export const createApiClient = (getToken?: () => string | null): ApiClient => new ApiClient(getToken);
