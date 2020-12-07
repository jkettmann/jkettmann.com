import React from 'react';

import * as S from './styles';

interface Props extends S.StyledProps {
  children: React.ReactNode;
}

const Container: React.FC<Props> = ({ section, children }) => (
  <S.Container section={section}>{children}</S.Container>
);

export default Container;
