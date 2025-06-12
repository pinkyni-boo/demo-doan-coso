import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { VintageCard, VintageHeading, VintageText } from '../Templates/VintageLayout';
import { ArrowRight, Star } from 'lucide-react';

const ServiceCard = ({ service, index, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className="h-full group"
      onClick={() => onClick && onClick(service.name)}
    >
      <Link
        to={`/services/${service.id || service._id}`}
        className="hover:no-underline block h-full"
      >
        <VintageCard className="h-full flex flex-col overflow-hidden group-hover:shadow-elegant transition-all duration-500">
          <div className="relative overflow-hidden h-64">
            <img
              src={service.image}
              alt={service.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-vintage-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Badge */}
            <div className="absolute top-4 right-4">
              <div className="bg-vintage-gold text-vintage-dark px-3 py-1 rounded-full text-xs font-bold vintage-sans flex items-center shadow-golden">
                <Star className="h-3 w-3 mr-1 fill-current" />
                Hot
              </div>
            </div>
            
            {/* Hover Icon */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="w-16 h-16 bg-vintage-gold rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300 delay-100 shadow-golden">
                <ArrowRight className="h-6 w-6 text-vintage-dark" />
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-4 flex-grow flex flex-col">
            <VintageHeading level={4} className="group-hover:text-vintage-primary transition-colors">
              {service.name}
            </VintageHeading>
            
            <VintageText variant="body" className="flex-grow line-clamp-3">
              {service.description}
            </VintageText>
            
            <div className="flex justify-between items-center pt-4 border-t border-vintage-primary/20">
              <div className="text-vintage-primary font-bold group-hover:text-vintage-gold transition-colors flex items-center vintage-sans">
                <span>Chi tiết</span>
                <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
              
              {service.price && (
                <div className="bg-vintage-warm text-vintage-primary px-3 py-1 rounded-lg font-medium vintage-sans text-sm">
                  {typeof service.price === "number"
                    ? service.price.toLocaleString("vi-VN") + " đ"
                    : service.price}
                </div>
              )}
            </div>
          </div>
        </VintageCard>
      </Link>
    </motion.div>
  );
};

export default ServiceCard;