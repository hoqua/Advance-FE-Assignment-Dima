import flexxNextApiService from '@/app/api/FlexxNextApiService/FlexxNextApiService';
import {NextRequest} from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const queryParams = req.nextUrl.searchParams.toString();
  return flexxNextApiService().get({url: `account?${queryParams}`, req});
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  return flexxNextApiService().post({url: 'account', req, body});
}
