import React from 'react';

import * as S from './styles';
import { StyledProps } from './styles';

interface Props extends StyledProps {
  title: string;
  subtitle?: string;
}

const TitleSection: React.FC<Props> = ({ center, title, subtitle }) => (
  <S.TitleSection>
    {subtitle && <S.SubTitle center={center}>{title}</S.SubTitle>}
    <S.Title center={center}>{subtitle}</S.Title>
    <S.Separator center={center} />
  </S.TitleSection>
);

export default TitleSection;
