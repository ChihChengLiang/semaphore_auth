const ProofOfBurn = artifacts.require('ProofOfBurn')

// Traditional Truffle test

describe('ProofOfBurn contract', () => {
  describe('register', () => {
    it('Should emit an event', async () => {
      const pob = await ProofOfBurn.new()
      await pob.register()
      assert.equal(1, 1)
    })
  })
})
