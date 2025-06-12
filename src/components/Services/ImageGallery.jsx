export default function ImageGallery({ images }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {images.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={`Ảnh ${idx + 1}`}
          className="w-full h-80 object-cover rounded-xl shadow-md hover:scale-105 transform transition"
        />
      ))}
    </div>
  );
}
