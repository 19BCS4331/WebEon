import React, { lazy } from "react";
import { Route } from "react-router-dom";
import { ProtectedRoute } from "./components/global/ProtectedRoute";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const LoginNew = lazy(() => import("./pages/LoginNew"));

// -----------------------------------------------MASTERS-------------------------------------------

// Master Profiles -------------------------------------------------------------------------------------------

const CurrencyProfile = lazy(() =>
  import("./pages/Master/Master Profiles/CurrencyProfile")
);
const FinancialCodes = lazy(() =>
  import("./pages/Master/Master Profiles/FinancialCodes")
);
const FinancialSubProfile = lazy(() =>
  import("./pages/Master/Master Profiles/FinancialSubProfile")
);
const DivisionProfile = lazy(() =>
  import("./pages/Master/Master Profiles/DivisionProfile")
);
const DivisionDetails = lazy(() =>
  import("./pages/Master/Master Profiles/DivisionDetails")
);
const AccountsProfile = lazy(() =>
  import("./pages/Master/Master Profiles/AccountsProfile")
);
const Ad1Provider = lazy(() =>
  import("./pages/Master/Master Profiles/Ad1Provider")
);

// Master Profiles End -------------------------------------------------------------------------------------------

//   Party Profiles ------------------------------------------------------------------

const MainIndexComp = lazy(() =>
  import("./pages/Master/Party Profiles/IndexPartyProfiles")
);

//   Party Profiles End------------------------------------------------------------------

// System Setup ---------------------------------------------------------------------

const CompanyProfile = lazy(() =>
  import("./pages/Master/SystemSetup/CompanyProfile")
);

const BranchLocationProfile = lazy(() =>
  import("./pages/Master/SystemSetup/BranchLocationProfile")
);

const AdvSettings = lazy(() =>
  import("./pages/Master/SystemSetup/AdvSettings")
);

const BranchSettings = lazy(() =>
  import("./pages/Master/SystemSetup/BranchSettings")
);

// const UserGroup = lazy(() => import("./pages/Master/SystemSetup/UserGroup"));

// const UserProfile = lazy(() => import("./pages/Master/SystemSetup/UserGroup"));

const UserComp = lazy(() =>
  import("./pages/Master/SystemSetup/UserProfileIndex")
);

const ProductProfile = lazy(() =>
  import("./pages/Master/SystemSetup/ProductProfile")
);

const TaxMaster = lazy(() => import("./pages/Master/SystemSetup/TaxMaster"));

const MonthWiseLocking = lazy(() =>
  import("./pages/Master/SystemSetup/MonthWiseLocking")
);

const PurposeLimitProfile = lazy(() =>
  import("./pages/Master/SystemSetup/PurposeLimitProfile")
);

const MailServerConfig = lazy(() =>
  import("./pages/Master/SystemSetup/MailServerConfig")
);

const MailSendingConfig = lazy(() =>
  import("./pages/Master/SystemSetup/MailSendingConfig")
);

const ThemeSelect = lazy(() =>
  import("./pages/Master/SystemSetup/ThemeSelect")
);
// System Setup End ---------------------------------------------------------------------

// Rates ---------------------------------------
const RateControlProfile = lazy(() =>
  import("./pages/Master/Rates/RateControlProfile")
);
// Rates End ---------------------------------------

// Miscellaneous ----------------------------------------------------------------

const MoneyTransferServices = lazy(() =>
  import("./pages/Master/Miscellaneous/MoneyTransferServices")
);

const ManualBillBook = lazy(() =>
  import("./pages/Master/Miscellaneous/ManualBillBook")
);

const ExpenseIncBookingMaster = lazy(() =>
  import("./pages/Master/Miscellaneous/ExpenseIncBookingMaster")
);

const ScanMasterProfile = lazy(() =>
  import("./pages/Master/Miscellaneous/ScanMasterProfile")
);

const CounterMaster = lazy(() =>
  import("./pages/Master/Miscellaneous/CounterMaster")
);

const ChequeMaster = lazy(() =>
  import("./pages/Master/Miscellaneous/ChequeMaster")
);

const MasterPurposeProfile = lazy(() =>
  import("./pages/Master/Miscellaneous/MasterPurposeProfile")
);

const SubPurposeProfile = lazy(() =>
  import("./pages/Master/Miscellaneous/SubPurposeProfile")
);

const BlockAccountPayment = lazy(() =>
  import("./pages/Master/Miscellaneous/BlockAccountPayment")
);

const BlockAccountReceipt = lazy(() =>
  import("./pages/Master/Miscellaneous/BlockAccountReceipt")
);

const BlockAccountJournal = lazy(() =>
  import("./pages/Master/Miscellaneous/BlockAccountJournal")
);

const BlockPax = lazy(() => import("./pages/Master/Miscellaneous/BlockPax"));

const AllowAdrAcr = lazy(() =>
  import("./pages/Master/Miscellaneous/AllowAdrAcr")
);

const BlockPartyCode = lazy(() =>
  import("./pages/Master/Miscellaneous/BlockPartyCode")
);
// Miscellaneous End ----------------------------------------------------------------

// Insurance ----------------------------------------------------------------

const InsurancePlanMaster = lazy(() =>
  import("./pages/Master/Insurance/InsurancePlanMaster")
);

// Insurance End ----------------------------------------------------------------

// ----------------------------------------  MASTERS END ---------------------------------------------------------------------------------------

// --------------------------------------------TRANSACTIONS ----------------------------------

// Other Transactions -----------------------------------------

const Ad1Transactions = lazy(() =>
  import("./pages/Transactions/OtherTransactions/Ad1Transactions")
);

const Ad2RefTransactions = lazy(() =>
  import("./pages/Transactions/OtherTransactions/Ad2RefTransactions")
);

const Ad1Approval = lazy(() =>
  import("./pages/Transactions/OtherTransactions/Ad1Approval")
);

const InsuranceSales = lazy(() =>
  import("./pages/Transactions/OtherTransactions/InsuranceSales")
);

const ChangePaxDetails = lazy(() =>
  import("./pages/Transactions/OtherTransactions/ChangePaxDetails")
);

const EEFCSettlement = lazy(() =>
  import("./pages/Transactions/OtherTransactions/EEFCSettlement")
);

const DealCoverRate = lazy(() =>
  import("./pages/Transactions/OtherTransactions/DealCoverRate")
);

const DealCoverAck = lazy(() =>
  import("./pages/Transactions/OtherTransactions/DealCoverAck")
);

const ChangeOrDetails = lazy(() =>
  import("./pages/Transactions/OtherTransactions/ChangeOrDetails")
);

const LossTransactionRequest = lazy(() =>
  import("./pages/Transactions/OtherTransactions/LossTransactionRequest")
);

const LossTransactionStatus = lazy(() =>
  import("./pages/Transactions/OtherTransactions/LossTransactionStatus")
);

// Other Transactions End-----------------------------------------

// Accounting Transactions ---------------------------------------------

const AdvanceAdjustment = lazy(() =>
  import("./pages/Transactions/AccountingTransactions/AdvanceAdjustment")
);

const AdviceOfDebitAndCredit = lazy(() =>
  import("./pages/Transactions/AccountingTransactions/AdviceOfDebitAndCredit")
);

const AdvRefund = lazy(() =>
  import("./pages/Transactions/AccountingTransactions/AdvRefund")
);
const BankReco = lazy(() =>
  import("./pages/Transactions/AccountingTransactions/BankReco")
);
const CounterFundTransferIn = lazy(() =>
  import("./pages/Transactions/AccountingTransactions/CounterFundTransferIn")
);
const CounterFundTransferOut = lazy(() =>
  import("./pages/Transactions/AccountingTransactions/CounterFundTransferOut")
);
const CreditFundReq = lazy(() =>
  import("./pages/Transactions/AccountingTransactions/CreditFundReq")
);
const DepositWithdrawal = lazy(() =>
  import("./pages/Transactions/AccountingTransactions/DepositWithdrawal")
);
const ExpenseIncomeBooking = lazy(() =>
  import("./pages/Transactions/AccountingTransactions/ExpenseIncomeBooking")
);
const FundTransferDirect = lazy(() =>
  import("./pages/Transactions/AccountingTransactions/FundTransferDirect")
);
const JournalVouchers = lazy(() =>
  import("./pages/Transactions/AccountingTransactions/JournalVouchers")
);
const Payment = lazy(() =>
  import("./pages/Transactions/AccountingTransactions/Payment")
);
const Receipt = lazy(() =>
  import("./pages/Transactions/AccountingTransactions/Receipt")
);
const StockRevaluation = lazy(() =>
  import("./pages/Transactions/AccountingTransactions/StockRevaluation")
);

// Accounting Transactions End ---------------------------------------------

// Buying/Selling Transactions ---------------------------------------------

const BuyFromIndiviOrCorp = lazy(() =>
  import("./pages/Transactions/BuySellTransactions/BuyFromIndiviOrCorp")
);

const BuyFromBank = lazy(() =>
  import("./pages/Transactions/BuySellTransactions/BuyFromBank")
);

const BuyFromFFMCS = lazy(() =>
  import("./pages/Transactions/BuySellTransactions/BuyFromFFMCS")
);

const BuyFromForeignCorrespondent = lazy(() =>
  import("./pages/Transactions/BuySellTransactions/BuyFromForeignCorrespondent")
);

const BuyFromFranchisee = lazy(() =>
  import("./pages/Transactions/BuySellTransactions/BuyFromFranchisee")
);

const BuyFromNonFranchisee = lazy(() =>
  import("./pages/Transactions/BuySellTransactions/BuyFromNonFranchisee")
);

const BuyFromRMCS = lazy(() =>
  import("./pages/Transactions/BuySellTransactions/BuyFromRMCS")
);

const FakeCurrency = lazy(() =>
  import("./pages/Transactions/BuySellTransactions/FakeCurrency")
);

const SaleToFFMC = lazy(() =>
  import("./pages/Transactions/BuySellTransactions/SaleToFFMC")
);

const SaleToForeignCorrespondent = lazy(() =>
  import("./pages/Transactions/BuySellTransactions/SaleToForeignCorrespondent")
);

const SaleToIndividual = lazy(() =>
  import("./pages/Transactions/BuySellTransactions/SaleToIndividual")
);

const SellToBank = lazy(() =>
  import("./pages/Transactions/BuySellTransactions/SellToBank")
);

// Buying/Selling Transactions End ---------------------------------------------

// Stock Transactions ---------------------------------------------

const AcceptStockBranch = lazy(() =>
  import("./pages/Transactions/StockTransactions/AcceptStockBranch")
);

const AcceptStockCounter = lazy(() =>
  import("./pages/Transactions/StockTransactions/AcceptStockCounter")
);

const ReceiptOfStock = lazy(() =>
  import("./pages/Transactions/StockTransactions/ReceiptOfStock")
);

const ReturnOfStock = lazy(() =>
  import("./pages/Transactions/StockTransactions/ReturnOfStock")
);

const TransferStockBranch = lazy(() =>
  import("./pages/Transactions/StockTransactions/TransferStockBranch")
);

const TransferStockCounter = lazy(() =>
  import("./pages/Transactions/StockTransactions/TransferStockCounter")
);

const VoidOfStock = lazy(() =>
  import("./pages/Transactions/StockTransactions/VoidOfStock")
);

// Stock Transactions End ---------------------------------------------

// Transfers ---------------------------------------------

const AcceptCurrBranch = lazy(() =>
  import("./pages/Transactions/Transfers/AcceptCurrBranch")
);

const AcceptCurrCounter = lazy(() =>
  import("./pages/Transactions/Transfers/AcceptCurrCounter")
);

const TransferCurrBranchOrSurrenderToHo = lazy(() =>
  import("./pages/Transactions/Transfers/TransferCurrBranchOrSurrenderToHo")
);

const TransferCurrCounter = lazy(() =>
  import("./pages/Transactions/Transfers/TransferCurrCounter")
);

// Transfers End ---------------------------------------------

// WU Transactions -----------------------------------------------

const MoneyTransfer = lazy(() =>
  import("./pages/Transactions/WUTransactions/MoneyTransfer")
);

// WU Transactions End -----------------------------------------------

// Forward Transactions -------------------------------------------------------

const ForwardBookingTransactions = lazy(() =>
  import("./pages/Transactions/ForwardTransactions/ForwardBookingTransactions")
);

const ForwardContractTC = lazy(() =>
  import("./pages/Transactions/ForwardTransactions/ForwardContractTC")
);

const ForwardContractUtil = lazy(() =>
  import("./pages/Transactions/ForwardTransactions/ForwardContractUtil")
);

// Forward Transactions End-------------------------------------------------------

// Transactions --------------------------------------------

const ChequeDishonour = lazy(() =>
  import("./pages/Transactions/Transactions/ChequeDishonour")
);

const EEFCSettle = lazy(() =>
  import("./pages/Transactions/Transactions/EEFCSettle")
);

const TCSettleDir = lazy(() =>
  import("./pages/Transactions/Transactions/TCSettleDir")
);

const UnsettledStockReceipt = lazy(() =>
  import("./pages/Transactions/Transactions/UnsettledStockReceipt")
);

// Transactions End --------------------------------------------

// Maker ---------------------------------------------------------------------

const JournalVouchersMaker = lazy(() =>
  import("./pages/Transactions/Maker/JournalVouchers")
);

const PaymentMaker = lazy(() => import("./pages/Transactions/Maker/Payment"));

const ReceiptMaker = lazy(() => import("./pages/Transactions/Maker/Receipt"));

// Maker ---------------------------------------------------------------------

// Checker ---------------------------------------------------------------------

const JournalVouchersChecker = lazy(() =>
  import("./pages/Transactions/Maker/JournalVouchers")
);

const PaymentChecker = lazy(() => import("./pages/Transactions/Maker/Payment"));

const ReceiptChecker = lazy(() => import("./pages/Transactions/Maker/Receipt"));

// Checker ---------------------------------------------------------------------

// --------------------------------------------TRANSACTIONS End ----------------------------------

// -----------------------------------------------Miscellaneous-----------------------------------------------

// Options --------------------------------------

const BeginningDay = lazy(() =>
  import("./pages/Miscellaneous/Options/BeginningDay")
);

const BulkGst = lazy(() => import("./pages/Miscellaneous/Options/BulkGst"));

const DayEndProcess = lazy(() =>
  import("./pages/Miscellaneous/Options/DayEndProcess")
);

const PreviewReport = lazy(() =>
  import("./pages/Miscellaneous/Options/PreviewReport")
);

const TillSheet = lazy(() => import("./pages/Miscellaneous/Options/TillSheet"));

// Options End --------------------------------------

//  Opening Balances -------------------------------------------------

const AccountCode = lazy(() =>
  import("./pages/Miscellaneous/OpeningBalances/AccountCode")
);

const AllProducts = lazy(() =>
  import("./pages/Miscellaneous/OpeningBalances/AllProducts")
);

const SubLedgerAcc = lazy(() =>
  import("./pages/Miscellaneous/OpeningBalances/SubLedgerAcc")
);

//  Opening Balances End-------------------------------------------------

// -----------------------------------------------Miscellaneous End-----------------------------------------------

// -----------------------------------------------Tools/Util-----------------------------------------------

// ----------------System Tools----------------------------------

const ChangePassword = lazy(() =>
  import("./pages/Tools-Util/SystemTools/ChangePassword")
);

const PasswordPolicy = lazy(() =>
  import("./pages/Tools-Util/SystemTools/PasswordPolicy")
);

const YrWiseDbSettings = lazy(() =>
  import("./pages/Tools-Util/SystemTools/YrWiseDbSettings")
);

// ----------------System Tools End----------------------------------

// ----------------Utilities----------------------------------

const TCSQuery = lazy(() => import("./pages/Tools-Util/Utilities/TCSQuery"));

// ----------------Utilities End----------------------------------

// --------------------Audit Trail-----------------------------

const ChangeAgentInfoReq = lazy(() =>
  import("./pages/Tools-Util/AuditTrail/ChangeAgentInfoReq")
);

const ChangeCardNoReq = lazy(() =>
  import("./pages/Tools-Util/AuditTrail/ChangeCardNoReq")
);

const ChangeDateReq = lazy(() =>
  import("./pages/Tools-Util/AuditTrail/ChangeDateReq")
);

const ChangeIssuerCodeReq = lazy(() =>
  import("./pages/Tools-Util/AuditTrail/ChangeIssuerCodeReq")
);

const ChangeMarktRefReq = lazy(() =>
  import("./pages/Tools-Util/AuditTrail/ChangeMarktRefReq")
);

const ChangePaxInfoReq = lazy(() =>
  import("./pages/Tools-Util/AuditTrail/ChangePaxInfoReq")
);

// --------------------Audit Trail End-----------------------------

// -----------------------------------------------Tools/Util End-----------------------------------------------

// -------------------------------------------------Lead Management------------------------------------------------------

// Lead Handling -------------------------------------------

const LeadAllotment = lazy(() =>
  import("./pages/LeadManagement/LeadHandling/LeadAllotment")
);

const LeadGeneration = lazy(() =>
  import("./pages/LeadManagement/LeadHandling/LeadGeneration")
);

const LeadProcess = lazy(() =>
  import("./pages/LeadManagement/LeadHandling/LeadProcess")
);

// Lead Handling End-------------------------------------------

// Lead Report -------------------------------------------

const LeadReportByDate = lazy(() =>
  import("./pages/LeadManagement/LeadReport/LeadReportByDate")
);

const LeadStatusReport = lazy(() =>
  import("./pages/LeadManagement/LeadReport/LeadStatusReport")
);

// Lead Report End-------------------------------------------

// -------------------------------------------------Lead Management End------------------------------------------------------

// Lazy load other components similarly...

// -----------------------------------------ROUTES START---------------------------------------------

const routes = [
  { path: "/", element: <LoginNew />, protected: false },
  { path: "/dashboard", element: <Dashboard />, protected: true },

  //   ------------------MASTERS-----------------------------

  // Master Profiles -------------------------------------------------------------------------------------------
  {
    path: "/master-profiles/currency-profile",
    element: <CurrencyProfile />,
    protected: true,
  },
  {
    path: "/master-profiles/financial-codes",
    element: <FinancialCodes />,
    protected: true,
  },
  {
    path: "/master-profiles/financial-sub-profile",
    element: <FinancialSubProfile />,
    protected: true,
  },
  {
    path: "/master-profiles/division-profile",
    element: <DivisionProfile />,
    protected: true,
  },
  {
    path: "/master-profiles/division-details",
    element: <DivisionDetails />,
    protected: true,
  },
  {
    path: "/master-profiles/accounts-profile",
    element: <AccountsProfile />,
    protected: true,
  },

  {
    path: "/master-profiles/ad1-provider",
    element: <Ad1Provider />,
    protected: true,
  },

  // Master Profiles END-------------------------------------------------------------------------------------------

  //   Party Profiles ------------------------------------------------------------------

  // --------------------------------------SINGLE PARAM URL FOR PARTY PROFILES------------------------------------------------

  {
    path: "/party-profiles/:vType",
    element: <MainIndexComp />,
    protected: true,
  },

  // --------------------------------------SINGLE PARAM URL FOR PARTY PROFILES END------------------------------------------------

  //    Party Profiles End -------------------------------------------------------------------------

  // System Setup ---------------------------------------------------------------------
  {
    path: "/system-setup/company-profile",
    element: <CompanyProfile />,
    protected: true,
  },

  {
    path: "/system-setup/branch-profile",
    element: <BranchLocationProfile />,
    protected: true,
  },

  {
    path: "/system-setup/adv-settings",
    element: <AdvSettings />,
    protected: true,
  },

  {
    path: "/system-setup/branch-settings",
    element: <BranchSettings />,
    protected: true,
  },

  {
    path: "/system-setup/UserGroup/:isGroup",
    element: <UserComp />,
    protected: true,
  },

  {
    path: "/system-setup/product-profile",
    element: <ProductProfile />,
    protected: true,
  },

  {
    path: "/system-setup/tax-profile",
    element: <TaxMaster />,
    protected: true,
  },

  {
    path: "/system-setup/monthwise-locking",
    element: <MonthWiseLocking />,
    protected: true,
  },

  {
    path: "/system-setup/purpose-limit-profile",
    element: <PurposeLimitProfile />,
    protected: true,
  },

  {
    path: "/system-setup/mail-server-config",
    element: <MailServerConfig />,
    protected: true,
  },

  {
    path: "/system-setup/mail-sending-config",
    element: <MailSendingConfig />,
    protected: true,
  },

  {
    path: "/system-setup/select-theme",
    element: <ThemeSelect />,
    protected: true,
  },

  // System Setup End ---------------------------------------------------------------------

  //   Rates -----------------------------------------------------------------------

  {
    path: "/rates/rate-control-profile",
    element: <RateControlProfile />,
    protected: true,
  },

  //   Rates End -----------------------------------------------------------------------

  // Miscellaneous -----------------------------------------------------------------

  {
    path: "/misc/money-transfer",
    element: <MoneyTransferServices />,
    protected: true,
  },

  {
    path: "/misc/manual-bill-book",
    element: <ManualBillBook />,
    protected: true,
  },

  {
    path: "/misc/exp-inc-booking-master",
    element: <ExpenseIncBookingMaster />,
    protected: true,
  },

  {
    path: "/misc/scan-master-profile",
    element: <ScanMasterProfile />,
    protected: true,
  },

  {
    path: "/misc/counter-master",
    element: <CounterMaster />,
    protected: true,
  },

  {
    path: "/misc/cheque-master",
    element: <ChequeMaster />,
    protected: true,
  },

  {
    path: "/misc/master-purpose-profile",
    element: <MasterPurposeProfile />,
    protected: true,
  },

  {
    path: "/misc/sub-purpose-profile",
    element: <SubPurposeProfile />,
    protected: true,
  },

  {
    path: "/misc/block-account-payment",
    element: <BlockAccountPayment />,
    protected: true,
  },

  {
    path: "/misc/block-account-receipt",
    element: <BlockAccountReceipt />,
    protected: true,
  },

  {
    path: "/misc/block-account-journal",
    element: <BlockAccountJournal />,
    protected: true,
  },

  {
    path: "/misc/block-pax",
    element: <BlockPax />,
    protected: true,
  },

  {
    path: "/misc/allow-adr-acr",
    element: <AllowAdrAcr />,
    protected: true,
  },

  {
    path: "/misc/block-party-code",
    element: <BlockPartyCode />,
    protected: true,
  },

  // Miscellaneous End -----------------------------------------------------------------

  // Insurance -----------------------------------------------------------------

  {
    path: "/insurance/insurance-plan-master",
    element: <InsurancePlanMaster />,
    protected: true,
  },

  // Insurance End -----------------------------------------------------------------

  //   ------------------MASTERS END-----------------------------

  //   -----------------------------------------------TRANSACTIONS------------------------------

  // ---------------Other Transactions ----------------
  {
    path: "/other-transactions/ad1-trans",
    element: <Ad1Transactions />,
    protected: true,
  },

  {
    path: "/other-transactions/ad2-ref-trans",
    element: <Ad2RefTransactions />,
    protected: true,
  },
  {
    path: "/other-transactions/ad1-approval",
    element: <Ad1Approval />,
    protected: true,
  },
  {
    path: "/other-transactions/insurance-sales",
    element: <InsuranceSales />,
    protected: true,
  },
  {
    path: "/other-transactions/change-pax-details",
    element: <ChangePaxDetails />,
    protected: true,
  },
  {
    path: "/other-transactions/eefc-settlement",
    element: <EEFCSettlement />,
    protected: true,
  },
  {
    path: "/other-transactions/deal-cover-rate",
    element: <DealCoverRate />,
    protected: true,
  },
  {
    path: "/other-transactions/deal-cover-ackngmt",
    element: <DealCoverAck />,
    protected: true,
  },
  {
    path: "/other-transactions/change-or-details",
    element: <ChangeOrDetails />,
    protected: true,
  },
  {
    path: "/other-transactions/loss-trans-request",
    element: <LossTransactionRequest />,
    protected: true,
  },
  {
    path: "/other-transactions/loss-trans-status",
    element: <LossTransactionStatus />,
    protected: true,
  },

  // ---------------Other Transactions End----------------

  //  ---------------------Accounting Transactions-------------------------
  {
    path: "/transactions/accounting/receipt",
    element: <Receipt />,
    protected: true,
  },

  {
    path: "/transactions/accounting/payment",
    element: <Payment />,
    protected: true,
  },

  {
    path: "/accounting-transactions/exp-inc-booking",
    element: <ExpenseIncomeBooking />,
    protected: true,
  },

  {
    path: "/accounting-transactions/counter-fund-out",
    element: <CounterFundTransferOut />,
    protected: true,
  },

  {
    path: "/accounting-transactions/counter-fund-in",
    element: <CounterFundTransferIn />,
    protected: true,
  },

  {
    path: "/accounting-transactions/stock-revaluation",
    element: <StockRevaluation />,
    protected: true,
  },

  {
    path: "/accounting-transactions/deposit-withdrawals",
    element: <DepositWithdrawal />,
    protected: true,
  },

  {
    path: "/accounting-transactions/journal-vouchers",
    element: <JournalVouchers />,
    protected: true,
  },

  {
    path: "/accounting-transactions/fund-transfer-direct",
    element: <FundTransferDirect />,
    protected: true,
  },

  {
    path: "/accounting-transactions/advice-debit-credit",
    element: <AdviceOfDebitAndCredit />,
    protected: true,
  },

  {
    path: "/accounting-transactions/advance-refund",
    element: <AdvRefund />,
    protected: true,
  },

  {
    path: "/accounting-transactions/advance-adjustment",
    element: <AdvanceAdjustment />,
    protected: true,
  },

  {
    path: "/other-transactions/loss-trans-status",
    element: <LossTransactionStatus />,
    protected: true,
  },

  {
    path: "/accounting-transactions/bank-reconciliation",
    element: <BankReco />,
    protected: true,
  },

  {
    path: "/accounting-transactions/credit-fund-req",
    element: <CreditFundReq />,
    protected: true,
  },

  //  ---------------------Accounting Transactions End-------------------------

  //  ---------------------Buying/Selling Transactions-------------------------
  {
    path: "/transactions/buying-selling/buy-from-individuals",
    element: <BuyFromIndiviOrCorp />,
    protected: true,
  },

  {
    path: "/transactions/buying-selling/buy-from-ffmcs",
    element: <BuyFromFFMCS />,
    protected: true,
  },

  {
    path: "/transactions/buying-selling/buy-from-rmc",
    element: <BuyFromRMCS />,
    protected: true,
  },

  {
    path: "/transactions/buying-selling/buy-from-franchisee",
    element: <BuyFromFranchisee />,
    protected: true,
  },

  {
    path: "/transactions/buying-selling/sell-to-individuals",
    element: <SaleToIndividual />,
    protected: true,
  },

  {
    path: "/transactions/buying-selling/sell-to-ffmc",
    element: <SaleToFFMC />,
    protected: true,
  },

  {
    path: "/transactions/buying-selling/sell-to-foreign-correspondent",
    element: <SaleToForeignCorrespondent />,
    protected: true,
  },

  {
    path: "/transactions/buying-selling/buy-from-foreign-correspondent",
    element: <BuyFromForeignCorrespondent />,
    protected: true,
  },

  {
    path: "/transactions/buying-selling/buy-from-non-franchisee",
    element: <BuyFromNonFranchisee />,
    protected: true,
  },

  {
    path: "/transactions/buying-selling/fake-currency",
    element: <FakeCurrency />,
    protected: true,
  },

  {
    path: "/transactions/buying-selling/buy-from-bank",
    element: <BuyFromBank />,
    protected: true,
  },

  {
    path: "/transactions/buying-selling/sell-to-bank",
    element: <SellToBank />,
    protected: true,
  },

  //  ---------------------Buying/Selling Transactions End-------------------------

  //  ---------------------Stock Transactions -------------------------

  {
    path: "/transaction/stock/receipt-of-stock",
    element: <ReceiptOfStock />,
    protected: true,
  },

  {
    path: "/transaction/stock/return-of-stock",
    element: <ReturnOfStock />,
    protected: true,
  },

  {
    path: "/transaction/stock/void-of-stock",
    element: <VoidOfStock />,
    protected: true,
  },

  {
    path: "/transaction/stock/accept-stock-branch",
    element: <AcceptStockBranch />,
    protected: true,
  },

  {
    path: "/transaction/stock/transfer-of-stock-branch",
    element: <TransferStockBranch />,
    protected: true,
  },

  {
    path: "/transaction/stock/transfer-of-stock-counter",
    element: <TransferStockCounter />,
    protected: true,
  },

  {
    path: "/transaction/stock/accept-stock-counter",
    element: <AcceptStockCounter />,
    protected: true,
  },

  //  ---------------------Stock Transactions End-------------------------

  //  ---------------------Transfers-------------------------

  {
    path: "/transactions/transfer/accept-currency-branch",
    element: <AcceptCurrBranch />,
    protected: true,
  },

  {
    path: "/transactions/transfer/transfer-currency-branch-surrender-ho",
    element: <TransferCurrBranchOrSurrenderToHo />,
    protected: true,
  },

  {
    path: "/transactions/transfer/accept-currency-counter",
    element: <AcceptCurrCounter />,
    protected: true,
  },

  {
    path: "/transactions/transfer/transfer-currency-counter",
    element: <TransferCurrCounter />,
    protected: true,
  },

  //  ---------------------Transfers End-------------------------

  //  ---------------------WU Transactions-------------------------

  {
    path: "/transactions/wu-trans/money-transfer",
    element: <MoneyTransfer />,
    protected: true,
  },

  //  ---------------------WU Transactions End-------------------------

  //  ---------------------Forward Transactions-------------------------

  {
    path: "/transactions/forward-transactions/forward-booking",
    element: <ForwardBookingTransactions />,
    protected: true,
  },

  {
    path: "/transactions/forward-transactions/forward-contract-tc",
    element: <ForwardContractTC />,
    protected: true,
  },

  {
    path: "/transactions/forward-transactions/forward-contract-util",
    element: <ForwardContractUtil />,
    protected: true,
  },

  //  ---------------------Forward Transactions End-------------------------

  //  ---------------------Transactions-------------------------

  {
    path: "/transactions/transactions/tc-settle-direct",
    element: <TCSettleDir />,
    protected: true,
  },

  {
    path: "/transactions/transactions/unsettled-stock-receipt",
    element: <UnsettledStockReceipt />,
    protected: true,
  },

  {
    path: "/transactions/transactions/cheque-dishonoured",
    element: <ChequeDishonour />,
    protected: true,
  },

  {
    path: "/transactions/transactions/eefc-settle",
    element: <EEFCSettle />,
    protected: true,
  },

  //  ---------------------Transactions End-------------------------

  // ---------------------------Maker------------------------------------

  {
    path: "/transactions/maker/receipt",
    element: <ReceiptMaker />,
    protected: true,
  },

  {
    path: "/transactions/maker/payment",
    element: <PaymentMaker />,
    protected: true,
  },

  {
    path: "/transactions/maker/journal-vouchers",
    element: <JournalVouchersMaker />,
    protected: true,
  },

  // ---------------------------Maker End------------------------------------

  // ---------------------------Checker------------------------------------

  {
    path: "/transactions/checker/receipt",
    element: <ReceiptChecker />,
    protected: true,
  },

  {
    path: "/transactions/checker/payment",
    element: <PaymentChecker />,
    protected: true,
  },

  {
    path: "/transactions/checker/journal-vouchers",
    element: <JournalVouchersChecker />,
    protected: true,
  },

  // ---------------------------Checker End------------------------------------
  //   -----------------------------------------------TRANSACTIONS End------------------------------

  //   ----------------------------------------------------Miscellaneous--------------------------------------

  // Options -------------------------------------------

  {
    path: "/miscellaneous/options/day-end-process",
    element: <DayEndProcess />,
    protected: true,
  },

  {
    path: "/miscellaneous/options/beginning-of-day",
    element: <BeginningDay />,
    protected: true,
  },

  {
    path: "/miscellaneous/options/till-sheet",
    element: <TillSheet />,
    protected: true,
  },

  {
    path: "/miscellaneous/options/bulk-gst",
    element: <BulkGst />,
    protected: true,
  },

  {
    path: "/miscellaneous/options/preview-report",
    element: <PreviewReport />,
    protected: true,
  },

  // Options End-------------------------------------------

  // Opening Balances-------------------------------------------

  {
    path: "/miscellaneous/opening-balances/all-products",
    element: <AllProducts />,
    protected: true,
  },

  {
    path: "/miscellaneous/opening-balances/account-code",
    element: <AccountCode />,
    protected: true,
  },

  {
    path: "/miscellaneous/opening-balances/sub-ledger-account",
    element: <SubLedgerAcc />,
    protected: true,
  },

  // Opening Balances End-------------------------------------------

  //   ----------------------------------------------------Miscellaneous End--------------------------------------

  // -----------------------------------------------Tools/Util-----------------------------------------------

  // ----------------System Tools----------------------------------

  {
    path: "/tools/system-tools/yr-wise-db-settings",
    element: <YrWiseDbSettings />,
    protected: true,
  },

  {
    path: "/tools/system-tools/change-password",
    element: <ChangePassword />,
    protected: true,
  },

  {
    path: "/tools/system-tools/password-policy",
    element: <PasswordPolicy />,
    protected: true,
  },

  // ----------------System Tools End----------------------------------

  // ----------------Utilities----------------------------------

  {
    path: "/tools/util/tcs-query",
    element: <TCSQuery />,
    protected: true,
  },

  // ----------------Utilities End----------------------------------

  // --------------------Audit Trail-----------------------------

  {
    path: "/tools/audit-trail/change-date-request",
    element: <ChangeDateReq />,
    protected: true,
  },

  {
    path: "/tools/audit-trail/change-pax-info-request",
    element: <ChangePaxInfoReq />,
    protected: true,
  },

  {
    path: "/tools/audit-trail/change-issuer-code-request",
    element: <ChangeIssuerCodeReq />,
    protected: true,
  },

  {
    path: "/tools/audit-trail/change-mkt-ref-request",
    element: <ChangeMarktRefReq />,
    protected: true,
  },

  {
    path: "/tools/audit-trail/change-card-no-request",
    element: <ChangeCardNoReq />,
    protected: true,
  },

  {
    path: "/tools/audit-trail/change-agent-info-request",
    element: <ChangeAgentInfoReq />,
    protected: true,
  },

  // --------------------Audit Trail End-----------------------------

  // -----------------------------------------------Tools/Util End-----------------------------------------------

  // -------------------------------------------------Lead Management------------------------------------------------------

  // Lead Handling -------------------------------------------

  {
    path: "/lead-management/lead-handling/lead-generation",
    element: <LeadGeneration />,
    protected: true,
  },

  {
    path: "/lead-management/lead-handling/lead-allotment",
    element: <LeadAllotment />,
    protected: true,
  },

  {
    path: "/lead-management/lead-handling/lead-process",
    element: <LeadProcess />,
    protected: true,
  },

  // Lead Handling End-------------------------------------------

  // Lead Report -------------------------------------------

  {
    path: "/lead-management/lead-report/lead-status-report",
    element: <LeadStatusReport />,
    protected: true,
  },

  {
    path: "/lead-management/lead-report/lead-report-by-date",
    element: <LeadReportByDate />,
    protected: true,
  },

  // Lead Report End-------------------------------------------

  // -------------------------------------------------Lead Management End------------------------------------------------------

  // Add other routes

  // -----------------------------------------ROUTES END---------------------------------------------
];

const renderRoutes = () => {
  return routes.map((route, index) =>
    route.protected ? (
      <Route key={index} path={route.path} element={<ProtectedRoute />}>
        <Route path={route.path} element={route.element} />
      </Route>
    ) : (
      <Route key={index} path={route.path} element={route.element} />
    )
  );
};

export default renderRoutes;
