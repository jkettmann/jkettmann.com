import styled from 'styled-components';

export const PortraitWrapper = styled.div`
  margin: 0px 20px 5px;
  float: right;

  @media (min-width: 500px) {
    margin: 0 30px 30px;
  }
`;

export const Image = styled.figure`
  width: 130px;
  height: 130px;
  border-radius: 50%;
  overflow: hidden;

  @media (min-width: 500px) {
    width: 200px;
    height: 200px;
  }
`;

export const IconWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  padding: 0px 15px;

  @media (min-width: 500px) {
    padding: 0 52px;
  }
`;

export const IconLink = styled.a`
  text-decoration: none;
  border: none;
`;

export const Icon = styled.img`

`;
