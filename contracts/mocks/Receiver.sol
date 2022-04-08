//////////////////////////////////////////////////////

// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

interface IWalletSplitter {
    function updateOwner(address payable _newOwner) external returns(bool);
}

contract Receiver {
    fallback() external payable {}

    function updateSplitOwner(address splitter, address to) external {
        IWalletSplitter _splitter = IWalletSplitter(splitter);
        _splitter.updateOwner(payable(to));
    }
}

contract BadReceiver {
    receive() external payable {
        revert("hey");
    }
    function updateSplitOwner(address splitter, address to) external {
        IWalletSplitter _splitter = IWalletSplitter(splitter);
        _splitter.updateOwner(payable(to));
    }
}
