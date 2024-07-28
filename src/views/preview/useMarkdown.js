import markdownit from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/vs2015.css'
import mk from '@xtthaop/markdown-it-katex'

export default function useMarkdown() {
  // https://github.com/markdown-it/markdown-it?tab=readme-ov-file#usage-examples
  const md = markdownit({
    html: false,
    breaks: true,
    highlight: function (str, lang) {
      // https://github.com/highlightjs/highlight.js
      if (lang && hljs.getLanguage(lang)) {
        try {
          return `<pre class="hljs"><code>${
            hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
          }</code></pre>`
        } catch (__) {
          // continue regardless of error
        }
      }

      return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
    },
  })

  handleLinkRenderer(md)
  handleParagraphOpen(md)
  handleParagraphClose(md)
  handleText(md)
  handleSoftbreak(md)
  handleHeadingOpen(md)
  handleImgRenderer(md)

  // https://github.com/xtthaop/markdown-it-katex
  md.use(mk)

  return { md }
}

function handleLinkRenderer(md) {
  const defaultRender =
    md.renderer.rules.link_open ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options, env, self)
    }

  md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    const aIndex = tokens[idx].attrIndex('target')

    if (aIndex < 0) {
      tokens[idx].attrPush(['target', '_blank'])
    } else {
      tokens[idx].attrs[aIndex][1] = '_blank'
    }

    return defaultRender(tokens, idx, options, env, self)
  }
}

function handleParagraphOpen(md) {
  const defaultRender =
    md.renderer.rules.paragraph_open ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options, env, self)
    }

  md.renderer.rules.paragraph_open = function (tokens, idx, options, env, self) {
    if (
      tokens[idx + 1].type === 'inline' &&
      tokens[idx + 1].children.some((child) => child.type === 'image')
    ) {
      const children = tokens[idx + 1].children
      children.forEach((child) => {
        if (child.type === 'text') {
          child.renderAsParagraph = true
        }
        if (child.type === 'softbreak') {
          child.ignore = true
        }
      })
      return ''
    } else {
      injectLineNumbers(tokens, idx)
      return defaultRender(tokens, idx, options, env, self)
    }
  }
}

function handleParagraphClose(md) {
  const defaultRender =
    md.renderer.rules.paragraph_close ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options, env, self)
    }

  md.renderer.rules.paragraph_close = function (tokens, idx, options, env, self) {
    if (
      tokens[idx - 1].type === 'inline' &&
      tokens[idx - 1].children.some((child) => child.type === 'image')
    ) {
      return ''
    } else {
      return defaultRender(tokens, idx, options, env, self)
    }
  }
}

function handleText(md) {
  const defaultRender =
    md.renderer.rules.text ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options, env, self)
    }

  md.renderer.rules.text = function (tokens, idx, options, env, self) {
    if (tokens[idx].renderAsParagraph) {
      return `<p>${md.utils.escapeHtml(tokens[idx].content)}</p>`
    } else {
      return defaultRender(tokens, idx, options, env, self)
    }
  }
}

function handleSoftbreak(md) {
  const defaultRender =
    md.renderer.rules.softbreak ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options, env, self)
    }

  md.renderer.rules.softbreak = function (tokens, idx, options, env, self) {
    if (tokens[idx].ignore) {
      return ''
    } else {
      return defaultRender(tokens, idx, options, env, self)
    }
  }
}

function injectLineNumbers(tokens, idx) {
  if (tokens[idx].map && tokens[idx].level === 0) {
    const line = tokens[idx].map[0]
    tokens[idx].attrJoin('class', 'line')
    tokens[idx].attrSet('data-line', String(line))
  }
}

function handleHeadingOpen(md) {
  md.renderer.rules.heading_open = function (tokens, idx, options, env, self) {
    injectLineNumbers(tokens, idx)
    return self.renderToken(tokens, idx, options, env, self)
  }
}

function handleImgRenderer(md) {
  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    token.attrs[token.attrIndex('alt')][1] = self.renderInlineAsText(token.children, options, env)
    const imgSrcArr = token.attrs[token.attrIndex('src')][1].split('?')
    const imgParams = imgSrcArr.length > 1 && imgSrcArr[1].split('/')

    const imageAlt = (token.attrIndex('alt') > -1 && token.attrs[token.attrIndex('alt')][1]) || ''
    const imageTitle =
      (token.attrIndex('title') > -1 && token.attrs[token.attrIndex('title')][1]) || ''

    const imgRealSrc = imgSrcArr[0]
    const imgSuffix = '.' + imgRealSrc.split('.')[1]
    const imgPlaceholderSrc =
      imgRealSrc.replace(new RegExp(`${imgSuffix}$`), '') + '_low_ratio' + imgSuffix
    const imgWidth = (imgParams && imgParams[1]) || '100%'

    return `<div class="image-container"><img
              data-src="${imgRealSrc}"
              src="${imgPlaceholderSrc}"
              width="${imgWidth}"
              alt="${imageAlt}"
              title="${imageTitle}"
            /></div>`
  }
}
