import { createGlobalStyle } from 'styled-components';
import tw from 'tailwind.macro';

export default createGlobalStyle`
  html {
    font-size: 18px;
    font-family: 'Lato', sans-serif;
  }

  body {
    ${tw`m-0 text-indigo-900 bg-white`};
  }

  h1, h2, h3, h4, h5 {
    font-family: 'Raleway', sans-serif;
    ${tw`font-bold w-full text-left`};
  }

  h1 {
    ${tw`text-4xl`};
  }

  h2 {
    ${tw`text-3xl mt-12`};
  }

  a {
    ${tw`text-indigo-600 hover:text-indigo-700`};
  }

  p + p {
    ${tw`mt-3`};
  }
`;
