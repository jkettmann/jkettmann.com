import React from 'react';

import Icon, { IconProps } from 'components/ui/Icon';

import * as S from './styles';

interface Props extends S.StyledProps {
  title: string;
  content: React.ReactNode;
  icon: IconProps;
}

const InfoBlock: React.FC<Props> = ({ icon, title, content, center }) => (
  <S.InfoBlock center={center}>
    <S.Icon>
      <Icon icon={icon} />
    </S.Icon>
    <S.Wrapper center={center}>
      <S.Title>{title}</S.Title>
      <S.Content>{content}</S.Content>
    </S.Wrapper>
  </S.InfoBlock>
);

export default InfoBlock;
