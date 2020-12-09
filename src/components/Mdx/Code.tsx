import React from 'react'
import theme from 'prism-react-renderer/themes/oceanicNext'
import Highlight, { defaultProps, Language } from 'prism-react-renderer'

export type CodeProps = {
  codeString: string,
  language: Language,
  'react-live'?: boolean,
}

const Code = ({ codeString, language, ...props }: CodeProps): React.ReactNode => {
  return (
    <Highlight
      {...defaultProps}
      code={codeString}
      language={language}
      theme={theme}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={`${className} my-12 w-full no-whitespace-normalization`}
          style={style}
        >
          {tokens.map((line, i) => (
            <div {...getLineProps({ line, key: i })}>
              {line.map((token, key) => (
                <span {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  )
}

export default Code
