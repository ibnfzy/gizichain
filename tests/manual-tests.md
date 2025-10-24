# Manual Test Plan

Gunakan panduan berikut ketika menguji aplikasi secara manual.

## Autentikasi
1. Buka aplikasi dan tunggu Splash Screen selesai.
2. Pastikan pengguna tanpa sesi diarahkan ke halaman **Login**.
3. Isi form dengan kredensial yang valid lalu tekan tombol **Masuk**.
4. Verifikasi bahwa token tersimpan di SecureStore dan pengguna diarahkan ke **Dashboard**.
5. Tekan tombol **Keluar** dan pastikan kembali ke halaman **Login**.

## Registrasi
1. Dari halaman Login, pilih tautan "Daftar sekarang".
2. Lengkapi semua kolom (nama, email, kata sandi, konfirmasi).
3. Kirim form dan pastikan diarahkan ke **Dashboard** setelah registrasi sukses.

## Dashboard
1. Setelah login, pastikan sapaan menampilkan nama pengguna.
2. Verifikasi kartu **Status Gizi** berubah warna sesuai status data dari endpoint `/api/inference/latest`.
3. Cek kartu **Kebutuhan Harian** menampilkan energi, protein, dan cairan.
4. Tarik ke bawah untuk melakukan refresh dan amati pembaruan data.

## Styling
1. Pastikan gaya Tailwind (NativeWind) aktif di semua halaman.
2. Konfirmasi palet warna hijau, pink, putih digunakan konsisten pada tombol dan kartu.
3. Pastikan font dasar Inter digunakan pada teks utama.
