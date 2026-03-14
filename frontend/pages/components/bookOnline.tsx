'use client';

import { Dispatch, SetStateAction, useState } from "react";

interface BookingModalProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export default function BookingModal({ open, setOpen }: BookingModalProps) {
  // const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 2));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    alert("Booking submitted!");
    setOpen(false);
    setStep(1);
  };

  return (
    <>
      {/* Book Now Button */}
      <button
        onClick={() => setOpen(true)}
        className="hidden md:block rounded-lg border border-[#D4AF37] px-5 py-2.5 text-sm font-medium text-[#D4AF37] transition hover:bg-[#D4AF37] hover:text-black"
      >
        Book Now
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 min-h-screen"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpen(false);
              setStep(1);
            }
          }}
        >
          <div className="bg-black text-white rounded-xl shadow-xl w-full max-w-lg p-8 relative max-h-[90vh] overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-lg font-bold"
              aria-label="Close modal"
            >
              ×
            </button>

            <h2 className="text-xl font-bold mb-2 text-[#D4AF37]">Book a Session</h2>

            <p className="mb-4 text-gray-300 text-sm">
              Fill out the form below or review our booking details.
            </p>

            {/* Progress Indicator */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1">
                <div className={`h-2 rounded-full ${step >= 1 ? 'bg-[#D4AF37]' : 'bg-neutral-700'}`}></div>
                <p className="text-xs mt-1 text-center">Step 1: Info</p>
              </div>
              <div className="flex-1 mx-2">
                <div className={`h-2 rounded-full ${step >= 2 ? 'bg-[#D4AF37]' : 'bg-neutral-700'}`}></div>
                <p className="text-xs mt-1 text-center">Step 2: Payment</p>
              </div>
            </div>

            <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
              {step === 1 && (
                <>
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="rounded-lg bg-neutral-900 p-2 text-white text-sm border border-neutral-700 focus:border-[#D4AF37] outline-none"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="rounded-lg bg-neutral-900 p-2 text-white text-sm border border-neutral-700 focus:border-[#D4AF37] outline-none"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="rounded-lg bg-neutral-900 p-2 text-white text-sm border border-neutral-700 focus:border-[#D4AF37] outline-none"
                  />
                  <select
                    className="rounded-lg bg-neutral-900 p-2 text-white text-sm border border-neutral-700 focus:border-[#D4AF37] outline-none"
                    required
                  >
                    <option value="">Select Service</option>
                    <option value="lifestyle">Lifestyle Shoot</option>
                    <option value="couple">Couple/Duo Shoot</option>
                    <option value="sports">Sports Photography/Videography</option>
                    <option value="event">Special Event</option>
                  </select>
                  <textarea
                    placeholder="Additional Notes"
                    className="rounded-lg bg-neutral-900 p-2 text-white text-sm border border-neutral-700 focus:border-[#D4AF37] outline-none"
                    rows={3}
                  ></textarea>

                  <button
                    type="button"
                    onClick={nextStep}
                    className="rounded-lg bg-[#D4AF37] text-black font-semibold py-2 mt-4 hover:opacity-90 transition"
                  >
                    Next
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  {/* Payment Section */}
                  <fieldset className="mt-6 border border-neutral-700 rounded-lg p-5 space-y-4">
                    <legend className="text-[#D4AF37] font-semibold mb-2">Payment Method</legend>

                    <label className="flex items-center gap-3 text-sm">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        defaultChecked
                        className="accent-[#D4AF37]"
                        required
                      />
                      Credit / Debit Card
                    </label>

                    <input
                      type="text"
                      placeholder="Card Number"
                      className="rounded-lg bg-neutral-900 p-2 text-white text-sm border border-neutral-700 focus:border-[#D4AF37] outline-none mb-2"
                      required
                    />
                    <div className="flex gap-3 mb-2">
                      <input
                        type="text"
                        placeholder="Expiration Date (MM/YY)"
                        className="rounded-lg bg-neutral-900 p-2 text-white text-sm border border-neutral-700 focus:border-[#D4AF37] outline-none flex-1"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Security Code"
                        className="rounded-lg bg-neutral-900 p-2 text-white text-sm border border-neutral-700 focus:border-[#D4AF37] outline-none flex-1"
                        required
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Zip Code"
                      className="rounded-lg bg-neutral-900 p-2 text-white text-sm border border-neutral-700 focus:border-[#D4AF37] outline-none"
                      required
                    />
                  </fieldset>

                  <div className="flex justify-between mt-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="rounded-lg border border-[#D4AF37] text-[#D4AF37] font-semibold py-2 px-4 hover:bg-[#D4AF37] hover:text-black transition"
                    >
                      Back
                    </button>

                    <button
                      type="submit"
                      className="rounded-lg bg-[#D4AF37] text-black font-semibold py-2 px-4 hover:opacity-90 transition"
                    >
                      Submit Booking
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}