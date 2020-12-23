import { createGlobalStyle } from 'styled-components';
import tw from 'tailwind.macro';

export default createGlobalStyle`
  html {
    font-size: 18px;
    font-family: 'Lato', sans-serif;

    @media (min-width: 400px) {
      font-size: 20px;
    }
  }

  body {
    ${tw`m-0 bg-white`};
    color: #2a233d;
  }

  h1, h2, h3, h4, h5 {
    font-family: 'Raleway', sans-serif;
    line-height: 1.3;
    ${tw`font-bold w-full text-left`};

    & > a > svg {
      display: none;
      position: absolute;
      transform: translate(-120%, 50%) scale(0.7);
      fill: #333;
    }
  }

  h1 {
    ${tw`text-4xl`};
  }

  h2 {
    ${tw`text-3xl mt-8 mb-2`};
  }

  h3 {
    ${tw`text-2xl mt-8 mb-2`};

    & > a > svg {
      transform: translate(-120%, 30%) scale(0.7);
    }
  }

  h4 {
    ${tw`text-xl mt-8 mb-2`};

    & > a > svg {
      transform: translate(-120%, 20%) scale(0.7);
    }
  }

  a {
    color: #000;
    border-bottom: 1px solid #75b09c;

    :hover {
      color: #75b09c;
    }
  }

  p {
    ${tw`my-4 w-full`};
    &:last-child {
      margin-bottom: 0;
    }
  }
`;
