import styled from 'styled-components';
import tw from 'tailwind.macro';

export interface StyledProps {
  center?: boolean;
}

export const TitleSection = styled.div`
  ${tw`flex flex-col w-full`};
`;

export const Date = styled.div<StyledProps>`
  ${tw`mb-4 text-xs text-indigo-600 w-full text-left`};
  ${({ center }) => center && tw`text-center`};
`;

export const Title = styled.h1<StyledProps>`
  ${({ center }) => center && tw`text-center`};
`;

