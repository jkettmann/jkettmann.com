import styled, { css } from 'styled-components';

export const SideBar = styled.div<{ hasScrolled: boolean; scrolledToBottom: boolean; }>`
  position: fixed;
  opacity: ${props => props.hasScrolled ? '1' : '0'};
  transition: opacity 300ms ease;

  @media (max-width: 849px) {
    display: flex;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    ${props => props.scrolledToBottom && css`
      opacity: 0;
      pointer-events: none;
    `}
  }

  @media (min-width: 850px) {
    display: block;
    top: 50%;
    transform: translate(-100px, -50%);
  }
`;

export const IconLink = styled.a`
  margin: 0 8px;
  text-decoration: none;
  border: none;
`;

export const Icon = styled.img`

`;
