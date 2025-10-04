export default function Loading() {
  return (
    <div className="w-full h-96 flex flex-col items-center justify-center">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-4 border-t-accent border-r-transparent border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: '1.2s' }}></div>
        <div className="absolute inset-4 rounded-full border-4 border-t-success border-r-transparent border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: '1.5s' }}></div>
      </div>
      <p className="mt-6 text-lg font-medium">Portfolyo Yükleniyor...</p>
      <p className="text-secondary text-sm mt-2">Stake bilgileriniz alınıyor</p>
    </div>
  );
}