'use client'

import React, { useState, useEffect } from 'react'

interface FilePreviewProps {
  file: {
    id: number
    filename: string
    url?: string
    mimeType?: string
  } | null
  onClose: () => void
  darkMode?: boolean
}

export default function FilePreview({ file, onClose, darkMode = false }: FilePreviewProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [fileUrl, setFileUrl] = useState<string | null>(null)

    useEffect(() => {
        if (file && file.id) {
            // Create the download URL
            const url = file.url || `/api/attachments/${file.id}`
            console.log('📎 FilePreview URL:', url)
            setFileUrl(url)
            setLoading(false)
        }
    }, [file])




  const getFileType = (): 'image' | 'pdf' | 'other' => {
    if (!file) return 'other'
    const filename = file.filename || ''
    const ext = filename.split('.').pop()?.toLowerCase() || ''

    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) {
      return 'image'
    }
    if (ext === 'pdf') {
      return 'pdf'
    }
    return 'other'
  }

  const fileType = getFileType()

  // Handle close - with safety check
  const handleClose = () => {
    if (onClose && typeof onClose === 'function') {
      onClose()
    }
  }

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  if (!file) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100] p-4"
      onClick={(e) => {
        // Close when clicking on the backdrop
        if (e.target === e.currentTarget) {
          handleClose()
        }
      }}
    >
      <div className={`rounded-lg shadow-xl w-[90vw] h-[90vh] flex flex-col ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        {/* Header */}
        <div className={`p-4 border-b flex justify-between items-center ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              📄 {file.filename || 'Προβολή Αρχείου'}
            </h3>
            <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
              {fileType === 'image' ? 'Εικόνα' : fileType === 'pdf' ? 'PDF' : 'Αρχείο'}
            </span>
          </div>
          <button
            onClick={handleClose}
            className={`w-8 h-8 flex items-center justify-center rounded-full text-xl ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Φόρτωση αρχείου...</p>
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <p className="text-red-500 mb-2">Σφάλμα κατά τη φόρτωση του αρχείου</p>
                <button
                  onClick={() => window.open(fileUrl || '', '_blank')}
                  className={`px-4 py-2 rounded ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                >
                  Άνοιγμα σε νέο παράθυρο
                </button>
              </div>
            </div>
          )}

          {!loading && !error && fileType === 'image' && fileUrl && (
            <div className="flex items-center justify-center h-full">
              <img
                src={fileUrl}
                alt={file.filename}
                className="max-w-full max-h-full object-contain"
                onLoad={() => setLoading(false)}
                onError={() => {
                  setLoading(false)
                  setError(true)
                }}
              />
            </div>
          )}

          {!loading && !error && fileType === 'pdf' && fileUrl && (
            <iframe
              src={`${fileUrl}#toolbar=1&navpanes=1`}
              className="w-full h-full"
              title={file.filename}
              style={{ border: 'none', minHeight: 'calc(90vh - 80px)' }}
              onLoad={() => setLoading(false)}
              onError={() => {
                setLoading(false)
                setError(true)
              }}
            />
          )}

          {!loading && !error && fileType === 'other' && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="text-6xl">📎</div>
              <p className={`text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Δεν είναι δυνατή η προεπισκόπηση αυτού του τύπου αρχείου
              </p>
              <button
                onClick={() => window.open(fileUrl || '', '_blank')}
                className={`px-4 py-2 rounded ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
              >
                Λήψη / Άνοιγμα Αρχείου
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-3 border-t text-center text-sm ${darkMode ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
          <div className="flex justify-between items-center">
            <span>{file.filename}</span>
            <button
              onClick={handleClose}
              className={`px-4 py-1 rounded ${darkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'} font-medium transition-colors`}
            >
              Κλείσιμο
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}