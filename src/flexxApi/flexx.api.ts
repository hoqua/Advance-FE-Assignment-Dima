import {Tenant} from '@/domain/Tenant';

const fetchTenant = async (): Promise<Tenant> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/pages/tenant/fetch-tenant`,
  );

  return response.json();
};

export {fetchTenant};
