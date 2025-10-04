'use client';

import { useState, useRef, useEffect } from 'react';

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
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('uploads');
    if (stored) {
      setUploads(JSON.parse(stored));
    }
  }, []);

  const saveUploads = (newUploads: Upload[]) => {
    setUploads(newUploads);
    localStorage.setItem('uploads', JSON.stringify(newUploads));
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      const newUploads = [data, ...uploads];
      saveUploads(newUploads);
      
      await navigator.clipboard.writeText(data.url);
      setCopiedUrl(data.url);
      setTimeout(() => setCopiedUrl(null), 3000);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
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
    await navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const deleteAll = async () => {
    if (!confirm('Delete all screenshots? This cannot be undone.')) return;
    
    try {
      const res = await fetch('/api/delete-all', { method: 'DELETE' });
      if (res.ok) {
        saveUploads([]);
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
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          SShot
        </h1>
        <p className="text-slate-600">Upload screenshots, get instant links</p>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-3 border-dashed rounded-2xl p-16 mb-8 cursor-pointer
          transition-all duration-300 ease-out
          ${isDragging 
            ? 'border-blue-500 bg-blue-50 scale-105' 
            : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50'
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
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-600 text-lg">Uploading...</p>
            </>
          ) : (
            <>
              <svg className="w-16 h-16 mx-auto mb-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-slate-700 text-xl font-medium mb-2">
                Drop your screenshot here
              </p>
              <p className="text-slate-500">or click to browse</p>
            </>
          )}
        </div>
      </div>

      {copiedUrl && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl animate-slide-up">
          <p className="text-green-800 text-center font-medium">
            ✓ Link copied to clipboard!
          </p>
        </div>
      )}

      {uploads.length > 0 && (
        <div className="animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-slate-800">
              History ({uploads.length})
            </h2>
            <button
              onClick={deleteAll}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium shadow-sm hover:shadow-md"
            >
              Delete All
            </button>
          </div>

          <div className="space-y-2">
            {uploads.map((upload, index) => (
              <div
                key={upload.timestamp}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-slate-700 font-medium">{upload.filename}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-500 text-sm">{formatDate(upload.timestamp)}</span>
                    <svg 
                      className={`w-5 h-5 text-slate-400 transition-transform ${expandedIndex === index ? 'rotate-180' : ''}`}
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
                    <img 
                      src={upload.url} 
                      alt={upload.filename}
                      className="w-full rounded-lg border border-slate-200"
                    />
                    <button
                      onClick={() => copyToClipboard(upload.url)}
                      className={`
                        w-full px-4 py-3 rounded-lg font-medium transition-all
                        ${copiedUrl === upload.url
                          ? 'bg-green-500 text-white'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }
                      `}
                    >
                      {copiedUrl === upload.url ? '✓ Copied!' : 'Copy Link'}
                    </button>
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
