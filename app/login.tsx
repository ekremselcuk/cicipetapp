'use client';
import { supabase } from '@/lib/supabase';

export default function Login() {
  const googleIleGiris = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
      <button
        onClick={googleIleGiris}
        className="flex items-center justify-center gap-3 bg-white text-gray-700 font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all border-2 border-gray-50 active:scale-95"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
        Google ile Devam Et
      </button>
      
      <p className="text-[10px] text-amber-900/40 font-medium uppercase tracking-widest">
        Güvenli ve hızlı giriş
      </p>
    </div>
  );
}