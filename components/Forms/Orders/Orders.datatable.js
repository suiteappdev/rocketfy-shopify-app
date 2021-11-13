import React, {useEffect, useState} from 'react';
import {useIndexResourceState, Card, IndexTable} from '@shopify/polaris';
import moment from 'moment';
import { mapCourrier } from '../../../helpers/location.helper';
import { mapDimension } from '../../../helpers/package.helper';

const Datatable = (props)=>{
     const [orders, setOrders]  = useState([]);

      const resourceName = {
        singular: 'order',
        plural: 'orders',
      };

      if(props.orders.length > 0 && props.cities.length > 0){
        (async () => {
          let orderList = await mapCourrier(props.orders, props.cities);
           setOrders(orderList);
        })()
      }

      const resourceIDResolver = (orders) => {
        return orders.node.id;
      };

      const bulkActions = [
        {
          content: 'Enviar a envios Rocketfy',
          onAction: () => console.log('Todo: implement bulk add tags'),
        },
        {
          content: 'Abrir panel de envios',
          onAction: () => console.log('Todo: implement bulk remove tags'),
        }
      ];
    
      const {
        selectedResources,
        allResourcesSelected,
        handleSelectionChange,
      } = useIndexResourceState(orders, { resourceIDResolver });

      const rowMarkup = orders.map(
         ({node}, index) => {
           return(
            <IndexTable.Row
              id={node.id}
              key={node.id}
              selected={selectedResources.includes(node.id)}
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
            itemCount={orders.length}
            selectedItemsCount={
              allResourcesSelected ? 'All' : selectedResources.length
            }
            onSelectionChange={handleSelectionChange}
            bulkActions={bulkActions}
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