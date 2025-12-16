import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

interface FileInfo {
  id: string;
  name: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  accessType: 'public' | 'restricted' | 'password';
  expiresAt: string;
  downloadLimit: number;
  downloadCount: number;
  isExpired: boolean;
  isLimitReached: boolean;
  fileUrl: string;
  mimeType: string;
}

const Download = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch file info
    const fetchFileInfo = async () => {
      setLoading(true);
      try {
        // TODO: Replace with real API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock data - Change mimeType to test different file types
        const mockData: FileInfo = {
          id: fileId || 'abc123',
          name: 'Proje_Dokumani.pdf',
          size: 2457600, // 2.4 MB
          uploadedBy: 'user@example.com',
          uploadedAt: new Date().toISOString(),
          accessType: 'public',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          downloadLimit: 5,
          downloadCount: 2,
          isExpired: false,
          isLimitReached: false,
          fileUrl: 'https://getsamplefiles.com/download/txt/sample-5.txt', // Mock URL
          mimeType: 'text/plain', // Change to test: 'application/pdf' 'image/jpeg', 'video/mp4', 'audio/mpeg', 'text/plain'
        };

        setFileInfo(mockData);

        // If public access, auto-verify
        if (mockData.accessType === 'public') {
          setIsVerified(true);
        }
      } catch (err) {
        setError('Dosya bulunamadı veya erişim sağlanamadı.');
      } finally {
        setLoading(false);
      }
    };

    fetchFileInfo();
  }, [fileId]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileType = (mimeType: string, fileName: string): string => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.startsWith('text/') || fileName.endsWith('.txt') || fileName.endsWith('.md')) return 'text';
    return 'other';
  };

  const getFileIcon = (type: string): string => {
    switch (type) {
      case 'image': return '🖼️';
      case 'video': return '🎬';
      case 'audio': return '🎵';
      case 'pdf': return '📄';
      case 'text': return '📝';
      default: return '📁';
    }
  };

  const handleEmailVerification = () => {
    if (!emailInput || !/\S+@\S+\.\S+/.test(emailInput)) {
      alert('Geçerli bir e-posta adresi girin!');
      return;
    }

    // TODO: API call to verify email
    console.log('Verifying email:', emailInput);

    // Mock verification
    if (emailInput === 'allowed@example.com') {
      setIsVerified(true);
    } else {
      alert('Bu e-posta adresi dosyaya erişim yetkisine sahip değil!');
    }
  };

  const handlePasswordVerification = () => {
    if (!passwordInput) {
      alert('Lütfen şifre girin!');
      return;
    }

    // TODO: API call to verify password
    console.log('Verifying password:', passwordInput);

    // Mock verification
    if (passwordInput === '123456') {
      setIsVerified(true);
    } else {
      alert('Yanlış şifre!');
    }
  };

  const handleDownload = async () => {
    if (!isVerified || !fileInfo) return;

    setIsDownloading(true);

    try {
      // TODO: Real download API call
      console.log('Downloading file:', fileInfo.id);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate download
      const link = document.createElement('a');
      link.href = fileInfo.fileUrl;
      link.download = fileInfo.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Update download count
      setFileInfo({
        ...fileInfo,
        downloadCount: fileInfo.downloadCount + 1,
      });
    } catch (err) {
      alert('İndirme sırasında bir hata oluştu!');
    } finally {
      setIsDownloading(false);
    }
  };

  const renderPreview = () => {
    if (!fileInfo || !isVerified || !showPreview) return null;

    const fileType = getFileType(fileInfo.mimeType, fileInfo.name);

    return (
      <div className="mt-6 bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Önizleme</h3>
          <button
            onClick={() => setShowPreview(false)}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            ✕ Kapat
          </button>
        </div>

        <div className="bg-white rounded-lg overflow-hidden">
          {fileType === 'image' && (
            <div className="flex justify-center p-4">
              <img
                src={fileInfo.fileUrl}
                alt={fileInfo.name}
                className="max-w-full max-h-96 object-contain rounded-lg shadow-md"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EResim Yüklenemedi%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
          )}

          {fileType === 'video' && (
            <div className="p-4">
              <video
                controls
                className="w-full rounded-lg shadow-md"
                src={fileInfo.fileUrl}
              >
                Tarayıcınız video etiketini desteklemiyor.
              </video>
            </div>
          )}

          {fileType === 'audio' && (
            <div className="p-6">
              <div className="text-center mb-4">
                <div className="text-6xl mb-2">🎵</div>
                <p className="text-sm text-gray-600">{fileInfo.name}</p>
              </div>
              <audio
                controls
                className="w-full"
                src={fileInfo.fileUrl}
              >
                Tarayıcınız audio etiketini desteklemiyor.
              </audio>
            </div>
          )}

          {fileType === 'pdf' && (
            <div className="h-96">
              <iframe
                src={fileInfo.fileUrl}
                className="w-full h-full border-0 rounded-lg"
                title="PDF Önizleme"
              />
            </div>
          )}

          {fileType === 'text' && (
            <div className="p-4 max-h-96 overflow-y-auto">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono bg-gray-50 p-4 rounded">
                {/* Mock text content */}
                Bu bir metin dosyası önizlemesidir.

                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

                Gerçek API entegrasyonunda buraya dosya içeriği gelecek.
              </pre>
            </div>
          )}

          {fileType === 'other' && (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">📁</div>
              <p className="text-gray-600 mb-2">Bu dosya türü önizlenemiyor</p>
              <p className="text-sm text-gray-500">
                Dosyayı indirerek görüntüleyebilirsiniz
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-xl font-semibold text-gray-700">Dosya bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !fileInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Dosya Bulunamadı</h1>
          <p className="text-gray-600 mb-6">
            {error || 'Bu link geçersiz veya dosya silinmiş olabilir.'}
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  if (fileInfo.isExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⏰</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Link Süresi Doldu</h1>
          <p className="text-gray-600 mb-2">
            Bu dosyanın paylaşım süresi sona erdi.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Son geçerlilik: {formatDate(fileInfo.expiresAt)}
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  if (fileInfo.isLimitReached) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">İndirme Limiti Doldu</h1>
          <p className="text-gray-600 mb-2">
            Bu dosya maksimum indirme sayısına ulaştı.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            İndirme limiti: {fileInfo.downloadLimit} / {fileInfo.downloadLimit}
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  const fileType = getFileType(fileInfo.mimeType, fileInfo.name);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold text-indigo-600">
              🔒 SecureShare
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* File Icon */}
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">{getFileIcon(fileType)}</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{fileInfo.name}</h1>
            <p className="text-gray-600">{formatFileSize(fileInfo.size)}</p>
          </div>

          {/* File Info */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Yükleyen:</span>
              <span className="font-medium text-gray-900">{fileInfo.uploadedBy}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Yüklenme Tarihi:</span>
              <span className="font-medium text-gray-900">
                {formatDate(fileInfo.uploadedAt)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Son Geçerlilik:</span>
              <span className="font-medium text-gray-900">
                {formatDate(fileInfo.expiresAt)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Kalan İndirme:</span>
              <span className="font-medium text-gray-900">
                {fileInfo.downloadLimit === 999
                  ? 'Sınırsız'
                  : `${fileInfo.downloadLimit - fileInfo.downloadCount} / ${
                      fileInfo.downloadLimit
                    }`}
              </span>
            </div>
          </div>

          {/* Access Control */}
          {!isVerified && (
            <div className="mb-6">
              {/* Email Verification */}
              {fileInfo.accessType === 'restricted' && (
                <div className="border-2 border-indigo-200 rounded-xl p-6 bg-indigo-50">
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">👥</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Erişim Kontrolü
                    </h3>
                    <p className="text-sm text-gray-600">
                      Bu dosya belirli kişilerle paylaşılmıştır.
                      <br />
                      E-posta adresinizi girin.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleEmailVerification()}
                      placeholder="E-posta adresiniz"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                    <button
                      onClick={handleEmailVerification}
                      className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
                    >
                      Doğrula ve Devam Et
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    💡 İpucu: Test için <code className="bg-white px-2 py-1 rounded">allowed@example.com</code> kullanın
                  </p>
                </div>
              )}

              {/* Password Verification */}
              {fileInfo.accessType === 'password' && (
                <div className="border-2 border-indigo-200 rounded-xl p-6 bg-indigo-50">
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">🔐</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Şifre Gerekli
                    </h3>
                    <p className="text-sm text-gray-600">
                      Bu dosya şifre ile korunmaktadır.
                      <br />
                      İndirmek için şifreyi girin.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handlePasswordVerification()}
                      placeholder="Şifre"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                    <button
                      onClick={handlePasswordVerification}
                      className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
                    >
                      Doğrula ve Devam Et
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    💡 İpucu: Test için şifre <code className="bg-white px-2 py-1 rounded">123456</code>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Preview */}
          {renderPreview()}

          {/* Download Button */}
          {isVerified && (
            <div className="mt-6">
              {!showPreview && fileType !== 'other' && (
                <button
                  onClick={() => setShowPreview(true)}
                  className="w-full mb-3 py-2 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition font-medium"
                >
                  👁️ Önizlemeyi Göster
                </button>
              )}

              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className={`w-full py-4 rounded-xl font-bold text-lg transition shadow-lg ${
                  isDownloading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                }`}
              >
                {isDownloading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-3"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    İndiriliyor...
                  </span>
                ) : (
                  '📥 Dosyayı İndir'
                )}
              </button>

              <p className="text-xs text-gray-500 mt-4 text-center">
                {fileInfo.accessType === 'public' && '🌍 Bu dosya herkese açıktır'}
                {fileInfo.accessType === 'restricted' && '✅ E-posta doğrulandı'}
                {fileInfo.accessType === 'password' && '✅ Şifre doğrulandı'}
              </p>
            </div>
          )}

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <div className="text-2xl mr-3">🔒</div>
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-1">Güvenlik Bildirisi</p>
                <p>
                  Bu dosya AES-256 şifreleme ile korunmaktadır. İndirme işlemi
                  güvenli bağlantı üzerinden gerçekleştirilir.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <Link to="/" className="text-gray-600 hover:text-indigo-600 transition text-sm">
            ← Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Download;
