import React, { useState } from 'react'
import { fetchCircuit, fetchProvingKey } from '../utils/fetch'

const formatMB = rawSize => (rawSize / 1024 / 1024).toFixed(2)

const ProgressBar = ({ label, progress }) => {
  const percentage = progress ? progress.percentage : 0

  const detail =
    progress && progress.transferred && progress.total
      ? `${formatMB(progress.transferred)}/${formatMB(progress.total)} MB`
      : progress && progress.transferred
      ? `Downloaded ${formatMB(progress.transferred)} MB`
      : ''

  return (
    <>
      <div className='level'>
        <div className='level-left'>
          <div className='level-item'>
            <span className='tag'>{label}</span>
          </div>
        </div>
        <div className='level-right'>
          <div className='level-item'>
            <p>{detail}</p>
          </div>
        </div>
      </div>
      <progress className='progress' value={percentage} max='100'></progress>
    </>
  )
}

const DownloadSnarks = ({ onComplete }) => {
  const [on, toggle] = useState(true)
  const [circuitProgress, setCircuitProgress] = useState(null)
  const [provingKeyProgress, setProvingKeyProgress] = useState(null)

  const startDownload = async () => {
    toggle(false)
    await Promise.all([
      fetchCircuit(progress => setCircuitProgress(progress)),
      fetchProvingKey(progress => setProvingKeyProgress(progress))
    ])
    toggle(true)
    onComplete()
  }

  return (
    <>
      <p>
        To use the snark magic, we'll have to download a circuit and proving
        key. These are public and has a total size 200 MB -ish.
      </p>
      <ProgressBar label={'Circuit'} progress={circuitProgress} />
      <ProgressBar label={'Proving Key'} progress={provingKeyProgress} />
      <hr />
      <button
        className={`button is-primary ${on ? '' : 'is-loading'}`}
        onClick={startDownload}
      >
        Fetch Now
      </button>
    </>
  )
}

export default DownloadSnarks
