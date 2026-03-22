export default function CancelPage() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="bg-neutral-900 p-8 rounded-xl text-center">
          <h1 className="text-xl font-bold text-red-500 mb-4">
            Payment Cancelled
          </h1>
          <p className="text-gray-300 mb-6">
            Your booking was not completed. You can try again anytime.
          </p>
  
          <a
            href="/"
            className="bg-[#D4AF37] text-black px-6 py-2 rounded-lg"
          >
            Try Again
          </a>
        </div>
      </div>
    );
  }