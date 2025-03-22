import { redirect } from 'next/navigation';

// Bu sayfa, bot ve gezgiciler için SEO dostu bir ürün sayfası sağlar
// ve kullanıcıyı doğru dashboard rotasına yönlendirir
export default function ProductPage({ params }) {
  const { id } = params;
  
  // Server-side rendering yapıldığında bu yönlendirme gerçekleşir
  // SEO botları meta verileri alır, kullanıcılar dashboard'a yönlendirilir
  redirect(`/dashboard/products/${id}`);
  
  // Bu kısım hiçbir zaman çalışmaz ama SEO için eklenmiştir
  return null;
} 