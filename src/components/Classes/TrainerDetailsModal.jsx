import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Award, Clock, Trophy, MapPin, Heart, Target, CheckCircle, Shield, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function TrainerDetailsModal({ isOpen, onClose, trainerId, trainerName }) {
  const [trainerData, setTrainerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [trainerFeedbacks, setTrainerFeedbacks] = useState([]);

  useEffect(() => {
    if (isOpen) {
      console.log('🚀 TrainerDetailsModal opened with:', { trainerId, trainerName });
      if (trainerId) {
        fetchTrainerDetails();
        fetchTrainerFeedbacks();
      } else if (trainerName) {
        console.log('📝 No trainerId provided, searching by name:', trainerName);
        fetchTrainerByName();
        // fetchTrainerFeedbacksByName will be called after trainerData is set
      } else {
        console.log('⚠️ No trainerId or trainerName provided!');
      }
    }
  }, [isOpen, trainerId, trainerName]);

  // Separate effect to fetch feedbacks after trainer data is loaded
  useEffect(() => {
    if (isOpen && trainerName && trainerData && !trainerId) {
      console.log('🔍 Trainer data loaded, fetching feedbacks by name...');
      fetchTrainerFeedbacksByName();
    }
  }, [trainerData, isOpen, trainerName, trainerId]);

  const fetchTrainerDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/trainers/${trainerId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setTrainerData(response.data);
    } catch (error) {
      console.error('Error fetching trainer details:', error);
      // Use fallback data if API fails
      setTrainerData({
        fullName: trainerName || 'Huấn luyện viên',
        specializations: ['Fitness tổng quát'],
        experience: 'Chưa có thông tin',
        certifications: [],
        bio: 'Chưa có thông tin chi tiết',
        avatar: null
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainerByName = async () => {
    try {
      setLoading(true);
      console.log('Searching for trainer by name:', trainerName);
      
      // Basic fallback implementation
      setTrainerData({
        fullName: trainerName || 'Huấn luyện viên',
        specializations: ['Fitness tổng quát'],
        experience: 'Chưa có thông tin',
        certifications: [],
        bio: 'Huấn luyện viên chưa cập nhật thông tin giới thiệu.',
        avatar: null
      });
    } catch (error) {
      console.error('Error fetching trainer by name:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainerFeedbacks = async () => {
    try {
      console.log('🔍 Fetching feedbacks for trainer ID:', trainerId);
      setTrainerFeedbacks([]);
    } catch (error) {
      console.error('❌ Error fetching trainer feedbacks:', error);
      setTrainerFeedbacks([]);
    }
  };

  const fetchTrainerFeedbacksByName = async () => {
    try {
      console.log('🔍 Fetching feedbacks for trainer name:', trainerName);
      setTrainerFeedbacks([]);
    } catch (error) {
      console.error('❌ Error fetching trainer feedbacks by name:', error);
      setTrainerFeedbacks([]);
    }
  };

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
          className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  {trainerData?.fullName || trainerName || 'Đang tải...'}
                </h2>
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-white" />
                  <span className="text-white/90">
                    {trainerData?.experience || 'Huấn luyện viên'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Đang tải thông tin...</p>
            </div>
          ) : (
            <div className="p-6">
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">Thông tin huấn luyện viên</p>
                <p className="text-gray-400 text-sm mt-1">
                  {trainerData?.fullName || trainerName}
                </p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
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