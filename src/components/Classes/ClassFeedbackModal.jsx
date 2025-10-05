import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function ClassFeedbackModal({ isOpen, onClose, classData, onSubmitted }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [feedbackData, setFeedbackData] = useState({
    service: { rating: 0, comment: '' },
    trainer: { rating: 0, comment: '' },
    class: { rating: 0, comment: '' },
    overall: { rating: 0, comment: '' }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [instructorDetails, setInstructorDetails] = useState(null);

  // Fetch instructor details when modal opens
  useEffect(() => {
    if (isOpen && classData) {
      console.log('Class data received:', classData);
      fetchInstructorDetails();
    }
  }, [isOpen, classData]);

  const fetchInstructorDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      // If we already have instructorId, no need to fetch
      if (classData.instructorId || classData.trainerId) {
        console.log('Instructor ID already available:', classData.instructorId || classData.trainerId);
        return;
      }

      // Get instructor name from class data
      const instructorName = classData.instructorName || classData.instructor;
      if (!instructorName) {
        console.log('⚠️ No instructor name available in class data');
        return;
      }

      console.log('🔍 Searching for instructor by name:', instructorName);
      console.log('📚 Class data:', classData);
      console.log('👤 Current user:', currentUser.fullName, currentUser._id);
      
      // STEP 1: Find the instructor/trainer user account
      try {
        const usersResponse = await axios.get(
          `http://localhost:5000/api/users`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        // Find user whose fullName matches instructorName AND is NOT the current user
        const instructorUser = usersResponse.data.find(user => 
          (user.fullName === instructorName || 
           user.name === instructorName ||
           user.username === instructorName) &&
          user._id !== currentUser._id  // Ensure it's not the current user
        );
        
        if (instructorUser) {
          console.log('✅ Found instructor user:', instructorUser);
          console.log('✅ Instructor ID to use for feedback:', instructorUser._id);
          console.log('🔐 Verification - Current user ID:', currentUser._id, 'Instructor ID:', instructorUser._id);
          
          setInstructorDetails(instructorUser);
          return;
        } else {
          console.log('⚠️ No matching instructor user found in users table');
        }
      } catch (userError) {
        console.log('❌ Error accessing users API:', userError.message);
      }
      
      // STEP 2: Fallback - Try trainers table and get their userId
      try {
        const trainersResponse = await axios.get(
          `http://localhost:5000/api/trainers`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        const foundTrainer = trainersResponse.data.find(trainer => 
          trainer.fullName === instructorName || 
          trainer.name === instructorName ||
          trainer.username === instructorName
        );
        
        if (foundTrainer && foundTrainer.userId) {
          // Verify this trainer userId is not the current user
          if (foundTrainer.userId !== currentUser._id) {
            console.log('✅ Found trainer with userId:', foundTrainer);
            console.log('✅ Using trainer.userId for feedback linking:', foundTrainer.userId);
            
            setInstructorDetails({
              ...foundTrainer,
              _id: foundTrainer.userId // Use userId as the ID for feedback
            });
          } else {
            console.log('⚠️ Trainer userId matches current user - this is wrong!');
          }
        } else {
          console.log('⚠️ Trainer found but no userId or trainer not found');
        }
      } catch (trainerError) {
        console.log('❌ Error accessing trainers API:', trainerError.message);
      }
      
    } catch (error) {
      console.error('❌ Error fetching instructor details:', error);
    }
  };

  const steps = [
    { id: 1, title: 'Đánh giá dịch vụ', key: 'service', description: 'Chất lượng dịch vụ tại phòng gym' },
    { id: 2, title: 'Đánh giá huấn luyện viên', key: 'trainer', description: 'Chuyên môn và thái độ của trainer' },
    { id: 3, title: 'Đánh giá lớp học', key: 'class', description: 'Nội dung và chất lượng lớp học' },
    { id: 4, title: 'Đánh giá tổng quan', key: 'overall', description: 'Đánh giá chung về trải nghiệm' }
  ];

  const handleRatingChange = (step, rating) => {
    setFeedbackData(prev => ({
      ...prev,
      [step]: { ...prev[step], rating }
    }));
  };

  const handleCommentChange = (step, comment) => {
    setFeedbackData(prev => ({
      ...prev,
      [step]: { ...prev[step], comment }
    }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // Validate that all ratings are provided
    const hasAllRatings = Object.values(feedbackData).every(item => item.rating > 0);
    
    if (!hasAllRatings) {
      toast.error('Vui lòng đánh giá tất cả các mục');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Get instructor ID with multiple fallback methods
      const instructorId = classData.instructorId || 
                          classData.trainerId || 
                          instructorDetails?._id ||
                          (instructorDetails && instructorDetails.id);
      
      // Warning if no instructor ID found
      if (!instructorId) {
        console.warn('⚠️ WARNING: No instructor ID found for feedback!', {
          classData,
          instructorDetails,
          instructorName: classData.instructorName || classData.instructor
        });
        // Continue submission but feedback won't be linked to trainer properly
      } else {
        console.log('✅ Instructor ID found:', instructorId);
      }
      
      // Format data to match existing feedback API structure
      const submissionData = {
        feedbackType: 'class',
        classId: classData._id,
        class: classData._id, // Required field for linking to class
        // CRITICAL: Add trainer field for linking feedback to trainer profile
        trainer: instructorId,
        // CONTROLLER EXPECTS trainerId field specifically
        trainerId: instructorId,
        trainerName: classData.instructorName || 
                    classData.instructor ||
                    instructorDetails?.fullName ||
                    instructorDetails?.name,
        // Add instructor ID specifically for database linking (legacy support)
        instructorId: instructorId,
        instructorName: classData.instructorName || 
                       classData.instructor ||
                       instructorDetails?.fullName ||
                       instructorDetails?.name,
        // Class details for additional context (not the main class field)
        classDetails: {
          _id: classData._id,
          className: classData.className,
          serviceName: classData.serviceName,
          instructorId: instructorId,
          instructorName: classData.instructorName || 
                         classData.instructor ||
                         instructorDetails?.fullName ||
                         instructorDetails?.name,
          instructor: classData.instructorName || 
                     classData.instructor ||
                     instructorDetails?.fullName ||
                     instructorDetails?.name
        },
        overallRating: feedbackData.overall.rating,
        // STRUCTURED RATINGS for easy querying - each rating in separate field
        ratings: {
          // Service ratings
          serviceQuality: feedbackData.service.rating,
          // Trainer ratings - multiple fields for flexibility
          staffService: feedbackData.trainer.rating,    // Legacy field
          instructor: feedbackData.trainer.rating,      // Specific trainer rating
          trainerRating: feedbackData.trainer.rating,   // Dedicated trainer field
          instructorRating: feedbackData.trainer.rating, // Alternative trainer field
          // Class ratings
          equipmentQuality: feedbackData.class.rating,
          classQuality: feedbackData.class.rating,
          // Overall ratings
          atmosphere: feedbackData.overall.rating,
          cleanliness: feedbackData.overall.rating,
          valueForMoney: feedbackData.overall.rating,
          overallExperience: feedbackData.overall.rating
        },
        // SEPARATE COMMENT FIELDS for easy access
        comments: {
          service: feedbackData.service.comment || '',
          trainer: feedbackData.trainer.comment || '',
          instructor: feedbackData.trainer.comment || '', // Same as trainer
          class: feedbackData.class.comment || '',
          overall: feedbackData.overall.comment || ''
        },
        title: `Đánh giá lớp học: ${classData.className}`,
        content: [
          `Dịch vụ: ${feedbackData.service.rating}/5 sao${feedbackData.service.comment ? ` - ${feedbackData.service.comment}` : ''}`,
          `Huấn luyện viên: ${feedbackData.trainer.rating}/5 sao${feedbackData.trainer.comment ? ` - ${feedbackData.trainer.comment}` : ''}`,
          `Lớp học: ${feedbackData.class.rating}/5 sao${feedbackData.class.comment ? ` - ${feedbackData.class.comment}` : ''}`,
          `Tổng quan: ${feedbackData.overall.rating}/5 sao${feedbackData.overall.comment ? ` - ${feedbackData.overall.comment}` : ''}`
        ].join('\n\n'),
        type: 'class',
        isAnonymous: false,
        wouldRecommend: feedbackData.overall.rating >= 4,
        // Additional trainer-specific feedback data
        trainerFeedback: {
          rating: feedbackData.trainer.rating,
          comment: feedbackData.trainer.comment,
          instructorId: instructorId,
          instructorName: classData.instructorName || 
                         classData.instructor ||
                         instructorDetails?.fullName ||
                         instructorDetails?.name
        }
      };

      console.log('🚀 FINAL SUBMISSION DATA:', {
        'trainer (main field)': submissionData.trainer,
        'trainerId (controller expects)': submissionData.trainerId, 
        instructorId: submissionData.instructorId,
        instructorName: submissionData.instructorName,
        trainerName: submissionData.trainerName,
        classData: classData,
        instructorDetails: instructorDetails,
        fallbackMethods: {
          fromClassData: classData.instructorId || classData.trainerId,
          fromInstructorDetails: instructorDetails?._id,
          finalInstructorId: instructorId,
          hasInstructorId: !!instructorId
        }
      });

      await axios.post('http://localhost:5000/api/feedback', submissionData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Cảm ơn bạn đã đánh giá! Phản hồi của bạn sẽ được admin xem xét.');
      onSubmitted && onSubmitted();
      onClose();
      
      // Reset form
      setCurrentStep(1);
      setInstructorDetails(null);
      setFeedbackData({
        service: { rating: 0, comment: '' },
        trainer: { rating: 0, comment: '' },
        class: { rating: 0, comment: '' },
        overall: { rating: 0, comment: '' }
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ rating, onRatingChange, size = 'h-8 w-8' }) => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className={`${size} transition-all duration-200 hover:scale-110 ${
              star <= rating ? 'text-amber-400' : 'text-gray-300 hover:text-amber-200'
            }`}
          >
            <Star className="w-full h-full fill-current" />
          </button>
        ))}
      </div>
    );
  };

  const currentStepData = steps[currentStep - 1];
  const currentFeedback = feedbackData[currentStepData.key];

  if (!isOpen) return null;

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
          className="bg-white rounded-2xl max-w-md w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{currentStepData.title}</h2>
              <p className="text-sm text-gray-600 mt-1">{currentStepData.description}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Bước {currentStep}/4</span>
              <span className="text-sm text-gray-500">{Math.round((currentStep / 4) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / 4) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Class Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-800 mb-1">{classData?.className}</h3>
                <p className="text-sm text-gray-600">{classData?.serviceName}</p>
                <p className="text-sm text-gray-500">{classData?.instructorName}</p>
              </div>

              {/* Rating */}
              <div className="text-center mb-6">
                <p className="text-lg font-medium text-gray-800 mb-4">
                  Bạn đánh giá như thế nào?
                </p>
                <StarRating
                  rating={currentFeedback.rating}
                  onRatingChange={(rating) => handleRatingChange(currentStepData.key, rating)}
                />
                <p className="text-sm text-gray-500 mt-2">
                  {currentFeedback.rating > 0 && (
                    <>
                      {currentFeedback.rating === 1 && 'Rất không hài lòng'}
                      {currentFeedback.rating === 2 && 'Không hài lòng'}
                      {currentFeedback.rating === 3 && 'Bình thường'}
                      {currentFeedback.rating === 4 && 'Hài lòng'}
                      {currentFeedback.rating === 5 && 'Rất hài lòng'}
                    </>
                  )}
                </p>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nhận xét (tùy chọn)
                </label>
                <textarea
                  value={currentFeedback.comment}
                  onChange={(e) => handleCommentChange(currentStepData.key, e.target.value)}
                  rows={3}
                  maxLength={200}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Chia sẻ thêm về trải nghiệm của bạn..."
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {currentFeedback.comment.length}/200
                </div>
              </div>
            </motion.div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </button>

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                disabled={currentFeedback.rating === 0}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${
                  currentFeedback.rating === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Tiếp theo
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={currentFeedback.rating === 0 || isSubmitting}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${
                  currentFeedback.rating === 0 || isSubmitting
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Hoàn thành
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}