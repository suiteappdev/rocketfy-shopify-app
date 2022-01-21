import React, {useCallback, useRef, useState} from 'react';
import {useIndexResourceState, Card, IndexTable, Button, Modal, Stack, TextContainer, TextField, FormLayout} from '@shopify/polaris';
import moment from 'moment'; 
import { mapCourrier } from '../../../helpers/location.helper';
import { ORDER_BY_ID } from '../../../graphql/querys/orderById.query';
import { createOrder, shippingCost } from '../../../helpers/order.helper';
import { useQuery } from '@apollo/client';
import Select from 'react-select';

const Datatable = (props)=>{
     const [orders, setOrders]  = useState([]);
     const [currentOrder, setCurrentOrder]  = useState({});

     const useImperativeQuery = (query) => {
      const { refetch } = useQuery(query, { skip: true });
      
      const imperativelyCallQuery = (variables) => {
        return refetch(variables);
      } 
      
      return imperativelyCallQuery;
    }

    const options = [
      { value: 'chocolate', label: 'Chocolate' },
      { value: 'strawberry', label: 'Strawberry' },
      { value: 'vanilla', label: 'Vanilla' }
    ]

    const DISCOUNT_LINK = 'https://polaris.shopify.com/';

    const [active, setActive] = useState(false);
    const node = useRef(null);
  
    const handleClick = useCallback(() => {
      node.current && node.current.input.focus();
    }, []);
  
    const toggleModal = useCallback((order) => {
      setActive((active) => !active)
      setCurrentOrder(order);
      console.log("currentOrder", order);
    }, []);
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

                  console.log("orderById", response);

                  if(response){
                    let order = await createOrder(response.data);
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
            <IndexTable.Cell>${node.currentTotalPriceSet.shopMoney.amount}</IndexTable.Cell>
            <IndexTable.Cell><Button onClick={toggleModal}>Cotizar</Button></IndexTable.Cell>
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
              {title: 'Total'},
              {title: 'Transportadora'}
            ]}
          >
            {rowMarkup}
          </IndexTable>
      <Modal
        open={active}
        onClose={toggleModal}
        title="Cotizar envio"
        primaryAction={{
          content: 'Cerrar',
          onAction: toggleModal,
        }}
      >
        <Modal.Section>
          <Stack vertical>
            <Stack.Item>
              <TextContainer>
                <p>
                  Por favor configure las dimensiones de su paquete.
                </p>
              </TextContainer>
            </Stack.Item>
            <Stack.Item fill>
            <FormLayout>
              <FormLayout.Group condensed>
                <TextField
                  prefix="kg"
                  type="number"
                  label="Peso"
                  onChange={() => {}}
                  autoComplete="off"
                />
                <TextField
                  prefix="cms"
                  type="number"
                  label="Alto"
                  onChange={() => {}}
                  autoComplete="off"
                />
                <TextField
                  prefix="cms"
                  type="number"
                  label="Ancho"
                  onChange={() => {}}
                  autoComplete="off"
                />
                <TextField
                  prefix="cms"
                  type="number"
                  label="Largo"
                  onChange={() => {}}
                  autoComplete="off"
                /> 
                <p>
                 Seleccione el destino del paquete.
                </p>
              </FormLayout.Group>
              <div style={{height: '225px'}}>
                <Select options={options} />
                <Select options={options} />
              </div>
            </FormLayout>
            </Stack.Item>
          </Stack>
        </Modal.Section>
      </Modal>
        </Card>
      );
}

export {Datatable};