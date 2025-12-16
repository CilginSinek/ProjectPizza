import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-indigo-600">🔒 SecureShare</span>
            </div>
            <div className="flex gap-4">
              <Link
                to="/login"
                className="px-4 py-2 text-gray-700 hover:text-indigo-600 transition"
              >
                Giriş Yap
              </Link>
              <Link
                to="/register"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Kayıt Ol
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Güvenli Dosya Paylaşımı
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Dosyalarınızı AES-256 şifreleme ile güvenli bir şekilde paylaşın.
            Tek kullanımlık linkler, süre sınırlaması ve tam kontrol.
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-3 bg-indigo-600 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 transition shadow-lg"
          >
            Hemen Başla
          </Link>
        </div>

        {/* Features */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">
              AES-256 Şifreleme
            </h3>
            <p className="text-gray-600">
              Dosyalarınız bankacılık seviyesinde şifreleme ile korunur.
              Maksimum güvenlik garantisi.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition">
            <div className="text-4xl mb-4">⏱️</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">
              Süre Sınırlı Paylaşım
            </h3>
            <p className="text-gray-600">
              Dosyalarınız için geçerlilik süresi belirleyin.
              Süre dolunca otomatik olarak silinir.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">
              Tek Kullanımlık Linkler
            </h3>
            <p className="text-gray-600">
              İndirme limiti belirleyin. Bir kez indirilen dosyalar
              otomatik olarak erişime kapanır.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">
              İndirme Takibi
            </h3>
            <p className="text-gray-600">
              Kim, ne zaman indirdi? Tüm indirme geçmişini
              yönetici panelinizden takip edin.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition">
            <div className="text-4xl mb-4">🔑</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">
              JWT Güvenlik
            </h3>
            <p className="text-gray-600">
              Modern JSON Web Token teknolojisi ile
              kimlik doğrulama ve yetkilendirme.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">
              Hızlı Yükleme
            </h3>
            <p className="text-gray-600">
              Büyük dosyaları hızlıca yükleyin.
              İlerleme çubuğu ile anlık takip.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 bg-indigo-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Dosyalarınız Bizimle Güvende
          </h2>
          <p className="text-xl mb-8 text-indigo-100">
            Hemen ücretsiz hesap oluştur, güvenli paylaşıma başla!
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-3 bg-white text-indigo-600 text-lg font-semibold rounded-lg hover:bg-gray-100 transition shadow-lg"
          >
            Ücretsiz Kayıt Ol
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>© 2025 SecureShare - VADI Hackathon WTH'25</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
