import { gql } from '@apollo/client';

const ORDERS_QUERY = gql`
    query {
        orders(first: 100, query: "fulfillment_status:unfulfilled", sortKey: CREATED_AT){
            edges{
                node{
                    name
                    id
                    displayFinancialStatus
                    paymentGatewayNames
                    currentTotalWeight
                    customer{
                        firstName
                        lastName
                        validEmailAddress
                        verifiedEmail
                    }
                    createdAt
                    billingAddress {
                        address1
                        address2
                        zip
                        city
                        province
                    }
                    shippingAddress {
                        firstName
                        lastName
                        company
                        address1
                        address2
                        city
                        zip
                        province
                        provinceCode
                        country
                        countryCodeV2
                        phone
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
                }
            }
        }
    }
`



const DATA_KEY = 'orders';

export { ORDERS_QUERY, DATA_KEY};

