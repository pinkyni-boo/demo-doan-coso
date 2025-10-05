import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Calendar, User, MessageSquare } from 'lucide-react';

export default function ViewFeedbackModal({ isOpen, onClose, feedback, classData }) {
  if (!isOpen || !feedback) return null;

  const getRatingText = (rating) => {
    const texts = {
      1: 'Rất không hài lòng',
      2: 'Không hài lòng', 
      3: 'Bình thường',
      4: 'Hài lòng',
      5: 'Rất hài lòng'
    };
    return texts[rating] || '';
  };

  const StarRating = ({ rating, label }) => {
    return (
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-medium text-gray-700 w-24">{label}:</span>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-4 w-4 ${
                star <= rating ? 'text-amber-400 fill-current' : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-gray-600">({rating}/5 - {getRatingText(rating)})</span>
      </div>
    );
  };

  // Parse content to extract individual ratings and comments
  const parseContent = (content) => {
    const lines = content.split('\n\n');
    const parsed = {};
    
    lines.forEach(line => {
      if (line.includes('Dịch vụ:')) {
        const match = line.match(/Dịch vụ: (\d+)\/5 sao(?:\s*-\s*(.+))?/);
        if (match) {
          parsed.service = { rating: parseInt(match[1]), comment: match[2] || '' };
        }
      } else if (line.includes('Huấn luyện viên:')) {
        const match = line.match(/Huấn luyện viên: (\d+)\/5 sao(?:\s*-\s*(.+))?/);
        if (match) {
          parsed.trainer = { rating: parseInt(match[1]), comment: match[2] || '' };
        }
      } else if (line.includes('Lớp học:')) {
        const match = line.match(/Lớp học: (\d+)\/5 sao(?:\s*-\s*(.+))?/);
        if (match) {
          parsed.class = { rating: parseInt(match[1]), comment: match[2] || '' };
        }
      } else if (line.includes('Tổng quan:')) {
        const match = line.match(/Tổng quan: (\d+)\/5 sao(?:\s*-\s*(.+))?/);
        if (match) {
          parsed.overall = { rating: parseInt(match[1]), comment: match[2] || '' };
        }
      }
    });
    
    return parsed;
  };

  const parsedContent = parseContent(feedback.content);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Đánh giá của bạn</h2>
              <p className="text-sm text-gray-600 mt-1">{feedback.title}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Class Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Thông tin lớp học
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium">Tên lớp:</span> {classData?.className || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Dịch vụ:</span> {classData?.serviceName || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Huấn luyện viên:</span> {classData?.instructorName || 'N/A'}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span className="font-medium">Đánh giá lúc:</span> {new Date(feedback.createdAt).toLocaleDateString('vi-VN')}
                </div>
              </div>
            </div>

            {/* Overall Rating */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">Đánh giá tổng thể</h4>
              <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-6 w-6 ${
                        star <= feedback.overallRating ? 'text-amber-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-medium text-amber-700">
                  {feedback.overallRating}/5 - {getRatingText(feedback.overallRating)}
                </span>
              </div>
            </div>

            {/* Detailed Ratings */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-4">Chi tiết đánh giá</h4>
              <div className="space-y-3">
                {parsedContent.service && (
                  <StarRating rating={parsedContent.service.rating} label="Dịch vụ" />
                )}
                {parsedContent.trainer && (
                  <StarRating rating={parsedContent.trainer.rating} label="Trainer" />
                )}
                {parsedContent.class && (
                  <StarRating rating={parsedContent.class.rating} label="Lớp học" />
                )}
                {parsedContent.overall && (
                  <StarRating rating={parsedContent.overall.rating} label="Tổng quan" />
                )}
              </div>
            </div>

            {/* Comments */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                Nhận xét chi tiết
              </h4>
              <div className="space-y-4">
                {parsedContent.service?.comment && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium text-blue-800">Dịch vụ:</span>
                    <p className="text-blue-700 mt-1">{parsedContent.service.comment}</p>
                  </div>
                )}
                {parsedContent.trainer?.comment && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <span className="font-medium text-green-800">Huấn luyện viên:</span>
                    <p className="text-green-700 mt-1">{parsedContent.trainer.comment}</p>
                  </div>
                )}
                {parsedContent.class?.comment && (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <span className="font-medium text-purple-800">Lớp học:</span>
                    <p className="text-purple-700 mt-1">{parsedContent.class.comment}</p>
                  </div>
                )}
                {parsedContent.overall?.comment && (
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <span className="font-medium text-amber-800">Tổng quan:</span>
                    <p className="text-amber-700 mt-1">{parsedContent.overall.comment}</p>
                  </div>
                )}
                {!Object.values(parsedContent).some(item => item?.comment) && (
                  <p className="text-gray-500 text-center py-4">Không có nhận xét chi tiết</p>
                )}
              </div>
            </div>

            
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Đóng
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}