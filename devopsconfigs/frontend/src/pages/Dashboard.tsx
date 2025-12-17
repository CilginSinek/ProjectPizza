import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { logout, getToken } from "../utils/auth";

interface SharedFile {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  expiresAt: string;
  accessType: "public" | "restricted" | "password";
  downloadCount: number;
  downloadLimit: number;
  shareLink: string;
  status: "active" | "expired" | "limit_reached";
}

const Dashboard = () => {
  const [files, setFiles] = useState<SharedFile[]>([]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date().getTime();
    const expiry = new Date(expiresAt).getTime();
    const diff = expiry - now;

    if (diff < 0) return "Süresi doldu";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} gün kaldı`;
    if (hours > 0) return `${hours} saat kaldı`;
    return "Yakında dolacak";
  };

  const copyToClipboard = (link: string) => {
    navigator.clipboard.writeText(link);
    alert("Link kopyalandı!");
  };

  const handleDelete = async (fileId: string) => {
    if (window.confirm("Bu dosyayı silmek istediğinize emin misiniz?")) {
      try {
        const token = getToken();
        const response = await fetch(`/api/files/delete/${fileId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setFiles(files.filter((f) => f.id !== fileId));
          alert("Dosya başarıyla silindi.");
        } else {
          const data = await response.json();
          alert(data.message || "Dosya silinirken bir hata oluştu.");
        }
      } catch (error) {
        console.error("Delete error:", error);
        alert("Bir hata oluştu.");
      }
    }
  };

  const handleDownload = async (file: SharedFile) => {
    try {
      const token = getToken();
      const response = await fetch(file.shareLink, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
      alert("İndirme başarısız oldu.");
    }
  };

  // Statistics
  const stats = {
    totalFiles: files.length,
    totalDownloads: files.reduce((sum, file) => sum + file.downloadCount, 0),
    activeFiles: files.filter((f) => f.status === "active").length,
    expiredFiles: files.filter(
      (f) => f.status === "expired" || f.status === "limit_reached"
    ).length,
  };

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const token = getToken();
        const response = await fetch("/api/pages/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Map backend data to frontend interface
        const mappedFiles = (data.data || []).map((file: any) => ({
          id: file._id,
          name: file.filename,
          size: file.size,
          uploadedAt: file.uploadedAt || file.createdAt,
          expiresAt: file.expiresAt,
          accessType: file.accessLevel || "private", // Backend uses accessLevel
          downloadCount: file.downloadCount,
          downloadLimit: file.downloadLimit || 999, // Fallback
          shareLink: `${window.location.origin}/download/${file._id}`, // Frontend route for download or direct API link
          status:
            file.downloadCount >= (file.downloadLimit || 999)
              ? "limit_reached"
              : "active", // Simple status logic
        }));

        setFiles(mappedFiles);
      } catch (error) {
        console.error("Error fetching files:", error);
        setFiles([]);
      }
    };
    fetchFiles();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold text-indigo-600">
              🔒 PizzaFile
            </Link>
            <div className="flex gap-4">
              <Link
                to="/upload"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                + Yeni Dosya Yükle
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Yüklediğiniz dosyaları yönetin</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Toplam Dosya</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalFiles}
                </p>
              </div>
              <div className="text-4xl">📁</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Toplam İndirme</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalDownloads}
                </p>
              </div>
              <div className="text-4xl">📥</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Aktif Paylaşım</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.activeFiles}
                </p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Süresi Dolan</p>
                <p className="text-3xl font-bold text-red-600">
                  {stats.expiredFiles}
                </p>
              </div>
              <div className="text-4xl">⏰</div>
            </div>
          </div>
        </div>

        {/* Files Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Dosyalarım</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dosya
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Erişim
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İndirme
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Süre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {files.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {file.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatFileSize(file.size)} •{" "}
                          {formatDate(file.uploadedAt)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${file.accessType === "public"
                            ? "bg-blue-100 text-blue-800"
                            : file.accessType === "restricted"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-orange-100 text-orange-800"
                          }`}
                      >
                        {file.accessType === "public" && "🌍 Herkese Açık"}
                        {file.accessType === "restricted" &&
                          "👥 Belirli Kişiler"}
                        {file.accessType === "password" && "🔐 Şifreli"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {file.downloadCount} /{" "}
                        {file.downloadLimit === 999 ? "∞" : file.downloadLimit}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className={`h-1.5 rounded-full ${file.downloadCount >= file.downloadLimit
                              ? "bg-red-500"
                              : "bg-green-500"
                            }`}
                          style={{
                            width: `${Math.min(
                              (file.downloadCount / file.downloadLimit) * 100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {getTimeRemaining(file.expiresAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(file.expiresAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {file.status === "active" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Aktif
                        </span>
                      )}
                      {file.status === "expired" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          ⏰ Süresi Doldu
                        </span>
                      )}
                      {file.status === "limit_reached" && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          🚫 Limit Doldu
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(file.shareLink)}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                          title="Linki Kopyala"
                        >
                          📋
                        </button>
                        <button
                          onClick={() => handleDownload(file)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                          title="İndir"
                        >
                          🔗
                        </button>
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                          title="Sil"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {files.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📂</div>
              <p className="text-xl font-semibold text-gray-900 mb-2">
                Henüz dosya yüklemediniz
              </p>
              <p className="text-gray-600 mb-6">
                İlk dosyanızı yükleyerek güvenli paylaşıma başlayın!
              </p>
              <Link
                to="/upload"
                className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
              >
                Dosya Yükle
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              💡 Hızlı İpuçları
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Dosyalarınızı AES-256 şifreleme ile güvende tutuyoruz</li>
              <li>• Paylaşım linklerini kopyalamak için 📋 ikonuna tıklayın</li>
              <li>• Süresi dolan dosyalar otomatik olarak silinir</li>
              <li>• İndirme geçmişini takip edebilirsiniz</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📊 Kullanım İstatistikleri
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Ortalama Dosya Boyutu
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatFileSize(
                    files.reduce((sum, f) => sum + f.size, 0) / files.length ||
                    0
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Toplam Depolama</span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatFileSize(files.reduce((sum, f) => sum + f.size, 0))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Ortalama İndirme</span>
                <span className="text-sm font-semibold text-gray-900">
                  {(stats.totalDownloads / files.length || 0).toFixed(1)} /
                  dosya
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
