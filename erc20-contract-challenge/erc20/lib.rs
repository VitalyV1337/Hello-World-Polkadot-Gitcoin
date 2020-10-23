#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
mod erc20 {

    #[cfg(not(feature = "ink-as-dependency"))]
    #[ink(storage)]
    pub struct Erc20 {
        /// The total supply.
        total_supply: Balance,
        /// The balance of each user.
        balances: ink_storage::collections::HashMap<AccountId, Balance>,
        /// Balances that are spendable by non-owners: (owner, spender) -> allowed
        allowances: ink_storage::collections::HashMap<(AccountId, AccountId), Balance>,
    }

    #[ink(event)]
    pub struct Transfer {
        #[ink(topic)]
        from: Option<AccountId>,
        #[ink(topic)]
        to: Option<AccountId>,
        #[ink(topic)]
        value: Balance,
    }

    #[ink(event)]
    pub struct Allowance {
        #[ink(topic)]
        owner: Option<AccountId>,
        #[ink(topic)]
        spender: Option<AccountId>,
        #[ink(topic)]
        value: Balance,
    }

    impl Erc20 {

        #[ink(constructor)]
        pub fn new(initial_supply: Balance) -> Self {
            let mut balances = ink_storage::collections::HashMap::new();
            balances.insert(Self::env().caller(), initial_supply);
            let allowances = ink_storage::collections::HashMap::new();
            Self {
                total_supply: initial_supply,
                balances,
                allowances
            }
        }

        #[ink(message)]
        pub fn total_supply(&self) -> Balance {
            self.total_supply
        }

        #[ink(message)]
        pub fn balance_of(&self, owner: AccountId) -> Balance {
            self.balance_of_or_zero(&owner)
        }

        #[ink(message)]
        pub fn transfer(&mut self, to: AccountId, value: Balance) -> bool {
            // ACTION: Call the `transfer_from_to` with `from` as `self.env().caller()`
            self.transfer_from_to(self.env().caller(), to, value)
        }

        fn transfer_from_to(&mut self, from: AccountId, to: AccountId, value: Balance) -> bool {
            // ACTION: Get the balance for `from` and `to`
            //   HINT: Use the `balance_of_or_zero` function to do this
            // ACTION: If `from_balance` is less than `value`, return `false`
            // ACTION: Insert new values for `from` and `to`
            //         * from_balance - value
            //         * to_balance + value
            // ACTION: Return `true`
            let from_balance = self.balance_of_or_zero(&from);
            if from_balance < value {
                return false
            }
            self.balances.insert(from, from_balance - value);
            let to_balance = self.balance_of_or_zero(&to);
            self.balances.insert(to, to_balance + value);

            self.env().emit_event(Transfer {
                from: Some(from),
                to: Some(to),
                value,
            });
            true
        }

        #[ink(message)]
        pub fn approve(&mut self, spender: AccountId, value: Balance) -> bool {
            let owner = self.env().caller();
            self.allowances.insert((owner, spender), value);
            self.env().emit_event(Allowance {
                owner: Some(owner),
                spender: Some(spender),
                value,
            });
            true
        }

        #[ink(message)]
        pub fn allowance(&self, owner: AccountId, spender: AccountId) -> Balance {
            self.allowance_of_or_zero(&owner, &spender)
        }

        #[ink(message)]
        pub fn transfer_from(&mut self, from: AccountId, to: AccountId, value: Balance) -> bool {
            let allowance = self.allowance(from, self.env().caller());
            if allowance < value{
                return false
            }
            self.allowances.insert((from, self.env().caller()), value);
            self.transfer_from_to(from, to , value);
            true
        }

        fn allowance_of_or_zero(&self, owner: &AccountId, spender: &AccountId) -> Balance {
          *self.allowances.get(&(*owner, *spender)).unwrap_or(&0)
        }

        fn balance_of_or_zero(&self, owner: &AccountId) -> Balance {
            *self.balances.get(owner).unwrap_or(&0)
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        use ink_lang as ink;

        #[ink::test]
        fn new_works() {
            let contract = Erc20::new(777);
            assert_eq!(contract.total_supply(), 777);
        }

        #[ink::test]
        fn balance_works() {
            let contract = Erc20::new(100);
            assert_eq!(contract.total_supply(), 100);
            assert_eq!(contract.balance_of(AccountId::from([0x1; 32])), 100);
            assert_eq!(contract.balance_of(AccountId::from([0x0; 32])), 0);
        }

        #[ink::test]
        fn transfer_works() {
            let mut contract = Erc20::new(100);
            assert_eq!(contract.balance_of(AccountId::from([0x1; 32])), 100);
            assert!(contract.transfer(AccountId::from([0x0; 32]), 10));
            assert_eq!(contract.balance_of(AccountId::from([0x0; 32])), 10);
            assert!(!contract.transfer(AccountId::from([0x0; 32]), 100));
        }

        #[ink::test]
        fn transfer_from_works() {
            let mut contract = Erc20::new(100);
            assert_eq!(contract.balance_of(AccountId::from([0x1; 32])), 100);
            contract.approve(AccountId::from([0x1; 32]), 20);
            contract.transfer_from(AccountId::from([0x1; 32]), AccountId::from([0x0; 32]), 10);
            assert_eq!(contract.balance_of(AccountId::from([0x0; 32])), 10);
        }
    }
}
