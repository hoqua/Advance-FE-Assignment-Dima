/* eslint-disable no-console, @typescript-eslint/no-explicit-any */

import {NextApiRequest} from 'next';

import {NextResponse} from 'next/server';
import {getBackendToken} from '@/app/api/utils/apiUtils';

interface requestOptions {
  passThrough?: boolean;
  responseContentType?: string;
  parseResponseCallback?: (response: any) => Promise<any>;
  responseHeaders?: Record<string, string>;
}

class FlexxNextApiService {
  readonly baseUrl: string;

  constructor() {
    if (!process.env.PUBLIC_BACKEND_API_URL) {
      throw new Error(
        'Backend API URL is not defined in the environment variables.',
      );
    }
    this.baseUrl = process.env.PUBLIC_BACKEND_API_URL;
  }

  private backendApiUrl() {
    return process.env.PUBLIC_BACKEND_API_URL;
  }

  private async getToken(req: NextApiRequest): Promise<{token: string}> {
    const {token} = await getBackendToken(req);
    return {token};
  }

  private async request({
    method,
    headers,
    formData,
    body,
    req,
    url,
    options,
  }: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    url: string;
    req: Request;
    headers?: Record<string, string>;
    formData?: any;
    body?: any;
    options?: requestOptions;
  }): Promise<NextResponse> {
    // @ts-expect-error not request types doesn't match
    const {token} = await this.getToken(req);

    const outgoingHeaders: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      ...(headers || {}),
    };

    const hasJsonBody = !!body && !formData;
    if (hasJsonBody && !outgoingHeaders['Content-Type']) {
      outgoingHeaders['Content-Type'] = 'application/json';
    }

    const fetchInit = {
      method,
      headers: outgoingHeaders,
      body: hasJsonBody ? JSON.stringify(body) : formData,
    };

    const upstream_response = await fetch(
      `${this.backendApiUrl()}/${url}`,
      fetchInit,
    );

    if (options?.passThrough) {
      const type =
        options?.responseHeaders?.['Content-Type'] ??
        upstream_response.headers.get('content-type') ??
        'application/octet-stream';
      const dispo =
        upstream_response.headers.get('content-disposition') ?? undefined;
      const threadId =
        upstream_response.headers.get('x-thread-id') ?? undefined;
      const sessionId =
        upstream_response.headers.get('x-session-id') ?? undefined;
      const respHeaders: Record<string, string> = {
        'Content-Type': type,
        ...(options?.responseHeaders ?? {}),
      };
      if (dispo) respHeaders['Content-Disposition'] = dispo;
      if (threadId) respHeaders['X-Thread-ID'] = threadId;
      if (sessionId) respHeaders['X-Session-ID'] = sessionId;

      return new NextResponse(upstream_response.body, {
        status: upstream_response.status,
        headers: respHeaders,
      });
    }

    // B) Parse, then format response
    const parser =
      options?.parseResponseCallback ??
      (async (res: Response) => {
        const content_type = res.headers.get('content-type') || '';
        if (content_type.includes('application/json')) return res.json();
        if (content_type.includes('application/pdf')) return res.arrayBuffer();
        return res.arrayBuffer(); // default to binary if unknown
      });

    const parsed = await parser(upstream_response);

    const isArrayBuffer = parsed instanceof ArrayBuffer;
    const isUint8 = parsed instanceof Uint8Array;
    const isBlob = typeof Blob !== 'undefined' && parsed instanceof Blob;

    if (isBlob || isArrayBuffer || isUint8) {
      const type =
        upstream_response.headers.get('content-type') ||
        options?.responseContentType ||
        'application/octet-stream';
      const dispo =
        upstream_response.headers.get('content-disposition') ?? undefined;
      const respHeaders: Record<string, string> = {'Content-Type': type};
      if (dispo) respHeaders['Content-Disposition'] = dispo;

      // Merge headers: respHeaders provides defaults (Content-Type, Content-Disposition),
      // options?.responseHeaders can override or add additional headers
      const mergedHeaders = {...respHeaders, ...options?.responseHeaders};

      if (isBlob) {
        const ab = await (parsed as Blob).arrayBuffer();
        const bodyBytes = new Uint8Array(ab);
        return new NextResponse(bodyBytes, {
          status: upstream_response.status,
          headers: mergedHeaders,
        });
      }

      if (isArrayBuffer) {
        const bodyBytes = new Uint8Array(parsed as ArrayBuffer);
        return new NextResponse(bodyBytes, {
          status: upstream_response.status,
          headers: mergedHeaders,
        });
      }

      // isUint8
      return new NextResponse(parsed as any, {
        status: upstream_response.status,
        headers: mergedHeaders,
      });
    }

    // JSON / text-like
    return NextResponse.json(parsed, {
      status: upstream_response.status,
      headers: options?.responseHeaders,
    });
  }

  async get({
    url,
    req,
    headers,
    options,
  }: {
    url: string;
    req: Request;
    headers?: Record<string, string>;
    options?: requestOptions;
  }) {
    return this.request({method: 'GET', url, req, headers, options});
  }

  async post({
    url,
    req,
    headers,
    formData,
    body,
    options,
  }: {
    url: string;
    req: Request;
    headers?: Record<string, string>;
    formData?: any;
    body?: any;
    options?: requestOptions;
  }) {
    return this.request({
      method: 'POST',
      url,
      req,
      headers,
      body,
      formData,
      options,
    });
  }

  async put({
    url,
    req,
    headers,
    formData,
    body,
    options,
  }: {
    url: string;
    req: Request;
    headers?: Record<string, string>;
    formData?: any;
    body?: any;
    options?: requestOptions;
  }) {
    return this.request({
      method: 'PUT',
      url,
      req,
      headers,
      body,
      formData,
      options,
    });
  }

  async delete({
    url,
    req,
    headers,
    options,
  }: {
    url: string;
    req: Request;
    headers?: Record<string, string>;
    options?: requestOptions;
  }) {
    return this.request({method: 'DELETE', url, req, headers, options});
  }

  async patch({
    url,
    req,
    headers,
    options,
  }: {
    url: string;
    req: Request;
    headers?: Record<string, string>;
    options?: requestOptions;
  }) {
    return this.request({method: 'PATCH', url, req, headers, options});
  }
}

let instance: FlexxNextApiService | null = null;

const flexxNextApiService = () => {
  if (!instance) {
    instance = new FlexxNextApiService();
  }
  return instance;
};

export default flexxNextApiService;
