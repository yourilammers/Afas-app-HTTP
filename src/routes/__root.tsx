import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import PageLayout from '../components/Layout/PageLayout';
import Providers from '../components/Providers/Providers';

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: () => (
    <Providers>
      <PageLayout>
        <Outlet />
      </PageLayout>
    </Providers>
  ),
  notFoundComponent: () => <>Not found</>,
});
