import styled from 'styled-components';
import tw from 'tailwind.macro';

export interface StyledProps {
  primary?: boolean;
  block?: boolean;
}

export const Button = styled.button<StyledProps>`
  outline: none !important;
  ${tw`py-2 px-8 rounded-full border border-teal-300 text-indigo-900 hover:text-indigo-900`};

  ${({ primary }) => (primary ? tw`bg-teal-300` : tw`text-indigo-600 hover:text-indigo-600`)};

  ${({ block }) => block && tw`w-full`};
`;
