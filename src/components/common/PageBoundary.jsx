import { Component, Suspense } from 'react'
import { PageLoader } from './PageLoader'
import { t } from '../../utils/i18n'

// Keep navigation available if a page chunk fails to download.
export class PageBoundary extends Component {
  state = { failed: false, resetKey: this.props.resetKey }

  static getDerivedStateFromProps(props, state) {
    return state.resetKey === props.resetKey ? null : { failed: false, resetKey: props.resetKey }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed) {
      return (
        <div role="alert" className="m-6 rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-foreground">{t('This page could not open')}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t('Check your connection and reload the page to try again.')}</p>
          <button type="button" onClick={() => window.location.reload()} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">{t('Reload page')}</button>
        </div>
      )
    }
    return <Suspense fallback={<PageLoader />}>{this.props.children}</Suspense>
  }
}
