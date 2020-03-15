import React, { useState, useEffect } from 'react'
import ProofOfBurnABI from 'semaphore-auth-contracts/abis/ProofOfBurn.json'
import SemaphoreABI from 'semaphore-auth-contracts/abis/Semaphore.json'
import { ethers } from 'ethers'
import { useWeb3Context } from 'web3-react'

const ServerInfo = () => {
  const [data, setData] = useState({
    serverName: null,
    network: null,
    registrationStyle: null,
    registrationAddress: null,
    semaphoreAddress: null,
    registrationContract: null
  })
  const context = useWeb3Context()

  useEffect(() => {
    const fetchAndBuildContract = async () => {
      const serverInfo = await fetch('http://localhost:5566/info').then(res =>
        res.json()
      )

      setData(serverInfo)
      const provider = new ethers.providers.Web3Provider(
        context.library.provider
      )
      const ProofOfBurn = new ethers.Contract(
        serverInfo.registrationAddress,
        ProofOfBurnABI,
        provider
      )
      setData({ registrationContract: ProofOfBurn })
    }
    fetchAndBuildContract()
  }, [])

  return (
    <div className='box'>
      {data.registrationContract ? (
        <ProofOfBurn contract={data.registrationContract} />
      ) : (
        <p>Loading</p>
      )}
    </div>
  )
}

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
    <div className='box'>
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

export { ServerInfo, ProofOfBurn }
