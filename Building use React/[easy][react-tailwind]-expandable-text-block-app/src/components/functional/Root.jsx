/**
 * @fileoverview Компонент ExpandableTextBlock представляет собой расширяемый текстовый блок.
 * Он позволяет отображать сокращенную версию текста с возможностью его раскрытия и сворачивания.
 */

import { ExpandableText } from '@functional';

/**
 * Компонент ExpandableTextBlock представляет собой контейнер для нескольких расширяемых текстовых блоков.
 * Он демонстрирует различные варианты использования компонента ExpandableText.
 * @returns {JSX.Element} Контейнер с заголовком и несколькими примерами ExpandableText.
 */
const ExpandableTextBlock = () => (
  <div className="max-w-4xl w-full p-3 grid gap-3">
    <h1 className="text-center font-bold text-3xl">Text Expander</h1>
    <div className="grid gap-3">
      <ExpandableText>
        Space travel is the ultimate adventure! Imagine soaring past the stars
        and exploring new worlds. It&#39;s the stuff of dreams and science fiction,
        but believe it or not, space travel is a real thing. Humans and robots
        are constantly venturing out into the cosmos to uncover its secrets and
        push the boundaries of what&#39;s possible.
      </ExpandableText>
      <ExpandableText
        collapsedNumWords={20}
        expandButtonText="Show text"
        collapseButtonText="Collapse text"
        buttonColor="e33232"
      >
        Space travel requires some seriously amazing technology and
        collaboration between countries, private companies, and international
        space organizations. And while it&#39;s not always easy (or cheap), the
        results are out of this world. Think about the first time humans stepped
        foot on the moon or when rovers were sent to roam around on Mars.
      </ExpandableText>
      <ExpandableText expanded={true} className="p-4">
        Space missions have given us incredible insights into our universe and
        have inspired future generations to keep reaching for the stars. Space
        travel is a pretty cool thing to think about. Who knows what we&#39;ll
        discover next!
      </ExpandableText>
    </div>
  </div>
);
export default ExpandableTextBlock;
