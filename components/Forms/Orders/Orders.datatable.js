import React, {useEffect, useState} from 'react';
import {useIndexResourceState, Card, IndexTable} from '@shopify/polaris';
import moment from 'moment';
import { mapCourrier } from '../../../helpers/location.helper';

const Datatable = (props)=>{
      let orders = [];

      const resourceName = {
        singular: 'order',
        plural: 'orders',
      };

      if(props.orders.length > 0 && props.cities.length > 0){
        (async () => {
            let orders = await mapCourrier(props.orders, props.cities);
            console.log("orders", orders);
        })()
      }
    
      const {selectedResources, allResourcesSelected, handleSelectionChange} =
      useIndexResourceState(props.orders);

      const rowMarkup = orders.map(
         ({node}, index) => {
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
            <IndexTable.Cell>{node.courrier}</IndexTable.Cell>
            <IndexTable.Cell>${node.currentTotalPriceSet.shopMoney.amount}</IndexTable.Cell>
            </IndexTable.Row>
          )
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