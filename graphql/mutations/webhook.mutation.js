import { gql } from '@apollo/client';

const WEBHOOK_MUTATION = gql`
    mutation {
            webhookSubscriptionCreate(
                topic: ORDERS_CREATE
                webhookSubscription: {
                    format: JSON,
                    callbackUrl: "${process.env.HOST}/webhook-notification"
                }
            
            ) {
                
                userErrors {
                    field
                    message
                }
                
                webhookSubscription {
                    id
                }
            }
        }
`
const DATA_KEY = 'data';

export { WEBHOOK_MUTATION, DATA_KEY};