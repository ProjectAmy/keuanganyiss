import { IoStatsChart, IoWallet, IoNotifications, IoDocumentText, IoInformationCircle, IoLogoWhatsapp, IoShieldCheckmark } from "react-icons/io5";

const features = [
    {
        icon: <IoWallet className="w-8 h-8 text-blue-500" />,
        title: "Manajemen Tagihan",
        description: "Kelola SPP dan tagihan siswa lainnya dengan sistematis, akurat, dan mudah dipantau."
    },
    {
        icon: <IoStatsChart className="w-8 h-8 text-green-500" />,
        title: "Pencatatan Transaksi",
        description: "Rekam setiap pemasukan dan pengeluaran sekolah secara detail untuk transparansi finansial."
    },
    {
        icon: <IoNotifications className="w-8 h-8 text-purple-500" />,
        title: "Notifikasi Otomatis",
        description: "Sistem pengingat pembayaran otomatis ke wali murid untuk meningkatkan kelancaran administrasi."
    },
    {
        icon: <IoDocumentText className="w-8 h-8 text-yellow-500" />,
        title: "Laporan Keuangan",
        description: "Generate laporan keuangan harian, bulanan, hingga tahunan secara otomatis dan real-time."
    },
    {
        icon: <IoShieldCheckmark className="w-8 h-8 text-red-500" />,
        title: "Audit & Keamanan",
        description: "Rekam jejak digital (audit logs) setiap transaksi untuk keamanan dan akuntabilitas."
    },
];

const AboutPage = () => {
    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <div className="text-center mb-16 space-y-4">
                <div className="inline-block p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-4 shadow-sm animate-fade-in-up">
                    <IoInformationCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                    Tentang Keuangan YISS
                </h1>
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                    Sistem Manajemen Keuangan Sekolah Terintegrasi. Solusi cerdas untuk pencatatan, penagihan, dan pelaporan keuangan sekolah yang transparan dan akuntabel.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className="group p-8 bg-white dark:bg-zinc-900 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-zinc-800 hover:-translate-y-2"
                    >
                        <div className="mb-6 p-4 bg-gray-50 dark:bg-zinc-800 rounded-2xl w-fit group-hover:bg-blue-50 dark:group-hover:bg-zinc-700 transition-colors duration-300">
                            {feature.icon}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {feature.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            {feature.description}
                        </p>
                    </div>
                ))}
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-10 md:p-16 text-center text-white shadow-xl overflow-hidden relative isolate">
                <div className="relative z-10">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">Butuh Bantuan Administrasi?</h2>
                    <p className="mb-8 text-blue-100 text-lg max-w-2xl mx-auto">
                        Jika ada kendala pembayaran atau sistem, segera hubungi kami.
                    </p>
                    <a
                        href="https://wa.me/62895110024000"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-full font-bold hover:bg-blue-50 transition-colors duration-300 shadow-lg hover:shadow-xl"
                    >
                        <IoLogoWhatsapp className="w-6 h-6" />
                        Hubungi wa 0895110024000
                    </a>
                </div>

                {/* Decorative Background Elements */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
            </div>
        </div>
    );
};

export default AboutPage;
