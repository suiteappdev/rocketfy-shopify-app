/*
unshipped || fullfilled
*/
import { gql } from '@apollo/client';

const ORDERS_QUERY = gql`
    query {
        orders(first: 2, query: "fulfillment_status:unfulfilled", sortKey: CREATED_AT){
            edges{
                node{
                    name
                    id
                    paymentGatewayNames
                    currentTotalWeight
                    customer{
                        firstName
                        lastName
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
                    lineItems(first:50) {
                        edges {
                          cursor
                          node {
                            variant 
                            { 
                                weight
                            }
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

