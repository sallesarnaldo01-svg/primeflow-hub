import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  return null;
};

export default Index;
