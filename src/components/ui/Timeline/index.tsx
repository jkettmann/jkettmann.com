import React from 'react';

import * as S from './styles';

interface Props {
  title: string;
  subtitle: string;
  content: React.ReactNode;
  startDate: string;
  endDate: string;
}

const Timeline: React.FC<Props> = ({ title, subtitle, content, startDate, endDate }) => (
  <S.Timeline>
    <S.Point />
    <S.Details>
      <S.Date>
        {startDate} - {endDate}
      </S.Date>
      <S.Title>{title}</S.Title>
      <S.Subtitle>{subtitle}</S.Subtitle>
    </S.Details>
    <S.Content>{content}</S.Content>
  </S.Timeline>
);

export default Timeline;
