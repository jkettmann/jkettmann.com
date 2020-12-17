import React from 'react';

import * as S from './styles';
import { SelfQualifierProps } from './types';

const DefaultLabel = () => <>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</>

const SelfQualifier: React.FC<SelfQualifierProps> = ({ pains, selectedPain, setPain }) => {
  return (
    <S.Container noPainSelected={!selectedPain}>
      <S.SelectContainer>
        <S.Select
          onChange={(e) => setPain(e.target.value)}
          value={selectedPain ? selectedPain.value : ''}
        >
          <S.InvisibleDefaultOption key="" value="">
            {""}
          </S.InvisibleDefaultOption>
          {pains.map(option => (
            <S.Option key={option.value} value={option.value}>
              {option.label}
            </S.Option>
          )
        )}
        </S.Select>
        <S.Title>
          After all this time learning React I still <S.Pain>{selectedPain?.label || <DefaultLabel />}</S.Pain>
        </S.Title>
      </S.SelectContainer>

    </S.Container>
  );
};

export default SelfQualifier;
