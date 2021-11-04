import React from 'react';
import {useIndexResourceState, Card, IndexTable} from '@shopify/polaris';
import moment from 'moment';
import { getCourrier } from '../../../helpers/location.helper';

const Datatable = (props)=>{
      const resourceName = {
        singular: 'order',
        plural: 'orders',
      };
    
      const {selectedResources, allResourcesSelected, handleSelectionChange} =
      useIndexResourceState(props.orders);

      const rowMarkup = props.orders.map(
        async ({node}, index) => {
          if(props.cities){
            let courrier = await getCourrier(props.cities, 'morroa');
            console.log("courrier", courrier);
          }

          return(
              <IndexTable.Row
                id={index}
                key={index}
                selected={selectedResources.includes(index)}
                position={index}
              >
              <IndexTable.Cell>{node.name}</IndexTable.Cell>
              <IndexTable.Cell>{moment(node.createdAt).format('LLL')}</IndexTable.Cell>
              <IndexTable.Cell>{`${node.customer.firstName} ${node.customer.lastName}`}</IndexTable.Cell>
              <IndexTable.Cell>{`${node.billingAddress.address1} ${node.billingAddress.address2}`}</IndexTable.Cell>
              <IndexTable.Cell>{node.shippingAddress.city}</IndexTable.Cell>
              <IndexTable.Cell>{node.shippingAddress.province}</IndexTable.Cell>
              <IndexTable.Cell>{'Interrapidisimo'}</IndexTable.Cell>
              <IndexTable.Cell>${node.currentTotalPriceSet.shopMoney.amount}</IndexTable.Cell>
              </IndexTable.Row>            
          );
        }
      );
    
      return (
        <Card>
          <IndexTable
            resourceName={resourceName}
            itemCount={props.orders.length}
            selectedItemsCount={
              allResourcesSelected ? 'All' : selectedResources.length
            }
            onSelectionChange={handleSelectionChange}
            headings={[
              {title: '# Pedido'},
              {title: 'Fecha del Pedido'},
              {title: 'Cliente'},
              {title: 'Dirección'},
              {title: 'Ciudad'},
              {title: 'Provincia'},
              {title: 'Transportadora'},
              {title: 'Total'}
            ]}
          >
            {rowMarkup}
          </IndexTable>
        </Card>
      );
}

export {Datatable};