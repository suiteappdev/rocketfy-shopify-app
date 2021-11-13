/*
unshipped || fullfilled
*/
import { gql } from '@apollo/client';

const ORDERS_QUERY = gql`
    query {
        orders(first: 60, query: "fulfillment_status:unfulfilled", sortKey: CREATED_AT){
            edges{
                node{
                    id
                    name
                    paymentGatewayNames
                    customer{
                        firstName
                        lastName
                    }
                    createdAt
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
                    lineItems(first:50) {
                        edges {
                          cursor
                          node {
                            name
                            image {
                                transformedSrc(maxWidth: 60, scale: 1)
                            }
                            refundableQuantity
                            discountedTotalSet {
                                shopMoney {
                                    amount
                                    currencyCode
                                }
                                presentmentMoney {
                                    amount
                                    currencyCode
                                }
                            }
                          }
                        }
                      } 
                }
            }
        }
    }
`



const DATA_KEY = 'orders';

export { ORDERS_QUERY, DATA_KEY};

