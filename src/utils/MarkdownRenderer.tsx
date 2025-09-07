import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Highlight, themes } from "prism-react-renderer";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="markdown-p">{children}</p>,
        h1: ({ children }) => <h1 className="markdown-h1">{children}</h1>,
        h2: ({ children }) => <h2 className="markdown-h2">{children}</h2>,
        h3: ({ children }) => <h3 className="markdown-h3">{children}</h3>,
        strong: ({ children }) => (
          <strong className="markdown-strong">{children}</strong>
        ),
        em: ({ children }) => <em className="markdown-em">{children}</em>,
        ul: ({ children }) => <ul className="markdown-ul">{children}</ul>,
        ol: ({ children }) => <ol className="markdown-ol">{children}</ol>,
        li: ({ children }) => <li className="markdown-li">{children}</li>,
        pre: (props) => {
          const children = props.children as any;

          // Handle both direct code children and nested code elements
          let code = "";
          let language = "javascript";

          // Check if children is an array with a code element
          if (Array.isArray(children) && children.length > 0) {
            const codeElement = children[0];
            if (codeElement?.props?.className) {
              // Handle both string and array children
              const childrenContent = codeElement.props.children;
              if (typeof childrenContent === "string") {
                code = childrenContent;
              } else if (Array.isArray(childrenContent)) {
                // Join array elements into a string
                code = childrenContent
                  .map((child) =>
                    typeof child === "string"
                      ? child
                      : child?.props?.children || ""
                  )
                  .join("");
              } else {
                code = childrenContent || "";
              }
              language =
                codeElement.props.className.replace("language-", "") ||
                "javascript";
            }
          } else if (children?.props?.className) {
            // This is a code element with className
            const childrenContent = children.props.children;
            if (typeof childrenContent === "string") {
              code = childrenContent;
            } else if (Array.isArray(childrenContent)) {
              code = childrenContent
                .map((child) =>
                  typeof child === "string"
                    ? child
                    : child?.props?.children || ""
                )
                .join("");
            } else {
              code = childrenContent || "";
            }
            language =
              children.props.className.replace("language-", "") || "javascript";
          } else if (typeof children === "string") {
            // Direct string content
            code = children;
          } else if (children?.props?.children) {
            // Nested structure
            const childrenContent = children.props.children;
            if (typeof childrenContent === "string") {
              code = childrenContent;
            } else if (Array.isArray(childrenContent)) {
              code = childrenContent
                .map((child) =>
                  typeof child === "string"
                    ? child
                    : child?.props?.children || ""
                )
                .join("");
            } else {
              code = childrenContent || "";
            }
          }

          return (
            <div className="markdown-code-block">
              <Highlight theme={themes.oneDark} code={code} language={language}>
                {({
                  className,
                  style,
                  tokens,
                  getLineProps,
                  getTokenProps,
                }) => (
                  <pre
                    className={`${className} markdown-pre`}
                    style={{ ...style, backgroundColor: "#1d1d1d" }}
                  >
                    {tokens.map((line, i) => (
                      <div
                        key={i}
                        {...getLineProps({ line })}
                        className="markdown-code-line"
                      >
                        <span className="markdown-line-number">{i + 1}</span>
                        <span className="markdown-code-content">
                          {line.map((token, key) => (
                            <span key={key} {...getTokenProps({ token })} />
                          ))}
                        </span>
                      </div>
                    ))}
                  </pre>
                )}
              </Highlight>
            </div>
          );
        },
        code: ({ children }) => (
          <code className="markdown-inline-code">{children}</code>
        ),
        table: ({ children }) => (
          <div className="markdown-table-wrapper">
            <table className="markdown-table">{children}</table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="markdown-thead">{children}</thead>
        ),
        tbody: ({ children }) => (
          <tbody className="markdown-tbody">{children}</tbody>
        ),
        tr: ({ children }) => <tr className="markdown-tr">{children}</tr>,
        th: ({ children }) => <th className="markdown-th">{children}</th>,
        td: ({ children }) => <td className="markdown-td">{children}</td>,
      }}
    >
      {content}
    </Markdown>
  );
}
