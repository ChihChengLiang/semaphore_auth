pragma solidity ^0.5.15;

import {Semaphore} from "./semaphore/Semaphore.sol";

contract ProofOfBurn {
    Semaphore public semaphore;
    uint256 public registration_fee;
    uint256[] public identityCommitments;

    event Registered(uint256 _identityCommitment);

    constructor(address _semaphore, uint256 _registration_fee) public {
        semaphore = Semaphore(_semaphore);
        registration_fee = _registration_fee;
    }

    function register(uint256 _identityCommitment) public payable {
        require(
            msg.value == registration_fee,
            "Not sending the right amount of ether"
        );

        semaphore.insertIdentity(_identityCommitment);
        identityCommitments.push(_identityCommitment);

        emit Registered(_identityCommitment);
    }

    function getIdentityCommitments() public view returns (uint256[] memory) {
        return identityCommitments;
    }
}
