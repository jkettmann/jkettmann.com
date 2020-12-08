import React from 'react';

import * as S from './styles';
import { StyledProps } from './styles';

interface Props extends StyledProps {
  title: string;
  date?: string;
}

const TitleSection: React.FC<Props> = ({ center, title, date }) => (
  <S.TitleSection>
    <S.Title center={center}>{title}</S.Title>
    {date && <S.Date center={center}>{date}</S.Date>}
  </S.TitleSection>
);

export default TitleSection;
