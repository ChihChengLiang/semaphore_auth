import React from 'react'
import { ethers } from 'ethers'
import { useProofOfBurnData } from '../hooks'

const ProofOfBurn = () => {
  const data = useProofOfBurnData()

  return data.isLoaded ? (
    <div className='box has-background-light'>
      <div className='content'>
        <strong>Group managed by contract</strong> <small>{data.address}</small>
      </div>

      <nav className='level'>
        <div className='level-item has-text-centered'>
          <div>
            <p className='heading'>Members in the group</p>
            <p className='title is-4'>{data.commitments}</p>
          </div>
        </div>
        <div className='level-item has-text-centered'>
          <div>
            <p className='heading'>Registration Fee</p>
            <p className='title is-4'>
              {ethers.utils.formatEther(data.registrationFee)} ETH
            </p>
          </div>
        </div>
      </nav>
    </div>
  ) : (
    <p>Waiting contract data...</p>
  )
}

export { ProofOfBurn }
