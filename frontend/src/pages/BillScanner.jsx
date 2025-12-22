import React, { useState, useRef } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function BillScanner() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleExtract = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const response = await axios.post('/vision/extract', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Pass the extracted data to the New Sale page
      navigate('/sales/new', { state: { extractedBill: response.data } });
      
    } catch (err) {
      console.error('Extraction failed:', err);
      setError('Failed to extract bill data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto pt-24 px-4">
      <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-2xl">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent mb-6 text-center">
          AI Bill Scanner
        </h1>

        <div className="space-y-8">
          {/* Upload Area */}
          <div 
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
              selectedImage ? 'border-violet-500 bg-violet-500/10' : 'border-slate-700 hover:border-violet-500 hover:bg-slate-800'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileSelect}
            />
            
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-md" />
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-violet-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-medium text-white">Tap to Scan Bill</p>
                  <p className="text-sm text-slate-400">or upload a photo</p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <button
            onClick={handleExtract}
            disabled={!selectedImage || loading}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              !selectedImage || loading
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-violet-600 hover:bg-violet-700 text-white shadow-lg hover:shadow-violet-600/25'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Bill...
              </span>
            ) : (
              'Extract Data'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
