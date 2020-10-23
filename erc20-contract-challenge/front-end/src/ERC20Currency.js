import React, { useState } from "react"
import { Form, Input, Grid, Label, Icon, Button } from "semantic-ui-react"
import { TxButton } from "./substrate-lib/components"
import { ContractPromise } from "@polkadot/api-contract"
import {useSubstrate} from "./substrate-lib"
import abi from './config/erc20.json';

function ERC20Currency(props) {
  const { api } = useSubstrate()

  const [status, setStatus] = useState(null)
  const [formState, setFormState] = useState({ addressTo: null, amount: 0 })
  const { accountPair, contractAddress } = props

  const onChange = (_, data) =>
    setFormState((prev) => ({ ...prev, [data.state]: data.value }))

  const { addressTo, amount } = formState

  const handleClick = async () => {
    const { address } = accountPair

    const contract = new ContractPromise(api, abi, contractAddress)
    const value = await contract.tx
      .transfer_from(address,addressTo,amount)
      .signAndSend(addressTo, (result) => {
        if (result.status.isInBlock) {
          console.log("in a block")
        } else if (result.status.isFinalized) {
          console.log("finalized")
        }
      })

    console.log(value.result.toHuman())

    if (value.result.isSuccess) {
      const success = value.result.asSuccess
      console.log(value.output.toHuman())

      setStatus(
        `transferred ${amount} Gas consumed ${success.gasConsumed.toHuman()}`,
      )
    } else {
      setStatus("Call failed")
    }
  }

  return (
    <Grid.Column width={8}>
      <h1>ERC20 Token Transfer</h1>
      <Form>
        <Form.Field>
          <Label basic color="teal">
            <Icon name="hand point right" />1 Unit = 1000000000000
          </Label>
        </Form.Field>
        <Form.Field>Transfer ERC20 token. Account ID {}</Form.Field>

        <Form.Field>
          <Input
            fluid
            label="To"
            type="text"
            placeholder="address"
            state="addressTo"
            onChange={onChange}
          />
        </Form.Field>
        <Form.Field>
          <Input
            fluid
            label="Amount"
            type="number"
            state="amount"
            onChange={onChange}
          />
        </Form.Field>
        <Form.Field style={{ textAlign: "center" }}>
          <TxButton
            accountPair={accountPair}
            label="Submit"
            type="SIGNED-TX"
            setStatus={setStatus}
            attrs={{
              palletRpc: "balances",
              callable: "transfer",
              inputParams: [addressTo, amount],
              paramFields: [true, true],
            }}
          />
        </Form.Field>
        <div style={{ overflowWrap: "break-word" }}>{status}</div>
      </Form>
    </Grid.Column>
  )
}

export default ERC20Currency;