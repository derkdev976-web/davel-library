"use client"

import dynamic from 'next/dynamic'

const PDFViewer = dynamic(() => import('./simple-pdf-viewer').then(mod => ({ default: mod.SimplePDFViewer })), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-96 p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading PDF Viewer...</p>
      </div>
    </div>
  )
})

export { PDFViewer }
