pragma solidity ^0.5.15;

import {Semaphore} from "../semaphore/semaphorejs/contracts/Semaphore.sol";

contract ProofOfBurn {
    Semaphore public semaphore;
    uint256 public registration_fee;

    event Registered(uint256 _identityCommitment);

    constructor(address _semaphore, uint256 _registration_fee) public {
        semaphore = Semaphore(_semaphore);
        registration_fee = _registration_fee;
    }

    // FIXME: This is a owner only function, should make this ownable, or redesign the contructor
    function setExternalNullifier(string memory _host_name) public {
        semaphore.addExternalNullifier(
            uint256(keccak256(abi.encodePacked("ANON", _host_name)))
        );
    }

    function register(uint256 _identityCommitment) public payable {
        require(
            msg.value == registration_fee,
            "Not sending the right amount of ether"
        );

        semaphore.insertIdentity(_identityCommitment);

        emit Registered(_identityCommitment);
    }
}
