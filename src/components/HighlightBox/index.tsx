import React from 'react';
import * as S from './styles';

const HighlightBox: React.FC = ({ children }) => (
  <S.Box>
    {children}
  </S.Box>
);

export default HighlightBox;
