import React, { useEffect, useState } from 'react';
import { Form, Input, Grid, Card } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';
import { TxButton } from './substrate-lib/components';

function Main(props) {
    const { api } = useSubstrate();
    const { accountPair } = props;

    // The transaction submission status
    const [status, setStatus] = useState('');

    // The currently stored value
    const [currentBag, setCurrentBag] = useState("");
    const [currentItems, setCurrentItems] = useState(0);
    const [currentItemsNeeded, setCurrentItemsNeeded] = useState(null);
    const [bag, setBag] = useState("");
    const [items, setItems] = useState(0);

    // retrieve the current number of items
    const getItemsNeeded = () => {

        // when theres items present return no
        return (currentItemsNeeded && currentItemsNeeded.isSome ? currentItemsNeeded.toString() : 0);
    }

    useEffect(() => {
        let unsubscribe;
        // update the details
        api.query.templateModule.details(newValue => {
            // default to empty
            if (newValue.isNone) {
                setCurrentBag('<None>');
                setCurrentItems('0');
            } else {
                // set new values (on submit)
                setCurrentBag(newValue.Bag.toHuman())
                setCurrentItems(newValue.Items.toString())
                setCurrentItemsNeeded(newValue.ItemsNeeded);
            }
        }).then(unsub => {
            unsubscribe = unsub;
        })
            .catch(console.error);

        return () => unsubscribe && unsubscribe();
    }, [api.query.templateModule]);

    return (
        <Grid.Column width={8}>
            <h1>Shopping Bag Details</h1>
            <Card>
                <Card.Content>
                    <Card.Header content={currentBag} />
                    <Card.Meta content={"Current No. of Items: " + currentItems} />
                </Card.Content>
            </Card>
            <Form>
                <Form.Field>
                    <Input
                        label='Bag'
                        state='newValue'
                        type='string'
                        onChange={(_, { value }) => setBag(value)}
                    />
                </Form.Field>
                <Form.Field>
                    <Input
                        label='Items'
                        state='newValue'
                        type='number'
                        onChange={(_, { value }) => setItems(value)}
                    />
                </Form.Field>
                <Form.Field style={{ textAlign: 'center' }}>
                    <TxButton
                        accountPair={accountPair}
                        label='Save Details'
                        type='SIGNED-TX'
                        setStatus={setStatus}
                        attrs={{
                            palletRpc: 'templateModule',
                            callable: 'setItemsNeeded',
                            inputParams: [{ "Bag": bag, "Items": items, "ItemsNeeded": null }],
                            paramFields: [true]
                        }}
                    />
                </Form.Field>
                <div style={{ overflowWrap: 'break-word' }}>{status}</div>
            </Form>
        </Grid.Column>
    );
}

export default function ContactDetails(props) {
    const { api } = useSubstrate();
    return (api.query.templateModule && api.query.templateModule.something
        ? <Main {...props} /> : null);
}
