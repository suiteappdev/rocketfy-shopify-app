import { gql } from '@apollo/client';

const STORE_QUERY = gql`
    query {
        shop {
            name
            email
            billingAddress{
              address1
              address2
              country
              city
              province
              phone
              firstName
              lastName
              formatted
              countryCodeV2
              
            }
            customerAccounts
            domains {
              id
              url
              host
            }
            myshopifyDomain
            
          }
    }
`

const DATA_KEY = 'shop';

export { STORE_QUERY, DATA_KEY};