import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  Upload,
  Search,
  RefreshCcw,
  X,
  Eye,
  Download,
} from "lucide-react";
import { toast } from "react-toastify";

const ImageManager = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Vui lòng đăng nhập để tiếp tục");
          navigate("/login");
          return;
        }

        fetchImages();
      } catch (error) {
        console.error("Auth error:", error);
        navigate("/");
      }
    };

    checkAdminAuth();
  }, [navigate]);

  const fetchImages = async (cursor = null) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const params = new URLSearchParams();
      params.append("max_results", "20");
      if (cursor) {
        params.append("next_cursor", cursor);
      }

      const response = await axios.get(
        `http://localhost:5000/api/images/?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const newImages = response.data.images || [];

      if (cursor) {
        setImages((prev) => [...prev, ...newImages]);
      } else {
        setImages(newImages);
      }

      setNextCursor(response.data.next_cursor);
      setTotalCount(response.data.total_count || newImages.length);
    } catch (error) {
      console.error("Error fetching images:", error);
      if (error.response?.status === 403) {
        toast.error("Bạn không có quyền truy cập trang này");
        navigate("/");
      } else {
        toast.error("Không thể tải danh sách ảnh");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File quá lớn. Kích thước tối đa là 10MB");
      return;
    }

    try {
      setUploading(true);
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("image", file);

      const response = await axios.post(
        "http://localhost:5000/api/images/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const newImage = {
        publicId: response.data.publicId,
        filename: response.data.filename,
        url: response.data.imageUrl,
        size: response.data.size,
        width: response.data.width,
        height: response.data.height,
        format: response.data.format,
        uploadDate: new Date().toISOString(),
      };

      setImages([newImage, ...images]);
      setTotalCount((prev) => prev + 1);
      toast.success("Tải lên ảnh thành công");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Tải lên ảnh thất bại");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (publicId) => {
    if (!confirm("Bạn có chắc chắn muốn xóa ảnh này?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const encodedPublicId = encodeURIComponent(publicId);

      await axios.delete(
        `http://localhost:5000/api/images/${encodedPublicId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setImages(images.filter((img) => img.publicId !== publicId));
      setTotalCount((prev) => prev - 1);
      setSelectedImage(null);
      toast.success("Xóa ảnh thành công");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Xóa ảnh thất bại");
    }
  };

  const handleLoadMore = () => {
    if (nextCursor && !loading) {
      fetchImages(nextCursor);
    }
  };

  const handleDownloadImage = (imageUrl, filename) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = filename || "image";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredImages = images.filter(
    (img) =>
      img.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      img.publicId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý hình ảnh</h1>
          <p className="mt-2 text-gray-600">
            Quản lý tất cả hình ảnh trên hệ thống
          </p>
          <p className="text-sm text-gray-500">
            Tổng cộng: {totalCount} ảnh | Đang hiển thị: {images.length} ảnh
          </p>
        </div>

        {/* Action bar */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo tên file hoặc ID..."
              className="pl-10 w-full rounded-lg border border-gray-300 py-2 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => fetchImages()}
              disabled={loading}
              className="flex items-center py-2 px-4 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <RefreshCcw size={18} className="mr-2" />
              <span>Làm mới</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              <Upload size={18} className="mr-2" />
              <span>{uploading ? "Đang tải lên..." : "Tải lên ảnh"}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Image grid */}
        {loading && images.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredImages.map((image, index) => (
                <div
                  key={image.publicId || index}
                  className={`relative group rounded-lg overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow cursor-pointer ${
                    selectedImage?.publicId === image.publicId
                      ? "ring-2 ring-purple-500"
                      : ""
                  }`}
                  onClick={() => setSelectedImage(image)}
                >
                  <div className="aspect-square">
                    <img
                      src={image.url}
                      alt={image.filename}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/400x400?text=Error+Loading+Image";
                      }}
                    />
                  </div>

                  {/* Hover overlay with actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImage(image);
                        }}
                        className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadImage(image.url, image.filename);
                        }}
                        className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                        title="Tải xuống"
                      >
                        <Download size={16} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImage(image.publicId);
                        }}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Image info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent text-white text-xs p-2">
                    <div className="truncate">{image.filename}</div>
                    <div className="flex justify-between items-center text-gray-300">
                      <span>{image.format?.toUpperCase()}</span>
                      <span>{Math.round(image.size / 1024)} KB</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load more button */}
            {nextCursor && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Đang tải..." : "Tải thêm ảnh"}
                </button>
              </div>
            )}
          </>
        )}

        {filteredImages.length === 0 && !loading && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Upload size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">
              {searchTerm
                ? "Không tìm thấy hình ảnh phù hợp"
                : "Chưa có hình ảnh nào"}
            </p>
            {!searchTerm && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Tải lên ảnh đầu tiên
              </button>
            )}
          </div>
        )}

        {/* Image detail modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {selectedImage.filename}
                </h3>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-4">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.filename}
                  className="w-full h-auto max-h-[60vh] object-contain mx-auto rounded-lg"
                />

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">
                      Thông tin cơ bản
                    </h4>
                    <div className="space-y-2">
                      <div className="flex">
                        <span className="font-medium w-24">Filename:</span>
                        <span className="text-gray-600 break-all">
                          {selectedImage.filename}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="font-medium w-24">Public ID:</span>
                        <span className="text-gray-600 break-all">
                          {selectedImage.publicId}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="font-medium w-24">Format:</span>
                        <span className="text-gray-600">
                          {selectedImage.format?.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="font-medium w-24">Size:</span>
                        <span className="text-gray-600">
                          {Math.round(selectedImage.size / 1024)} KB (
                          {selectedImage.size} bytes)
                        </span>
                      </div>
                      <div className="flex">
                        <span className="font-medium w-24">Dimensions:</span>
                        <span className="text-gray-600">
                          {selectedImage.width} × {selectedImage.height}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="font-medium w-24">Uploaded:</span>
                        <span className="text-gray-600">
                          {new Date(selectedImage.uploadDate).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">URL</h4>
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <input
                        type="text"
                        value={selectedImage.url}
                        readOnly
                        className="w-full bg-transparent text-sm text-gray-600 border-none outline-none"
                        onClick={(e) => e.target.select()}
                      />
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedImage.url);
                        toast.success("Đã copy URL vào clipboard");
                      }}
                      className="text-sm text-purple-600 hover:text-purple-700"
                    >
                      Copy URL
                    </button>
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() =>
                      handleDownloadImage(
                        selectedImage.url,
                        selectedImage.filename
                      )
                    }
                    className="flex items-center py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Download size={18} className="mr-2" />
                    <span>Tải xuống</span>
                  </button>

                  <button
                    onClick={() => handleDeleteImage(selectedImage.publicId)}
                    className="flex items-center py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 size={18} className="mr-2" />
                    <span>Xóa ảnh</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageManager;
