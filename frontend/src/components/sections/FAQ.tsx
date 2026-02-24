import { useState } from "react";

const FAQ = () => {
  const [open, setOpen] = useState<number | null>(null);

  const faqs = [
    {
      question: "How does AI Document Tutor work?",
      answer:
        "Upload your documents and interact using chat or voice. The AI learns from your content."
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes, all data is encrypted and processed securely."
    },
    {
      question: "Can I use voice commands?",
      answer:
        "Yes, our platform supports full voice interaction."
    }
  ];

  return (
    <section className="bg-white py-24 px-10">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">
          Frequently Asked Questions
        </h2>

        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border-b py-6 cursor-pointer"
            onClick={() =>
              setOpen(open === index ? null : index)
            }
          >
            <h3 className="font-semibold text-lg">
              {faq.question}
            </h3>

            {open === index && (
              <p className="mt-4 text-gray-600">
                {faq.answer}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;

