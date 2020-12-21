import styled from 'styled-components';
import tw from 'tailwind.macro';

export interface StyledProps {
  notFlex?: boolean;
  section?: boolean;
}

export const Container = styled.div<StyledProps>`
  ${tw`max-w-screen-md w-full mx-auto p-5`};
  ${({ notFlex }) => !notFlex && tw`flex flex-wrap`};
  ${({ section }) => section && tw`py-8 sm:py-16`};
`;
