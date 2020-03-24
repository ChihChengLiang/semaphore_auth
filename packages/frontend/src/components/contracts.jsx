import React from 'react'
import { ethers } from 'ethers'
import { useProofOfBurnData } from '../hooks'

const ProofOfBurn = () => {
  const data = useProofOfBurnData()

  return data.isLoaded ? (
    <div className='media'>
      <div className='media-content'>
        <p>
          Address: <small>{data.address}</small>
        </p>
        <p>
          Registration Fee:{' '}
          <strong>{ethers.utils.formatEther(data.registrationFee)} ETH</strong>
        </p>
        <p>
          <strong>{data.commitments}</strong> Members in the group
        </p>
      </div>
    </div>
  ) : (
    <p>Waiting contract data...</p>
  )
}

export { ProofOfBurn }
