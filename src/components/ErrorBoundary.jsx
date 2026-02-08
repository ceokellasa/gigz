import { Component } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'

export class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null, errorInfo: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo })
        // Log to error reporting service in production
        if (import.meta.env.PROD) {
            console.error('Error caught by boundary:', error, errorInfo)
            // TODO: Send to error tracking service (e.g., Sentry)
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null })
        window.location.href = '/'
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
                    <div className="max-w-md w-full text-center">
                        <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                            <AlertTriangle className="h-8 w-8 text-red-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h1>
                        <p className="text-slate-500 mb-6">
                            We're sorry, but something unexpected happened. Please try again.
                        </p>
                        {import.meta.env.DEV && this.state.error && (
                            <div className="bg-slate-100 rounded-lg p-4 mb-6 text-left">
                                <p className="text-sm font-mono text-red-600 break-all">
                                    {this.state.error.toString()}
                                </p>
                            </div>
                        )}
                        <button
                            onClick={this.handleReset}
                            className="btn-primary inline-flex items-center gap-2"
                        >
                            <RefreshCcw className="h-4 w-4" />
                            Go to Home
                        </button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
