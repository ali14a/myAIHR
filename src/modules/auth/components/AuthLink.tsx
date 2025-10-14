import React from 'react';
import { Link } from 'react-router-dom';

interface AuthLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
}

const AuthLink: React.FC<AuthLinkProps> = ({
  to,
  children,
  className = "font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
}) => {
  return (
    <Link
      to={to}
      className={className}
    >
      {children}
    </Link>
  );
};

export default AuthLink;