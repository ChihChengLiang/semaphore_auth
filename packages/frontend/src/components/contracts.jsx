import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'

// @param contract is an ethers.Contract instance
const ProofOfBurn = ({ contract }) => {
  const [data, setData] = useState({
    address: null,
    registrationFee: null,
    commitments: null
  })

  useEffect(() => {
    const fetchData = async () => {
      const address = contract.address
      const registrationFee = (await contract.registration_fee()).toString()
      const commitments = (await contract.getIdentityCommitments()).length
      setData({ address, registrationFee, commitments })
    }
    fetchData()
  }, [])

  return data.address ? (
    <div className='content'>
      <p>address: {data.address}</p>
      <p>
        Registration Fee: {ethers.utils.formatEther(data.registrationFee)} ETH
      </p>
      <p>Number of Registration: {data.commitments}</p>
    </div>
  ) : (
    <p>Loading...</p>
  )
}

export { ProofOfBurn }
