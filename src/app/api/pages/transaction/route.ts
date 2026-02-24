import flexxNextApiService from '@/app/api/FlexxNextApiService/FlexxNextApiService';
import {NextRequest} from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const queryParams = req.nextUrl.searchParams.toString();
  return flexxNextApiService().get({url: `transaction?${queryParams}`, req});
}
