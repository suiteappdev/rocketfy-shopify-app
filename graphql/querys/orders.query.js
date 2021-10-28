/*
unshipped || fullfilled
*/
import { gql } from '@apollo/client';

const ORDERS_QUERY = gql`
    query {
        orders(first: 100, query: "fulfillment_status:fullfilled", sortKey: CREATED_AT){
            edges{
                node{
                    name
                    customer{
                        firstName
                        lastName
                    }
                    id
                    createdAt
                    billingAddress {
                        address1
                        address2
                        zip
                        city
                        province
                    }
                    currentSubtotalPriceSet{
                        shopMoney{
                            amount
                        } 
                    }
                    currentTotalPriceSet {
                        shopMoney{
                            amount
                        }
                    }
                    originalTotalPriceSet{
                        shopMoney{
                            amount
                        }
                    }
                    fullyPaid
                }
            }
        }
    }
`



const DATA_KEY = 'orders';

export { ORDERS_QUERY, DATA_KEY};

