import { createGlobalStyle } from 'styled-components';
import tw from 'tailwind.macro';

export default createGlobalStyle`
  html {
    font-size: 18px;
    font-family: 'Lato', sans-serif;
  }

  body {
    ${tw`m-0 bg-white`};
    color: #2a233d;
  }

  h1, h2, h3, h4, h5 {
    font-family: 'Raleway', sans-serif;
    ${tw`font-bold w-full text-left`};
  }

  h1 {
    ${tw`text-4xl`};
  }

  h2 {
    ${tw`text-3xl mt-8 mb-2`};
  }

  a {
    color: #000;
    border-bottom: 1px solid #75b09c;

    :hover {
      color: #75b09c;
    }
  }
`;
