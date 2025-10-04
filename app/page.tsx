'use client';

import { useState, useRef, useEffect } from 'react';
import { upload } from '@vercel/blob/client';

interface Upload {
  url: string;
  filename: string;
  timestamp: number;
}

export default function Home() {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [showCopyAnimation, setShowCopyAnimation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    try {
      const res = await fetch('/api/blobs');
      if (res.ok) {
        const data = await res.json();
        setUploads(data.sort((a: Upload, b: Upload) => b.timestamp - a.timestamp));
      }
    } catch (error) {
      console.error('Failed to fetch uploads:', error);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setIsUploading(true);
    setCopiedUrl(null);

    try {
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });

      const newUpload: Upload = {
        url: newBlob.url,
        filename: newBlob.pathname,
        timestamp: Date.now(),
      };

      setUploads([newUpload, ...uploads]);
      setExpandedIndex(0);
      
      try {
        await navigator.clipboard.writeText(newBlob.url);
        setCopiedUrl(newBlob.url);
        setShowCopyAnimation(true);
        setTimeout(() => {
          setCopiedUrl(null);
          setShowCopyAnimation(false);
        }, 5000);
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError);
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setShowCopyAnimation(true);
      setTimeout(() => {
        setCopiedUrl(null);
        setShowCopyAnimation(false);
      }, 2000);
    } catch (error) {
      console.error('Clipboard copy failed:', error);
    }
  };

  const deleteUpload = async (url: string) => {
    if (!confirm('Delete this screenshot?')) return;
    
    try {
      const res = await fetch('/api/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      
      if (res.ok) {
        setUploads(uploads.filter(u => u.url !== url));
        if (expandedIndex !== null && expandedIndex >= uploads.length - 1) {
          setExpandedIndex(Math.max(0, uploads.length - 2));
        }
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const deleteAll = async () => {
    if (!confirm('Delete all screenshots? This cannot be undone.')) return;
    
    try {
      const res = await fetch('/api/delete-all', { method: 'DELETE' });
      if (res.ok) {
        setUploads([]);
        setExpandedIndex(null);
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <div className="text-center mb-12 animate-fade-in">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
          CloudClip
        </h1>
        <p className="text-slate-600 dark:text-slate-300">Upload screenshots, get instant links</p>
      </div>

      {showCopyAnimation && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50 animate-fade-in">
          <div className="bg-green-500 text-white px-8 py-6 rounded-2xl shadow-2xl transform scale-110 animate-pulse">
            <div className="flex items-center gap-4">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-2xl font-bold">Copied to Clipboard!</span>
            </div>
          </div>
        </div>
      )}

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-3 border-dashed rounded-2xl p-16 mb-8 cursor-pointer
          transition-all duration-300 ease-out
          ${isDragging 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105' 
            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-700'
          }
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
          shadow-lg hover:shadow-xl animate-slide-up
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
        
        <div className="text-center">
          {isUploading ? (
            <>
              <div className="w-16 h-16 border-4 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-300 text-lg">Uploading...</p>
            </>
          ) : (
            <>
              <svg className="w-16 h-16 mx-auto mb-4 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-slate-700 dark:text-slate-200 text-xl font-medium mb-2">
                Drop your screenshot here
              </p>
              <p className="text-slate-500 dark:text-slate-400">or click to browse</p>
            </>
          )}
        </div>
      </div>

      {copiedUrl && (
        <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-300 dark:border-green-600 rounded-2xl animate-slide-up shadow-lg">
          <div className="flex items-center justify-center gap-3 mb-3">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-green-800 dark:text-green-300 text-xl font-bold">
              Upload Successful!
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-green-200 dark:border-green-700">
            <p className="text-green-700 dark:text-green-400 text-sm font-medium mb-1 text-center">Link copied to clipboard:</p>
            <p className="text-slate-600 dark:text-slate-300 text-xs break-all text-center font-mono">{copiedUrl}</p>
          </div>
        </div>
      )}

      {uploads.length > 0 && (
        <div className="animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              History ({uploads.length})
            </h2>
            <button
              onClick={deleteAll}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded-lg transition-colors font-medium shadow-sm hover:shadow-md"
            >
              Delete All
            </button>
          </div>

          <div className="space-y-2">
            {uploads.map((upload, index) => (
              <div
                key={upload.timestamp}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <svg className="w-5 h-5 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-slate-700 dark:text-slate-200 font-medium">{upload.filename}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-500 dark:text-slate-400 text-sm">{formatDate(upload.timestamp)}</span>
                    <svg 
                      className={`w-5 h-5 text-slate-400 dark:text-slate-500 transition-transform ${expandedIndex === index ? 'rotate-180' : ''}`}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {expandedIndex === index && (
                  <div className="px-6 pb-6 space-y-4 animate-slide-up">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(upload.url);
                        }}
                        className={`
                          flex-1 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2
                          ${copiedUrl === upload.url
                            ? 'bg-green-500 dark:bg-green-600 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white'
                          }
                        `}
                      >
                        {copiedUrl === upload.url ? (
                          <>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Copied!
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy Link
                          </>
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteUpload(upload.url);
                        }}
                        className="px-4 py-3 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <img 
                      src={upload.url} 
                      alt={upload.filename}
                      className="w-full max-w-md mx-auto rounded-lg border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
