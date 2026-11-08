import React from 'react';
import { AuthModal } from '../auth/AuthModal';

/**
 * Backward compatibility wrapper for TeacherAuthModal
 * Dispatches to the new modern dual-role AuthModal
 */
export const TeacherAuthModal: React.FC = () => {
  return <AuthModal />;
};
