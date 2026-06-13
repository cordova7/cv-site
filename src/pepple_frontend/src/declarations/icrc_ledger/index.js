// ICRC Ledger Interface
import { IDL } from "@dfinity/candid";
import { Actor } from "@dfinity/agent";

export const idlFactory = ({ IDL }) => {
  const Subaccount = IDL.Vec(IDL.Nat8);
  const Account = IDL.Record({
    owner: IDL.Principal,
    subaccount: IDL.Opt(Subaccount),
  });
  const Amount = IDL.Nat;
  const Memo = IDL.Vec(IDL.Nat8);
  const Timestamp = IDL.Nat64;
  const TransferArgs = IDL.Record({
    to: Account,
    fee: IDL.Opt(Amount),
    memo: IDL.Opt(Memo),
    from_subaccount: IDL.Opt(Subaccount),
    created_at_time: IDL.Opt(Timestamp),
    amount: Amount,
  });
  const TransferError = IDL.Variant({
    GenericError: IDL.Record({
      message: IDL.Text,
      error_code: IDL.Nat,
    }),
    TemporarilyUnavailable: IDL.Null,
    BadBurn: IDL.Record({ min_burn_amount: Amount }),
    Duplicate: IDL.Record({ duplicate_of: IDL.Nat }),
    BadFee: IDL.Record({ expected_fee: Amount }),
    CreatedInFuture: IDL.Record({ ledger_time: Timestamp }),
    TooOld: IDL.Null,
    InsufficientFunds: IDL.Record({ balance: Amount }),
  });
  const TransferResult = IDL.Variant({
    Ok: IDL.Nat,
    Err: TransferError,
  });
  const Value = IDL.Variant({
    Int: IDL.Int,
    Nat: IDL.Nat,
    Blob: IDL.Vec(IDL.Nat8),
    Text: IDL.Text,
  });
  const MetadataValue = IDL.Variant({
    Int: IDL.Int,
    Nat: IDL.Nat,
    Blob: IDL.Vec(IDL.Nat8),
    Text: IDL.Text,
  });
  const ApproveArgs = IDL.Record({
    fee: IDL.Opt(IDL.Nat),
    memo: IDL.Opt(IDL.Vec(IDL.Nat8)),
    from_subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
    created_at_time: IDL.Opt(IDL.Nat64),
    amount: IDL.Nat,
    expected_allowance: IDL.Opt(IDL.Nat),
    expires_at: IDL.Opt(IDL.Nat64),
    spender: IDL.Record({
      owner: IDL.Principal,
      subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
    }),
  });
  
  return IDL.Service({
    icrc1_balance_of: IDL.Func([Account], [Amount], ["query"]),
    icrc1_decimals: IDL.Func([], [IDL.Nat8], ["query"]),
    icrc1_fee: IDL.Func([], [Amount], ["query"]),
    icrc1_metadata: IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Text, MetadataValue))], ["query"]),
    icrc1_name: IDL.Func([], [IDL.Text], ["query"]),
    icrc1_symbol: IDL.Func([], [IDL.Text], ["query"]),
    icrc1_total_supply: IDL.Func([], [Amount], ["query"]),
    icrc1_transfer: IDL.Func([TransferArgs], [TransferResult], []),
    icrc2_approve: IDL.Func([ApproveArgs], [TransferResult], []),
    icrc2_allowance: IDL.Func(
      [
        IDL.Record({
          account: Account,
          spender: Account,
        }),
      ],
      [
        IDL.Record({
          allowance: IDL.Nat,
          expires_at: IDL.Opt(IDL.Nat64),
        }),
      ],
      ["query"],
    ),
  });
};

export const init = ({ IDL }) => {
  return [];
};

export const createActor = (canisterId, options) => {
  const agent = options?.agent || options?.agentOptions;
  if (!agent) {
    throw new Error("Agent is required");
  }
  
  const actor = Actor.createActor(idlFactory, {
    agent,
    canisterId,
    ...options?.actorOptions,
  });
  
  return actor;
}; 
 