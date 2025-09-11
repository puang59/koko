import MarkdownRenderer from "../utils/MarkdownRenderer";

export default function ResponseSection({
  response,
  isCopied,
}: {
  response: string;
  isCopied: boolean;
}) {
  return (
    <section>
      <div className="markdown-container">
        <MarkdownRenderer content={response} />
      </div>
      <div className="copy-shortcut">
        <kbd className={isCopied ? "copied size-inc" : " size-inc"}>⌘</kbd>
        <span> + </span>
        <kbd className={isCopied ? "copied" : ""}>C</kbd>
      </div>
    </section>
  );
}
