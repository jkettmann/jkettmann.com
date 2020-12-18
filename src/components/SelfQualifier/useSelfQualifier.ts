import { useState } from 'react';
import { Pain, UseSelfQualifierReturn } from './types';

const useSelfQualifier = (pains: Array<Pain>): UseSelfQualifierReturn => {
  const [pain, setPain] = useState<string | null>(null)
  const selectedPain = pains.find(({ value }) => value === pain);

  return { selectedPain, setPain };
};

export default useSelfQualifier;
