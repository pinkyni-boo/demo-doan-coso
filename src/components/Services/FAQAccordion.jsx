import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function FAQAccordion({ faqs }) {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleAccordion = (index) => {
    if (openIndex === index) {
      setOpenIndex(null); // đóng nếu đang mở
    } else {
      setOpenIndex(index); // mở nếu đang đóng
    }
  };

  return (
    <div className="space-y-4">
      {faqs.map((faq, idx) => (
        <div
          key={idx}
          className="border border-gray-200 rounded-lg overflow-hidden"
        >
          <button
            className={`w-full text-left p-4 flex justify-between items-center ${
              openIndex === idx ? "bg-blue-50" : "bg-white"
            }`}
            onClick={() => toggleAccordion(idx)}
          >
            <h3 className="font-medium text-gray-800">{faq.question}</h3>
            {openIndex === idx ? (
              <ChevronUp className="text-blue-600 h-5 w-5" />
            ) : (
              <ChevronDown className="text-gray-600 h-5 w-5" />
            )}
          </button>
          <div
            className={`px-4 overflow-hidden transition-all duration-300 ease-in-out ${
              openIndex === idx
                ? "max-h-96 pb-4 opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <p className="text-gray-600">{faq.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
