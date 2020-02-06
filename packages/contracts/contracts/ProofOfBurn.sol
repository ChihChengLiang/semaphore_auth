pragma solidity ^0.5.15;

import {
    Semaphore
} from "../semaphore/semaphorejs/contracts/Semaphore.sol";

contract ProofOfBurn {
    Semaphore public semaphore;

    event Registered(uint256 _identityCommitment);

    constructor(address _semaphore) public {
        semaphore = Semaphore(_semaphore);
    }

    function register(uint256 _identityCommitment) public payable {
        require(msg.value == 10 ether, "Not sending the right amount of ether");

        semaphore.insertIdentity(_identityCommitment);

        emit Registered(_identityCommitment);
    }
}
