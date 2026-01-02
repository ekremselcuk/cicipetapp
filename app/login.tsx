'use client';
import { supabase } from '@/lib/supabase';

export default function Login() {
  // TEST İÇİN: Şifresiz, hızlı giriş yöntemi (Magic Link)
  const handleLogin = async () => {
    const email = prompt("Test için e-posta adresini gir:");
    if (!email) return;

    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      alert("Hata: " + error.message);
    } else {
      alert("Giriş bağlantısı e-postana gönderildi! (Spam kutusuna bakmayı unutma)");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <button 
        onClick={handleLogin}
        className="bg-amber-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-amber-700 transition-all"
      >
        E-posta ile Hızlı Giriş Yap
      </button>
    </div>
  );
}