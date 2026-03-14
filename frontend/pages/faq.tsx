'use client';

import { useState } from "react";
import Navbar from "./components/navbar";
import Footer from "./components/footer";

const faqItems = [
  {
    title: "Deposit Policy / Política de Depósito",
    content: `
A non-refundable deposit is required to secure your booking date and time. The remaining balance is due on or before the day of the shoot/event unless otherwise agreed.

Se requiere un depósito no reembolsable para asegurar la fecha y hora de tu sesión o evento. El saldo restante debe pagarse el día de la sesión o antes, a menos que se acuerde algo diferente.
`,
  },
  {
    title: "Cancellation & Reschedule / Cancelación o Reprogramación",
    content: `
If you need to cancel or reschedule, please notify us at least 48 hours before your scheduled session.

Las reprogramaciones pueden realizarse con al menos 48 horas de anticipación según disponibilidad. Cancelaciones con menos de 48 horas pueden resultar en la pérdida del depósito.
`,
  },
  {
    title: "Turnaround Time / Tiempo de Entrega",
    content: `
Standard delivery time is 3–5 business days for most sessions.

Lifestyle & portraits: 3–5 days  
Sports photography: 3–5 days  
Video highlight reels: 3–7 days  

El tiempo estándar de entrega es de 3–5 días hábiles dependiendo del tipo de proyecto.
`,
  },
  {
    title: "Usage Rights & Credits / Derechos de Uso",
    content: `
Clients receive personal usage rights for delivered photos and videos.

You may share them on social media, print them, and use them for personal branding. Images may not be resold or used commercially without written permission.

Los clientes reciben derechos de uso personal para compartir en redes sociales o uso personal. No se entregan archivos RAW y no se permite reventa sin permiso.
`,
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
    <Navbar/>
      <main className="pt-24 bg-black text-white min-h-screen">
        <section className="max-w-4xl mx-auto px-6 py-12">

          <h1 className="text-4xl font-bold text-center mb-6">
            FAQ & Policies
          </h1>

          <p className="text-gray-300 text-center mb-12">
            Frequently asked questions and policies for Madi Visuals bookings.
          </p>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className="border border-neutral-800 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full text-left px-6 py-4 bg-neutral-900 hover:bg-neutral-800 transition flex justify-between items-center"
                >
                  <span className="font-semibold">{item.title}</span>
                  <span className="text-[#D4AF37] text-xl">
                    {openIndex === index ? "−" : "+"}
                  </span>
                </button>

                {openIndex === index && (
                  <div className="px-6 py-4 text-gray-300 whitespace-pre-line bg-neutral-950">
                    {item.content}
                  </div>
                )}
              </div>
            ))}
          </div>

        </section>
      </main>

    <Footer/>
    </>
  );
}