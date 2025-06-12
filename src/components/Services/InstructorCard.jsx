import { Instagram, Facebook, Linkedin } from "lucide-react";

export default function InstructorCard({ instructor }) {
  return (
    <div className="bg-gray-50 rounded-xl overflow-hidden shadow-sm border border-gray-100 transition-all hover:shadow-md">
      <div className="relative">
        <img
          src={instructor.image}
          alt={instructor.name}
          className="w-full h-64 object-cover object-center"
        />
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent p-4">
          <h3 className="text-white font-bold text-lg">{instructor.name}</h3>
          <p className="text-white text-sm opacity-80">
            {instructor.specialty}
          </p>
        </div>
      </div>
      <div className="p-4">
        <p className="text-gray-600 text-sm mb-3">{instructor.bio}</p>
        <div className="flex space-x-3">
          {instructor.socialMedia?.facebook && (
            <a
              href={instructor.socialMedia.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              <Facebook size={18} />
            </a>
          )}
          {instructor.socialMedia?.instagram && (
            <a
              href={instructor.socialMedia.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-600 hover:text-pink-800"
            >
              <Instagram size={18} />
            </a>
          )}
          {instructor.socialMedia?.linkedin && (
            <a
              href={instructor.socialMedia.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 hover:text-blue-900"
            >
              <Linkedin size={18} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
