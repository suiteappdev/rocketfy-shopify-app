/*
unshipped || fullfilled
*/
import { gql } from '@apollo/client';

const ORDERS_QUERY = gql`
{
  orders(first: 1, query:"name:#49210") {
    edges {
      node {
        id
        currentTotalWeight
        name
        displayFulfillmentStatus
        cancelledAt
        createdAt
        shippingAddress {
          formatted(withName : true) 
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
}`

const DATA_KEY = 'ordersById';

export { ORDERS_QUERY, DATA_KEY};

