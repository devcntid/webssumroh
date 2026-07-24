import type { Metadata } from "next";
import Link from "next/link";
import {
  LegalPage,
  type LegalSection,
} from "@/components/public/sections/LegalPage";
import { getSiteSettings } from "@/lib/queries/site-settings";
import { resolveHeroAppearance } from "@/lib/hero-settings";

export const metadata: Metadata = {
  title: "Syarat dan Ketentuan Layanan | SS Umroh",
  description:
    "Syarat dan Ketentuan penggunaan situs serta layanan perjalanan umroh dari PT. Sarana Sadaya (SS Umroh).",
};

const EFFECTIVE_DATE = "21 Juli 2026";

const SECTIONS: LegalSection[] = [
  {
    id: "penerimaan",
    title: "Penerimaan Ketentuan",
    content: (
      <>
        <p>
          Syarat dan Ketentuan ini mengatur penggunaan situs dan layanan PT.
          Sarana Sadaya dengan merek dagang SS Umroh (&ldquo;kami&rdquo;).
          Dengan mengakses situs, meminta penawaran, mendaftar, atau melakukan
          pembayaran, Anda menyatakan telah membaca dan menyetujui ketentuan
          ini.
        </p>
        <p>
          Ketentuan khusus dalam formulir pendaftaran, proposal, invoice, atau
          perjanjian paket yang Anda setujui merupakan bagian dari perjanjian
          dan berlaku bersama halaman ini.
        </p>
      </>
    ),
  },
  {
    id: "layanan",
    title: "Ruang Lingkup Layanan",
    content: (
      <p>
        Kami menyediakan konsultasi dan penyelenggaraan perjalanan umroh,
        perjalanan korporat atau grup, serta layanan pendukung seperti
        tiket, hotel, visa, transportasi, asuransi, dan bimbingan perjalanan.
        Rincian fasilitas mengikuti paket atau proposal tertulis yang dipilih.
      </p>
    ),
  },
  {
    id: "informasi-peserta",
    title: "Pendaftaran dan Data Peserta",
    content: (
      <>
        <p>
          Peserta wajib memberikan data yang benar, lengkap, terbaru, dan sesuai
          dengan dokumen resmi. Peserta bertanggung jawab memeriksa ejaan nama,
          nomor paspor, masa berlaku, serta persyaratan kesehatan dan perjalanan.
        </p>
        <p>
          Biaya tambahan atau kegagalan proses yang timbul akibat data yang
          salah, dokumen terlambat, atau dokumen tidak memenuhi syarat menjadi
          tanggung jawab peserta sepanjang bukan disebabkan kesalahan kami.
        </p>
      </>
    ),
  },
  {
    id: "harga-pembayaran",
    title: "Harga dan Pembayaran",
    content: (
      <>
        <ul>
          <li>
            Harga, uang muka, jadwal pelunasan, dan fasilitas mengikuti
            penawaran atau invoice resmi SS Umroh.
          </li>
          <li>
            Kursi dianggap terkonfirmasi setelah pembayaran yang dipersyaratkan
            diterima dan diverifikasi.
          </li>
          <li>
            Pembayaran hanya dilakukan ke rekening atau kanal pembayaran resmi
            yang diinformasikan oleh SS Umroh.
          </li>
          <li>
            Harga dapat dipengaruhi kurs valuta asing, pajak, fuel surcharge,
            kebijakan maskapai, visa, atau perubahan biaya pihak ketiga.
          </li>
        </ul>
        <p>
          Setiap penyesuaian akan disampaikan secara transparan sesuai
          perjanjian paket dan peraturan yang berlaku.
        </p>
      </>
    ),
  },
  {
    id: "pembatalan",
    title: "Pembatalan dan Pengembalian Dana",
    content: (
      <>
        <p>
          Ketentuan pembatalan, pengalihan peserta, dan pengembalian dana
          mengikuti perjanjian paket yang disetujui karena setiap maskapai,
          hotel, visa, dan penyedia layanan memiliki aturan berbeda.
        </p>
        <p>
          Pengembalian dana, apabila berlaku, dilakukan setelah dikurangi biaya
          yang sudah dibayarkan atau tidak dapat dikembalikan kepada pihak
          ketiga dan biaya administrasi yang diinformasikan. Pembatalan harus
          diajukan secara tertulis melalui kanal resmi kami.
        </p>
      </>
    ),
  },
  {
    id: "perubahan-perjalanan",
    title: "Perubahan Jadwal dan Itinerary",
    content: (
      <p>
        Jadwal penerbangan, hotel, urutan kunjungan, dan itinerary dapat berubah
        karena kebijakan maskapai, otoritas, kondisi cuaca, keamanan, operasional,
        atau keadaan di luar kendali kami. Kami akan mengupayakan pengganti
        dengan standar yang setara dan menyampaikan perubahan secepat mungkin.
      </p>
    ),
  },
  {
    id: "dokumen",
    title: "Paspor, Visa, dan Dokumen",
    content: (
      <p>
        Persetujuan visa sepenuhnya merupakan kewenangan pemerintah negara
        tujuan. Kami membantu proses administrasi, tetapi tidak dapat menjamin
        visa diterbitkan. Peserta wajib menyerahkan dokumen tepat waktu dan
        memastikan paspor memiliki masa berlaku yang dipersyaratkan.
      </p>
    ),
  },
  {
    id: "kesehatan",
    title: "Kesehatan dan Asuransi",
    content: (
      <>
        <p>
          Peserta wajib mengungkapkan kondisi kesehatan, kebutuhan obat,
          disabilitas, kehamilan, atau kebutuhan pendampingan yang relevan
          sebelum mendaftar. Kami dapat meminta surat keterangan dokter apabila
          diperlukan demi keselamatan perjalanan.
        </p>
        <p>
          Cakupan asuransi mengikuti polis yang diterbitkan penyedia asuransi.
          Klaim tunduk pada syarat, pengecualian, dan keputusan penyedia
          asuransi.
        </p>
      </>
    ),
  },
  {
    id: "perilaku",
    title: "Tanggung Jawab dan Perilaku Peserta",
    content: (
      <p>
        Peserta wajib mematuhi hukum negara tujuan, ketentuan ibadah, arahan
        tour leader, jadwal rombongan, serta menghormati peserta lain. Kami
        berhak mengambil langkah yang wajar apabila perilaku peserta mengganggu
        keselamatan, ketertiban, atau pelaksanaan perjalanan.
      </p>
    ),
  },
  {
    id: "keadaan-kahar",
    title: "Keadaan Kahar",
    content: (
      <p>
        Keadaan kahar mencakup bencana alam, wabah, perang, kerusuhan, penutupan
        perbatasan, kebijakan pemerintah, gangguan transportasi besar, atau
        kejadian lain di luar kendali wajar para pihak. Penyelesaian akan
        mengutamakan keselamatan serta mengikuti ketersediaan refund,
        reschedule, atau kredit dari penyedia terkait.
      </p>
    ),
  },
  {
    id: "tanggung-jawab",
    title: "Batas Tanggung Jawab",
    content: (
      <p>
        Kami bertanggung jawab menyelenggarakan layanan sesuai perjanjian dan
        standar profesional. Untuk layanan yang dijalankan maskapai, hotel,
        asuransi, imigrasi, atau pihak independen lain, tanggung jawab masing-
        masing mengikuti ketentuan penyedia dan hukum yang berlaku. Ketentuan
        ini tidak menghapus hak konsumen yang dijamin peraturan Indonesia.
      </p>
    ),
  },
  {
    id: "situs-kekayaan-intelektual",
    title: "Penggunaan Situs dan Kekayaan Intelektual",
    content: (
      <p>
        Merek, logo, desain, teks, foto milik kami, dan materi situs dilindungi
        hukum. Materi tidak boleh disalin, dijual, dimodifikasi, atau digunakan
        untuk kepentingan komersial tanpa izin tertulis. Anda juga dilarang
        mengganggu keamanan situs, menyalahgunakan formulir, atau mengirim
        konten melanggar hukum.
      </p>
    ),
  },
  {
    id: "privasi",
    title: "Privasi",
    content: (
      <p>
        Pengelolaan data pribadi mengikuti{" "}
        <Link href="/privacy">Kebijakan Privasi SS Umroh</Link>. Dengan
        menggunakan layanan, Anda memahami bahwa data tertentu perlu dibagikan
        kepada penyedia perjalanan dan otoritas untuk melaksanakan layanan.
      </p>
    ),
  },
  {
    id: "sengketa",
    title: "Hukum dan Penyelesaian Sengketa",
    content: (
      <p>
        Ketentuan ini tunduk pada hukum Republik Indonesia. Keluhan harus
        disampaikan terlebih dahulu melalui kanal resmi agar dapat diselesaikan
        secara musyawarah. Apabila tidak tercapai kesepakatan, penyelesaian
        dilakukan melalui mekanisme yang tersedia berdasarkan peraturan
        Indonesia.
      </p>
    ),
  },
  {
    id: "perubahan-ketentuan",
    title: "Perubahan Ketentuan",
    content: (
      <p>
        Kami dapat memperbarui ketentuan ini untuk menyesuaikan layanan,
        kebijakan mitra, atau hukum. Perubahan berlaku sejak tanggal yang
        dicantumkan pada halaman ini dan tidak mengurangi hak yang telah timbul
        berdasarkan perjanjian sebelumnya.
      </p>
    ),
  },
  {
    id: "kontak",
    title: "Kontak",
    content: (
      <p>
        Pertanyaan atau keluhan dapat disampaikan melalui halaman{" "}
        <Link href="/kontak">Kontak</Link>, WhatsApp 0813-1201-7883, atau
        kantor PT. Sarana Sadaya di Jl. Cihapit No. 41, Kota Bandung.
      </p>
    ),
  },
];

export default async function TermsPage() {
  let settings: Awaited<ReturnType<typeof getSiteSettings>> = null;
  try {
    settings = await getSiteSettings();
  } catch {
    // Keep legal content available when external services are unavailable.
  }
  const hero = resolveHeroAppearance(settings, "terms", null);

  return (
    <LegalPage
      eyebrow="Syarat & Ketentuan"
      title="Syarat dan Ketentuan Layanan"
      description="Ketentuan yang membantu memastikan penggunaan situs dan layanan perjalanan SS Umroh berlangsung jelas, aman, dan transparan."
      effectiveDate={EFFECTIVE_DATE}
      sections={SECTIONS}
      hero={hero}
    />
  );
}
