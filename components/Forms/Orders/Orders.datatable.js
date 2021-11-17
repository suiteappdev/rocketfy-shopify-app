import React, {useEffect, useState} from 'react';
import {useIndexResourceState, Card, IndexTable} from '@shopify/polaris';
import moment from 'moment';
import { mapCourrier } from '../../../helpers/location.helper';
import { ORDER_BY_ID } from '../../../graphql/querys/orderById.query';
import { createOrder } from '../../../helpers/order.helper';
import { useQuery } from '@apollo/client';

const Datatable = (props)=>{
     const [orders, setOrders]  = useState([]);

     const useImperativeQuery = (query) => {
      const { refetch } = useQuery(query, { skip: true });
      
      const imperativelyCallQuery = (variables) => {
        return refetch(variables);
      } 
      
      return imperativelyCallQuery;
    }
    
    const callQuery = useImperativeQuery(ORDER_BY_ID);

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
    
      const {
        selectedResources,
        allResourcesSelected,
        handleSelectionChange,
      } = useIndexResourceState(orders, { resourceIDResolver });

      const promotedBulkActions = [
        {
          content: 'Enviar ordenes a rocketfy',
          onAction: async () =>{
            for (let index = 0; index < selectedResources.length; index++) {
                  let o = selectedResources[index];
                  let response = await callQuery({ id : o}).catch((e)=>console.log(e.message));
                  if(response){
                    console.log("response", response);
                    //let order = await createOrder(response.data.order);
                    //console.log("o", order)
                  }
            }
          },
        },
        {
          content: 'Ir a Rocketfy',
          onAction: () => {
            props.toApp()
          },
        },
      ];



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
            promotedBulkActions={promotedBulkActions}
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