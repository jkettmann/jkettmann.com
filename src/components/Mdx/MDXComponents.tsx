import React from 'react';

import Link, { LinkProps } from './Link';
import Code, { CodeProps } from './Code';
import * as S from './MDXComponents.styles';

type PreProps = {
  children: {
    props: {
      children: string,
      className: string,
      mdxType: string
    }
  },
}

function preToCodeBlock(preProps: PreProps): CodeProps | null {
  if (
    preProps.children &&
    preProps.children.props &&
    preProps.children.props.mdxType === "code"
  ) {
    // we have a <pre><code> situation
    const {
      children: codeString,
      className = "",
      ...props
    } = preProps.children.props;

    const match = className.match(/language-([\0-\uFFFF]*)/);

    return {
      codeString: codeString.trim(),
      className,
      language: match && match[1],
      ...props
    };
  }
  return null;
}

const MDXLayoutComponents = {
  ul: (props: object) => <S.UnorderedList {...props} />,
  ol: (props: object) => <S.OrderedList {...props} />,
  li: (props: object) => <S.ListItem {...props} />,
  blockquote: (props: object) => <S.Blockquote {...props} />,
  a: (props: LinkProps) => <Link {...props} />,
  pre: (preProps: any) => {
    const props = preToCodeBlock(preProps)
    // if there's a codeString and some props, we passed the test
    if (props) {
      return <Code {...props} />
    } else {
      console.log('normal pre')
      // it's possible to have a pre without a code in it
      return <pre {...preProps} />
    }
  },
};

export default MDXLayoutComponents;
