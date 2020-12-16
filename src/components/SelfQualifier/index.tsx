import React, { useState } from 'react';

import * as S from './styles';

const DefaultLabel = () => <>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</>

const painOptions = [
  { value: 'job-search', label: 'I can\'t finding a job'},
  { value: 'pro', label: 'I feel like an amateur' },
]

const SelfQualifier: React.FC = () => {
  const [pain, setPain] = useState<string | null>(null)
  const selectedPain = painOptions.find(({ value }) => value === pain);
  return (
    <S.Container noPainSelected={!selectedPain}>
      <S.SelectContainer>
        <S.Select
          onChange={(e) => setPain(e.target.value)}
        >
          {painOptions.map(option => (
            <option value={option.value}>
              {option.label}
            </option>
          )
        )}
        </S.Select>
        <S.Title>
          I'm a React developer but <S.Pain>{selectedPain?.label || <DefaultLabel />}</S.Pain>
        </S.Title>
      </S.SelectContainer>

    </S.Container>
  );
};

export default SelfQualifier;
