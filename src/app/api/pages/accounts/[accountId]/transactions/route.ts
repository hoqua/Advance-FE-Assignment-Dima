import flexxNextApiService from '@/app/api/FlexxNextApiService/FlexxNextApiService';
import {NextRequest} from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  {params}: {params: Promise<{accountId: string}>},
) {
  const {accountId} = await params;
  const queryParams = req.nextUrl.searchParams.toString();
  const url = queryParams
    ? `account/${accountId}/transactions?${queryParams}`
    : `account/${accountId}/transactions`;
  return flexxNextApiService().get({url, req});
}
