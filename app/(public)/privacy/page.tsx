import type { Metadata } from "next";
import Link from "next/link";
import {
  LegalPage,
  type LegalSection,
} from "@/components/public/sections/LegalPage";

export const metadata: Metadata = {
  title: "Kebijakan Privasi | SS Umroh",
  description:
    "Kebijakan Privasi SS Umroh menjelaskan cara PT. Sarana Sadaya mengumpulkan, menggunakan, menyimpan, dan melindungi data pribadi pengguna.",
};

const EFFECTIVE_DATE = "21 Juli 2026";

const SECTIONS: LegalSection[] = [
  {
    id: "pendahuluan",
    title: "Pendahuluan",
    content: (
      <>
        <p>
          PT. Sarana Sadaya, dengan merek dagang SS Umroh (&ldquo;kami&rdquo;),
          menghormati privasi calon jamaah, jamaah, pengunjung situs, dan mitra
          kami. Kebijakan ini menjelaskan pengelolaan data pribadi ketika Anda
          mengakses situs, berkonsultasi, mendaftar, atau menggunakan layanan
          perjalanan kami.
        </p>
        <p>
          Dengan memberikan data kepada kami, Anda menyatakan telah membaca dan
          memahami kebijakan ini.
        </p>
      </>
    ),
  },
  {
    id: "data-dikumpulkan",
    title: "Data yang Kami Kumpulkan",
    content: (
      <>
        <p>Data yang dapat kami kumpulkan meliputi:</p>
        <ul>
          <li>Nama, nomor telepon, alamat email, alamat, dan tanggal lahir.</li>
          <li>
            Data identitas dan dokumen perjalanan seperti KTP, paspor, foto,
            kartu keluarga, serta dokumen visa yang diwajibkan.
          </li>
          <li>
            Informasi pemesanan, pilihan paket, jadwal, kebutuhan kamar,
            preferensi makanan, dan kebutuhan pendampingan khusus.
          </li>
          <li>
            Informasi pembayaran dan status transaksi. Kami tidak menyimpan
            data lengkap kartu pembayaran.
          </li>
          <li>
            Isi komunikasi melalui formulir, WhatsApp, telepon, email, atau
            kunjungan kantor.
          </li>
          <li>
            Data teknis dasar seperti alamat IP, jenis perangkat, browser, dan
            aktivitas penggunaan situs.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "penggunaan-data",
    title: "Cara Kami Menggunakan Data",
    content: (
      <>
        <p>Kami menggunakan data pribadi untuk:</p>
        <ul>
          <li>Memberikan konsultasi dan rekomendasi paket perjalanan.</li>
          <li>
            Memproses pendaftaran, pembayaran, tiket, hotel, visa, asuransi,
            dan layanan perjalanan lainnya.
          </li>
          <li>
            Menghubungi Anda mengenai jadwal, dokumen, perubahan perjalanan,
            dan informasi pelayanan.
          </li>
          <li>
            Menjaga keamanan, mencegah penipuan, memenuhi kewajiban hukum, dan
            menyelesaikan keluhan.
          </li>
          <li>
            Meningkatkan kualitas situs, produk, dan layanan pelanggan kami.
          </li>
          <li>
            Mengirim informasi promosi apabila Anda telah memberikan
            persetujuan dan belum menarik persetujuan tersebut.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "dasar-pemrosesan",
    title: "Dasar Pemrosesan",
    content: (
      <p>
        Kami memproses data berdasarkan persetujuan Anda, kebutuhan untuk
        menjalankan perjanjian layanan, kewajiban hukum, atau kepentingan sah
        kami dalam menyediakan layanan secara aman dan efektif. Anda dapat
        menarik persetujuan untuk pemrosesan berbasis persetujuan kapan saja,
        tanpa memengaruhi pemrosesan yang telah dilakukan sebelumnya.
      </p>
    ),
  },
  {
    id: "pembagian-data",
    title: "Pembagian Data kepada Pihak Lain",
    content: (
      <>
        <p>
          Data hanya dibagikan sejauh diperlukan kepada pihak yang mendukung
          perjalanan atau operasional kami, seperti:
        </p>
        <ul>
          <li>
            Maskapai, hotel, penyedia transportasi, asuransi, pembimbing,
            muthawif, dan penyedia layanan destinasi.
          </li>
          <li>
            Kedutaan, imigrasi, Kementerian Agama, dan otoritas lain yang
            berwenang.
          </li>
          <li>
            Penyedia pembayaran, penyimpanan berkas, komunikasi, analitik, dan
            infrastruktur teknologi.
          </li>
          <li>
            Penasihat profesional atau penegak hukum apabila diwajibkan oleh
            peraturan yang berlaku.
          </li>
        </ul>
        <p>Kami tidak menjual atau menyewakan data pribadi Anda.</p>
      </>
    ),
  },
  {
    id: "penyimpanan-keamanan",
    title: "Penyimpanan dan Keamanan",
    content: (
      <>
        <p>
          Kami menerapkan langkah administratif dan teknis yang wajar untuk
          melindungi data dari akses, perubahan, pengungkapan, atau kehilangan
          yang tidak sah. Akses internal diberikan hanya kepada personel yang
          membutuhkannya untuk menjalankan tugas.
        </p>
        <p>
          Data disimpan selama diperlukan untuk memberikan layanan, memenuhi
          kewajiban hukum dan akuntansi, menyelesaikan sengketa, serta menjaga
          catatan perjalanan. Setelah tidak diperlukan, data akan dihapus,
          dianonimkan, atau dimusnahkan secara aman.
        </p>
      </>
    ),
  },
  {
    id: "cookie",
    title: "Cookie dan Teknologi Serupa",
    content: (
      <p>
        Situs dapat menggunakan cookie yang diperlukan untuk fungsi dasar,
        keamanan, preferensi, dan pengukuran kinerja. Anda dapat mengatur
        browser untuk menolak cookie tertentu, tetapi sebagian fungsi situs
        mungkin tidak bekerja secara optimal.
      </p>
    ),
  },
  {
    id: "hak-anda",
    title: "Hak Anda",
    content: (
      <>
        <p>
          Sesuai peraturan yang berlaku, Anda dapat meminta untuk mengakses,
          memperbarui, memperbaiki, atau menghapus data pribadi; menarik
          persetujuan; membatasi pemrosesan; dan mengajukan keberatan.
        </p>
        <p>
          Permintaan harus disertai informasi yang cukup untuk memverifikasi
          identitas. Beberapa data mungkin tetap kami simpan apabila diwajibkan
          oleh hukum atau masih dibutuhkan untuk pelaksanaan perjanjian.
        </p>
      </>
    ),
  },
  {
    id: "anak",
    title: "Data Anak",
    content: (
      <p>
        Data peserta berusia di bawah 18 tahun hanya diproses dengan
        persetujuan dan pendampingan orang tua atau wali yang sah. Orang tua
        atau wali bertanggung jawab memastikan data yang diberikan benar dan
        berwenang untuk diberikan.
      </p>
    ),
  },
  {
    id: "perubahan",
    title: "Perubahan Kebijakan",
    content: (
      <p>
        Kebijakan ini dapat diperbarui untuk menyesuaikan layanan, teknologi,
        atau ketentuan hukum. Versi terbaru akan selalu ditampilkan di halaman
        ini beserta tanggal berlakunya.
      </p>
    ),
  },
  {
    id: "kontak",
    title: "Hubungi Kami",
    content: (
      <p>
        Untuk pertanyaan atau permintaan terkait data pribadi, silakan hubungi
        PT. Sarana Sadaya melalui halaman <Link href="/kontak">Kontak</Link>,
        WhatsApp 0813-1201-7883, atau kunjungi kantor kami di Jl. Cihapit No.
        41, Kota Bandung.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Kebijakan Privasi"
      title="Kebijakan Privasi"
      description="Transparansi tentang cara SS Umroh mengumpulkan, menggunakan, menyimpan, dan melindungi data pribadi Anda."
      effectiveDate={EFFECTIVE_DATE}
      sections={SECTIONS}
    />
  );
}
