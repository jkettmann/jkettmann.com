import styled, { css } from 'styled-components';
import UnstyledContainer from 'components/ui/Container';

export const Container = styled(UnstyledContainer)<{ noPainSelected: boolean }>`
  margin-top: 6rem;
  margin-bottom: 0;
  display: block;
  ${props => props.noPainSelected && css`
    height: calc(100vh - 6rem - 2.5rem - 4rem - 70px);
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
  font-size: 1.2rem;
`;

export const Pain = styled.span`
  border-bottom: 3px solid;
  padding-right: 8px;
  pointer-events: none;
`;

export const ChevronDown = styled.span`
  font-size: 0.5em;
  display: inline-block;
  transform: translateY(-6px);
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