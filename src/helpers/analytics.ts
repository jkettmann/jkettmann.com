export function trackEvent(name: string, params: object) {
  if (!window.plausible) {
    window.plausible = function() {
      (window.plausible.q = window.plausible.q || []).push(arguments)
    }
  }
  window.plausible(name, {props: params })
}
