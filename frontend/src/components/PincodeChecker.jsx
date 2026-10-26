import { useState } from 'react'
import { MapPin, CheckCircle2, AlertCircle, Truck } from 'lucide-react'

export default function PincodeChecker() {
  const [pincode, setPincode] = useState(() => localStorage.getItem('sh7_pincode') || '')
  const [status, setStatus] = useState(() => {
    const saved = localStorage.getItem('sh7_pincode')
    return saved ? 'verified' : 'idle'
  })
  const [errorMsg, setErrorMsg] = useState('')

  const handleCheck = (e) => {
    e.preventDefault()
    const cleaned = pincode.trim()

    if (!/^[1-9][0-9]{5}$/.test(cleaned)) {
      setStatus('error')
      setErrorMsg('Please enter a valid 6-digit Indian pincode')
      return
    }

    setStatus('loading')
    setErrorMsg('')

    setTimeout(() => {
      localStorage.setItem('sh7_pincode', cleaned)
      setStatus('verified')
    }, 400)
  }

  // Calculate estimated delivery: 3 to 5 days from today
  const getDeliveryDateStr = () => {
    const today = new Date()
    const start = new Date(today)
    start.setDate(today.getDate() + 3)
    const end = new Date(today)
    end.setDate(today.getDate() + 5)

    const opt = { month: 'short', day: 'numeric' }
    return `${start.toLocaleDateString('en-IN', opt)} – ${end.toLocaleDateString('en-IN', opt)}`
  }

  return (
    <div className="pincode-checker-box">
      <div className="pincode-header">
        <MapPin size={15} className="gold-text" />
        <span className="pincode-title">Delivery Options & Availability</span>
      </div>

      <form onSubmit={handleCheck} className="pincode-form">
        <input
          type="text"
          value={pincode}
          onChange={(e) => {
            setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))
            if (status !== 'idle') setStatus('idle')
          }}
          placeholder="Enter 6-digit Pincode"
          maxLength={6}
          className="pincode-input"
          aria-label="Enter postal pincode"
        />
        <button
          type="submit"
          className="btn btn-gold-outline btn-sm pincode-submit-btn"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Checking...' : status === 'verified' ? 'Change' : 'Check'}
        </button>
      </form>

      {status === 'error' && (
        <div className="pincode-result error">
          <AlertCircle size={14} />
          <span>{errorMsg}</span>
        </div>
      )}

      {status === 'verified' && (
        <div className="pincode-result verified">
          <div className="delivery-promise-row">
            <Truck size={16} className="gold-text" />
            <div>
              <p className="delivery-estimate-date">
                Estimated Delivery by <strong>{getDeliveryDateStr()}</strong>
              </p>
              <p className="delivery-perk-text">
                ✓ Free Shipping on ₹499+ • ✓ Cash on Delivery (COD) Available
              </p>
              <p className="delivery-disclaimer">
                *Delivery dates are indicative estimates. Final serviceability is confirmed at
                checkout and before dispatch.
              </p>
            </div>
          </div>
          <span className="delivering-to-badge">
            <CheckCircle2 size={13} /> Delivering to Pincode {pincode}
          </span>
        </div>
      )}
    </div>
  )
}
