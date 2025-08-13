import { CheckCircle, Clock, Loader2, ExternalLink } from 'lucide-react'

interface TransactionStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'completed' | 'failed'
  txHash?: string
}

interface TransactionProgressProps {
  isOpen: boolean
  onClose: () => void
  steps: TransactionStep[]
  currentStepId: string
  title: string
}

export default function TransactionProgress({ 
  isOpen, 
  onClose, 
  steps, 
  title 
}: TransactionProgressProps) {
  if (!isOpen) return null

  const getStepIcon = (step: TransactionStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-brand-primary" />
      case 'in-progress':
        return <Loader2 className="w-6 h-6 text-brand-primary animate-spin" />
      case 'failed':
        return <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
          <span className="text-white text-xs font-bold">!</span>
        </div>
      default:
        return <Clock className="w-6 h-6 text-gray-400" />
    }
  }

  const getStepStatus = (step: TransactionStep) => {
    switch (step.status) {
      case 'completed':
        return 'text-brand-primary'
      case 'in-progress':
        return 'text-brand-primary'
      case 'failed':
        return 'text-red-600'
      default:
        return 'text-gray-500'
    }
  }

  const isCompleted = steps.every(step => step.status === 'completed')
  const hasFailed = steps.some(step => step.status === 'failed')

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-xl rounded-xl shadow-xl max-w-md w-full border border-white/10">
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-brand-gray mb-2">{title}</h2>
            {isCompleted && (
              <div className="text-brand-primary text-sm">Transaction completed successfully!</div>
            )}
            {hasFailed && (
              <div className="text-red-600 text-sm">Transaction failed</div>
            )}
            {!isCompleted && !hasFailed && (
              <div className="text-brand-gray/70 text-sm">In progress...</div>
            )}
          </div>

          <div className="space-y-6 relative">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-start space-x-4 relative">
                <div className="flex-shrink-0 mt-0.5">
                  {getStepIcon(step)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${getStepStatus(step)}`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-brand-gray/60 mt-1">
                    {step.description}
                  </div>
                  {step.status === 'in-progress' && (
                    <div className="mt-2 w-full bg-white/10 rounded-full h-1.5">
                      <div className="bg-brand-primary h-1.5 rounded-full animate-pulse transition-all duration-500" style={{ width: '60%' }}></div>
                    </div>
                  )}
                  {step.status === 'completed' && step.txHash && (
                    <div className="mt-2">
                      <a
                        href={`https://testnet.sonicscan.org/tx/${step.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs text-brand-primary hover:text-brand-accent transition-colors"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View on Explorer
                      </a>
                    </div>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className="absolute left-3 top-8 w-px h-6 bg-white/10"></div>
                )}
              </div>
            ))}
          </div>

          {(isCompleted || hasFailed) && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}