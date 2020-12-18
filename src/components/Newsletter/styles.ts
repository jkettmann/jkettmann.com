import styled from 'styled-components';

export const Wrapper = styled.div`
  margin: 80px -50px;
  padding: 20px 100px;
  box-shadow: 2px 2px 6px 0 rgba(117,176,156,0.3);
  background: #1D342C;
  color: #eee;
  text-align: center;

  @media(max-width: 900px) {
    margin: 40px -20px;
    padding: 10px;
  }

  h4 {
    font-size: 34px !important;
    line-height: 42px !important;
    margin-bottom: 10px !important;
    font-family: 'Raleway', sans-serif !important;
    font-weight: 700 !important;
    color: #eee !important;
  }

  p {
    margin-bottom: 40px !important;
    font-family: 'Lato', sans-serif !important;
    font-weight: 400 !important;
    font-size: 18px !important;
    line-height: 26px !important;
    color: #eee !important;
  }

  #post-subscribe .ml-form-embedContainer .ml-form-embedWrapper .ml-form-embedBody .ml-form-embedSubmit button {
    background-color: #599B85 !important;
    font-size: 18px !important;

    :hover {
      background-color: #75b09c !important;
    }
  }

  .embedForm {
    background: none !important;
  }

  .ml-form-embedContent {
    margin: 0 !important;
  }
`
