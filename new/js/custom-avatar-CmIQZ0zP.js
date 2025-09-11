import { _ as a } from './_plugin-vue_export-helper-BCo6x5W8.js'
import { W as s, O as t, X as e, a1 as r } from './vendor-qbXXoUpV.js'
const i = ['src'],
  p = { name: 'customAvatar' },
  o = a(
    Object.assign(p, {
      props: { avatar: { type: String, default: '' }, size: { type: String, default: '50px' } },
      setup: (a) => (p, o) => (
        t(),
        s(
          'div',
          { class: 'custom-avatar', style: r({ width: a.size, height: a.size }) },
          [e('img', { src: a.avatar, alt: '' }, null, 8, i)],
          4,
        )
      ),
    }),
    [['__scopeId', 'data-v-ded1cd8f']],
  )
export { o as C }
