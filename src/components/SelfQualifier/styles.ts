import styled, { css } from 'styled-components';
import UnstyledContainer from 'components/ui/Container';

export const Container = styled(UnstyledContainer)<{ noPainSelected: boolean }>`
  max-width: 920px;
  margin-top: 4rem;
  ${props => props.noPainSelected && css`
    height: 100vh;
    margin-top: 6rem;
  `}
`;

export const SelectContainer = styled.div`
  position: relative;
`;

export const Select = styled.select`
  position: absolute;
  height: 100%;
  width: 100%;
  background: none;
  font-weight: bold;
  border: none;
  cursor: pointer;
  opacity: 0;
`;

export const Pain = styled.span`
  border-bottom: 3px solid;
  position: relative;
  padding-right: 1em;
  pointer-events: none;

  &:after {
    content: '▼';
    position: absolute;
    font-size: 0.5em;
    transform: translate(0.5em, 50%);
  }
`;

export const Title = styled.h1`
  &:before {
    content: open-quote;
    position: absolute;
    transform: translateX(-100%);
  }

  &:after {
    content: close-quote;
  }
`;