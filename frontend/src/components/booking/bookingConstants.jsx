import React from 'react';
import { FaBirthdayCake, FaRing, FaUtensils, FaShoppingCart, FaBroom, FaCamera, FaStar, FaGift, FaConciergeBell, FaLeaf, FaUsers } from 'react-icons/fa';
import { GiPartyPopper } from "react-icons/gi";
import { RiCake3Line } from "react-icons/ri";
import { MdOutlineCleanHands } from "react-icons/md";

// Service type options with different pricing structures
export const serviceTypes = [
  {
    id: 'birthday',
    name: 'Birthday Party',
    icon: <FaBirthdayCake className="mx-auto mb-3 text-4xl text-pink-500" />,
    description: 'Celebrate special birthdays with custom menus and party atmosphere',
    baseMultiplier: 1.5, // 50% more than base rate
    minDuration: 3,
    maxDuration: 8,
    features: ['Custom birthday menu', 'Party presentation', 'Birthday cake coordination']
  },
  {
    id: 'marriage',
    name: 'Marriage Ceremony',
    icon: <FaRing className="mx-auto mb-3 text-4xl text-indigo-500" />,
    description: 'Grand wedding celebrations with multi-course traditional meals',
    baseMultiplier: 2.5, // 150% more than base rate
    minDuration: 6,
    maxDuration: 12,
    features: ['Multi-course menu', 'Traditional cuisine', 'Large quantity cooking', 'Premium service']
  },
  {
    id: 'daily',
    name: 'Daily Cook',
    icon: <FaUtensils className="mx-auto mb-3 text-4xl text-teal-500" />,
    description: 'Regular home cooking for daily meals and weekly meal prep',
    baseMultiplier: 0.8, // 20% less than base rate for regular service
    minDuration: 1,
    maxDuration: 3,
    features: ['Home-style cooking', 'Meal planning', 'Grocery assistance', 'Flexible timing']
  }
];

// Dynamic add-ons based on service type
export const getAddOnsForService = (serviceType) => {
  const baseAddOns = [
    { name: 'Cleanup', price: 150, icon: <MdOutlineCleanHands className="text-2xl text-blue-500" />, description: 'Complete post-meal cleanup service' }
  ];

  const serviceSpecificAddOns = {
    birthday: [
      { name: 'Party Decor', price: 500, icon: <GiPartyPopper className="text-2xl text-purple-500" />, description: 'Birthday party table decoration' },
      { name: 'Birthday Cake', price: 800, icon: <RiCake3Line className="text-2xl text-pink-500" />, description: 'Custom birthday cake' },
      { name: 'Photography', price: 1200, icon: <FaCamera className="text-2xl text-gray-500" />, description: 'Party photography service' }
    ],
    marriage: [
      { name: 'Wedding Decor', price: 2000, icon: <FaGift className="text-2xl text-red-500" />, description: 'Elegant wedding decoration' },
      { name: 'Traditional Setup', price: 1500, icon: <FaConciergeBell className="text-2xl text-yellow-500" />, description: 'Traditional ceremony setup' },
      { name: 'Catering Staff', price: 3000, icon: <FaUsers className="text-2xl text-green-500" />, description: 'Additional serving staff' },
      { name: 'Premium Ingredients', price: 2500, icon: <FaStar className="text-2xl text-amber-500" />, description: 'Premium quality ingredients' }
    ],
    daily: [
      { name: 'Grocery Shopping', price: 200, icon: <FaShoppingCart className="text-2xl text-orange-500" />, description: 'Weekly grocery shopping' },
      { name: 'Meal Planning', price: 300, icon: <FaLeaf className="text-2xl text-green-500" />, description: 'Weekly meal planning service' },
      { name: 'Utensils Care', price: 150, icon: <FaBroom className="text-2xl text-brown-500" />, description: 'Kitchen utensils maintenance' }
    ]
  };

  return [...baseAddOns, ...(serviceSpecificAddOns[serviceType] || [])];
};
