import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { insertAllowedEmail, upsertAllowedEmails } from '../lib/supabase';

function normalizeEmailsFromText(text: string): string[] {
  const potentialTokens = text
    .replace(/\r/g, '\n')
    .split(/\n|,|;|\s/)
    .map((t) => t.trim())
    .filter(Boolean);
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  const emails = potentialTokens.filter((t) => emailRegex.test(t.toLowerCase()));
  return Array.from(new Set(emails.map((e) => e.toLowerCase())));
}

const Admin: React.FC = () => {
  const [singleEmail, setSingleEmail] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const navigate = useNavigate();

  const parsedBulkEmails = useMemo(() => normalizeEmailsFromText(bulkText), [bulkText]);

  // Generate QR code URL for www.letscreate.club
  useEffect(() => {
    const websiteUrl = 'https://www.letscreate.club';
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(websiteUrl)}`;
    setQrCodeUrl(qrApiUrl);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('adminUser');
    navigate('/login');
  };

  const handleSingleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    const emails = normalizeEmailsFromText(singleEmail);
    if (emails.length !== 1) {
      setError('Enter a valid email.');
      return;
    }
    setIsSubmitting(true);
    try {
      await insertAllowedEmail(emails[0]);
      setMessage(`Added: ${emails[0]}`);
      alert(`Email added: ${emails[0]}`);
      setSingleEmail('');
    } catch (err: any) {
      setError(err?.message || 'Failed to add email');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (parsedBulkEmails.length === 0) {
      setError('No valid emails found.');
      return;
    }
    setIsSubmitting(true);
    try {
      await upsertAllowedEmails(parsedBulkEmails);
      setMessage(`Processed ${parsedBulkEmails.length} emails.`);
      setBulkText('');
      setFileName(null);
    } catch (err: any) {
      setError(err?.message || 'Bulk import failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const text = await file.text();
    // Accept CSV with or without header. Pull any emails we can find.
    setBulkText(text);
  };

  const downloadQRCode = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'letscreate-club-qr-code.png';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading QR code:', error);
      alert('Failed to download QR code. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-teal-800">Admin: Allowed Emails</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="space-y-8">
          <section className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">Add Single Email</h2>
            <form onSubmit={handleSingleAdd} className="flex gap-3 items-center">
              <input
                type="email"
                value={singleEmail}
                onChange={(e) => setSingleEmail(e.target.value)}
                placeholder="user@example.com"
                className="flex-1 px-4 py-3 border rounded-lg"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-3 bg-teal-600 text-white rounded-lg disabled:bg-gray-400"
              >
                {isSubmitting ? 'Adding...' : 'Add'}
              </button>
            </form>
          </section>

          <section className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-2">Bulk Import</h2>
            <p className="text-sm text-gray-500 mb-4">
              Paste a list of emails (any separator) or upload a .csv. Duplicates are ignored.
            </p>
            <div className="flex items-center gap-3 mb-4">
              <input type="file" accept=".csv,text/csv,text/plain" onChange={handleFileChange} />
              {fileName && <span className="text-sm text-gray-600">{fileName}</span>}
            </div>
            <form onSubmit={handleBulkAdd}>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                className="w-full h-40 border rounded-lg p-3 mb-3"
                placeholder="email1@example.com, email2@example.com\n..."
              />
              <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                <span>Found {parsedBulkEmails.length} valid emails</span>
              </div>
              <button
                type="submit"
                disabled={isSubmitting || parsedBulkEmails.length === 0}
                className="px-5 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg disabled:bg-gray-400"
              >
                {isSubmitting ? 'Importing...' : 'Import Emails'}
              </button>
            </form>
          </section>

          <section className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">QR Code Creator</h2>
            <p className="text-sm text-gray-500 mb-4">
              Generate and download QR codes for instant website access - scan to visit!
            </p>
            <div className="flex flex-col items-center gap-4">
              {qrCodeUrl && (
                <div className="border-2 border-gray-200 rounded-lg p-4 bg-white">
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code for www.letscreate.club" 
                    className="w-48 h-48"
                  />
                </div>
              )}
              <div className="text-center">
                <button
                  onClick={downloadQRCode}
                  className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Download QR Code
                </button>
              </div>
            </div>
          </section>

          {(message || error) && (
            <div className={`p-4 rounded-lg ${error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {error || message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;


