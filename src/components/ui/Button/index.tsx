import React from 'react';

import * as S from './styles';

interface Props extends S.StyledProps {
  children: React.ReactNode;
}

const Button: React.FC<Props & React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ primary, block, children, ...other }) => (
  <S.Button {...other} primary={primary} block={block} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
    {children}
  </S.Button>
);

export default Button;
