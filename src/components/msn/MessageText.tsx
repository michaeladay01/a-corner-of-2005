import { tokenize } from '../../data/emoticons'

/** Renders text with classic emoticon substitution. */
export function MessageText({ text }: { text: string }) {
  return (
    <>
      {tokenize(text).map((token, i) =>
        token.type === 'text' ? (
          <span key={i}>{token.value}</span>
        ) : (
          <img
            key={i}
            className="emo animated"
            src={token.emoticon.src}
            alt={token.emoticon.code}
            title={`${token.emoticon.name}  ${token.emoticon.code}`}
          />
        )
      )}
    </>
  )
}
