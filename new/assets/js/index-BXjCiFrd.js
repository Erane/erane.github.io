import { u as e, a as t } from './index-COo89UDE.js'
import { u as s } from './navigation-WHXjmV4g.js'
import { a } from './add-circle-B-150d-i.js'
import {
  d as n,
  W as l,
  u as r,
  X as i,
  R as o,
  y as c,
  L as d,
  M as u,
  Y as p,
  O as f,
  N as v,
} from './vendor-qbXXoUpV.js'
const m = { class: 'content-scroll-wrap' },
  g = { class: 'content-scroll' },
  k = ['onClick'],
  h = { name: 'setting-preset' },
  w = Object.assign(h, {
    setup(h) {
      const w = t(),
        { goBack: b } = s(),
        x = (e) => {
          w.push('/setting/preset/create' + (e ? `/${e}` : ''))
        },
        y = e(),
        C = n(() => y.presets)
      return (e, t) => {
        const s = d('t-navbar'),
          n = d('t-notice-bar'),
          h = d('t-cell'),
          w = d('t-swipe-cell')
        return (
          f(),
          l('div', m, [
            r(
              s,
              {
                title: '预设',
                class: 'nav',
                fixed: !1,
                'left-arrow': '',
                onLeftClick: t[1] || (t[1] = (e) => c(b)('/setting')),
              },
              {
                right: o(() => [r(c(a), { onClick: t[0] || (t[0] = (e) => x()), size: '1.5em' })]),
                _: 1,
              },
            ),
            i('div', g, [
              r(n, {
                visible: '',
                content: '部分代码由 末期少女病 提供, 感谢她的无私分享',
                'prefix-icon': !1,
              }),
              (f(!0),
              l(
                u,
                null,
                p(
                  C.value,
                  (e) => (
                    f(),
                    v(
                      w,
                      { class: 'content-list-swipe', ref_for: !0, ref: 'cell1', key: e.id },
                      {
                        right: o(() => [
                          i(
                            'div',
                            {
                              class: 'btn delete-btn',
                              onClick: (t) => {
                                return (
                                  (s = e.id),
                                  (a = function* () {
                                    yield y.deletePreset(s)
                                  }),
                                  new Promise((e, t) => {
                                    var s = (e) => {
                                        try {
                                          l(a.next(e))
                                        } catch (s) {
                                          t(s)
                                        }
                                      },
                                      n = (e) => {
                                        try {
                                          l(a.throw(e))
                                        } catch (s) {
                                          t(s)
                                        }
                                      },
                                      l = (t) =>
                                        t.done ? e(t.value) : Promise.resolve(t.value).then(s, n)
                                    l((a = a.apply(null, null)).next())
                                  })
                                )
                                var s, a
                              },
                            },
                            '删除',
                            8,
                            k,
                          ),
                        ]),
                        default: o(() => [
                          r(h, { onClick: (t) => x(e.id), title: e.name, arrow: '' }, null, 8, [
                            'onClick',
                            'title',
                          ]),
                        ]),
                        _: 2,
                      },
                      1024,
                    )
                  ),
                ),
                128,
              )),
            ]),
          ])
        )
      }
    },
  })
export { w as default }
