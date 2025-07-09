'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './globals.css'
import { SocketProvider } from '@/lib/socket-context'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 1,
          },
        },
      }),
  )
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <QueryClientProvider client={queryClient}>
          <SocketProvider>{children}</SocketProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </body>
    </html>
  )
}
