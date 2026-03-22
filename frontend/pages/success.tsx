export default function SuccessPage() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="bg-neutral-900 p-8 rounded-xl shadow-lg text-center">
          <h1 className="text-2xl font-bold text-[#D4AF37] mb-4">
            Payment Successful 🎉
          </h1>
          <p className="text-gray-300 mb-6">
            Your booking has been confirmed. We’ll contact you soon.
          </p>
  
          <a
            href="/"
            className="inline-block bg-[#D4AF37] text-black px-6 py-2 rounded-lg font-semibold hover:opacity-90"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }