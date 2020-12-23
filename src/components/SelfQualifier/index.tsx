import React from 'react';

import { trackEvent } from 'helpers/analytics';
import * as S from './styles';
import type { SelfQualifierProps } from './types';

const DefaultLabel = () => <>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</>

const SelfQualifier: React.FC<SelfQualifierProps> = ({ pains, selectedPain, setPain }) => {
  const onChangePain = (e: React.ChangeEvent) => {
    const { value } = e.target;
    setPain(value);
    trackEvent('Self Qualifier - Select Pain', { value });
  };
  return (
    <S.Container noPainSelected={!selectedPain}>
      <S.SelectContainer>
        <S.Select
          onChange={onChangePain}
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
          After all this time learning React I still <S.Pain>{selectedPain?.label || <DefaultLabel />}&nbsp;<S.ChevronDown>▼</S.ChevronDown></S.Pain>
        </S.Title>
      </S.SelectContainer>

    </S.Container>
  );
};

export default SelfQualifier;
