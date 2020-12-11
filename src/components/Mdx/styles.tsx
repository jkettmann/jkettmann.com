import styled from 'styled-components';
import tw from 'tailwind.macro';

export const Paragraph =  styled.p`
  ${tw`my-2`};
`;

export const UnorderedList = styled.ul`
  ${tw`list-disc my-4 pl-8`};
`;

export const OrderedList = styled.ol`
  ${tw`list-decimal my-4 pl-8`};
`;

export const ListItem = styled.li`
  ${tw`mb-1`};
`;

export const Subtitle = styled.h2`
  text-align: left;
  font-size: 18px;
  margin-top: 20px;
  margin-bottom: 20px;
  font-weight: 900;
  line-height: 1.1;
`;

export const Title = styled.h1`
  ${tw`text-3xl`};
`;

export const Blockquote = styled.blockquote`
  margin: 40px -50px;
  padding: 20px 70px;
  box-shadow: 2px 2px 6px 0 rgba(117,176,156,0.3);
  background: #CBE2DA;

  @media(max-width: 900px) {
    margin: 40px -20px;
    padding: 10px;
  }
`;