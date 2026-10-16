import { useState, useEffect } from 'react'

export default function CountdownTimer({ hours = 24, label = 'Limited Time Luxury Offer' }) {
  const [timeLeft, setTimeLeft] = useState(() => {
    // Stored target time in sessionStorage to stay stable across reloads
    const stored = sessionStorage.getItem('sh7_deal_expiry')
    if (stored) {
      const diff = Math.max(0, Math.floor((new Date(stored).getTime() - Date.now()) / 1000))
      return diff
    }
    const expiry = new Date(Date.now() + hours * 3600 * 1000)
    sessionStorage.setItem('sh7_deal_expiry', expiry.toISOString())
    return hours * 3600
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const hrs = String(Math.floor(timeLeft / 3600)).padStart(2, '0')
  const mins = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, '0')
  const secs = String(timeLeft % 60).padStart(2, '0')

  return (
    <div className="countdown-timer-wrap">
      {label && <span className="countdown-label">{label}</span>}
      <div className="countdown-boxes">
        <div className="time-box">
          <span className="time-val">{hrs}</span>
          <span className="time-unit">HRS</span>
        </div>
        <span className="time-colon">:</span>
        <div className="time-box">
          <span className="time-val">{mins}</span>
          <span className="time-unit">MINS</span>
        </div>
        <span className="time-colon">:</span>
        <div className="time-box">
          <span className="time-val">{secs}</span>
          <span className="time-unit">SECS</span>
        </div>
      </div>
    </div>
  )
}
