import React from 'react'
import theme from 'prism-react-renderer/themes/oceanicNext'
import Highlight, { defaultProps, Language } from 'prism-react-renderer'
import * as S from './Code.styles';

export type CodeProps = {
  codeString: string,
  language: Language,
  'react-live'?: boolean,
}

const Code = ({ codeString, language }: CodeProps): React.ReactElement => {
  return (
    <Highlight
      {...defaultProps}
      code={codeString}
      language={language}
      theme={theme}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <S.Pre
          className={`${className}`}
          style={style}
        >
          {tokens.map((line, i) => (
            <div {...getLineProps({ line, key: i })}>
              {line.map((token, key) => (
                <span {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </S.Pre>
      )}
    </Highlight>
  )
}

export default Code
