// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

contract UsdtPaymentReceiver is Ownable {
    error InvalidAddress();
    error InvoiceAlreadyExists();
    error InvoiceNotFound();
    error InvoiceNotActive();
    error InvoiceAlreadyPaid();
    error InvalidAmount();
    error TokenTransferFailed();

    struct Invoice {
        uint256 usdCents;
        uint256 usdtAmount;
        bool active;
        bool paid;
        address payer;
        uint256 createdAt;
        uint256 paidAt;
        string invoiceRef;
    }

    IERC20 public immutable usdt;
    uint8 public immutable usdtDecimals;
    address public treasury;

    mapping(bytes32 => Invoice) private invoices;

    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event InvoiceCreated(bytes32 indexed invoiceId, uint256 usdCents, uint256 usdtAmount, string invoiceRef);
    event InvoiceCancelled(bytes32 indexed invoiceId);
    event InvoicePaid(bytes32 indexed invoiceId, address indexed payer, uint256 usdtAmount);

    constructor(address usdtToken, address treasuryAddress, address initialOwner) Ownable(initialOwner) {
        if (usdtToken == address(0) || treasuryAddress == address(0) || initialOwner == address(0)) {
            revert InvalidAddress();
        }
        usdt = IERC20(usdtToken);
        usdtDecimals = IERC20Metadata(usdtToken).decimals();
        treasury = treasuryAddress;
    }

    function setTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert InvalidAddress();
        address old = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(old, newTreasury);
    }

    function createInvoice(bytes32 invoiceId, uint256 usdCents, string calldata invoiceRef) external onlyOwner {
        if (usdCents == 0) revert InvalidAmount();
        if (invoices[invoiceId].createdAt != 0) revert InvoiceAlreadyExists();

        uint256 usdtAmount = _usdCentsToUsdtAmount(usdCents);
        invoices[invoiceId] = Invoice({
            usdCents: usdCents,
            usdtAmount: usdtAmount,
            active: true,
            paid: false,
            payer: address(0),
            createdAt: block.timestamp,
            paidAt: 0,
            invoiceRef: invoiceRef
        });

        emit InvoiceCreated(invoiceId, usdCents, usdtAmount, invoiceRef);
    }

    function cancelInvoice(bytes32 invoiceId) external onlyOwner {
        Invoice storage inv = invoices[invoiceId];
        if (inv.createdAt == 0) revert InvoiceNotFound();
        if (!inv.active) revert InvoiceNotActive();
        if (inv.paid) revert InvoiceAlreadyPaid();

        inv.active = false;
        emit InvoiceCancelled(invoiceId);
    }

    function payInvoice(bytes32 invoiceId) external {
        Invoice storage inv = invoices[invoiceId];
        if (inv.createdAt == 0) revert InvoiceNotFound();
        if (!inv.active) revert InvoiceNotActive();
        if (inv.paid) revert InvoiceAlreadyPaid();

        bool ok = usdt.transferFrom(msg.sender, treasury, inv.usdtAmount);
        if (!ok) revert TokenTransferFailed();

        inv.paid = true;
        inv.active = false;
        inv.payer = msg.sender;
        inv.paidAt = block.timestamp;

        emit InvoicePaid(invoiceId, msg.sender, inv.usdtAmount);
    }

    function getInvoice(bytes32 invoiceId) external view returns (Invoice memory) {
        Invoice memory inv = invoices[invoiceId];
        if (inv.createdAt == 0) revert InvoiceNotFound();
        return inv;
    }

    function quoteUsdtAmountFromUsdCents(uint256 usdCents) external view returns (uint256) {
        if (usdCents == 0) revert InvalidAmount();
        return _usdCentsToUsdtAmount(usdCents);
    }

    function _usdCentsToUsdtAmount(uint256 usdCents) internal view returns (uint256) {
        // Business rule: 1 USDT == 1 USD.
        // usdCents * (10^decimals) / 100 gives exact token units.
        return (usdCents * (10 ** uint256(usdtDecimals))) / 100;
    }
}
