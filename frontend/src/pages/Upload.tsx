import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { logout } from '../utils/auth';

interface UploadedFile {
  file: File;
  progress: number;
  uploadedUrl?: string;
}

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [shareSettings, setShareSettings] = useState({
    expiryTime: '24h',
    downloadLimit: '5',
    accessType: 'public' as 'public' | 'restricted' | 'password',
    allowedEmails: [] as string[],
    password: '',
  });
  const [emailInput, setEmailInput] = useState('');
  const [generatedLink, setGeneratedLink] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    setSelectedFile({
      file,
      progress: 0,
    });
    setGeneratedLink('');
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const addEmail = () => {
    if (emailInput && /\S+@\S+\.\S+/.test(emailInput)) {
      if (!shareSettings.allowedEmails.includes(emailInput)) {
        setShareSettings({
          ...shareSettings,
          allowedEmails: [...shareSettings.allowedEmails, emailInput],
        });
        setEmailInput('');
      }
    }
  };

  const removeEmail = (email: string) => {
    setShareSettings({
      ...shareSettings,
      allowedEmails: shareSettings.allowedEmails.filter((e) => e !== email),
    });
  };

  const simulateUpload = () => {
    if (!selectedFile) return;

    setIsUploading(true);
    let progress = 0;

    const interval = setInterval(() => {
      progress += 10;
      setSelectedFile(prev => prev ? { ...prev, progress } : null);

      if (progress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
        const mockLink = `https://secureshare.app/d/${Math.random().toString(36).substring(7)}`;
        setGeneratedLink(mockLink);
        setSelectedFile(prev => prev ? { ...prev, uploadedUrl: mockLink } : null);
      }
    }, 300);
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    // Validation for restricted access
    if (shareSettings.accessType === 'restricted' && shareSettings.allowedEmails.length === 0) {
      alert('En az bir e-posta adresi ekleyin!');
      return;
    }

    // Validation for password
    if (shareSettings.accessType === 'password' && !shareSettings.password) {
      alert('Lütfen bir şifre belirleyin!');
      return;
    }

    console.log('Uploading file:', selectedFile.file);
    console.log('Share settings:', shareSettings);

    simulateUpload();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    alert('Link kopyalandı!');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold text-indigo-600">
              🔒 SecureShare
            </Link>
            <div className="flex gap-4">
              <Link
                to="/dashboard"
                className="px-4 py-2 text-gray-700 hover:text-indigo-600 transition"
              >
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 text-gray-700 hover:text-indigo-600 transition"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dosya Yükle</h1>
          <p className="text-gray-600 mb-8">
            Dosyanızı yükleyin, paylaşım ayarlarını yapın ve güvenli link oluşturun.
          </p>

          {/* File Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-300 hover:border-indigo-400'
            }`}
          >
            {!selectedFile ? (
              <div>
                <div className="text-6xl mb-4">📁</div>
                <p className="text-xl font-semibold text-gray-700 mb-2">
                  Dosyayı buraya sürükleyin
                </p>
                <p className="text-gray-500 mb-4">veya</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                  Dosya Seç
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <p className="text-sm text-gray-500 mt-4">
                  Maksimum dosya boyutu: 100 MB
                </p>
              </div>
            ) : (
              <div>
                <div className="text-6xl mb-4">📄</div>
                <p className="text-lg font-semibold text-gray-800 mb-1">
                  {selectedFile.file.name}
                </p>
                <p className="text-gray-500 mb-4">
                  {formatFileSize(selectedFile.file.size)}
                </p>

                {/* Progress Bar */}
                {selectedFile.progress > 0 && selectedFile.progress < 100 && (
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${selectedFile.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Yükleniyor... {selectedFile.progress}%
                    </p>
                  </div>
                )}

                {/* Upload Complete */}
                {selectedFile.progress === 100 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-center text-green-600 mb-2">
                      <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-semibold">Yükleme Tamamlandı!</span>
                    </div>
                  </div>
                )}

                {!isUploading && selectedFile.progress === 0 && (
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Dosyayı Değiştir
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Share Settings */}
          {selectedFile && !generatedLink && (
            <div className="mt-8 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Paylaşım Ayarları</h2>

              {/* Access Control */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Erişim Kontrolü
                </label>
                <div className="space-y-3">
                  {/* Public */}
                  <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition ${
                    shareSettings.accessType === 'public'
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-300 hover:border-indigo-400'
                  }`}>
                    <input
                      type="radio"
                      name="accessType"
                      value="public"
                      checked={shareSettings.accessType === 'public'}
                      onChange={() => setShareSettings({ ...shareSettings, accessType: 'public' })}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <div className="font-medium text-gray-900">🌍 Herkese Açık</div>
                      <div className="text-sm text-gray-600">
                        Linki olan herkes dosyayı indirebilir
                      </div>
                    </div>
                  </label>

                  {/* Restricted */}
                  <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition ${
                    shareSettings.accessType === 'restricted'
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-300 hover:border-indigo-400'
                  }`}>
                    <input
                      type="radio"
                      name="accessType"
                      value="restricted"
                      checked={shareSettings.accessType === 'restricted'}
                      onChange={() => setShareSettings({ ...shareSettings, accessType: 'restricted' })}
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">👥 Belirli Kişiler</div>
                      <div className="text-sm text-gray-600 mb-3">
                        Sadece e-posta adresi belirtilen kişiler erişebilir
                      </div>

                      {shareSettings.accessType === 'restricted' && (
                        <div className="mt-3 space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="email"
                              value={emailInput}
                              onChange={(e) => setEmailInput(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && addEmail()}
                              placeholder="ornek@email.com"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                            />
                            <button
                              onClick={addEmail}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                            >
                              Ekle
                            </button>
                          </div>

                          {shareSettings.allowedEmails.length > 0 && (
                            <div className="space-y-1">
                              {shareSettings.allowedEmails.map((email) => (
                                <div
                                  key={email}
                                  className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-gray-200"
                                >
                                  <span className="text-sm text-gray-700">{email}</span>
                                  <button
                                    onClick={() => removeEmail(email)}
                                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </label>

                  {/* Password Protected */}
                  <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition ${
                    shareSettings.accessType === 'password'
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-300 hover:border-indigo-400'
                  }`}>
                    <input
                      type="radio"
                      name="accessType"
                      value="password"
                      checked={shareSettings.accessType === 'password'}
                      onChange={() => setShareSettings({ ...shareSettings, accessType: 'password' })}
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">🔐 Şifre Korumalı</div>
                      <div className="text-sm text-gray-600 mb-3">
                        İndirmek için şifre gerekli
                      </div>

                      {shareSettings.accessType === 'password' && (
                        <div className="mt-3">
                          <input
                            type="password"
                            value={shareSettings.password}
                            onChange={(e) => setShareSettings({ ...shareSettings, password: e.target.value })}
                            placeholder="Şifre belirleyin"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
                          />
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Expiry Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Geçerlilik Süresi
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { value: 'once', label: 'Tek Kullanım' },
                    { value: '1h', label: '1 Saat' },
                    { value: '24h', label: '1 Gün' },
                    { value: '7d', label: '1 Hafta' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        setShareSettings({ ...shareSettings, expiryTime: option.value })
                      }
                      className={`px-4 py-3 rounded-lg border-2 font-medium transition ${
                        shareSettings.expiryTime === option.value
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-gray-300 hover:border-indigo-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Download Limit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İndirme Limiti
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { value: '1', label: '1 İndirme' },
                    { value: '5', label: '5 İndirme' },
                    { value: '10', label: '10 İndirme' },
                    { value: 'unlimited', label: 'Sınırsız' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        setShareSettings({ ...shareSettings, downloadLimit: option.value })
                      }
                      className={`px-4 py-3 rounded-lg border-2 font-medium transition ${
                        shareSettings.downloadLimit === option.value
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-gray-300 hover:border-indigo-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className={`w-full py-3 rounded-lg font-semibold transition shadow-md ${
                  isUploading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {isUploading ? 'Yükleniyor...' : 'Yükle ve Link Oluştur'}
              </button>
            </div>
          )}

          {/* Generated Link */}
          {generatedLink && (
            <div className="mt-8 p-6 bg-green-50 border-2 border-green-200 rounded-xl">
              <div className="flex items-center mb-4">
                <svg className="w-6 h-6 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-green-800">
                  Paylaşım Linki Oluşturuldu!
                </h3>
              </div>
              <div className="bg-white rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-2">Paylaşım Linki:</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={generatedLink}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                  >
                    📋 Kopyala
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-700 space-y-1">
                <p>
                  🔒 Erişim:{' '}
                  <span className="font-semibold">
                    {shareSettings.accessType === 'public' && 'Herkese Açık'}
                    {shareSettings.accessType === 'restricted' && `Belirli Kişiler (${shareSettings.allowedEmails.length} kişi)`}
                    {shareSettings.accessType === 'password' && 'Şifre Korumalı'}
                  </span>
                </p>
                <p>
                  ⏱️ Geçerlilik:{' '}
                  <span className="font-semibold">
                    {shareSettings.expiryTime === 'once'
                      ? 'Tek Kullanımlık'
                      : shareSettings.expiryTime === '1h'
                      ? '1 Saat'
                      : shareSettings.expiryTime === '24h'
                      ? '1 Gün'
                      : '1 Hafta'}
                  </span>
                </p>
                <p>
                  📥 İndirme Limiti:{' '}
                  <span className="font-semibold">
                    {shareSettings.downloadLimit === 'unlimited'
                      ? 'Sınırsız'
                      : `${shareSettings.downloadLimit} İndirme`}
                  </span>
                </p>
                {shareSettings.accessType === 'restricted' && shareSettings.allowedEmails.length > 0 && (
                  <div className="mt-2">
                    <p className="font-semibold mb-1">İzin verilen e-postalar:</p>
                    <div className="pl-4 space-y-1">
                      {shareSettings.allowedEmails.map((email) => (
                        <p key={email}>• {email}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setGeneratedLink('');
                  setShareSettings({
                    expiryTime: '24h',
                    downloadLimit: '5',
                    accessType: 'public',
                    allowedEmails: [],
                    password: '',
                  });
                }}
                className="mt-4 w-full py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Yeni Dosya Yükle
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload;
