import { gql } from '@apollo/client';

const ORDER_BY_ID = gql`query getOrdeyById($id :ID!){
                            order(id :$id){
                                name
                                id
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
                                lineItems(first:200) {
                                    edges {
                                      cursor
                                      node {
                                        variant 
                                        { 
                                          weight
                                          displayName
                                          price
                                        }
                                        name
                                        sku
                                        quantity
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
`

const DATA_KEY = 'OrderByID';

export { ORDER_BY_ID, DATA_KEY};

