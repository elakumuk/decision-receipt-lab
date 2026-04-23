"use client";

import { Highlight, themes } from "prism-react-renderer";

export function DocsCodeBlock({
  code,
  language,
}: {
  code: string;
  language: string;
}) {
  return (
    <Highlight theme={themes.nightOwl} code={code.trim()} language={language}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={`${className} overflow-x-auto rounded-[24px] border border-white/8 p-4 text-sm`}
          style={style}
        >
          {tokens.map((line, index) => (
            <div key={index} {...getLineProps({ line })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
}
