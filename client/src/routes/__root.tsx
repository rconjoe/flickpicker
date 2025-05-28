import {
  HeadContent,
  Outlet,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import Header from '../components/Header'

import TanStackQueryLayout from '../integrations/tanstack-query/layout.tsx'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

// this is the "entrypoint" in terms of the first thing to be rendered:
export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      {/* <HeadContent> is necessary to render everything in the "head" property. */}
      <HeadContent />
      <Header />

      <Outlet />
      <TanStackRouterDevtools />

      <TanStackQueryLayout />
    </>
  ),
  head: () => ({
    // TODO: there is still a bunch of head/document stuff to move from the old index.html.
    // https://tanstack.com/router/latest/docs/framework/react/guide/document-head-management
    // The most important meta tags have been moved over already, as seen below.
    meta: [
      {
        title: 'FlickPicker - Movie Night Tracking Application',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0',
      },
      {
        name: 'description',
        content: 'FlickPicker - Movie Night Tracking Application',
      },
      {
        name: 'theme-color',
        content: '#212529',
      },
      {
        name: 'color-scheme',
        content: 'light dark',
      },
    ],
  }),
})
