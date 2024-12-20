const fetch = require('node-fetch');

async function createAdmin() {
  try {
    const response = await fetch('http://localhost:3000/api/admin/create', {
      method: 'POST'
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Admin oluşturulurken bir hata oluştu');
    }

    console.log('Admin kullanıcısı başarıyla oluşturuldu:', data.admin);
    process.exit(0);
  } catch (error) {
    console.error('Hata:', error.message);
    if (error.cause) {
      console.error('Hata detayı:', error.cause);
    }
    process.exit(1);
  }
}

createAdmin(); 