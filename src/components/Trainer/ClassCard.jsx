import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  MessageSquare
} from 'lucide-react';

const ClassCard = ({ classItem, currentDate, onScheduleChange }) => {
  const navigate = useNavigate();

  // Parse schedule string to get day and time
  const parseSchedule = (scheduleStr) => {
    if (!scheduleStr) return null;
    
    // Example: "T2,T4 - 19:00-21:00" or "Thứ 2, Thứ 4 - 19:00-21:00"
    const parts = scheduleStr.split(' - ');
    if (parts.length !== 2) return null;
    
    const [daysPart, timePart] = parts;
    const [startTime, endTime] = timePart.split('-');
    
    // Parse days
    const days = [];
    if (daysPart.includes('T2') || daysPart.includes('Thứ 2')) days.push(1); // Monday
    if (daysPart.includes('T3') || daysPart.includes('Thứ 3')) days.push(2); // Tuesday
    if (daysPart.includes('T4') || daysPart.includes('Thứ 4')) days.push(3); // Wednesday
    if (daysPart.includes('T5') || daysPart.includes('Thứ 5')) days.push(4); // Thursday
    if (daysPart.includes('T6') || daysPart.includes('Thứ 6')) days.push(5); // Friday
    if (daysPart.includes('T7') || daysPart.includes('Thứ 7')) days.push(6); // Saturday
    if (daysPart.includes('CN') || daysPart.includes('Chủ nhật')) days.push(0); // Sunday
    
    return { days, startTime, endTime };
  };

  // Cancelled class
  if (classItem.isCancelled) {
    const schedule = parseSchedule(classItem.schedule);
    if (!schedule) return null;
    
    return (
      <div className="p-3 rounded-lg border-l-4 border-gray-400 bg-gray-50 opacity-75">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-sm text-gray-600 line-through truncate">{classItem.className}</h4>
          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
            {schedule.startTime} - {schedule.endTime}
          </span>
        </div>
        <div className="mb-2">
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
            Đã hủy - có lịch bù
          </span>
        </div>
        <div className="flex items-center text-xs text-gray-500">
          <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="truncate">{classItem.location}</span>
        </div>
      </div>
    );
  }

  // Makeup class
  if (classItem.isMakeup) {
    return (
      <div className="p-3 rounded-lg border-l-4 border-orange-400 bg-orange-50 hover:shadow-md transition-all cursor-pointer">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-sm text-orange-900 truncate">{classItem.className}</h4>
          <span className="text-xs text-orange-700 font-medium flex-shrink-0 ml-2">
            {classItem.schedule}
          </span>
        </div>
        <div className="mb-2">
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-200 text-orange-800">
            Lịch dạy bù
          </span>
        </div>
        <div className="flex items-center text-xs text-orange-700">
          <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="truncate">{classItem.location}</span>
        </div>
      </div>
    );
  }

  // Regular class
  const schedule = parseSchedule(classItem.schedule);
  if (!schedule) return null;

  const getClassStatus = () => {
    const now = new Date();
    const startDate = new Date(classItem.startDate);
    const endDate = new Date(classItem.endDate);
    
    now.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    
    if (now < startDate) return "upcoming";
    if (now > endDate) return "completed";
    return "ongoing";
  };

  const getStatusColor = () => {
    const status = getClassStatus();
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "ongoing":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-gray-100 text-gray-600 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const isCompleted = getClassStatus() === "completed";

  const handleScheduleChangeClick = (e) => {
    e.stopPropagation();
    onScheduleChange(classItem, currentDate);
  };

  const handleClassClick = () => {
    navigate(`/trainer/classes/${classItem._id}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClassClick();
    }
  };

  return (
    <div 
      className={`p-3 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-all ${getStatusColor()} ${
        isCompleted ? 'opacity-75' : ''
      }`}
      onClick={handleClassClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-sm truncate">{classItem.className}</h4>
        <span className="text-xs opacity-75 flex-shrink-0 ml-2">
          {schedule.startTime} - {schedule.endTime}
        </span>
      </div>
      
      <div className="flex items-center text-xs opacity-75 mb-2">
        <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
        <span className="truncate">{classItem.location}</span>
      </div>
      
      {/* Schedule change request button */}
      {!isCompleted && (
        <button
          onClick={handleScheduleChangeClick}
          className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded hover:bg-orange-200 transition-colors flex items-center mt-2 w-full justify-center focus:outline-none focus:ring-2 focus:ring-orange-500"
          aria-label={`Đổi lịch cho lớp ${classItem.className}`}
        >
          <MessageSquare className="h-3 w-3 mr-1" />
          Đổi lịch
        </button>
      )}
    </div>
  );
};

export default ClassCard;