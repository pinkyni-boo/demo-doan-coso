import { CheckCircle } from "lucide-react";

export default function AdvantagesList({ advantages }) {
  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none">
      {advantages.map((advantage, idx) => (
        <li key={idx} className="flex items-start space-x-3">
          <CheckCircle className="text-green-500 w-6 h-6 mt-1" />
          <span className="text-gray-700">{advantage}</span>
        </li>
      ))}
    </ul>
  );
}
