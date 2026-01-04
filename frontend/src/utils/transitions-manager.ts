export const transitionsManager = () => {
  const style = document.createElement("style")
  const css = document.createTextNode(`* {
       -webkit-transition: none !important;
       -moz-transition: none !important;
       -o-transition: none !important;
       -ms-transition: none !important;
       transition: none !important;
    }`)
  style.appendChild(css)

  const enable = () => {
    document.head.removeChild(style)
  }
  const disable = () => document.head.appendChild(style)
  return { enable, disable, style }
}
