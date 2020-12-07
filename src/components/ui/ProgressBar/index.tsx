import React from 'react';

import * as S from './styles';

interface Props extends S.StyledProps {
  title: string;
}

const ProgressBar: React.FC<Props> = ({ title, percentage }) => (
  <S.ProgressBar>
    <S.Content>
      <S.Title>{title}</S.Title>
      <S.Percentage>{percentage}%</S.Percentage>
    </S.Content>
    <S.BarWrapper>
      <S.Bar percentage={percentage} />
    </S.BarWrapper>
  </S.ProgressBar>
);

export default ProgressBar;
