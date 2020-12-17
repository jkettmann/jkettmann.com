import styled, { css } from 'styled-components';
import UnstyledContainer from 'components/ui/Container';

export const Container = styled(UnstyledContainer)<{ noPainSelected: boolean }>`
  margin-top: 6rem;
  margin-bottom: 3rem;
  display: block;
  ${props => props.noPainSelected && css`
    height: 100vh;
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

export const InvisibleDefaultOption = styled.option`
  display: none;
`;

export const Option = styled.option`
  font-size: 1.5rem;
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
  text-align: center;

  &:before {
    content: open-quote;
  }

  &:after {
    content: close-quote;
  }
`;