pragma solidity ^0.5.15;

import {Semaphore} from "../semaphore/semaphorejs/contracts/Semaphore.sol";
import "@nomiclabs/buidler/console.sol";

contract ProofOfBurn {
    Semaphore public semaphore;
    uint256 public registration_fee;

    event Registered(uint256 _identityCommitment);
    event Login(
        uint256 indexed _signal_index,
        bytes _publicHash,
        bytes32 _hostnameHash
    );

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

        emit Registered(_identityCommitment);
    }

    function login(
        bytes memory _hashPublic,
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[4] memory input // (root, nullifiers_hash, signal_hash, external_nullifier)
    ) public {
        require(
            semaphore.hasExternalNullifier(input[3]) == true,
            "external_nullifier does not exist"
        );
        uint256 signalIndex = semaphore.current_signal_index();

        semaphore.broadcastSignal(_hashPublic, a, b, c, input);

        emit Login(signalIndex, _hashPublic, bytes32(input[3]));
    }

    function getLeaves() public view returns (uint256[] memory) {
        return semaphore.leaves(semaphore.id_tree_index());
    }
}
