import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MetricMind — Enterprise AI-Powered Semantic BI Platform',
  description: 'Enterprise natural language business intelligence with governed semantic metrics, root-cause analysis, and multi-step reasoning.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-surface-canvas text-surface-textMain antialiased selection:bg-brand-500 selection:text-white">
        {children}
      </body>
    </html>
  )
}
